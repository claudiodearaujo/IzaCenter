import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminDashboardComponent } from './dashboard.component';
import { DashboardService, DashboardStats, RecentOrder } from '../../../core/services/dashboard.service';
import { ReadingsService, Reading } from '../../../core/services/readings.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      admin: {
        dashboard: {
          title: 'Dashboard',
          subtitle: 'Overview',
          totalOrders: 'Total Orders',
          totalRevenue: 'Total Revenue',
          totalClients: 'Total Clients',
          pendingReadings: 'Pending Readings',
          upcomingAppointments: 'Upcoming Appointments',
          pendingTestimonials: 'Pending Testimonials',
          quickActions: 'Quick Actions',
          recentOrders: 'Recent Orders',
          viewAll: 'View All',
        },
        products: {
          typeQuestion: 'Questions',
          typeSession: 'Session',
          typeMonthly: 'Monthly',
          typeSpecial: 'Special',
        },
        readings: {
          statusWaiting: 'Waiting',
          statusInProgress: 'In Progress',
        },
      },
      client: {
        orders: {
          statusPending: 'Pending',
          statusPaid: 'Paid',
          statusProcessing: 'Processing',
          statusCompleted: 'Completed',
        },
      },
    });
  }
}

const mockStats: DashboardStats = {
  totalOrders: 42,
  ordersGrowth: 10,
  totalRevenue: 5000,
  revenueGrowth: 5,
  totalUsers: 100,
  usersGrowth: 8,
  totalProducts: 10,
  pendingReadings: 3,
  upcomingAppointments: 5,
  pendingTestimonials: 2,
};

const mockRecentOrders: RecentOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-001',
    total: 200,
    status: 'PAID',
    paymentStatus: 'PAID',
    createdAt: new Date('2026-01-01'),
    user: { id: 'user-1', fullName: 'John Doe', email: 'john@test.com' },
    items: [{ product: { id: 'prod-1', name: 'Product 1' }, quantity: 2 }],
  },
];

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let readingsServiceSpy: jasmine.SpyObj<ReadingsService>;

  beforeEach(async () => {
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getStats',
      'getRecentOrders',
      'getSalesChart',
    ]);
    readingsServiceSpy = jasmine.createSpyObj('ReadingsService', ['findAll']);

    dashboardServiceSpy.getStats.and.returnValue(of({ data: mockStats }));
    dashboardServiceSpy.getRecentOrders.and.returnValue(of({ data: mockRecentOrders }));
    dashboardServiceSpy.getSalesChart.and.returnValue(
      of({ data: { labels: ['Jan'], datasets: [{ label: 'Revenue', data: [1000] }] } })
    );
    readingsServiceSpy.findAll.and.returnValue(of({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } }));

    await TestBed.configureTestingModule({
      imports: [
        AdminDashboardComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: ReadingsService, useValue: readingsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(dashboardServiceSpy.getStats).toHaveBeenCalled();
    expect(dashboardServiceSpy.getRecentOrders).toHaveBeenCalledWith(5);
    expect(readingsServiceSpy.findAll).toHaveBeenCalledWith({ status: 'PENDING', limit: 5 });
  });

  it('should set stats from response', () => {
    expect(component.stats()).toEqual(mockStats);
  });

  it('should set recentOrders from response', () => {
    expect(component.recentOrders().length).toBe(1);
  });

  it('should set loading to false after loading', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should handle stats error with default values', fakeAsync(() => {
    dashboardServiceSpy.getStats.and.returnValue(throwError(() => new Error('HTTP error')));
    component.loadDashboard();
    tick();
    expect(component.stats()!.totalOrders).toBe(0);
    expect(component.stats()!.totalRevenue).toBe(0);
  }));

  it('should return correct status label for PENDING', () => {
    expect(component.getStatusLabel('PENDING')).toBe('Pending');
  });

  it('should return correct status label for PAID', () => {
    expect(component.getStatusLabel('PAID')).toBe('Paid');
  });

  it('should return original value for unknown status', () => {
    expect(component.getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should return correct status class for COMPLETED', () => {
    expect(component.getStatusClass('COMPLETED')).toContain('green');
  });

  it('should return correct status class for PENDING', () => {
    expect(component.getStatusClass('PENDING')).toContain('yellow');
  });

  it('should format date correctly', () => {
    const date = '2026-01-15T10:30:00';
    const formatted = component.formatDate(date);
    expect(formatted).toContain('15');
  });

  it('should initialize chart data', () => {
    expect(component.ordersChartData).toBeDefined();
    expect(component.ordersChartData.labels.length).toBe(4);
    expect(component.revenueChartOptions).toBeDefined();
  });
});
