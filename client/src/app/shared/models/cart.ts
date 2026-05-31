import { nanoid } from 'nanoid';

export interface Cart {
    id: string;
    items: CartItem[];
    deliveryMethodId?: number;
    paymentIntentId?: string;
    clientSecret?: string;
}

export interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
    brand: string;
    type: string;
}

export class ShoppingCart implements Cart {
    id = nanoid();
    items: CartItem[] = [];
    deliveryMethodId?: number;
    paymentIntentId?: string;
    clientSecret?: string;
}