import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../core/services/shop';
import { MatButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatDivider, MatListOption, MatSelectionList } from '@angular/material/list';

@Component({
  selector: 'app-filters-dialog',
  imports: [CommonModule, MatButton, MatCheckboxModule,MatDivider, FormsModule, MatSelectionList, MatListOption],
  templateUrl: './filters-dialog.html',
  styleUrl: './filters-dialog.scss',
})
export class FiltersDialog {
  shopService = inject(ShopService);
  private dialogRef = inject(MatDialogRef<FiltersDialog>);
  data = inject(MAT_DIALOG_DATA);

  selectedBrands: string[] = this.data.selectedBrands;
  selectedTypes: string[] = this.data.selectedTypes;


  applyFilters() {
    this.dialogRef.close({
      selectedBrands: this.selectedBrands,
      selectedTypes: this.selectedTypes
    });
  }
}
