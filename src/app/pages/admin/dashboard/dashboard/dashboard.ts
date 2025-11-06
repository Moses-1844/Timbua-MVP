import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'contractor' | 'supplier' | 'regulator' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

interface SystemMetric {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
  type: 'login' | 'user_created' | 'user_updated' | 'system';
}


@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  // Category filter for UI (used in template)
  selectedCategory: string = 'all';
  // Sidebar state
  isSidebarCollapsed = false;
reportsSummary = {
  sites: 0,
  materials: 0,
  quotations: 0,
  orders: 0,
  assessments: 0,
  alerts: 0
};

loadReportsSummary() {
  const endpoints = ['sites', 'materials', 'quotations', 'orders', 'assessments', 'alerts'];

  endpoints.forEach((endpoint) => {
    this.http.get<any[]>(`http://localhost:3000/${endpoint}`).subscribe({
      next: (data) => {
        (this.reportsSummary as any)[endpoint] = data.length;
      },
      error: (err) => console.error(`Failed to load ${endpoint}:`, err)
    });
  });
}
selectedReport: string | null = null;
isLoadingReport = false;
selectedData: Record<string, any>[] = [];

loadReportData(type: string) {
  this.selectedReport = type;
  this.isLoadingReport = true;
  this.selectedData = [];

  this.http.get<any[]>(`http://localhost:3000/${type}`).subscribe({
    next: (data) => {
      this.selectedData = data;
      this.isLoadingReport = false;
    },
    error: (err) => {
      console.error(`Failed to load ${type}:`, err);
      this.isLoadingReport = false;
    }
  });
}

  // Current section
  currentSection: 'dashboard' | 'users' | 'reports' | 'settings' = 'dashboard';

  // Users loaded from db.json
  users: User[] = [];

  systemMetrics: SystemMetric[] = [
    { label: 'Total Contractors', value: 45, icon: '🧱', color: 'primary' },
    { label: 'Total Suppliers', value: 32, icon: '🚚', color: 'success' },
    { label: 'Total Regulators', value: 8, icon: '🏛️', color: 'info' },
    { label: 'Total Users', value: 85, icon: '👤', color: 'warning' },
    { label: 'Active Projects', value: 23, icon: '📦', color: 'secondary' },
    { label: 'System Alerts', value: 2, icon: '⚠️', color: 'danger' }
  ];

  recentActivities: ActivityLog[] = [
    { id: 1, user: 'john@contractor.com', action: 'User logged in', timestamp: '2024-01-20T08:30:00Z', type: 'login' },
    { id: 2, user: 'System', action: 'New supplier registered', timestamp: '2024-01-20T07:15:00Z', type: 'user_created' },
    { id: 3, user: 'admin', action: 'Updated user permissions', timestamp: '2024-01-19T16:45:00Z', type: 'user_updated' },
    { id: 4, user: 'mary@supplier.com', action: 'User logged in', timestamp: '2024-01-19T14:20:00Z', type: 'login' }
  ];

  permissionsMatrix = [
    { role: 'Contractor', canAdd: true, canEdit: true, canDelete: false, canApprove: false },
    { role: 'Supplier', canAdd: true, canEdit: false, canDelete: false, canApprove: false },
    { role: 'Regulator', canAdd: true, canEdit: true, canDelete: true, canApprove: true },
    { role: 'Admin', canAdd: true, canEdit: true, canDelete: true, canApprove: true }
  ];

  // User management
  selectedUser: User | null = null;
  showUserModal = false;
  newUser: Partial<User> = {
    role: 'contractor',
    status: 'active'
  };
  // Form model for add/edit user modal
  userForm: Partial<User> = {
    role: 'contractor',
    status: 'active'
  };

  // Search and filter
  searchTerm = '';
  roleFilter = 'all';

  constructor(private http: HttpClient) {}

ngOnInit() {
  this.loadUsers();
  this.loadReportsSummary(); // ✅ fetch counts from JSON server
}

  loadUsers() {
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  // Navigation
  navigateTo(section: 'dashboard' | 'users' | 'reports' | 'settings') {
    this.currentSection = section;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // User Management Methods
  openAddUserModal() {
    this.selectedUser = null;
    this.newUser = { role: 'contractor', status: 'active' };
    this.userForm = { ...this.newUser };
    this.showUserModal = true;
  }

  editUser(user: User) {
    this.selectedUser = { ...user };
    this.userForm = { ...user };
    this.showUserModal = true;
  }
  

deleteUser(user: User) {
  if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
    this.http.delete(`http://localhost:3000/users/${user.id}`).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => console.error('Failed to delete user:', err)
    });
  }
}

    getSectionTitle(): string {
    // Return the section title you want to display
    return 'Admin Dashboard';
  }
  
  getRoleColor(role: string): string {
    // Return a color string based on the role
    switch (role) {
      case 'admin': return 'primary';
      case 'contractor': return 'warning';
      case 'supplier': return 'success';
      case 'regulator': return 'info';
      default: return 'secondary';
    }
  }

saveUser() {
  if (!this.userForm.fullName || !this.userForm.email || !this.userForm.phone) {
    alert('Please fill in all required fields');
    return;
  }

  if (this.selectedUser) {
    // ✅ Update existing user via PUT
    const updatedUser = { ...this.selectedUser, ...this.userForm };
    this.http.put(`http://localhost:3000/users/${this.selectedUser.id}`, updatedUser).subscribe({
      next: () => {
        this.loadUsers(); // reload list from server
        this.closeUserModal();
      },
      error: (err) => console.error('Failed to update user:', err)
    });
  } else {
    // ✅ Add new user via POST
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id), 0) + 1,
      fullName: this.userForm.fullName!,
      email: this.userForm.email!,
      phone: this.userForm.phone!,
      role: this.userForm.role!,
      status: this.userForm.status!,
      createdAt: new Date().toISOString()
    };

    this.http.post('http://localhost:3000/users', newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.closeUserModal();
      },
      error: (err) => console.error('Failed to add user:', err)
    });
  }
}
  closeUserModal() {
    this.showUserModal = false;
    this.selectedUser = null;
    this.userForm = { role: 'contractor', status: 'active' };
  }

  resetPassword(user: User) {
    if (confirm(`Reset password for ${user.fullName}?`)) {
      // In real app, call API to reset password
      alert(`Password reset email sent to ${user.email}`);
    }
  }

toggleUserStatus(user: User) {
  const updatedUser = { ...user, status: user.status === 'active' ? 'inactive' : 'active' };
  this.http.put(`http://localhost:3000/users/${user.id}`, updatedUser).subscribe({
    next: () => this.loadUsers(),
    error: (err) => console.error('Failed to toggle user status:', err)
  });
}


  // Filter methods
  get filteredUsers() {
    return this.users.filter(user => {
      const matchesSearch =
        (user.fullName && user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  exportData() {
    // In real app, implement CSV/Excel export
    alert('Export functionality would be implemented here');
  }
}