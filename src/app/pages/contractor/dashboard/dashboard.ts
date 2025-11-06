import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContractorDashboardService } from './contractor-dashboard.service';

interface Project {
  name: string;
  location: string;
  status: 'on-track' | 'delayed' | 'at-risk';
  progress: number;
  dueDate: string;
}

interface Deadline {
  day: string;
  month: string;
  title: string;
  project: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface Activity {
  type: 'order' | 'assessment' | 'site' | 'material';
  text: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  
  dashboardStats = {
    activeProjects: 0,
    pendingOrders: 0,
    quotations: 0,
    assessmentsDue: 0
  };

  recentProjects: Project[] = [];
  upcomingDeadlines: Deadline[] = [];
  recentActivities: Activity[] = [];
  isLoading = true;
  contractorName = '';
  contractorId: number | null = null;

  constructor(
    private router: Router,
    private dashboardService: ContractorDashboardService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    this.loadContractorData();
    this.loadDashboardData();
  }

  private loadContractorData(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.contractorId = this.getContractorId();
      
      const contractorData = localStorage.getItem('contractor');
      if (contractorData) {
        const contractor = JSON.parse(contractorData);
        this.contractorName = contractor.companyName || contractor.contactPerson || 'Contractor';
      } else {
        this.contractorName = 'Contractor';
      }
    }
  }

  private getContractorId(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 1; // Default test ID for server-side
    }

