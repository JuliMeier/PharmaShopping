import { CanActivateFn, Router } from '@angular/router';
import { Account } from '../services/account';
import { inject } from '@angular/core';
import { Snackbar } from '../services/snackbar';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(Account);
  const router = inject(Router);
  const snack = inject(Snackbar);

  if (accountService.isAdmin()) {
      return true;
  } else {
    snack.error('You do not have permission to access this page.');
    router.navigateByUrl('/shop');
    return false;
  }
};
