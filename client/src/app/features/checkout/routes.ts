import { Route } from '@angular/router';
import { CheckoutSucess } from './checkout-sucess/checkout-sucess';
import { authGuard } from '../../core/guards/auth-guard';
import { orderCompleteGuard } from '../../core/guards/order-complete-guard';
import { Checkout } from './checkout';
import { emptyCartGuard } from '../../core/guards/empty-cart-guard';


export const checkoutRoutes: Route[] = [
    {path: '', component: Checkout, canActivate: [authGuard, emptyCartGuard]},
    {path: 'success', component: CheckoutSucess, canActivate: [authGuard, orderCompleteGuard]},
]