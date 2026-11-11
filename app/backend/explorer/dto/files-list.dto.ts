import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

export class OptionalMetaData {
    @ApiProperty({
        type: Boolean,
        description: 'If true returns nested files',
        default: false,
        example: false,
    })
    @IsBoolean()
    @IsOptional()
    recurse?: boolean;

    @ApiProperty({
        type: Boolean,
        description: 'If false returns date of modification',
        example: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    noModTime?: boolean;

    @ApiProperty({
        type: Boolean,
        description: 'If false returns the type of file',
        example: false,
        default: false,
    })
    @IsBoolean()
    @IsOptional()
    noMimeType?: boolean;

    @ApiProperty({
        type: Number,
        description: 'Maximum depth of recursion',
        example: 1,
        default: 1,
    })
    @IsNumber()
    @IsOptional()
    MaxDepth?: number;
    
}

export class FileListDto {
    @ApiProperty({
        type: String,
        description: 'Name of the connection',
        example: "drive-name:"
    })
    @IsString()
    @IsNotEmpty()
    fs!: string;

    @ApiProperty({
        type: String,
        description: 'Internal absolute path',
        example: "myDrive/Photos/2023"
    })
    @IsString()
    @IsOptional()
    path?: string;

    @ApiProperty({
        type: OptionalMetaData,
        description: 'Other metadata to be mentioned while fetching users data',
    })
    @ValidateNested()
    @Type(() => OptionalMetaData)
    @IsOptional()
    opt?: OptionalMetaData

}

export class CompleteFileList{
    @ApiProperty({
        type: String,
        description: 'Name of the connection',
        example: "drive-name:"
    })
    @IsString()
    @IsNotEmpty()
    fs!: string;

    @ApiProperty({
        type: String,
        description: 'Internal absolute path',
        example: "myDrive/Photos/2023"
    })
    @IsString()
    @IsOptional()
    path?: string;
}