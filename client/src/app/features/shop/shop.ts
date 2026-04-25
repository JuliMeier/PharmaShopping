import { Component, inject, OnInit, signal } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop';
import { MatCard } from '@angular/material/card';
import { ProductItem } from "./product-item/product-item";
import { MatDialog } from '@angular/material/dialog';
import { FiltersDialog } from './filters-dialog/filters-dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatList, MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ShopParams } from '../../shared/models/shopParams';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  imports: [
    MatCard,
    ProductItem,
    MatButton, MatIcon,
    MatMenu,
    MatSelectionList,
    MatListOption,
    MatMenuTrigger,
    MatPaginator,
    FormsModule,
    MatIconButton
],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {

  private shopService = inject(ShopService)
  private dialogService = inject(MatDialog);

  products?: Pagination<Product>;

  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'priceAsc', label: 'Price: Low to High' },
    { value: 'priceDesc', label: 'Price: High to Low' }
  ];

  shopParams = new ShopParams();
  pageSizeOptions = [5, 10, 20, 50];
  
  ngOnInit(): void {
    this.initializeShop();
  };

  initializeShop() {
    this.shopService.getBrands();
    this.shopService.getTypes();
    this.getProducts();
  }
  
  getProducts(){
    this.shopService.getProducts(this.shopParams).subscribe({
      next: (response) => {
        this.products = response;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
    });
    
  }

  onSearchChange() {
    this.shopParams.pageNumber = 1; // Reset to first page on search change
    this.getProducts();
  }

  handlePageEvent(event: PageEvent){
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }

  onSortChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    if (selectedOption) {
      this.shopParams.sort = selectedOption.value;
      this.shopParams.pageNumber = 1; // Reset to first page on sort change
      this.getProducts();
    }
    
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FiltersDialog, {
      minWidth: '500px',
      data: {
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    })

    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.shopParams.brands = result.selectedBrands;
          this.shopParams.types = result.selectedTypes;
          this.shopParams.pageNumber = 1; // Reset to first page on filter change
          this.getProducts();
        }
      }
    });
  }
}