import { inject, Injectable } from '@angular/core';
import { ConfirmationToken, loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cart';
import { Cart, ShoppingCart } from '../../shared/models/cart';
import { firstValueFrom, map } from 'rxjs';
import { Account } from './account';



@Injectable({
  providedIn: 'root',
})
export class StripeService {
  baseUrl = environment.apiUrl;
  private cartService = inject(CartService);
  private accountService = inject(Account);
  private http = inject(HttpClient);
  private stripePromise: Promise<Stripe | null>;
  private elements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.getStripeInstance();

      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
        this.elements = stripe.elements(
          { clientSecret: cart.clientSecret, appearance: { labels: 'floating' } });
      } else {
        throw new Error('Stripe failed to initialize');
      }
    }
    return this.elements;
  }


  async createPaymentElement() {
    if (!this.paymentElement) {
      const elements = await this.initializeElements();

      if (elements) {
        this.paymentElement = elements.create('payment');
      } else {
        throw new Error('Stripe Elements failed to initialize');
      }
    }
    return this.paymentElement;
  }

  async createAddressElement() {
    if (!this.addressElement) {
      const elements = await this.initializeElements();
      if (elements) {

        const user = this.accountService.currentUser();
        let defaultValues: StripeAddressElementOptions['defaultValues'] = {};

        if (user) {
          defaultValues.name = user.firstName + ' ' + user.lastName;
        }

        if (user?.address) {
          defaultValues.address = {
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postal_code: user.address.zipCode,

          }

        }

        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues
        };

        this.addressElement = elements.create('address', options);
      } else {
        throw new Error('Stripe Elements failed to initialize');
      }
    }
    return this.addressElement;
  }

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const results = await elements.submit();

    if (results.error) {
      throw new Error(results.error.message);
    }
    if (stripe) {
      return await stripe.createConfirmationToken({ elements });
    } else {
      throw new Error('Stripe failed to initialize');
    }

  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const results = await elements.submit();
    
    if (results.error) {
      throw new Error(results.error.message);
    }

    const clientSecret = this.cartService.cart()?.clientSecret;


    if (stripe && clientSecret) {
      return await stripe.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: {
          confirmation_token: confirmationToken.id,
        },
        redirect: 'if_required',
      })
    } else {
      throw new Error('Stripe failed to initialize');     
    }
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart');

    return this.http.post<ShoppingCart>(this.baseUrl + 'payments/' + cart.id, {}).pipe(
      map(cart => {
        this.cartService.setCart(cart);
        return cart;
      })
    )
  }


  disposeElements() {
    this.addressElement?.destroy();
    this.addressElement = undefined;
    this.elements = undefined;
    this.paymentElement = undefined;
  }
}
