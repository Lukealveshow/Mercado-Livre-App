import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingsService, Listing, ListingsResponse } from '../../core/services/listings.service';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './listings.component.html',
})
export class ListingsComponent implements OnInit {
  listings   = signal<Listing[]>([]);
  pagination = signal<any>(null);
  loading    = signal(false);
  syncing    = signal(false);
  error      = signal('');
  successMsg = signal('');

  filters = { status: '', search: '', page: 1, limit: 20 };
  searchDebounce: any;

  constructor(private listingsService: ListingsService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.listingsService.getListings(this.filters).subscribe({
      next: (res) => {
        this.listings.set(res.items);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar anúncios.');
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.filters.page = 1;
      this.load();
    }, 400);
  }

  onFilterChange() {
    this.filters.page = 1;
    this.load();
  }

  sync() {
    this.syncing.set(true);
    this.successMsg.set('');
    this.error.set('');
    this.listingsService.sync().subscribe({
      next: (res) => {
        this.successMsg.set(
          `Sincronizado! ${res.created} criados, ${res.updated} atualizados.`
        );
        this.syncing.set(false);
        this.load();
      },
      error: () => {
        this.error.set('Erro ao sincronizar com o Mercado Livre.');
        this.syncing.set(false);
      },
    });
  }

  changePage(page: number) {
    this.filters.page = page;
    this.load();
  }

  quickUpdate(listing: Listing, field: 'price' | 'quantity', event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    if (isNaN(value) || value < 0) return;
    this.listingsService.update(listing._id, { [field]: value }).subscribe({
      next: (updated) => {
        this.listings.update(list =>
          list.map(l => l._id === updated._id ? updated : l)
        );
        this.successMsg.set('Atualizado com sucesso!');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => this.error.set('Erro ao atualizar anúncio.'),
    });
  }

  toggleStatus(listing: Listing) {
    const newStatus = listing.status === 'active' ? 'paused' : 'active';
    this.listingsService.update(listing._id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.listings.update(list =>
          list.map(l => l._id === updated._id ? updated : l)
        );
      },
      error: () => this.error.set('Erro ao alterar status.'),
    });
  }

  get pages(): number[] {
    const p = this.pagination();
    if (!p) return [];
    return Array.from({ length: p.totalPages }, (_, i) => i + 1);
  }
}