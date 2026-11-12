import { BadGatewayException, BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { JobManagerService } from "../jobs/jobs.service";
import { ConfigService } from "../common/config/config.service";
import { RcloneService } from "../rclone/rclone.service";
import { CompleteFileList, FileContents, FileListDto, OptionalMetaData, RetrieveFileMetadata } from "./dto/files-list.dto";
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

            //convert the hashmap into reverse lookup table 
            const dict = createReverseLookupMap(Placeholders.MediaFileExtensions, {
                mapKey: (k) => k.replace('_EXT', ''),
                normalize: (v) => v.toLowerCase(),
            });

            //Init the new hashmap with empty val for keys
            const organizedFiles: Record<string, any[]> = {
                FOLDER: [],
                OTHER: [],
            };
            //populating the hashmap with reverse lookup of old hashmap
            for (const k of Object.keys(Placeholders.MediaFileExtensions)) {
                organizedFiles[k.replace('_EXT', '')] = [];
            }

            //remove file extention and then based on key populate the corresponding value
            for (const file of files.list ?? []) {
                const name: string = file.Name ?? '';
                const dot = name.lastIndexOf('.');
                const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
                const category = file.IsDir ? 'FOLDER' : (dict.get(ext) ?? 'OTHER');

                (organizedFiles[category] ??= []).push(file);
            }

            //return the new hashmap
            this.jobManage.completeJob(jobId, organizedFiles);
        }catch(err){
            this.jobManage.emitProgress(jobId,Placeholders.Status.FAILED,{message:'Failed to scan the drive'})     
        }
    }

    async retrieveFileContents(dto: FileContents, range?: string) {
        try {
            const fs = dto.fs.includes(':') ? dto.fs : `${dto.fs}:`;
            const unParsedMetadata = dto.metadata
                ? null
                : (await this.rclone.call<{ item: Record<string, any> | null }>(
                      Placeholders.Endpoints.GET_FILE_METADATA,
                      { fs, remote: dto.filePath }
                  ))?.item;

            if (!unParsedMetadata && !dto.metadata) {
                throw new NotFoundException(`File not found at ${fs}${dto.filePath}`);
            }

            const fileMetadata: RetrieveFileMetadata = dto.metadata ?? {
                path: unParsedMetadata?.Path ?? dto.filePath,
                name: unParsedMetadata?.Name ?? dto.filePath.split('/').pop() ?? 'file',
                size: unParsedMetadata?.Size ?? -1,
                mimeType: unParsedMetadata?.MimeType,
                modTime: unParsedMetadata?.ModTime,
                isDir: Boolean(unParsedMetadata?.IsDir),
                id: unParsedMetadata?.ID,
            };

            if (fileMetadata.isDir) {
                throw new BadRequestException(`${fileMetadata.name} is a directory please select a file`);
            }

            const size = fileMetadata.size ?? -1;
            const mimeType = fileMetadata.mimeType ?? 'application/octet-stream';
            const filename = fileMetadata.name;
            const headers: Record<string, string> = {};

            if (range && size >= 0) {
                headers['Range'] = range;
            }

            const controller = new AbortController();
            const res = await this.rclone.fetchFileContent(
                `[${fs}]/${this.parseUrl(fileMetadata.path)}`,
                controller,
                headers
            );

            if (!res.ok || !res.body) {
                throw new BadGatewayException(`Not able to retrieve file ${filename}`);
            }

            return { res, size, mimeType, filename, controller };
        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            throw new InternalServerErrorException('Something bad happened');
        }
    }

    private parseUrl(url:string):string{
        const parseurl = url.split('/').map(part=>encodeURIComponent(part)).join('/');
        return parseurl;
    }

}