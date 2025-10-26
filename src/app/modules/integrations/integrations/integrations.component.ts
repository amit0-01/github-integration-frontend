import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {  GithubService } from '../../../services/github.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { IntegrationStatus } from '../../../core/interfaces/github.interface';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrl: './integrations.component.scss',
  standalone : false
})
export class IntegrationsComponent {
  integrationStatus: IntegrationStatus | null = null;
  loading = false;
  syncing = false;
  panelExpanded = false;

  constructor(
    private githubService: GithubService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check for OAuth callback
    this.handleOAuthCallback();
    this.checkIntegrationStatus();
  }

  private handleOAuthCallback(): void {
    this.route.queryParams.subscribe(params => {
      if (params['success'] === 'true' && params['userId']) {
        this.githubService.setUserId(params['userId']);
        this.snackBar.open('GitHub integration connected successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Remove query params
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {}
        });
        this.checkIntegrationStatus();
      } else if (params['success'] === 'false') {
        this.snackBar.open('Failed to connect GitHub integration', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  checkIntegrationStatus(): void {
    const userId = this.githubService.getUserId();
    if (!userId) {
      this.integrationStatus = { connected: false };
      return;
    }

    this.loading = true;
    this.githubService.getIntegrationStatus(userId).subscribe({
      next: (status) => {
        this.integrationStatus = status;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error checking integration status:', error);
        this.integrationStatus = { connected: false };
        this.loading = false;
      }
    });
  }

  connectGithub(): void {
    this.loading = true;
    this.githubService.getAuthUrl().subscribe({
      next: (response) => {
        window.location.href = response.authUrl;
      },
      error: (error) => {
        console.error('Error getting auth URL:', error);
        this.snackBar.open('Failed to initiate GitHub connection', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  removeIntegration(): void {
    const userId = this.githubService.getUserId();
    if (!userId) return;

    if (!confirm('Are you sure you want to remove this integration? All synced data will be deleted.')) {
      return;
    }

    this.loading = true;
    this.githubService.removeIntegration(userId).subscribe({
      next: () => {
        this.integrationStatus = { connected: false };
        this.loading = false;
        this.panelExpanded = false;
        this.snackBar.open('Integration removed successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error removing integration:', error);
        this.loading = false;
        this.snackBar.open('Failed to remove integration', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  resyncIntegration(): void {
    const userId = this.githubService.getUserId();
    if (!userId) return;

    this.syncing = true;
    this.githubService.resyncIntegration(userId).subscribe({
      next: () => {
        this.snackBar.open('Resync started in background. This may take a few minutes.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.syncing = false;
        
        setTimeout(() => {
          this.checkIntegrationStatus();
        }, 3000);
      },
      error: (error) => {
        console.error('Error resyncing integration:', error);
        this.syncing = false;
        this.snackBar.open('Failed to start resync', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewData(): void {
    this.router.navigate(['/data-viewer']);
  }

  getConnectedDate(): string {
    if (!this.integrationStatus?.connectedAt) return '';
    return new Date(this.integrationStatus.connectedAt).toLocaleDateString();
  }

  getLastSyncDate(): string {
    if (!this.integrationStatus?.lastSyncedAt) return 'Never';
    return new Date(this.integrationStatus.lastSyncedAt).toLocaleString();
  }
}
