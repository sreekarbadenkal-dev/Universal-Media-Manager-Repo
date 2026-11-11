import { Inject, Injectable, Logger } from "@nestjs/common";
import { JobManagerService } from "../jobs/jobs.service";
import { ConfigService } from "../common/config/config.service";
import { RcloneService } from "../rclone/rclone.service";
import { CompleteFileList, FileListDto, OptionalMetaData } from "./dto/files-list.dto";
import { Placeholders } from "../common/types/placeholder-types";
import { createReverseLookupMap } from "../common/types/helper-methods";


@Injectable()
export class ExplorerService {
    private readonly logger = new Logger(ExplorerService.name);

    constructor(
        @Inject(JobManagerService) private readonly jobManage: JobManagerService,
        @Inject(ConfigService) private readonly configService: ConfigService,
        @Inject(RcloneService) private readonly rclone: RcloneService
    ) { }

    async scanAndFetchFiles(jobId: string, dto: FileListDto) {
        this.jobManage.emitProgress(jobId,Placeholders.Status.INIT,{message:'Started Scanning the drive'})

        try{
            const files = await this.rclone.listDirectory(dto);
            this.jobManage.completeJob(jobId,files);
        }catch(err){
            this.jobManage.emitProgress(jobId,Placeholders.Status.FAILED,{message:'Failed to scan the drive'})     
        }
    }

    async scanAndFetchAllFiles(jobId: string, dto:CompleteFileList){
        this.jobManage.emitProgress(jobId,Placeholders.Status.INIT,{message:'Started Scanning the drive'})

        try{
            const completeDto : FileListDto = {...dto,opt:{recurse:true,noModTime:false,noMimeType:false,MaxDepth:-1} as OptionalMetaData }; 

            const files = await this.rclone.listDirectory(completeDto);

            const dict = createReverseLookupMap(Placeholders.MediaFileExtensions, {
                mapKey: (k) => k.replace('_EXT', ''),
                normalize: (v) => v.toLowerCase(),
            });

            const organizedFiles: Record<string, any[]> = {
                FOLDER: [],
                OTHER: [],
            };
            for (const k of Object.keys(Placeholders.MediaFileExtensions)) {
                organizedFiles[k.replace('_EXT', '')] = [];
            }

            for (const file of files.list ?? []) {
                const name: string = file.Name ?? '';
                const dot = name.lastIndexOf('.');
                const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
                const category = file.IsDir ? 'FOLDER' : (dict.get(ext) ?? 'OTHER');

                (organizedFiles[category] ??= []).push(file);
            }

            this.jobManage.completeJob(jobId, organizedFiles);
        }catch(err){
            this.jobManage.emitProgress(jobId,Placeholders.Status.FAILED,{message:'Failed to scan the drive'})     
        }
    }
}