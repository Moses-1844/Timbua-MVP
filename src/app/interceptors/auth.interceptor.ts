// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Intercepting request:', req.url); // Debug log
    
    // Get the token from storage
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      const tokenKeys = ['authToken', 'token', 'accessToken', 'jwtToken'];
      for (const key of tokenKeys) {
        token = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (token) break;
      }
    }

    // Clone the request and add headers
    let authReq = req;

    // Add headers for all requests
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    authReq = req.clone({
      setHeaders: headers
    });

    console.log('Request headers:', headers); // Debug log

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error in interceptor:', error);
        
        if (error.status === 401 || error.status === 403) {
          console.log('Authentication error, redirecting to login');
          // Clear storage and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
          }
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}