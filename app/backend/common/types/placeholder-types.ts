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

  export enum Status {
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
    OAUTH_STATUS = 'config/oauthstatus',
    QUIT_DAEMON = 'core/quit'
  }

  export enum EventNames {
    AUTH = 'Authentication',
    FILE_LIST = 'FileList'
  }

  export const MediaFileExtensions = {
    VIDEO_EXT: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mpeg', 'mpg', 'm4v', '3gp', '3g2'],
    IMAGE_EXT: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg', 'ico'],
    AUDIO_EXT: ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'mp2', 'ac3', 'dts'],
    DOC_EXT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv', 'md'],
    SUBTITLE_EXT: ['srt', 'ass', 'ssa', 'vtt', 'sub', 'idx'],
    SUBFOLDER_EXT: ['directory','inode/directory','folder','subfolder']
  }
}
