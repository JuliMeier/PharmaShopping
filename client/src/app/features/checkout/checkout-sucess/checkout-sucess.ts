import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-sucess',
  imports: [
    MatButton,
    RouterLink
  ],
  templateUrl: './checkout-sucess.html',
  styleUrl: './checkout-sucess.scss',
})
export class CheckoutSucess {

}
