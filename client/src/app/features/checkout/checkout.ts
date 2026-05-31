import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { OrderSummary } from "../../shared/components/order-summary/order-summary";
import { MatStepper, MatStepperModule} from "@angular/material/stepper";
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { StripeService } from '../../core/services/stripe';
import { StripeAddressElement, StripeAddressElementChangeEvent } from '@stripe/stripe-js/dist/stripe-js/elements/address';
import { Snackbar } from '../../core/services/snackbar';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { Account } from '../../core/services/account';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { CheckoutDelivery } from "./checkout-delivery/checkout-delivery";
import { StripePaymentElement, StripePaymentElementChangeEvent } from '@stripe/stripe-js/dist/stripe-js/elements/payment';
import { CheckoutReview } from "./checkout-review/checkout-review";
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { CartService } from '../../core/services/cart';
import { ConfirmationToken } from '@stripe/stripe-js';


@Component({
  selector: 'app-checkout',
  imports: [OrderSummary, MatStepper, MatStepperModule, MatButton, MatCheckboxModule, MatProgressSpinnerModule, RouterLink, CheckoutDelivery, CheckoutReview, CurrencyPipe, JsonPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit, OnDestroy {

  private stripeService = inject(StripeService);
  private snackbar = inject(Snackbar);
  private router = inject(Router);
  private accountService = inject(Account);
  cartService = inject(CartService);
  addressElement?: StripeAddressElement;
  paymentElement?: StripePaymentElement;
  saveAddress = false;
  completionStatus = signal<{address: boolean, card: boolean, delivery: boolean}>({address: false, card: false, delivery: false});
  confirmationToken?: ConfirmationToken;
  loading = false;

  constructor() {
    this.handleAddressChange = this.handleAddressChange.bind(this);
  }

  async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      this.addressElement.mount('#address-element');
      this.addressElement.on('change', this.handleAddressChange);

      this.paymentElement = await this.stripeService.createPaymentElement();
      this.paymentElement.mount('#payment-element');
      this.paymentElement.on('change', this.handlePaymentChange);
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  handleAddressChange = (event: StripeAddressElementChangeEvent) => {
    this.completionStatus.update(status => ({ ...status, address: event.complete }));
  }

  handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
    this.completionStatus.update(status => ({ ...status, card: event.complete }));
  }

  handleDeliveryChange(event: boolean) {
    this.completionStatus.update(status => ({ ...status, delivery: event }));
  }

  async getConfirmationToken() {

    try {

      if (Object.values(this.completionStatus()).every(status => status === true)) {
        const result = await this.stripeService.createConfirmationToken();
        if (result.error) throw new Error(result.error.message);
        this.confirmationToken = result.confirmationToken;
        console.log(this.confirmationToken);
      }
      
    } catch (error: any) {
      this.snackbar.error(error.message);
    }
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress();
        address && firstValueFrom(this.accountService.updateAddress(address));
      }
    }

    if (event.selectedIndex === 2) {
      await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
    }

    if (event.selectedIndex === 3) {
      await this.getConfirmationToken();
    }
  }

  onSaveAddressCheckbokChange(event: MatCheckboxChange) {
    this.saveAddress = event.checked;
  }

  ngOnDestroy() {
    this.stripeService.disposeElements();
  }

  async confirmPayment(stepper: MatStepper) {
    this.loading = true;
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.confirmPayment(this.confirmationToken);
        if (result.error) {
          throw new Error(result.error.message);
        } else {
          this.cartService.deleteCart();
          this.cartService.selectedDelivery.set(null);
          this.router.navigateByUrl('/checkout/success');
        }
      }
    } catch (error: any) {
        this.snackbar.error(error.message || 'An error occurred while confirming payment');
        stepper.previous();
    } finally {
      this.loading = false;
    }
  }

  private async getAddressFromStripeAddress(): Promise<Address | null> 
    {
      const result = await this.addressElement?.getValue();
      const address = result?.value.address;

      if (address) {
        return {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          country: address.country,
          state: address.state,
          zipCode: address.postal_code,
        }
      } else {
        return null;
      }
    }
  }
