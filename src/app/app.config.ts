import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { errorInterceptor } from './core/interceptor/error.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(MatSnackBarModule),
    provideHttpClient(withInterceptorsFromDi()), 
    {
      provide: 'HTTP_INTERCEPTORS', 
      useValue: errorInterceptor,
      multi: true,
    },

  ]
};
