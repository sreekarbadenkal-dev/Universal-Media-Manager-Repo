import { Global, Module } from '@nestjs/common';
import { RcloneController } from './rclone.controller';
import { RcloneService } from './rclone.service';
import { RcloneProcessService } from './rclone-process.service';

@Global()
@Module({
  controllers: [RcloneController],
  providers: [RcloneService, RcloneProcessService],
  exports: [RcloneService, RcloneProcessService]
})
export class RcloneModule {}