    try {
      // Try to get contractor ID from localStorage
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.contractorId) {
          return parseInt(user.contractorId, 10);
        }
        if (user.id) {
          return parseInt(user.id, 10);
        }
      }
      
      // Check for contractor ID directly in localStorage
      const contractorId = localStorage.getItem('contractorId');
      if (contractorId) {
        return parseInt(contractorId, 10);
      }

      // Check for user ID directly in localStorage
      const userId = localStorage.getItem('userId');
      if (userId) {
        return parseInt(userId, 10);
      }

      // If no ID found in localStorage, use test ID 1
      console.warn('No contractor ID found in localStorage. Using test ID: 1');
      return 1;
      
    } catch (error) {
      console.error('Error parsing contractor ID from localStorage:', error);
      console.warn('Using test ID: 1 due to parsing error');
      return 1;
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load dashboard statistics with contractor ID
    this.dashboardService.getDashboardStats(this.contractorId!).subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.handleApiError();
      }
    });

    // Load recent projects with contractor ID
    this.dashboardService.getRecentProjects(this.contractorId!).subscribe({
      next: (sites) => {
        this.recentProjects = sites.map(site => this.mapSiteToProject(site));
        this.generateUpcomingDeadlines(sites);
        this.generateRecentActivities(sites);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent projects:', error);
        this.handleApiError();
        this.isLoading = false;
      }
    });
  }

  private mapSiteToProject(site: any): Project {
    return {
      name: site.name,
      location: site.location,
      status: this.dashboardService.mapApiStatusToComponentStatus(site.status),
      progress: site.progress,
      dueDate: this.dashboardService.formatDate(site.endDate)
    };
  }

  private generateUpcomingDeadlines(sites: any[]): void {
    this.upcomingDeadlines = sites.slice(0, 4).map((site, index) => {
      const endDate = new Date(site.endDate);
      const daysUntilDue = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (daysUntilDue <= 7) priority = 'high';
      else if (daysUntilDue <= 30) priority = 'medium';

      return {
        day: endDate.getDate().toString(),
        month: endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        title: `${site.type} Completion`,
        project: site.name,
        time: '09:00 AM',
        priority: priority
      };
    });
  }

  private generateRecentActivities(sites: any[]): void {
    this.recentActivities = [
      {
        type: 'site',
        text: `Site "${sites[0]?.name}" progress updated to ${sites[0]?.progress}%`,
        time: '2 hours ago'
      },
      {
        type: 'material',
        text: 'New materials delivered to site',
        time: '1 day ago'
      },
      {
        type: 'assessment',
        text: 'Safety inspection completed',
        time: '2 days ago'
      },
      {
        type: 'order',
        text: 'New equipment order placed',
        time: '3 days ago'
      }
    ];
  }

  private handleApiError(): void {
    // Fallback to mock data if API fails
    this.dashboardStats = {
      activeProjects: 3,
      pendingOrders: 2,
      quotations: 1,
      assessmentsDue: 1
    };

    this.recentProjects = [
      {
        name: 'Residential Complex',
        location: 'Nairobi West',
        status: 'on-track',
        progress: 75,
        dueDate: '2024-12-15'
      },
      {
        name: 'Office Building',
        location: 'Upper Hill',
        status: 'delayed',
        progress: 45,
        dueDate: '2024-11-30'
      },
      {
        name: 'Shopping Mall',
        location: 'Thika Road',
        status: 'at-risk',
        progress: 60,
        dueDate: '2025-01-20'
      }
    ];

    this.upcomingDeadlines = [
      {
        day: '15',
        month: 'DEC',
        title: 'Project Completion',
        project: 'Residential Complex',
        time: '09:00 AM',
        priority: 'medium'
      },
      {
        day: '30',
        month: 'NOV',
        title: 'Inspection Due',
        project: 'Office Building',
        time: '02:00 PM',
        priority: 'high'
      }
    ];
    
    console.warn('Using fallback data due to API error');
  }

  quickAction(action: string): void {
    switch (action) {
      case 'new-project':
        this.navigateTo('add-site');
        break;
      default:
        console.log('Quick action:', action);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/contractor/${route}`]);
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'schedule';
      case 'low':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'order':
        return 'shopping_cart';
      case 'assessment':
        return 'assignment';
      case 'site':
        return 'construction';
      case 'material':
        return 'inventory';
      default:
        return 'notifications';
    }
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}


/*
 * 
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContractorDashboardService } from './contractor-dashboard.service';

interface Project {
  name: string;
  location: string;
  status: 'on-track' | 'delayed' | 'at-risk';
  progress: number;
  dueDate: string;
}

interface Deadline {
  day: string;
  month: string;
  title: string;
  project: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface Activity {
  type: 'order' | 'assessment' | 'site' | 'material';
  text: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  
  dashboardStats = {
    activeProjects: 0,
    pendingOrders: 0,
    quotations: 0,
    assessmentsDue: 0
  };

  recentProjects: Project[] = [];
  upcomingDeadlines: Deadline[] = [];
  recentActivities: Activity[] = [];
  isLoading = true;
  contractorName = '';

  constructor(
    private router: Router,
    private dashboardService: ContractorDashboardService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    this.loadContractorData();
    this.loadDashboardData();
  }

  private loadContractorData(): void {
    if (isPlatformBrowser(this.platformId)) {
      const contractorData = localStorage.getItem('contractor');
      if (contractorData) {
        const contractor = JSON.parse(contractorData);
        this.contractorName = contractor.companyName || contractor.contactPerson || 'Contractor';
      } else {
        this.contractorName = 'Contractor';
      }
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load dashboard statistics
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.handleApiError();
      }
    });

    // Load recent projects
    this.dashboardService.getRecentProjects().subscribe({
      next: (sites) => {
        this.recentProjects = sites.map(site => this.mapSiteToProject(site));
        this.generateUpcomingDeadlines(sites);
        this.generateRecentActivities(sites);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recent projects:', error);
        this.handleApiError();
        this.isLoading = false;
      }
    });
  }

  private mapSiteToProject(site: any): Project {
    return {
      name: site.name,
      location: site.location,
      status: this.dashboardService.mapApiStatusToComponentStatus(site.status),
      progress: site.progress,
      dueDate: this.dashboardService.formatDate(site.endDate)
    };
  }

  private generateUpcomingDeadlines(sites: any[]): void {
    this.upcomingDeadlines = sites.slice(0, 4).map((site, index) => {
      const endDate = new Date(site.endDate);
      const daysUntilDue = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (daysUntilDue <= 7) priority = 'high';
      else if (daysUntilDue <= 30) priority = 'medium';

      return {
        day: endDate.getDate().toString(),
        month: endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        title: `${site.type} Completion`,
        project: site.name,
        time: '09:00 AM',
        priority: priority
      };
    });
  }

  private generateRecentActivities(sites: any[]): void {
    this.recentActivities = [
      {
        type: 'site',
        text: `Site "${sites[0]?.name}" progress updated to ${sites[0]?.progress}%`,
        time: '2 hours ago'
      },
      {
        type: 'material',
        text: 'New materials delivered to site',
        time: '1 day ago'
      },
      {
        type: 'assessment',
        text: 'Safety inspection completed',
        time: '2 days ago'
      },
      {
        type: 'order',
        text: 'New equipment order placed',
        time: '3 days ago'
      }
    ];
  }

  private handleApiError(): void {
    // Fallback to mock data if API fails
    this.dashboardStats = {
      activeProjects: 0,
      pendingOrders: 0,
      quotations: 0,
      assessmentsDue: 0
    };

    this.recentProjects = [];
    this.upcomingDeadlines = [];
    
    // You can add fallback mock data here if needed
    console.warn('Using fallback data due to API error');
  }

  quickAction(action: string): void {
    switch (action) {
      case 'new-project':
        this.navigateTo('add-site');
        break;
      default:
        console.log('Quick action:', action);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/contractor/${route}`]);
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'schedule';
      case 'low':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'order':
        return 'shopping_cart';
      case 'assessment':
        return 'assignment';
      case 'site':
        return 'construction';
      case 'material':
        return 'inventory';
      default:
        return 'notifications';
    }
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
 * 
 */