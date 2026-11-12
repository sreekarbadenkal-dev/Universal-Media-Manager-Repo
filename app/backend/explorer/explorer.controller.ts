import { Body, Controller, Get, Inject, Post, Query, Req, Res } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiProduces, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ExplorerService } from "./explorer.service";
import { JobManagerService } from "../jobs/jobs.service";
import { CompleteFileList, FileContents, FileListDto } from "./dto/files-list.dto";
import { Readable } from "node:stream";
import type { Request, Response } from "express";

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

    @Get('file-content')
    @ApiOperation({ summary: 'Stream or download file contents' })
    @ApiProduces('application/octet-stream')
    @ApiOkResponse({
        description: 'File content stream',
        schema: { type: 'string', format: 'binary' }
    })
    @ApiQuery({ name: 'fs', required: true, type: String, example: 'drive-name:' })
    @ApiQuery({ name: 'filePath', required: true, type: String, example: 'my-drive/abc/file.txt' })
    @ApiQuery({ name: 'download', required: false, type: Boolean, example: false })
    async fetchFileContent(
        @Query() dto: FileContents,
        @Req() req: Request,
        @Res() res: Response
    ): Promise<void> {
        const { res: rcloneRes, size, mimeType, filename, controller } =
            await this.explorerService.retrieveFileContents(dto, req.headers.range);

        res.on('close', () => {
            if (!res.writableFinished)
                controller.abort()
        });

        const isDownload = dto.download === true || String(dto.download) === 'true';
        const disposition = isDownload ? 'attachment' : 'inline';
        const safeAsciiName = filename.replace(/["\\]/g, '_');
        const encodedName = encodeURIComponent(filename);

        res.setHeader('Content-Type', mimeType || rcloneRes.headers.get('content-type') || 'application/octet-stream');
        res.setHeader('Content-Disposition', `${disposition}; filename="${safeAsciiName}"; filename*=UTF-8''${encodedName}`);

        const contentLength = rcloneRes.headers.get('content-length');
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        } else if (size >= 0) {
            res.setHeader('Content-Length', String(size));
        }

        if (size >= 0) {
            res.setHeader('Accept-Ranges', 'bytes');
        }

        const contentRange = rcloneRes.headers.get('content-range');
        if (rcloneRes.status === 206 && contentRange) {
            res.status(206);
            res.setHeader('Content-Range', contentRange);
        }

        const nodeStream = Readable.fromWeb(rcloneRes.body as any);
        nodeStream.on('error', () => {
            if (!res.headersSent) {
                res.status(502).end();
            } else {
                res.destroy();
            }
        });
        nodeStream.pipe(res);
    }

}