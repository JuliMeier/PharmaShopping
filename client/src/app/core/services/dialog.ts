import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
export class Dialog {
  private dialog = inject(MatDialog);

  confirm(title: string, message: string) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: { title, message },
    });

    return firstValueFrom(dialogRef.afterClosed());
  }

}
