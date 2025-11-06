import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  
  recentProjects: Project[] = [
    {
      name: 'Residential Complex - Phase 1',
      location: 'Downtown District',
      status: 'on-track',
      progress: 75,
      dueDate: '15 Oct 2023'
    },
    {
      name: 'Commercial Building - Downtown',
      location: 'Central Business District',
      status: 'delayed',
      progress: 45,
      dueDate: '30 Nov 2023'
    },
    {
      name: 'Bridge Construction - North Area',
      location: 'Northern Highway',
      status: 'on-track',
      progress: 60,
      dueDate: '20 Dec 2023'
    },
    {
      name: 'Road Expansion - Highway 45',
      location: 'Eastern Corridor',
      status: 'at-risk',
      progress: 30,
      dueDate: '05 Jan 2024'
    }
  ];

  upcomingDeadlines: Deadline[] = [
    {
      day: '15',
      month: 'OCT',
      title: 'Site Inspection - Phase 1',
      project: 'Residential Complex',
      time: '09:00 AM',
      priority: 'high'
    },
    {
      day: '22',
      month: 'OCT',
      title: 'Material Delivery',
      project: 'Commercial Building',
      time: '02:00 PM',
      priority: 'medium'
    },
    {
      day: '28',
      month: 'OCT',
      title: 'Progress Meeting',
      project: 'All Projects',
      time: '10:00 AM',
      priority: 'low'
    },
    {
      day: '05',
      month: 'NOV',
      title: 'Safety Assessment',
      project: 'Bridge Construction',
      time: '11:30 AM',
      priority: 'high'
    }
  ];

  recentActivities: Activity[] = [
    {
      type: 'order',
      text: 'New material order placed for Residential Complex',
      time: '2 hours ago'
    },
    {
      type: 'assessment',
      text: 'Safety assessment completed for Commercial Building',
      time: '1 day ago'
    },
    {
      type: 'site',
      text: 'New construction site added: Road Expansion Project',
      time: '2 days ago'
    },
    {
      type: 'material',
      text: 'Material delivery received for Bridge Construction',
      time: '3 days ago'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

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
}