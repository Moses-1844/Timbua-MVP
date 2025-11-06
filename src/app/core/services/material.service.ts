import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private baseUrl = 'https://api.yourserver.com'; // change to your API

  constructor(private http: HttpClient) {}

  getSitesBySupplier(supplierId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/suppliers/${supplierId}/sites`);
  }
}
