import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingsService } from '../../core/services/listings.service';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './listings-form.component.html',
})
export class ListingFormComponent implements OnInit {
  isEdit     = signal(false);
  loading    = signal(false);
  saving     = signal(false);
  error      = signal('');
  categories = signal<any[]>([]);
  catLoading = signal(false);
  private listingId = '';
  form: any;

  constructor(
    private fb: FormBuilder,
    private listingsService: ListingsService,
    private route: ActivatedRoute,
    public  router: Router,
  ) {
    this.form = this.fb.group({
      title:['', [Validators.required, Validators.minLength(10)]],
      price:[null as number|null, [Validators.required, Validators.min(0.01)]],
      quantity:[null as number|null, [Validators.required, Validators.min(0)]],
      categoryId:['', Validators.required],
      condition:['new'],
      description: [''],
      status: ['active'],
    });
  }

  ngOnInit() {
    this.listingId = this.route.snapshot.paramMap.get('id') || '';
    if (this.listingId) {
      this.isEdit.set(true);
      this.loading.set(true);
      this.listingsService.getById(this.listingId).subscribe({
        next: (listing) => {
          this.form.patchValue({
            title:      listing.title,
            price:      listing.price,
            quantity:   listing.quantity,
            categoryId: listing.categoryId || '',
            status:     listing.status,
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Erro ao carregar anúncio.');
          this.loading.set(false);
        },
      });
    }
  }

  searchCategories() {
    const title = this.form.value.title || '';
    if (title.length < 5) return;
    this.catLoading.set(true);
    this.listingsService.suggestCategories(title).subscribe({
      next:  (cats) => { this.categories.set(cats); this.catLoading.set(false); },
      error: () => this.catLoading.set(false),
    });
  }

  selectCategory(cat: any) {
    this.form.patchValue({ categoryId: cat.category_id });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set('');
    const val = this.form.value;

    if (this.isEdit()) {
      this.listingsService.update(this.listingId, {
        title:    val.title!,
        price:    val.price!,
        quantity: val.quantity!,
        status:   val.status as any,
      }).subscribe({
        next:  () => this.router.navigate(['/listings']),
        error: (err) => {
          this.error.set(err.error?.detail || 'Erro ao atualizar anúncio.');
          this.saving.set(false);
        },
      });
    } else {
      this.listingsService.create({
        title:       val.title!,
        price:       val.price!,
        quantity:    val.quantity!,
        categoryId:  val.categoryId!,
        condition:   val.condition!,
        description: val.description!,
      }).subscribe({
        next:  () => this.router.navigate(['/listings']),
        error: (err) => {
          this.error.set(err.error?.detail || 'Erro ao criar anúncio no Mercado Livre.');
          this.saving.set(false);
        },
      });
    }
  }

  hasError(field: string, error: string) {
    const c = this.form.get(field);
    return c?.hasError(error) && c?.touched;
  }
}