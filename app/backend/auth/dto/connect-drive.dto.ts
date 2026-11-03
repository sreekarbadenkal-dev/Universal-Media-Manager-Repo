import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Placeholders } from '../../common/types/placeholder-types';

export class ConnectDriveDTO {
  @ApiProperty({
    type: String,
    description: 'Unique nickname for this connection',
    example: 'my-google-drive'
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    type: String,
    description: 'OAuth permission scope',
    example: Placeholders.DriveScope.FULL,
    default: Placeholders.DriveScope.FULL
  })
  @IsString()
  @IsOptional()
  scope?: string = Placeholders.DriveScope.FULL;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom Google OAuth Client ID (optional)',
    example: '59702873.....apps.googleusercontent.com'
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Custom Google OAuth Client Secret (optional)',
    example: 'GOCSPX....'
  })
  @IsString()
  @IsOptional()
  clientSecret?: string;
}
