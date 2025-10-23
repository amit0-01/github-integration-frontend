import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Inject MatSnackBar for notifications
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: any) => {
      let errorMsg = 'An unknown error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMsg = `Client Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMsg = `Error ${error.status}: ${error.message}`;
      }

      // Show error in snackbar
      snackBar.open(errorMsg, 'Close', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });

      console.error('HTTP Error Intercepted:', error);

      // Pass the error along
      return throwError(() => error);
    })
  );
};
