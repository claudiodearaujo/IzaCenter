import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReadingsService, Reading, UpdateReadingDTO } from './readings.service';

describe('ReadingsService', () => {
  let service: ReadingsService;
  let httpMock: HttpTestingController;

  const mockReading: Reading = {
    id: '1',
    title: 'Leitura de Tarô',
    status: 'PENDING',
    clientQuestion: 'Qual meu futuro profissional?',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReadingsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ReadingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return all readings', () => {
      const mockResponse = { data: [mockReading], total: 1, page: 1, limit: 10 };

      service.findAll().subscribe(response => {
        expect(response.data).toEqual([mockReading]);
      });

      const req = httpMock.expectOne('/api/admin/readings');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return readings with filters', () => {
      const mockResponse = { data: [mockReading], total: 1, page: 1, limit: 10 };

      service.findAll({ status: 'PENDING', page: 1 }).subscribe(response => {
        expect(response.data).toEqual([mockReading]);
      });

      const req = httpMock.expectOne(req =>
        req.url === '/api/admin/readings' &&
        req.params.get('status') === 'PENDING'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
