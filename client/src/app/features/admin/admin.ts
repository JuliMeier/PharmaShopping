import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { PageEvent } from '@angular/material/paginator';
import { AdminService } from '../../../app/core/services/admin';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AfterViewInit } from '@angular/core';
import { Order } from '../../shared/models/order';
import { MatPaginator } from '@angular/material/paginator';
import { OrderParams } from '../../shared/models/orderParams';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatLabel, MatSelectModule } from '@angular/material/select';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { MatActionList } from "@angular/material/list";
import { Dialog } from '../../core/services/dialog';

@Component({
  selector: 'app-admin',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButton,
    MatIcon,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
    MatLabel,
    MatTooltipModule,
    MatTabsModule,
    RouterLink,
    MatActionList
], 
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements  OnInit {

  displayedColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'total','status','action'];
  dataSource = new MatTableDataSource<Order>([]);
  private adminService = inject(AdminService);
  private dialogServie = inject(Dialog);
  orderParams = new OrderParams();
  totalItems = 0;
  statusOptions = ['All', 'PaymentReceived', 'PaymentMismatch', 'Refunded', 'Pending'];
  

  
  ngOnInit(): void {
    this.loadOrders();
  }



  loadOrders() {
    this.adminService.getOrders(this.orderParams).subscribe({
      next: response => {
        if (response.data) {
          this.dataSource.data = response.data;
          this.totalItems = response.count;
        }
      }
    })
  }

  onPageChange(event: PageEvent) {
    this.orderParams.pageNumber = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrders();
  }

  onFilterSelect(event: MatSelectChange) {
    this.orderParams.filter = event.value;
    this.orderParams.pageNumber = 1;
    this.loadOrders();
  }

  async openConfirmDialog(id: number) {
    const confirmed = await this.dialogServie.confirm(
      'Confirm Refund',
      'Are you sure you want to refund this order? This cannot be undone.'
    )

    if (confirmed) this.refundOrder(id);
  }

  refundOrder(id: number) {
    this.adminService.refundOrder(id).subscribe({
      next: order => {
        this.dataSource.data = this.dataSource.data.map(o => o.id === order.id ? order : o);
      }
    })
  }
}
