import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Placeholders } from '../types/placeholder-types';

@Injectable()
export class RcloneService {
  private readonly logger = new Logger(RcloneService.name);
  private readonly baseUrl: string;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.baseUrl = this.configService.rclone.baseUrl;
  }

  /**
   * Core helper: Sends POST requests to Rclone RC server.
   * Any module (Auth, Drive, Transfer) calls this method.
   */
  public async call<T = any>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    this.logger.log(`[Rclone HTTP] POST ${url} payload: ${JSON.stringify(body)}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`[Rclone HTTP Error] ${response.status}: ${errorText}`);
        throw new Error(`Rclone RC returned ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as T;
      this.logger.log(`[Rclone HTTP Response] Success from ${endpoint}`);
      return data;
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        this.logger.error(`Could not reach Rclone at ${this.baseUrl}. Is 'rclone rcd' running?`);
        throw new Error(`Rclone server is not running at ${this.baseUrl}. Please start it with: .\\rclone\\rclone.exe rcd --rc-no-auth --rc-addr=127.0.0.1:5572`);
      }
      throw err;
    }
  }

  // --- Convenience Helpers using Placeholders ---
  public async getVersion() {
    return this.call(Placeholders.Endpoints.VERSION);
  }

  public async listRemotes() {
    const res = await this.call<{ remotes?: string[] }>(Placeholders.Endpoints.LIST_REMOTES);
    return res.remotes || [];
  }

  public async getQuota(fs: string) {
    return this.call(Placeholders.Endpoints.GET_QUOTA, { fs });
  }

  public async listDirectory(fs: string, remote = '', dirsOnly = false, filesOnly = false) {
    return this.call(Placeholders.Endpoints.LIST_DIRECTORY, {
      fs,
      remote,
      opt: { dirsOnly, filesOnly }
    });
  }

  public async startCopy(srcFs: string, dstFs: string) {
    const res = await this.call<{ jobid: number }>(Placeholders.Endpoints.COPY, {
      srcFs,
      dstFs,
      _async: true
    });
    return res.jobid;
  }

  public async getStats() {
    return this.call(Placeholders.Endpoints.STATS);
  }

  public async stopJob(jobid: number) {
    return this.call(Placeholders.Endpoints.STOP_JOB, { jobid });
  }
}
