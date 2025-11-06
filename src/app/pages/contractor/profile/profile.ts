import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Contractor {
  id: number;
  companyName: string;
  email: string;
  contactPerson: string;
  phoneNumber: string;
  businessRegistrationNumber: string;
  physicalAddress: string;
  specialization: string;
  yearsOfExperience: number;
  licenseNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  isVerified: boolean;
  registrationDate: string;
  verificationDate: string | null;
  avatar?: string;
  website?: string;
  description?: string;
}

interface Message {
  id: number;
  type: 'system' | 'order' | 'quotation' | 'assessment' | 'general';
  title: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedId?: number; // ID of related order, quotation, etc.
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  quotationRequests: boolean;
  assessmentReminders: boolean;
  systemAlerts: boolean;
}

@Component({
  selector: 'app-contractor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  contractor: Contractor | null = null;
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  
  // UI State
  activeTab: 'profile' | 'messages' | 'settings' = 'profile';
  messageFilter: 'all' | 'unread' | 'system' | 'orders' | 'quotations' = 'all';
  loading = true;
  error = '';
  
  // Edit mode
  editProfile = false;
  editSettings = false;
  
  // Form models
  profileForm: Partial<Contractor> = {};
  settings: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    quotationRequests: true,
    assessmentReminders: true,
    systemAlerts: true
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadContractorData();
    this.loadMessages();
  }

  private getContractorId(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 1; // Default test ID for server-side
    }

    try {
      const storageKeys = ['currentUser', 'contractorId', 'userId', 'user', 'contractor'];
      
      for (const key of storageKeys) {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
          try {
            const parsed = JSON.parse(storedValue);
            if (parsed.contractorId) return parseInt(parsed.contractorId, 10);
            if (parsed.id) return parseInt(parsed.id, 10);
          } catch {
            const directId = parseInt(storedValue, 10);
            if (!isNaN(directId)) return directId;
          }
        }
      }

      console.warn('No contractor ID found in localStorage. Using test ID: 1');
      return 1;
      
    } catch (error) {
      console.error('Error getting contractor ID:', error);
      return 1;
    }
  }

  loadContractorData() {
    const contractorId = this.getContractorId();
    
    this.http.get<Contractor>(`${environment.apiUrl}/contractors/${contractorId}`)
      .subscribe({
        next: (contractor) => {
          this.contractor = contractor;
          this.profileForm = { ...contractor };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading contractor data:', error);
          this.loadMockContractorData();
        }
      });
  }

  loadMessages() {
    const contractorId = this.getContractorId();
    
    this.http.get<Message[]>(`${environment.apiUrl}/contractors/${contractorId}/messages`)
      .subscribe({
        next: (messages) => {
          this.messages = messages.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          this.filterMessages();
        },
        error: (error) => {
          console.error('Error loading messages:', error);
          this.loadMockMessages();
        }
      });
  }

  filterMessages() {
    switch (this.messageFilter) {
      case 'unread':
        this.filteredMessages = this.messages.filter(msg => !msg.isRead);
        break;
      case 'system':
        this.filteredMessages = this.messages.filter(msg => msg.type === 'system');
        break;
      case 'orders':
        this.filteredMessages = this.messages.filter(msg => msg.type === 'order');
        break;
      case 'quotations':
        this.filteredMessages = this.messages.filter(msg => msg.type === 'quotation');
        break;
      default:
        this.filteredMessages = [...this.messages];
    }
  }

  markAsRead(message: Message) {
    if (!message.isRead) {
      message.isRead = true;
      this.http.patch(`${environment.apiUrl}/messages/${message.id}`, { isRead: true })
        .subscribe({
          error: (error) => console.error('Error marking message as read:', error)
        });
    }
  }

  markAllAsRead() {
    const unreadMessages = this.messages.filter(msg => !msg.isRead);
    unreadMessages.forEach(msg => msg.isRead = true);
    
    this.http.patch(`${environment.apiUrl}/contractors/${this.getContractorId()}/messages/mark-all-read`, {})
      .subscribe({
        error: (error) => console.error('Error marking all messages as read:', error)
      });
  }

  deleteMessage(message: Message) {
    if (confirm('Are you sure you want to delete this message?')) {
      this.messages = this.messages.filter(msg => msg.id !== message.id);
      this.filterMessages();
      
      this.http.delete(`${environment.apiUrl}/messages/${message.id}`)
        .subscribe({
          error: (error) => console.error('Error deleting message:', error)
        });
    }
  }

  updateProfile() {
    if (!this.contractor) return;

    this.http.put<Contractor>(`${environment.apiUrl}/contractors/${this.contractor.id}`, this.profileForm)
      .subscribe({
        next: (updatedContractor) => {
          this.contractor = updatedContractor;
          this.editProfile = false;
          alert('Profile updated successfully!');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          alert('Error updating profile. Please try again.');
        }
      });
  }

  updateSettings() {
    const contractorId = this.getContractorId();
    
    this.http.put(`${environment.apiUrl}/contractors/${contractorId}/notification-settings`, this.settings)
      .subscribe({
        next: () => {
          this.editSettings = false;
          alert('Notification settings updated successfully!');
        },
        error: (error) => {
          console.error('Error updating settings:', error);
          alert('Error updating settings. Please try again.');
        }
      });
  }

  getInitials(): string {
    if (!this.contractor?.contactPerson) return 'C';
    
    const names = this.contractor.contactPerson.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.contractor.contactPerson.substring(0, 2).toUpperCase();
  }

  getStatusBadgeClass(): string {
    if (!this.contractor) return 'secondary';
    
    switch (this.contractor.status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      case 'INACTIVE':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getStatusDisplay(): string {
    if (!this.contractor) return 'Unknown';
    
    switch (this.contractor.status) {
      case 'ACTIVE':
        return 'Active';
      case 'APPROVED':
        return 'Approved';
      case 'PENDING':
        return 'Pending Approval';
      case 'REJECTED':
        return 'Rejected';
      case 'INACTIVE':
        return 'Inactive';
      default:
        return this.contractor.status;
    }
  }

  getMessageIcon(type: string): string {
    switch (type) {
      case 'system':
        return 'info';
      case 'order':
        return 'shopping_cart';
      case 'quotation':
        return 'request_quote';
      case 'assessment':
        return 'assessment';
      case 'general':
        return 'email';
      default:
        return 'notifications';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'warning';
      case 'medium':
        return 'schedule';
      case 'low':
        return 'low_priority';
      default:
        return 'info';
    }
  }

  getUnreadCount(): number {
    return this.messages.filter(msg => !msg.isRead).length;
  }

  getFilteredUnreadCount(): number {
    return this.filteredMessages.filter(msg => !msg.isRead).length;
  }

  // Mock data fallbacks
  private loadMockContractorData() {
    this.contractor = {
      id: 1,
      companyName: 'Demo Construction Ltd',
      email: 'john.doe@democonstruction.com',
      contactPerson: 'John Doe',
      phoneNumber: '+254712345678',
      businessRegistrationNumber: 'REG123456',
      physicalAddress: '123 Construction Avenue, Nairobi, Kenya',
      specialization: 'Residential Buildings & Commercial Complexes',
      yearsOfExperience: 8,
      licenseNumber: 'NCA-12345',
      status: 'ACTIVE',
      isVerified: true,
      registrationDate: '2023-01-15',
      verificationDate: '2023-01-20',
      website: 'www.democonstruction.co.ke',
      description: 'Specializing in high-quality residential and commercial construction projects with over 8 years of experience in the industry.'
    };
    this.profileForm = { ...this.contractor };
    this.loading = false;
  }

  private loadMockMessages() {
    this.messages = [
      {
        id: 1,
        type: 'system',
        title: 'Welcome to Timbua Contractor Portal',
        content: 'Welcome to Timbua! Your contractor account has been successfully activated. You can now start managing your construction sites, orders, and quotations.',
        sender: 'Timbua System',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        priority: 'medium'
      },
      {
        id: 2,
        type: 'order',
        title: 'New Order Request - Riverside Apartments',
        content: 'You have received a new order request for construction materials at Riverside Apartments. Please review and respond within 48 hours.',
        sender: 'Timbua Orders',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'high',
        relatedId: 123
      },
      {
        id: 3,
        type: 'quotation',
        title: 'Quotation Approved - Office Tower Project',
        content: 'Your quotation for the Office Tower project has been approved. You can now proceed with the order.',
        sender: 'Project Manager',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'medium',
        relatedId: 456
      },
      {
        id: 4,
        type: 'assessment',
        title: 'Site Assessment Scheduled',
        content: 'A site assessment has been scheduled for Downtown Office Tower on Friday, 10:00 AM. Please ensure the site is accessible.',
        sender: 'Timbua Assessments',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'medium',
        relatedId: 789
      },
      {
        id: 5,
        type: 'general',
        title: 'Monthly Performance Report',
        content: 'Your monthly performance report for January 2024 is now available. You can view it in the reports section.',
        sender: 'Timbua Analytics',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        priority: 'low'
      },
      {
        id: 6,
        type: 'system',
        title: 'System Maintenance Notice',
        content: 'There will be scheduled system maintenance on Saturday from 2:00 AM to 4:00 AM. The portal may be unavailable during this time.',
        sender: 'Timbua System',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false,
        priority: 'low'
      }
    ];
    
    this.filterMessages();
  }
}