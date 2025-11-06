import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout implements OnInit {
  sidebarCollapsed = false;
  mobileSidebarOpen = false;
  currentPageTitle = 'Dashboard';

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();
    this.setupRouterEvents();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        this.sidebarCollapsed = true;
        this.mobileSidebarOpen = false;
      }
    }
  }

  private setupRouterEvents() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
        if (window.innerWidth < 1024) {
          this.mobileSidebarOpen = false;
        }
      });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar() {
    if (window.innerWidth < 1024) {
      this.mobileSidebarOpen = false;
    }
  }

  updatePageTitle() {
    const url = this.router.url;
    if (url.includes('construction-sites')) {
      this.currentPageTitle = 'Construction Sites';
    } else if (url.includes('orders')) {
      this.currentPageTitle = 'Orders';
    } else if (url.includes('quotations')) {
      this.currentPageTitle = 'Quotations';
    } else if (url.includes('assessments')) {
      this.currentPageTitle = 'Assessments';
    } else if (url.includes('materials')) {
      this.currentPageTitle = 'Materials';
    } else if (url.includes('add-site')) {
      this.currentPageTitle = 'Add New Site';
    } else {
      this.currentPageTitle = 'Dashboard';
    }
  }

  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  logout() {
    localStorage.clear();
    window.location.href = '/auth/login';
  }
}