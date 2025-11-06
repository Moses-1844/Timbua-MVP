import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}

async onSubmit() {
  if (!this.credentials.email || !this.credentials.password) {
    this.errorMessage = 'Please fill in all fields.';
    return;
  }

  this.isLoading = true;
  this.errorMessage = '';

  this.authService.login(this.credentials.email, this.credentials.password).subscribe({
    next: (users) => {
      if (users.length > 0) {
        const user = users[0];
        switch (user.role) {
          case 'contractor':
            this.router.navigate(['/contractor']);
            break;
          case 'supplier':
            this.router.navigate(['/supplier']);
            break;
          case 'regulator':
            this.router.navigate(['/regulator']);
            break;
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          default:
            this.errorMessage = 'Unauthorized role.';
        }
      } else {
        this.errorMessage = 'Invalid email or password.';
      }
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Login failed.';
      this.isLoading = false;
    }
  });
}

}
