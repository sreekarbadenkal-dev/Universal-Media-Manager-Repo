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

export class FileContents{
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Name of the connection',
        example: "drive-name:"
    })
    fs!: string;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        type: Boolean,
        description: 'If true makes file downloadable else streamable',
        example: "true"
    })
    download?:boolean=false;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'the path of file in drive',
        example: "my-drive/abc/file.txt"
    })
    filePath!:string;

    @ApiProperty({
        type: () => RetrieveFileMetadata,
        required: false,
        description: 'Optional pre-fetched file metadata'
    })
    @ValidateNested()
    @Type(() => RetrieveFileMetadata)
    @IsOptional()
    metadata?: RetrieveFileMetadata;
}

export class RetrieveFileMetadata {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: 'my-drive/abc/file.txt',
        description: 'Complete path to locate file'
    })
    path!: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        example: 'My Work understanding.docx',
        description: 'Name of the file or directory'
    })
    name!: string;

    @IsNumber()
    @ApiProperty({
        type: Number,
        example: -1,
        description: 'File size in bytes (-1 if unknown, e.g. exported Google Docs)'
    })
    size!: number;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'MIME type of the file'
    })
    mimeType?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: '2026-09-04T10:43:10.771Z',
        description: 'Last modification timestamp in ISO 8601 format'
    })
    modTime?: string;

    @IsBoolean()
    @ApiProperty({
        type: Boolean,
        example: false,
        description: 'True if the item is a directory, false if it is a file'
    })
    isDir!: boolean;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        required: false,
        example: '1ZP8z-qjQNY1ZoeZUEyREQCPZEp2vYwAjnTFY481S35Q',
        description: 'Provider-specific file ID (when supported by the remote)'
    })
    id?: string;
}
