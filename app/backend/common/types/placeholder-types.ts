export enum DriveType {
  GOOGLE_DRIVE = 'drive',
  ONEDRIVE = 'onedrive',
  DROPBOX = 'dropbox',
  LOCAL = 'local'
}

export enum DriveScope {
  FULL = 'drive',
  READONLY = 'drive.readonly',
  FILE = 'drive.file'
}

export class Placeholders {
  static readonly DriveType = DriveType;
  static readonly DriveScope = DriveScope;

  // Standard Rclone RPC endpoints
  static readonly Endpoints = {
    VERSION: 'core/version',
    CREATE_REMOTE: 'config/create',
    DELETE_REMOTE: 'config/delete',
    LIST_REMOTES: 'config/listremotes',
    GET_QUOTA: 'operations/about',
    LIST_DIRECTORY: 'operations/list',
    COPY: 'sync/copy',
    MOVE: 'sync/move',
    STATS: 'core/stats',
    STOP_JOB: 'job/stop',
    JOB_STATUS: 'job/status',
    OAUTH_STOP: 'config/oauthstop',
    OAUTH_STATUS: 'config/oauthstatus'
  } as const;
}
