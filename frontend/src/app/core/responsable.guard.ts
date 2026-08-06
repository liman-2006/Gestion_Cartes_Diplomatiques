import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const responsableGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isResponsable()) {
    return true;
  }

  router.navigate(['/tableau-de-bord']);
  return false;
};
