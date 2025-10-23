export interface IntegrationStatus {
    connected: boolean;
    connectedAt?: Date;
    lastSyncedAt?: Date;
    username?: string;
    avatarUrl?: string;
    email?: string;
    name?: string;
  }