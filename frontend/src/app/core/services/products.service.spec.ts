import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsService, Product } from './products.service';
import { environment } from '../../../environments/environment';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Leitura Cigana Completa',
    slug: 'leitura-cigana-completa',
    shortDescription: 'Leitura completa com 36 cartas',
    productType: 'SESSION',
    price: 150,
    validityDays: 30,
    galleryUrls: [],
    isActive: true,
    isFeatured: true,
    requiresScheduling: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProducts: Product[] = [mockProduct];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductsService],
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return paginated products', () => {
      const mockResponse = {
        data: mockProducts,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      service.findAll().subscribe((response) => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].name).toBe('Leitura Cigana Completa');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should pass filter params correctly', () => {
      service.findAll({ category: 'leituras', featured: true, page: 2 }).subscribe();

      const req = httpMock.expectOne((request) =>
        request.url === `${environment.apiUrl}/products` &&
        request.params.get('category') === 'leituras' &&
        request.params.get('featured') === 'true' &&
        request.params.get('page') === '2'
      );
      req.flush({ data: [], meta: {} });
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', () => {
      service.findBySlug('leitura-cigana-completa').subscribe((response) => {
        expect(response.data.slug).toBe('leitura-cigana-completa');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/products/leitura-cigana-completa`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProduct });
    });
  });

  describe('findFeatured', () => {
    it('should return featured products', () => {
      service.findFeatured(6).subscribe((response) => {
        expect(response.data.length).toBe(1);
      });

      const req = httpMock.expectOne((request) =>
        request.url === `${environment.apiUrl}/products/featured` &&
        request.params.get('limit') === '6'
      );
      req.flush({ data: mockProducts });
    });
  });

  describe('admin create', () => {
    it('should create a new product', () => {
      const createData = {
        name: 'Novo Produto',
        productType: 'QUESTION',
        price: 100,
      };

      service.create(createData).subscribe((response) => {
        expect(response.data.name).toBe('Novo Produto');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush({ data: { ...mockProduct, ...createData } });
    });
  });

  describe('admin update', () => {
    it('should update a product', () => {
      const updateData = { price: 200, isFeatured: false };

      service.update('prod-1', updateData).subscribe((response) => {
        expect(response.data.price).toBe(200);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/products/prod-1`);
      expect(req.request.method).toBe('PUT');
      req.flush({ data: { ...mockProduct, ...updateData } });
    });
  });

  describe('admin delete', () => {
    it('should delete a product', () => {
      service.delete('prod-1').subscribe((response) => {
        expect(response.message).toContain('excluído');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/products/prod-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Produto excluído com sucesso' });
    });
  });

  describe('admin toggleActive', () => {
    it('should toggle product active status', () => {
      service.toggleActive('prod-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/products/prod-1/toggle-active`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: { ...mockProduct, isActive: false } });
    });
  });

  describe('admin toggleFeatured', () => {
    it('should toggle product featured status', () => {
      service.toggleFeatured('prod-1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/admin/products/prod-1/toggle-featured`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: { ...mockProduct, isFeatured: false } });
    });
  });
});
