import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { RcloneModule } from './rclone/rclone.module';
import { AuthModule } from './auth/auth.module';
import { ExplorerModule } from './explorer/explorer.module';
import { JobModule } from './jobs/jobs.module';

@Module({
  imports: [CommonModule, RcloneModule, AuthModule, ExplorerModule, JobModule],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {}
