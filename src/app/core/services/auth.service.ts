import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/users'; // json-server endpoint
  private _isAuthenticated = false;
  private _role: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  // Getters
  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get role(): string | null {
    return this._role;
  }

  // Login with JSON Server
  login(email: string, password: string): Observable<any> {
    return this.http
      .get<any[]>(`${this.apiUrl}?email=${email}&password=${password}`)
      .pipe(
        tap(users => {
          if (users.length > 0) {
            const user = users[0];
            this._isAuthenticated = true;
            this._role = user.role;

            // store in localStorage
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            this._isAuthenticated = false;
            this._role = null;
          }
        })
      );
  }

  logout(): void {
    this._isAuthenticated = false;
    this._role = null;
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  // Restore session
  restoreSession(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this._isAuthenticated = true;
      this._role = user.role;
    }
  }
}
