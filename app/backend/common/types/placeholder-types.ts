export namespace Placeholders {
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

  export enum AuthStatus {
    INIT = 'INITIALIZING',
    WAITING = 'WAITING_FOR_USER',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
  }

  export enum Endpoints {
    VERSION = 'core/version',
    CREATE_REMOTE = 'config/create',
    DELETE_REMOTE = 'config/delete',
    LIST_REMOTES = 'config/listremotes',
    GET_QUOTA = 'operations/about',
    LIST_DIRECTORY = 'operations/list',
    COPY = 'sync/copy',
    MOVE = 'sync/move',
    STATS = 'core/stats',
    STOP_JOB = 'job/stop',
    JOB_STATUS = 'job/status',
    OAUTH_STOP = 'config/oauthstop',
    OAUTH_STATUS = 'config/oauthstatus'
  }

  export enum EventNames {
    AUTH = 'Authentication'
  }
}
