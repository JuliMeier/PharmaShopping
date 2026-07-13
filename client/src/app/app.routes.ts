import { Routes } from '@angular/router';
import { Admin } from './features/admin/admin';
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
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'shop', component: Shop},
    {path: 'shop/:id', component: ProductDetails}, 
    {path: 'cart', component: Cart},
    {path: 'checkout', loadChildren: () => import('./features/checkout/routes').then(m => m.checkoutRoutes) },
    {path: 'orders', loadChildren: () => import('./features/orders/routes').then(m => m.orderRoutes) },
    {path: 'account', loadChildren: () => import('./features/account/routes').then(m => m.accountRoutes) },
    {path: 'test-error', component: TestError}, 
    {path: 'not-found', component: NotFound},
    {path: 'server-error', component: ServerError},
    {path: 'admin', loadComponent: () => import('./features/admin/admin').then(m => m.Admin), canActivate: [authGuard, adminGuard]},
    {path: '**', redirectTo: 'not-found', pathMatch: 'full'}
];
