import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Listing {
  _id: string;
  meliItemId: string;
  title: string;
  price: number;
  quantity: number;
  status: 'active' | 'paused' | 'closed';
  thumbnail: string;
  permalink: string;
  categoryId: string;
  lastSyncedAt: string;
}

export interface ListingsResponse {
  items: Listing[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private api = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  getListings(filters: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page)   params = params.set('page', String(filters.page));
    if (filters.limit)  params = params.set('limit', String(filters.limit));
    return this.http.get<ListingsResponse>(this.api, { params });
  }

  getById(id: string) {
    return this.http.get<Listing>(`${this.api}/${id}`);
  }

  sync() {
    return this.http.get<{ message: string; created: number; updated: number }>(
      `${this.api}/sync`
    );
  }

  create(data: Partial<Listing> & { description?: string; categoryId?: string; condition?: string }) {
    return this.http.post<Listing>(this.api, data);
  }

  update(id: string, data: Partial<Listing>) {
    return this.http.patch<Listing>(`${this.api}/${id}`, data);
  }

  suggestCategories(q: string) {
    return this.http.get<any[]>(`${this.api}/categories`, { params: { q } });
  }
}