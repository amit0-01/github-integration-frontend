
export interface IntegrationStatus {
  connected: boolean;
  connectedAt?: Date;
  lastSyncedAt?: Date;
  username?: string;
  avatarUrl?: string;
  email?: string;
  name?: string;
}


export interface AuthUrlResponse {
  authUrl: string;
}


export interface SyncStatusResponse {
  organizations: number;
  repositories: number;
  commits: number;
  pullRequests: number;
  issues: number;
  issueChangelogs: number;
  users: number;
}

export interface ApiSuccessResponse {
  success: boolean;
  message: string;
}


export interface ResyncResponse extends ApiSuccessResponse {
  syncInProgress: boolean;
}