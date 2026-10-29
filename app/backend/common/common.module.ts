import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { RcloneService } from './rclone/rclone.service';

@Global()
@Module({
  providers: [ConfigService, RcloneService],
  exports: [ConfigService, RcloneService]
})
export class CommonModule {}

