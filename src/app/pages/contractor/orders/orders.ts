
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../core/models/contractor.models';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders {
  @Input() orders: Order[] = [];

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ordered': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  }
}