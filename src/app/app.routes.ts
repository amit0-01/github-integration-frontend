import { Routes } from '@angular/router';


export const routes: Routes = [
    { path: '', redirectTo: '/integrations', pathMatch: 'full' },
    { path: 'integrations', 
      loadChildren : () => import('./modules/integrations/integrations.module').then(m => m.IntegrationsModule)
     },
    { path: 'data-viewer',
      loadChildren : () => import('./modules/data-viewer/data-viewer.module').then(m => m.DataViewerModule)
     },
    { path: '**', redirectTo: '/integrations' }
  ];
