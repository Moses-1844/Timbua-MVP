import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierLayout } from './supplier-layout';

describe('SupplierLayout', () => {
  let component: SupplierLayout;
  let fixture: ComponentFixture<SupplierLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
