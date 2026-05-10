import { Component, inject } from '@angular/core';
import { CartService } from '../../core/services/cart';
import { CurrencyPipe } from '@angular/common';
import { CartItemComponent } from "./cart-item/cart-item";
import { OrderSummary } from "../../shared/components/order-summary/order-summary";

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, CartItemComponent, OrderSummary],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartService = inject(CartService);
}
