import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RcloneService } from '../common/rclone/rclone.service';

@ApiTags('Rclone Engine')
@Controller('rclone')
export class RcloneController {
  constructor(@Inject(RcloneService) private readonly rcloneService: RcloneService) {}

  @Get('version')
  @ApiOperation({ summary: 'Check if Rclone daemon is reachable and get version info' })
  async getVersion() {
    return this.rcloneService.getVersion();
  }

  @Get('remotes')
  @ApiOperation({ summary: 'List all configured remotes (e.g. Google Drive)' })
  async listRemotes() {
    return this.rcloneService.listRemotes();
  }

  @Get('quota')
  @ApiOperation({ summary: 'Get total, used, and free space on a local drive or remote' })
  @ApiQuery({ name: 'path', example: 'C:/', description: 'Drive path like C:/ or gdrive:' })
  async getQuota(@Query('path') path: string) {
    return this.rcloneService.getQuota(path || 'C:/');
  }

  @Get('list')
  @ApiOperation({ summary: 'List folders and files at a given path' })
  @ApiQuery({ name: 'fs', example: 'C:/', description: 'Root filesystem/drive' })
  @ApiQuery({ name: 'remote', required: false, example: '', description: 'Subdirectory inside the drive' })
  async listFiles(@Query('fs') fs: string, @Query('remote') remote?: string) {
    return this.rcloneService.listDirectory(fs || 'C:/', remote || '');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get real-time transfer speeds, bytes transferred, and active jobs' })
  async getStats() {
    return this.rcloneService.getStats();
  }
}
