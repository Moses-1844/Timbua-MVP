import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  rememberMe = false;
  emailInvalid = false;
  passwordInvalid = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Validate email format
  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.emailInvalid = !emailRegex.test(this.credentials.email);
  }

  // Validate password length
  validatePassword() {
    this.passwordInvalid = this.credentials.password.length < 6;
  }

  onSubmit() {
    // Clear previous messages
    this.clearMessages();

    // Validate form
    this.validateEmail();
    this.validatePassword();

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.emailInvalid) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.passwordInvalid) {
      this.errorMessage = 'Password must be at least 3 characters long.';
      return;
    }

    this.isLoading = true;

    this.http.post<any>(`${environment.apiUrl}/auth/login`, this.credentials)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          if (response.success) {
            this.handleLoginSuccess(response);
          } else {
            this.handleLoginFailure(response.message || 'Login failed. Please try again.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.handleLoginError(error);
        }
      });
  }

  private handleLoginSuccess(response: any) {
    this.successMessage = 'Login successful! Redirecting...';

    // Save token
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }

    // Save user data based on role
    if (response.role === 'CONTRACTOR' && response.contractor) {
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.contractor.id,
        contractorId: response.contractor.id,
        email: response.contractor.email,
        companyName: response.contractor.companyName,
        contactPerson: response.contractor.contactPerson,
        role: 'CONTRACTOR',
        isVerified: response.contractor.isVerified
      }));
      localStorage.setItem('contractor', JSON.stringify(response.contractor));
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        this.router.navigate(['/contractor']);
      }, 1500);
    } 
    else if (response.role === 'SUPPLIER' && response.supplier) {
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.supplier.id,
        supplierId: response.supplier.id,
        email: response.supplier.email,
        companyName: response.supplier.companyName,
        contactPerson: response.supplier.contactPerson,
        role: 'SUPPLIER',
        verified: response.supplier.verified
      }));
      localStorage.setItem('supplier', JSON.stringify(response.supplier));
      
      setTimeout(() => {
        this.router.navigate(['/supplier']);
      }, 1500);
    }
    else if (response.role === 'ADMIN') {
      localStorage.setItem('currentUser', JSON.stringify({
        email: this.credentials.email,
        role: 'ADMIN'
      }));
      
      setTimeout(() => {
        this.router.navigate(['/admin']);
      }, 1500);
    }
    else if (response.role === 'REGULATOR') {
      localStorage.setItem('currentUser', JSON.stringify({
        email: this.credentials.email,
        role: 'REGULATOR'
      }));
      
      setTimeout(() => {
        this.router.navigate(['/regulator']);
      }, 1500);
    }
    else {
      this.handleLoginFailure('Unknown user role or missing user data.');
    }
  }

  private handleLoginFailure(message: string) {
    this.errorMessage = message;
    // Clear password on failure
    this.credentials.password = '';
    this.validatePassword();
  }

  private handleLoginError(error: any) {
    let errorMsg = 'Login failed. Please try again.';
    
    if (error.status === 401) {
      errorMsg = 'Invalid email or password. Please check your credentials.';
    } else if (error.status === 400) {
      errorMsg = 'Invalid request. Please check your email and password format.';
    } else if (error.status === 403) {
      errorMsg = 'Account not active. Please contact support.';
    } else if (error.status === 0) {
      errorMsg = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.status >= 500) {
      errorMsg = 'Server error. Please try again later.';
    }

    this.errorMessage = errorMsg;
    // Clear password on error
    this.credentials.password = '';
    this.validatePassword();
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Auto-clear error when user starts typing
  onInputChange() {
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }
}