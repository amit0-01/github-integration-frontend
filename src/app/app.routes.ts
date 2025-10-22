import { Routes } from '@angular/router';
import { DataViewerComponent } from './components/data-viewer/data-viewer.component';
import { IntegrationsComponent } from './components/integrations/integrations.component';

export const routes: Routes = [
    { path: '', redirectTo: '/integrations', pathMatch: 'full' },
    { path: 'integrations', component: IntegrationsComponent },
    { path: 'data-viewer', component: DataViewerComponent },
    { path: '**', redirectTo: '/integrations' }
  ];
