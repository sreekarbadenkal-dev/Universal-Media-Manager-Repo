import { Controller, Post, Get, Delete, Body, Query, Inject, Sse, MessageEvent, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { ConnectDriveDTO } from './dto/connect-drive.dto';
import { JobManagerService } from '../common/jobs/jobs.service';
import { Placeholders } from '../common/types/placeholder-types';

@ApiTags('Authentication & Onboarding')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(JobManagerService) private readonly jobManager: JobManagerService
  ) { }

  @Post('connect-gdrive')
  @ApiOperation({ summary: 'Initiate Google Drive OAuth onboarding' })
  @ApiBody({ type: ConnectDriveDTO })
  async connectGoogleDrive(@Body() dto: ConnectDriveDTO) {
    const jobId = this.jobManager.createJob();
    this.authService.processGoogleDriveAuth(jobId, dto);
    return {
      jobId: jobId,
      status: Placeholders.AuthStatus.INIT,
      streamUrl: `/auth/${jobId}/stream`
    }
  }

  @Sse(':jobId/stream')
  @ApiOperation({ summary: 'Stream Google Drive OAuth onboarding state via SSE' })
  connectGoogleDriveSse(@Param('jobId') jobId: string) {
    return this.jobManager.getStream(jobId);
  }


  @Post('stop-oauth')
  @ApiOperation({ summary: 'Cancel/stop any pending Google Drive OAuth listener' })
  async stopOAuth() {
    return this.authService.stopOAuth();
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List all linked cloud accounts' })
  async listAccounts() {
    return this.authService.listAccounts();
  }

  @Delete('disconnect')
  @ApiOperation({ summary: 'Disconnect/remove a linked cloud account' })
  @ApiQuery({ name: 'name', example: 'my-google-drive', description: 'Name of the remote to remove' })
  async disconnect(@Query('name') name: string) {
    return this.authService.disconnectAccount(name);
  }
}
