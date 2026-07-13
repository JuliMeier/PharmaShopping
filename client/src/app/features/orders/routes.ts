import { Route } from "@angular/router";
import { authGuard } from "../../core/guards/auth-guard";
import { OrderComponent } from "./order";
import { OrderDetailed } from "./order-detailed/order-detailed";


export const orderRoutes: Route[] = [
    {path: '', component: OrderComponent, canActivate: [authGuard]},
    {path: ':id', component: OrderDetailed, canActivate: [authGuard]},   
]