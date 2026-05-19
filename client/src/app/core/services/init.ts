import { inject, Injectable } from '@angular/core';
import { CartService } from './cart';
import { forkJoin, of } from 'rxjs';
import { Account } from './account';

@Injectable({
  providedIn: 'root',
})
export class Init {
  private cartService = inject(CartService);
  private accountService = inject(Account);

  init() {
    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);
    this.accountService.getUserInfo();
    return forkJoin({
      cart: cart$,
      user: this.accountService.getUserInfo()
    })
  }
}
