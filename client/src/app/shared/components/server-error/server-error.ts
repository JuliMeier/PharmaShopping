import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  imports: [MatCard],
  templateUrl: './server-error.html',
  styleUrl: './server-error.scss',
})
export class ServerError {
  error?: any;

  constructor(private router: Router) {
    const navigation = this.router.currentNavigation();
    this.error = navigation?.extras.state?.['error'];
   
    
  }
}
