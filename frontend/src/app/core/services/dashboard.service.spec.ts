import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService, DashboardStats, RecentOrder, RecentUser } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockStats: DashboardStats = {
    totalOrders: 100,
    ordersToday: 5,
    ordersGrowth: 15,
    totalRevenue: 25000,
    revenueToday: 500,
    revenueGrowth: 20,
    totalUsers: 150,
    newUsersToday: 3,
    usersGrowth: 10,
    totalProducts: 25,
    activeProducts: 20,
    pendingReadings: 8,
    publishedReadings: 50,
    upcomingAppointments: 12,
    pendingAppointments: 4,
    pendingTestimonials: 6,
  };

  const mockRecentOrder: RecentOrder = {
    id: '1',
    orderNumber: 'ORD-001',
    total: 99.90,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    user: {
      id: 'user-1',
      fullName: 'Maria Silva',
      email: 'maria@example.com',
    },
    items: [],
  };

  const mockRecentUser: RecentUser = {
    id: '1',
    fullName: 'João Santos',
    email: 'joao@example.com',
    createdAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStats', () => {
    it('should return dashboard stats', () => {
      const mockResponse = { data: mockStats, success: true };

      service.getStats().subscribe(response => {
        expect(response.data).toEqual(mockStats);
        expect(response.data.totalOrders).toBe(100);
        expect(response.data.totalRevenue).toBe(25000);
      });

      const req = httpMock.expectOne('/api/admin/dashboard/stats');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
