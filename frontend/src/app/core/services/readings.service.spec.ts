import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReadingsService, Reading } from './readings.service';
import { environment } from '../../../environments/environment';

describe('ReadingsService / Delivery compatibility', () => {
  let service: ReadingsService;
  let httpMock: HttpTestingController;

  const mockDelivery: Reading = {
    id: '1',
    orderItemId: 'order-item-1',
    clientId: 'client-1',
    title: 'Relatório integrativo',
    status: 'PENDING',
    deliveryType: 'PDF',
    content: {},
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

  it('should list admin deliveries through the canonical route', () => {
    const mockResponse = {
      data: [mockDelivery],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    service.findAll().subscribe(response => {
      expect(response.data).toEqual([mockDelivery]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/deliveries`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should pass admin delivery filters', () => {
    service.findAll({ status: 'PENDING', page: 1 }).subscribe();

    const req = httpMock.expectOne(request =>
      request.url === `${environment.apiUrl}/admin/deliveries` &&
      request.params.get('status') === 'PENDING' &&
      request.params.get('page') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  });

  it('should list client deliveries through the canonical route', () => {
    service.getMyReadings().subscribe(response => {
      expect(response.data[0].deliveryType).toBe('PDF');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/deliveries`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [mockDelivery] });
  });

  it('should fetch a client delivery by id', () => {
    service.getMyReadingById('1').subscribe(response => {
      expect(response.data.id).toBe('1');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/deliveries/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockDelivery });
  });
});
