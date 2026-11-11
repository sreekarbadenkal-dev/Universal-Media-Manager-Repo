import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ExplorerService } from "./explorer.service";
import { JobManagerService } from "../jobs/jobs.service";
import { CompleteFileList, FileListDto } from "./dto/files-list.dto";

@ApiTags('FileExploration and organize')
@Controller('explorer')
export class ExplorerController {

    constructor(
        @Inject(ExplorerService) private readonly explorerService: ExplorerService,
        @Inject(JobManagerService) private readonly jobManager: JobManagerService
    ) { }

    @Post('list')
    @ApiOperation({ summary: 'Fetch list of files on the rclone remote' })
    @ApiBody({ type: FileListDto })
    async fetchFileList(@Body() dto: FileListDto) {
        const jobId = this.jobManager.createJob();
        this.explorerService.scanAndFetchFiles(jobId, dto);
        return {
            jobId: jobId,
            status: '',
            streamUrl: '/jobs/stream'
        }
    }

    @Post('all-files')
    @ApiOperation({ summary: 'Fetch list of all files on the rclone remote' })
    @ApiBody({ type: CompleteFileList })
    async fetchCompleteFileList(@Body() dto: CompleteFileList) {
        const jobId = this.jobManager.createJob();
        this.explorerService.scanAndFetchAllFiles(jobId, dto);
        return {
            jobId: jobId,
            status: '',
            streamUrl: '/jobs/stream'
        }
    }


}