import { Component } from '@angular/core';

@Component({
  selector: 'app-add-site',
  imports: [],
  templateUrl: './add-site.html',
  styleUrl: './add-site.scss',
})
export class AddSite {

}
/*
<div class="contractor-dashboard">
  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">T</div>
        <h2>Contractor Portal</h2>
      </div>
    </div>

    <nav class="sidebar-nav">
      <a class="nav-item" [class.active]="currentSection === 'dashboard'" (click)="navigateTo('dashboard')">
        <i class="bi bi-speedometer2"></i>
        <span>Dashboard</span>
      </a>
      <a class="nav-item" [class.active]="currentSection === 'sites'" (click)="navigateTo('sites')">
        <i class="bi bi-building"></i>
        <span>Construction Sites</span>
      </a>
      <a class="nav-item" [class.active]="currentSection === 'materials'" (click)="navigateTo('materials')">
        <i class="bi bi-box-seam"></i>
        <span>Materials</span>
      </a>
      <a class="nav-item" [class.active]="currentSection === 'quotations'" (click)="navigateTo('quotations')">
        <i class="bi bi-file-text"></i>
        <span>Quotations</span>
      </a>
      <a class="nav-item" [class.active]="currentSection === 'orders'" (click)="navigateTo('orders')">
        <i class="bi bi-truck"></i>
        <span>Orders & Delivery</span>
      </a>
      <a class="nav-item" [class.active]="currentSection === 'assessments'" (click)="navigateTo('assessments')">
        <i class="bi bi-clipboard-check"></i>
        <span>Site Assessments</span>
      </a>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Contractor Dashboard</h1>
        <div class="header-actions">
          <div class="user-menu">
            <span class="user-name">{{ currentContractor.name }}</span>
            <div class="alert-badge">
              <i class="bi bi-bell"></i>
              <span class="badge bg-danger">{{ dashboardMetrics.systemAlerts }}</span>
            </div>
            <div class="dropdown">
              <button class="btn btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#"><i class="bi bi-person"></i> Profile</a></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Dashboard Content -->
    <div class="content-area">
      
      <!-- Dashboard Overview Section -->
      <div *ngIf="currentSection === 'dashboard'" class="dashboard-overview">
        <!-- Quick Stats -->
        <div class="row mb-4">
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-primary">
                <i class="bi bi-building"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardMetrics.activeProjects }}</div>
                <div class="stat-label">Active Projects</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-warning">
                <i class="bi bi-list-task"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardMetrics.pendingTasks }}</div>
                <div class="stat-label">Pending Tasks</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-info">
                <i class="bi bi-file-text"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardMetrics.pendingQuotes }}</div>
                <div class="stat-label">Pending Quotes</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-card">
              <div class="stat-icon bg-success">
                <i class="bi bi-truck"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ dashboardMetrics.activeOrders }}</div>
                <div class="stat-label">Active Orders</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects & Quick Actions -->
        <div class="row">
          <!-- Active Projects -->
          <div class="col-12 col-lg-8">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Active Projects</h5>
                <button class="btn btn-primary btn-sm" (click)="openAddSiteModal()">
                  <i class="bi bi-plus"></i> Add Site
                </button>
              </div>
              <div class="card-body">
                <div class="project-list">
                  <div class="project-item" *ngFor="let site of constructionSites">
                    <div class="project-info">
                      <h6>{{ site.name }}</h6>
                      <p class="project-location">{{ site.location }}</p>
                      <div class="project-meta">
                        <span class="badge" [class]="'bg-' + getStatusColor(site.status)">{{ site.status }}</span>
                        <span class="project-cost">KSH {{ site.estimatedCost | number }}</span>
                      </div>
                    </div>
                    <div class="project-progress">
                      <div class="progress">
                        <div class="progress-bar" 
                             [class]="'bg-' + getProgressColor(site.progress)"
                             [style.width]="site.progress + '%'">
                          {{ site.progress }}%
                        </div>
                      </div>
                      <div class="progress-label">Completion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Activities -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="mb-0">Recent Activities</h5>
              </div>
              <div class="card-body">
                <div class="activity-timeline">
                  <div class="activity-item">
                    <div class="activity-icon bg-success">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">Site Assessment Approved</div>
                      <div class="activity-desc">Downtown Office Tower site assessment has been approved</div>
                      <div class="activity-time">2 hours ago</div>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon bg-primary">
                      <i class="bi bi-truck"></i>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">Delivery Scheduled</div>
                      <div class="activity-desc">Steel bars delivery scheduled for tomorrow</div>
                      <div class="activity-time">5 hours ago</div>
                    </div>
                  </div>
                  <div class="activity-item">
                    <div class="activity-icon bg-warning">
                      <i class="bi bi-exclamation-triangle"></i>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">Quotation Expiring</div>
                      <div class="activity-desc">Cement quotation from BuildRight expires in 2 days</div>
                      <div class="activity-time">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Alerts -->
          <div class="col-12 col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="quick-actions">
                  <button class="btn btn-outline-primary w-100 mb-2" (click)="openAddSiteModal()">
                    <i class="bi bi-building-add"></i> Add New Site
                  </button>
                  <button class="btn btn-outline-success w-100 mb-2" (click)="openSupplierModal()">
                    <i class="bi bi-map"></i> Find Nearby Suppliers
                  </button>
                  <button class="btn btn-outline-info w-100 mb-2" (click)="navigateTo('assessments')">
                    <i class="bi bi-clipboard-check"></i> Request Assessment
                  </button>
                  <button class="btn btn-outline-warning w-100" (click)="navigateTo('quotations')">
                    <i class="bi bi-file-text"></i> New Quotation
                  </button>
                </div>
              </div>
            </div>

            <!-- Recent Alerts -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="mb-0">Recent Alerts</h5>
              </div>
              <div class="card-body">
                <div class="alert-list">
                  <div class="alert-item alert-warning">
                    <i class="bi bi-exclamation-triangle"></i>
                    <div>
                      <strong>Assessment Required</strong>
                      <small>Riverside Apartments needs site assessment</small>
                    </div>
                  </div>
                  <div class="alert-item alert-info">
                    <i class="bi bi-truck"></i>
                    <div>
                      <strong>Delivery Update</strong>
                      <small>Steel bars shipment arriving tomorrow</small>
                    </div>
                  </div>
                  <div class="alert-item alert-danger">
                    <i class="bi bi-x-circle"></i>
                    <div>
                      <strong>Payment Due</strong>
                      <small>Invoice #INV-2024-001 due in 3 days</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upcoming Deadlines -->
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="mb-0">Upcoming Deadlines</h5>
              </div>
              <div class="card-body">
                <div class="deadline-list">
                  <div class="deadline-item">
                    <div class="deadline-date bg-primary">25 JAN</div>
                    <div class="deadline-content">
                      <div class="deadline-title">Quotation Deadline</div>
                      <div class="deadline-desc">Cement for Downtown Tower</div>
                    </div>
                  </div>
                  <div class="deadline-item">
                    <div class="deadline-date bg-warning">28 JAN</div>
                    <div class="deadline-content">
                      <div class="deadline-title">Site Inspection</div>
                      <div class="deadline-desc">Riverside Apartments</div>
                    </div>
                  </div>
                  <div class="deadline-item">
                    <div class="deadline-date bg-success">30 JAN</div>
                    <div class="deadline-content">
                      <div class="deadline-title">Progress Report Due</div>
                      <div class="deadline-desc">All active projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Construction Sites Section -->
      <div *ngIf="currentSection === 'sites'" class="sites-section">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Construction Sites</h5>
            <button class="btn btn-primary" (click)="openAddSiteModal()">
              <i class="bi bi-plus"></i> Add New Site
            </button>
          </div>
          <div class="card-body">
            <!-- Filters -->
            <div class="row mb-3">
              <div class="col-md-6">
                <input type="text" class="form-control" placeholder="Search sites..." 
                       [(ngModel)]="searchTerm">
              </div>
              <div class="col-md-3">
                <select class="form-select" [(ngModel)]="siteStatusFilter">
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div class="col-md-3">
                <button class="btn btn-outline-secondary w-100" (click)="exportData()">
                  <i class="bi bi-download"></i> Export
                </button>
              </div>
            </div>

            <!-- Sites Grid -->
            <div class="row" *ngIf="constructionSites.length > 0">
              <
*/