import { Component } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

interface Quotation {
  id: number;
  material: string;
  quantity: number;
  unit: string;
  supplierId: string;
  site: string;
  status: string;
  deadline: string;
}

@Component({
  selector: 'app-quotations',
  standalone: true,
  templateUrl: './quotations.html',
  styleUrls: ['./quotations.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    TitleCasePipe
  ]
})
export class Quotations {
  quotationRequests: Quotation[] = [];
  quotationForm: FormGroup;
  showQuotationForm = false;

  constructor(private fb: FormBuilder) {
    this.quotationForm = this.fb.group({
      supplierId: ['', Validators.required],
      material: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      site: ['Main Construction Site'],
      status: ['pending'],
      deadline: [new Date().toISOString()]
    });

    this.loadSampleData();
  }

  loadSampleData() {
    this.quotationRequests = [
      { id: 1, supplierId: 'SUP-001', material: 'Cement', quantity: 100, unit: 'bags', site: 'Downtown Site', status: 'pending', deadline: '2025-11-10' },
      { id: 2, supplierId: 'SUP-002', material: 'Steel Bars', quantity: 200, unit: 'kg', site: 'Industrial Park', status: 'received', deadline: '2025-11-12' }
    ];
  }

  submitQuotationRequest() {
    if (this.quotationForm.valid) {
      const newQuotation = { id: Date.now(), ...this.quotationForm.value };
      this.quotationRequests.push(newQuotation);
      this.quotationForm.reset({ status: 'pending', site: 'Main Construction Site' });
      this.showQuotationForm = false;
    }
  }

  viewQuotes(quotation: Quotation) {
    alert(`Viewing quotes for: ${quotation.material}`);
  }

  deleteQuotation(id: number) {
    this.quotationRequests = this.quotationRequests.filter(q => q.id !== id);
  }
}
