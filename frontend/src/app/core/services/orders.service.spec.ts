import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrdersService, Order } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  const mockOrder: Order = {
    id: '1',
    orderNumber: 'ORD-001',
    clientId: 'client-1',
    subtotal: 100,
    discount: 0,
    total: 100,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrdersService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMyOrders', () => {
    it('should return client orders', () => {
      const mockResponse = { data: [mockOrder], success: true };

      service.getMyOrders().subscribe(response => {
        expect(response.data).toEqual([mockOrder]);
      });

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMyOrderById', () => {
    it('should return order by id', () => {
      const mockResponse = { data: mockOrder, success: true };

      service.getMyOrderById('1').subscribe(response => {
        expect(response.data).toEqual(mockOrder);
      });

      const req = httpMock.expectOne('/api/orders/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('findAll (admin)', () => {
    it('should return all orders without params', () => {
      const mockResponse = { data: [mockOrder], total: 1, page: 1, limit: 10 };

      service.findAll().subscribe(response => {
        expect(response.data).toEqual([mockOrder]);
      });

      const req = httpMock.expectOne('/api/admin/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return orders with filters', () => {
      const mockResponse = { data: [mockOrder], total: 1, page: 1, limit: 10 };

      service.findAll({ status: 'PENDING', page: 1 }).subscribe(response => {
        expect(response.data).toEqual([mockOrder]);
      });

      const req = httpMock.expectOne(req => 
        req.url === '/api/admin/orders' && 
        req.params.get('status') === 'PENDING'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('findById (admin)', () => {
    it('should return order by id', () => {
      const mockResponse = { data: mockOrder, success: true };

      service.findById('1').subscribe(response => {
        expect(response.data).toEqual(mockOrder);
      });

      const req = httpMock.expectOne('/api/admin/orders/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', () => {
      const mockResponse = { data: { ...mockOrder, status: 'COMPLETED' }, success: true };

      service.updateStatus('1', 'COMPLETED').subscribe(response => {
        expect(response.data.status).toBe('COMPLETED');
      });

      const req = httpMock.expectOne('/api/admin/orders/1/status');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'COMPLETED' });
      req.flush(mockResponse);
    });
  });

  describe('updateAdminNotes', () => {
    it('should update admin notes', () => {
      const mockResponse = { data: { ...mockOrder, adminNotes: 'Nota importante' }, success: true };

      service.updateAdminNotes('1', 'Nota importante').subscribe(response => {
        expect(response.data.adminNotes).toBe('Nota importante');
      });

      const req = httpMock.expectOne('/api/admin/orders/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ adminNotes: 'Nota importante' });
      req.flush(mockResponse);
    });
  });

  describe('getStats', () => {
    it('should return order stats', () => {
      const mockStats = { total: 100, pending: 20, completed: 80, revenue: 5000 };
      const mockResponse = { data: mockStats, success: true };

      service.getStats().subscribe(response => {
        expect(response.data).toEqual(mockStats);
      });

      const req = httpMock.expectOne('/api/admin/orders/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
