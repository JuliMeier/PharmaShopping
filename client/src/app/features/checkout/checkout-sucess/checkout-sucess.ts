import { Component, inject, OnDestroy } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Signalr } from '../../../core/services/signalr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { AddressPipe } from '../../../shared/pipes/address-pipe';
import { PaymentCardPipe } from '../../../shared/pipes/payment-card-pipe';
import { OrderService } from '../../../core/services/order';

@Component({
  selector: 'app-checkout-sucess',
  imports: [
    MatButton,
    RouterLink,
    MatProgressSpinnerModule,
    DatePipe,
    AddressPipe,
    CurrencyPipe,     
    PaymentCardPipe,
    NgIf    
  ],
  templateUrl: './checkout-sucess.html',
  styleUrl: './checkout-sucess.scss',
})
export class CheckoutSucess implements OnDestroy{
  signalrService = inject(Signalr);
  private orderService = inject(OrderService);

  ngOnDestroy(): void {
   this.orderService.orderComplete = false;
   this.signalrService.orderSignal.set(null);
   }
}
