import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Shop } from './features/shop/shop';
import { ProductDetails } from './features/shop/product-details/product-details';
import { TestError } from './features/test-error/test-error';
import { NotFound } from './shared/components/not-found/not-found';
import { ServerError } from './shared/components/server-error/server-error';
import { Cart } from './features/cart/cart';
import { Checkout } from './features/checkout/checkout';
import { Login } from './features/account/login/login';
import { Register } from './features/account/register/register';
import { authGuard } from './core/guards/auth-guard';
import { emptyCartGuard } from './core/guards/empty-cart-guard';
import { CheckoutSucess } from './features/checkout/checkout-sucess/checkout-sucess';
import { OrderComponent } from './features/orders/order';
import { OrderDetailed } from './features/orders/order-detailed/order-detailed';
import { orderCompleteGuard } from './core/guards/order-complete-guard';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'shop', component: Shop},
    {path: 'shop/:id', component: ProductDetails}, 
    {path: 'cart', component: Cart},
    {path: 'checkout', component: Checkout, canActivate: [authGuard, emptyCartGuard]},
    {path: 'checkout/success', component: CheckoutSucess, canActivate: [authGuard, orderCompleteGuard]},
    {path: 'orders', component: OrderComponent, canActivate: [authGuard]},
    {path: 'orders/:id', component: OrderDetailed, canActivate: [authGuard]},
    {path: 'account/login', component: Login}, 
    {path: 'account/register', component: Register},
    {path: 'test-error', component: TestError}, 
    {path: 'not-found', component: NotFound},
    {path: 'server-error', component: ServerError},
    {path: '**', redirectTo: 'not-found', pathMatch: 'full'}
];
