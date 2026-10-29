import { Controller, Post, Get, Delete, Body, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConnectDriveDTO } from './dto/connect-drive.dto';

@ApiTags('Authentication & Onboarding')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('connect-gdrive')
  @ApiOperation({ summary: 'Initiate Google Drive OAuth onboarding' })
  @ApiBody({ type: ConnectDriveDTO })
  async connectGoogleDrive(@Body() dto: ConnectDriveDTO) {
    return this.authService.connectGoogleDrive(dto);
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
