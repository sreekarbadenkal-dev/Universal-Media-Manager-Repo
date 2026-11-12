import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { ChildProcess, execFile, execFileSync, spawn } from "node:child_process";
import { ConfigService } from "../common/config/config.service";
import * as fs from 'fs';
import * as path from 'path';
import { RcloneService } from "./rclone.service";



@Injectable()
export class RcloneProcessService implements OnModuleInit, OnApplicationShutdown {
    private readonly logger = new Logger(RcloneProcessService.name);
    private rcloneProcess: ChildProcess | null = null;

    constructor(
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(RcloneService) private readonly rcloneService: RcloneService
    ) { }

    async onModuleInit() {
        await this.ensureRunningRclone();
    }

    async onApplicationShutdown(signal?: string) {
        await this.killProcess();
    }

    private async execFileAsync(file:string,args:string[]){
        return new Promise((resolve,reject)=>{
            execFile(file,args,(err,stdout,stderr)=>{
                if(err){
                    reject(err)
                }else{
                    resolve({stdout,stderr})
                }
            });
        });
    }

    public async isHealthy(): Promise<boolean> {
        try {
            const res = await fetch(
                `${this.configService.rclone.baseUrl}/core/version`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{}',
                    signal: AbortSignal.timeout(1000)
                }
            );
            return res.ok;
        }
        catch {
            return false;
        }

    }

    public async ensureRunningRclone(): Promise<void> {
        if (await this.isHealthy()) {
            this.logger.log(`Rclone process running at ${this.configService.rclone.baseUrl}`);
            return;
        }

        const binpath = this.resolveRcloneBinaryPath();
        if (!binpath) {
            this.logger.warn('Couldnot resolve the binary path of rclone')
            return;
        }
        this.logger.log(`Spawning Rclone from ${binpath}`);

        const proc = spawn(
            binpath || '',//to know location
            ['rcd', '--rc-no-auth', '--rc-addr=127.0.0.1:5572','--rc-serve'],//daemon mode no auth and listen on ipv4loopback:5527
            {
                stdio: ['ignore','ignore','pipe'],//ignoring the logs by rclone 
                windowsHide: true,//hiding the cmd window cause by exe files
            },
        );
        this.rcloneProcess = proc;

        const onNodeExit = () => {
            if (proc.pid && proc.exitCode === null) {
                try {
                    if (process.platform === 'win32') {
                        execFileSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
                    } else {
                        process.kill(proc.pid, 'SIGKILL');
                    }
                } catch {}
            }
        };
        process.once('exit', onNodeExit);

        proc.stderr?.on('data',(data)=>{this.logger.log(`[Rclone Error] ${data.toString().trim()}`)});
        proc.on('error',(err)=>{this.logger.error(`[Rclone] Failed to start process: ${err.message}`)});
        proc.on('exit',(code, signal)=>{
            process.off('exit', onNodeExit);
            if (this.rcloneProcess === proc) {
                this.rcloneProcess = null;
            }
            this.logger.warn(`[Rclone] Rclone exited (code: ${code}, signal: ${signal})`);
        });

        const start = Date.now()
        while (Date.now() - start < 3000) {
            if (proc.exitCode !== null) {
                break;
            }
            await new Promise(r => setTimeout(r, 300));
            if (await this.isHealthy()) {
                this.logger.log(`Rclone connected successfully (PID:${proc.pid})`);
                return;
            }
        }
        this.logger.log('Rclone couldnt be spawned within 3 seconds');
    }

    private async killProcess(): Promise<void> {
        const child_proc = this.rcloneProcess;

        if(!child_proc || child_proc.exitCode !== null){
            this.rcloneProcess = null;
            return
        }

        this.logger.log('Rclone process is shutting down..');

        try{
            await this.rcloneService.stopRcloneProcess(AbortSignal.timeout(500), child_proc.pid?.toString() ?? "");
        }catch{}

        const exitedCleanly = await new Promise<boolean>(resolve=>{
            if(child_proc.exitCode!==null) return resolve(true);
            
            const onExit = ()=>{
                clearTimeout(timer);
                resolve(true);
            };

            const timer = setTimeout(()=>{
                child_proc.off('exit', onExit);
                resolve(false);
            },1000);
            child_proc.once('exit',onExit);
        });

        if(!exitedCleanly && child_proc.pid){
            try{
                if(process.platform==='win32'){
                    await this.execFileAsync('taskkill',['/PID',String(child_proc.pid),'/T','/F'])
                }
                else{
                    child_proc.kill('SIGKILL')
                }
            }catch{}
        }

        this.rcloneProcess = null;
    }

    private resolveRcloneBinaryPath(): string | null {
        const candidates = [
            path.resolve(process.cwd(), this.configService.rclone.binaryPath),
            'c:/Sune_clone/Universal_Media_Manager/rclone/rclone.exe'
        ];
        return candidates.find((p) => fs.existsSync(p)) || null;
    }
}