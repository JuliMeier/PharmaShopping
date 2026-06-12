import { inject, Injectable } from '@angular/core';
import { CartService } from './cart';
import { forkJoin, of, tap } from 'rxjs';
import { Account } from './account';
import { Signalr } from './signalr';

@Injectable({
  providedIn: 'root',
})
export class Init {
  private cartService = inject(CartService);
  private accountService = inject(Account);
  private signalrService = inject(Signalr);

  init() {
    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);
    
    return forkJoin({
      cart: cart$,
      user: this.accountService.getUserInfo().pipe(
        tap(user =>{
          if (user) this.signalrService.createHubConnection();
        })
      )
    })
  }
}
