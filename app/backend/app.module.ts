import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { RcloneController } from './controllers/rclone.controller';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [RcloneController],
  providers: [],
  exports: []
})
export class AppModule {}
