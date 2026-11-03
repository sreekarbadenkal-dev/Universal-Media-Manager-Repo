import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { RcloneService } from './rclone/rclone.service';
import { JobManagerService } from './jobs/jobs.service';

@Global()
@Module({
  providers: [ConfigService, RcloneService, JobManagerService],
  exports: [ConfigService, RcloneService, JobManagerService]
})
export class CommonModule { }

