import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminProductListComponent } from './product-list.component';
import { ProductsService, Product } from '../../../../core/services/products.service';
import { CategoriesService, ProductCategory } from '../../../../core/services/categories.service';
import { NotificationService } from '../../../../core/services/notification.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      admin: {
        products: {
          title: 'Products',
          subtitle: 'Manage products',
          newProduct: 'New Product',
          allCategories: 'All Categories',
          allStatus: 'All Types',
          typeQuestion: 'Questions',
          typeSession: 'Session',
          typeMonthly: 'Monthly',
          typeSpecial: 'Special',
          deleteConfirm: 'Delete this product?',
          deleteProduct: 'Delete Product',
          yesDelete: 'Yes, delete',
          deletedSuccess: 'Product deleted',
          errorDeleting: 'Error deleting product',
          active: 'Active',
          inactive: 'Inactive',
        },
      },
      common: {
        all: 'All',
        actions: 'Actions',
        search: 'Search',
        yes: 'Yes',
        no: 'No',
      },
    });
  }
}

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  slug: 'test-product',
  productType: 'QUESTION',
  price: 150,
  isActive: true,
  isFeatured: false,
  requiresScheduling: false,
  validityDays: 30,
  galleryUrls: [],
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const mockCategory: ProductCategory = {
  id: 'cat-1',
  name: 'Amor',
  slug: 'amor',
  displayOrder: 1,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

describe('AdminProductListComponent', () => {
  let component: AdminProductListComponent;
  let fixture: ComponentFixture<AdminProductListComponent>;
  let productsServiceSpy: jasmine.SpyObj<ProductsService>;
  let categoriesServiceSpy: jasmine.SpyObj<CategoriesService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    productsServiceSpy = jasmine.createSpyObj('ProductsService', ['findAllAdmin', 'delete']);
    categoriesServiceSpy = jasmine.createSpyObj('CategoriesService', ['findAllAdmin']);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    productsServiceSpy.findAllAdmin.and.returnValue(
      of({ data: [mockProduct], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } })
    );
    categoriesServiceSpy.findAllAdmin.and.returnValue(
      of({ data: [mockCategory] })
    );

    await TestBed.configureTestingModule({
      imports: [
        AdminProductListComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [
        { provide: ProductsService, useValue: productsServiceSpy },
        { provide: CategoriesService, useValue: categoriesServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(productsServiceSpy.findAllAdmin).toHaveBeenCalled();
    expect(component.products().length).toBe(1);
    expect(component.products()[0].id).toBe('prod-1');
  });

  it('should load categories on init', () => {
    expect(categoriesServiceSpy.findAllAdmin).toHaveBeenCalled();
  });

  it('should set totalRecords from response', () => {
    expect(component.totalRecords()).toBe(1);
  });

  it('should set loading to false after loading', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should return type options', () => {
    const options = component.typeOptions;
    expect(options.length).toBe(5);
    expect(options[0].value).toBeNull();
    expect(options[1].value).toBe('QUESTION');
  });

  it('should handle error when loading products', fakeAsync(() => {
    productsServiceSpy.findAllAdmin.and.returnValue(throwError(() => new Error('HTTP error')));
    component.loadProducts();
    tick();
    expect(component.products()).toEqual([]);
    expect(component.loading()).toBeFalse();
  }));
});
