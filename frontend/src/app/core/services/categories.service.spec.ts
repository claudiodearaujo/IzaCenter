import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoriesService, ProductCategory, CreateCategoryDTO } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  const mockCategory: ProductCategory = {
    id: '1',
    name: 'Tarô',
    slug: 'taro',
    description: 'Leituras de tarô',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return categories list', () => {
      const mockResponse = { data: [mockCategory], success: true };

      service.findAll().subscribe(response => {
        expect(response.data).toEqual([mockCategory]);
      });

      const req = httpMock.expectOne('/api/categories');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', () => {
      const mockResponse = { data: mockCategory, success: true };

      service.findBySlug('taro').subscribe(response => {
        expect(response.data).toEqual(mockCategory);
      });

      const req = httpMock.expectOne('/api/categories/taro');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('findAllAdmin', () => {
    it('should return all categories for admin', () => {
      const mockResponse = { data: [mockCategory], success: true };

      service.findAllAdmin().subscribe(response => {
        expect(response.data).toEqual([mockCategory]);
      });

      const req = httpMock.expectOne('/api/admin/categories');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('create', () => {
    it('should create new category', () => {
      const createData: CreateCategoryDTO = { name: 'Nova Categoria' };
      const mockResponse = { data: mockCategory, success: true };

      service.create(createData).subscribe(response => {
        expect(response.data).toEqual(mockCategory);
      });

      const req = httpMock.expectOne('/api/admin/categories');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should update existing category', () => {
      const updateData = { name: 'Categoria Atualizada' };
      const mockResponse = { data: mockCategory, success: true };

      service.update('1', updateData).subscribe(response => {
        expect(response.data).toEqual(mockCategory);
      });

      const req = httpMock.expectOne('/api/admin/categories/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('reorder', () => {
    it('should reorder category', () => {
      const mockResponse = { data: mockCategory, success: true };

      service.reorder('1', 5).subscribe(response => {
        expect(response.data).toEqual(mockCategory);
      });

      const req = httpMock.expectOne('/api/admin/categories/1/reorder');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ order: 5 });
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete category', () => {
      const mockResponse = { message: 'Categoria excluída' };

      service.delete('1').subscribe(response => {
        expect(response.message).toBe('Categoria excluída');
      });

      const req = httpMock.expectOne('/api/admin/categories/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
