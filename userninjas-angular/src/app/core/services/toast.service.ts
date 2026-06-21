import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  show(message: string, action = 'Close', duration = 3000) {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  success(message: string, duration = 3000) {
    this.snackBar.open(message, '✓', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['toast-success'],
    });
  }

  error(message: string, duration = 4000) {
    this.snackBar.open(message, '✗', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['toast-error'],
    });
  }
}
