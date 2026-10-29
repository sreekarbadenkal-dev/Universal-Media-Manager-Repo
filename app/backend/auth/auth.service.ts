import { Injectable, Inject, Logger } from '@nestjs/common';
import { RcloneService } from '../common/rclone/rclone.service';
import { Placeholders } from '../common/types/placeholder-types';
import { ConnectDriveDTO } from './dto/connect-drive.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(@Inject(RcloneService) private readonly rclone: RcloneService) {}

  /**
   * Onboard a user by connecting their Google Drive account
   */
  async connectGoogleDrive(dto: ConnectDriveDTO) {
    this.logger.log(`Initiating Google Drive onboarding for: [${dto.name}]`);

    // Clean up any previously dangling OAuth listener on port 53682
    try {
      await this.rclone.call(Placeholders.Endpoints.OAUTH_STOP);
      this.logger.log('Closed previous dangling OAuth listener on port 53682');
    } catch {
      // Ignore if no OAuth was previously active
    }

    return this.rclone.call(Placeholders.Endpoints.CREATE_REMOTE, {
      name: dto.name,
      type: Placeholders.DriveType.GOOGLE_DRIVE,
      parameters: {
        scope: dto.scope || Placeholders.DriveScope.FULL
      }
    });
  }

  /**
   * Lists all connected cloud accounts/remotes
   */
  async listAccounts() {
    return this.rclone.call(Placeholders.Endpoints.LIST_REMOTES);
  }

  /**
   * Disconnect / remove an account
   */
  async disconnectAccount(name: string) {
    return this.rclone.call(Placeholders.Endpoints.DELETE_REMOTE, { name });
  }

  /**
   * Cancel any pending OAuth authentication in progress
   */
  async stopOAuth() {
    return this.rclone.call(Placeholders.Endpoints.OAUTH_STOP);
  }
}
