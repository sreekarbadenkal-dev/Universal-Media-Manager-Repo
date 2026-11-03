import { Injectable, Inject, Logger, MessageEvent } from '@nestjs/common';
import { RcloneService } from '../common/rclone/rclone.service';
import { ConfigService } from '../common/config/config.service';
import { Placeholders } from '../common/types/placeholder-types';
import { ConnectDriveDTO } from './dto/connect-drive.dto';
import { Observable } from 'rxjs';
import { JobManagerService } from '../common/jobs/jobs.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(RcloneService) private readonly rclone: RcloneService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(JobManagerService) private readonly jobManager: JobManagerService
  ) { }

  //Helper to construct parameters with custom client credentials if configured

  private buildDriveParameters(scope?: string): Record<string, string> {
    const params: Record<string, string> = {
      scope: scope || Placeholders.DriveScope.FULL
    };

    if (this.configService.rclone.clientId) {
      params.client_id = this.configService.rclone.clientId;
    }
    if (this.configService.rclone.clientSecret) {
      params.client_secret = this.configService.rclone.clientSecret;
    }

    return params;
  }

  //Onboard a user by connecting their Google Drive account
  async processGoogleDriveAuth(jobId: string, dto: ConnectDriveDTO) {
    this.jobManager.emitProgress(jobId, Placeholders.AuthStatus.INIT, { message: 'Cleaning previous auth process' });

    await this.rclone.call(Placeholders.Endpoints.OAUTH_STOP).catch(() => { })

    this.jobManager.emitProgress(jobId, Placeholders.AuthStatus.WAITING, { message: 'Browser opened waiting for user' });

    try {

      await this.rclone.call(Placeholders.Endpoints.CREATE_REMOTE, {
        name: dto.name,
        type: Placeholders.DriveType.GOOGLE_DRIVE,
        parameters: this.buildDriveParameters(dto.scope)
      });


      this.jobManager.completeJob(jobId, {
        status: Placeholders.AuthStatus.SUCCESS,
        remoteName: `${dto.name}:`
      });
    } catch (err: any) {
      this.jobManager.failJob(jobId, err);
    }

  }


  async listAccounts() {
    return this.rclone.call(Placeholders.Endpoints.LIST_REMOTES);
  }

  async disconnectAccount(name: string) {
    return this.rclone.call(Placeholders.Endpoints.DELETE_REMOTE, { name });
  }

  async stopOAuth() {
    return this.rclone.call(Placeholders.Endpoints.OAUTH_STOP);
  }
}
