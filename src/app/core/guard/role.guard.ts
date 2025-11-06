import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role!)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
