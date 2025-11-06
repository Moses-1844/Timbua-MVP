import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSites } from './supplier-sites';

describe('SupplierSites', () => {
  let component: SupplierSites;
  let fixture: ComponentFixture<SupplierSites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierSites]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierSites);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
