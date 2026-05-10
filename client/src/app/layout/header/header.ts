import { Component, inject } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Busy } from '../../core/services/busy';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CartService } from '../../core/services/cart';

@Component({
  selector: 'app-header',
  imports: [MatBadge, MatButton, MatIcon, RouterLink, RouterLinkActive, MatProgressBar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  busyService = inject(Busy); 
  cartService = inject(CartService );
}
