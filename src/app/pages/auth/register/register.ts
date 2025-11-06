import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  user = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '' as 'contractor' | 'supplier' | 'regulator' | 'admin'
  };

  isLoading = false;
  passwordMismatch = false;

  roles = [
    { value: 'contractor', label: 'Contractor', description: 'Manage projects and bids' },
    { value: 'supplier', label: 'Supplier', description: 'Provide materials and services' },
    { value: 'regulator', label: 'Regulator', description: 'Oversee compliance and standards' },
    { value: 'admin', label: 'Administrator', description: 'System management' }
  ];

  constructor(private router: Router) {}

  validatePassword(): boolean {
    this.passwordMismatch = this.user.password !== this.user.confirmPassword;
    return !this.passwordMismatch;
  }

  onSubmit() {
    if (!this.validatePassword()) {
      return;
    }

    if (this.user.fullName && this.user.email && this.user.password && this.user.phone && this.user.role) {
      this.isLoading = true;

      // Prepare user data for JSON Server
      const userData = {
        fullName: this.user.fullName,
        email: this.user.email,
        password: this.user.password, // In real app, hash this password
        phone: this.user.phone,
        role: this.user.role,
        createdAt: new Date().toISOString()
      };

      // Simulate API call to JSON Server
      setTimeout(() => {
        console.log('Registration data:', userData);
        
        // In a real app, you would make HTTP request to JSON Server
        // this.http.post('http://localhost:3000/users', userData).subscribe(...)
        
        this.isLoading = false;
        
        // Redirect to login or dashboard based on role
        alert('Registration successful! Redirecting to login...');
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  onRoleSelect(role: string) {
    this.user.role = role as any;
  }
}