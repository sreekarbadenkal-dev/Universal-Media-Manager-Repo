import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
}

export interface RcloneConfig {
  baseUrl: string;
  binaryPath: string;
  clientId?: string | undefined;
  clientSecret?: string | undefined;
}

export interface SwaggerConfig {
  enabled: boolean;
  path: string;
}

export interface AppEnvironmentConfig {
  server: ServerConfig;
  rclone: RcloneConfig;
  swagger: SwaggerConfig;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private readonly currentConfig: AppEnvironmentConfig;
  public readonly env: string;

  constructor() {
    this.env = process.env.NODE_ENV || 'development';

    // Attempt to load .env file if available
    const possibleEnvPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), 'app/backend/.env'),
      path.resolve(__dirname, '../../../../.env'),
      path.resolve(__dirname, '../../../.env')
    ];
    for (const envPath of possibleEnvPaths) {
      if (fs.existsSync(envPath)) {
        try {
          (process as any).loadEnvFile?.(envPath);
          this.logger.log(`Loaded environment file from: ${envPath}`);
          break;
        } catch { }
      }
    }

    const configFilePath = path.resolve(__dirname, 'config.json');

    try {
      const raw = fs.readFileSync(configFilePath, 'utf8');
      const allConfigs = JSON.parse(raw);

      if (!allConfigs[this.env]) {
        this.logger.warn(`Environment '${this.env}' not found in config.json. Falling back to 'development'.`);
        this.currentConfig = allConfigs['development'];
      } else {
        this.currentConfig = allConfigs[this.env];
      }

      // Resolve environment variable placeholders for Rclone OAuth
      if (this.currentConfig.rclone) {
        this.currentConfig.rclone.clientId =
          process.env.GOOGLE_CLIENT_ID ||
          (this.currentConfig.rclone.clientId?.startsWith('${') ? undefined : this.currentConfig.rclone.clientId);

        this.currentConfig.rclone.clientSecret =
          process.env.GOOGLE_CLIENT_SECRET ||
          (this.currentConfig.rclone.clientSecret?.startsWith('${') ? undefined : this.currentConfig.rclone.clientSecret);
      }

      this.logger.log(`Loaded configuration for environment: [${this.env}]`);
    } catch (err: any) {
      this.logger.error(`Failed to load config.json: ${err.message}`);
      throw err;
    }
  }

  get server(): ServerConfig {
    return this.currentConfig.server;
  }

  get rclone(): RcloneConfig {
    return this.currentConfig.rclone;
  }

  get swagger(): SwaggerConfig {
    return this.currentConfig.swagger;
  }
}
