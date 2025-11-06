
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Assessment } from '../../../core/models/contractor.models';

@Component({
  selector: 'app-assessments',
  imports: [CommonModule],
  templateUrl: './assessments.html',
  styleUrl: './assessments.scss',
})
export class Assessments {
  @Input() assessments: Assessment[] = [];

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger',
      'under-review': 'info'
    };
    return colors[status] || 'secondary';
  }
}