import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      client: {
        dashboard: {
          title: 'Dashboard',
          welcome: 'Welcome',
          totalOrders: 'Total Orders',
          pendingReadings: 'Pending Readings',
          completedReadings: 'Completed Readings',
          upcomingAppointments: 'Upcoming Appointments',
          recentOrders: 'Recent Orders',
          recentReadings: 'Recent Readings',
          viewAll: 'View All',
          noOrders: 'No orders',
          noReadings: 'No readings',
        },
        orders: {
          statusPending: 'Pending',
          statusPaid: 'Paid',
          statusProcessing: 'Processing',
          statusCompleted: 'Completed',
          statusCancelled: 'Cancelled',
          statusRefunded: 'Refunded',
        },
        readings: {
          statusWaiting: 'Waiting',
          statusInProgress: 'In Progress',
          statusPublished: 'Published',
        },
      },
    });
  }
}

const mockStats = {
  totalOrders: 3,
  pendingReadings: 1,
  completedReadings: 2,
  upcomingAppointments: 1,
};

const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-001',
    status: 'PAID',
    total: 150,
    createdAt: '2026-01-15T10:00:00Z',
  },
];

const mockReadings = [
  {
    id: 'reading-1',
    title: 'Tarot Reading',
    status: 'PUBLISHED',
    publishedAt: '2026-01-10T10:00:00Z',
    product: { name: 'Premium Reading' },
  },
];

const mockUser = { id: 'user-1', fullName: 'Test User', email: 'test@example.com', role: 'CLIENT' };

describe('DashboardComponent (Client)', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      user: signal(mockUser) as any,
    });

    // Default mock responses
    apiServiceSpy.get.and.callFake((url: string): any => {
      if (url.includes('/users/me/stats')) return of({ data: mockStats });
      if (url.includes('/users/me/orders')) return of({ data: mockOrders });
      if (url.includes('/users/me/readings')) return of({ data: mockReadings });
      return of({ data: null });
    });

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(apiServiceSpy.get).toHaveBeenCalledWith(
      '/users/me/stats',
      jasmine.anything()
    );
  });

  it('should set stats after loading', () => {
    expect(component.stats()).toEqual(mockStats);
  });

  it('should set recent orders after loading', () => {
    expect(component.recentOrders().length).toBe(1);
    expect(component.recentOrders()[0].id).toBe('order-1');
  });

  it('should set recent readings after loading', () => {
    expect(component.recentReadings().length).toBe(1);
    expect(component.recentReadings()[0].id).toBe('reading-1');
  });

  it('should set loading to false after data loaded', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should return correct status label for PENDING order', () => {
    const label = component.getStatusLabel('PENDING');
    expect(label).toBeTruthy();
  });

  it('should return correct status label for PAID order', () => {
    const label = component.getStatusLabel('PAID');
    expect(label).toBeTruthy();
  });

  it('should return correct status label for PUBLISHED reading', () => {
    const label = component.getStatusLabel('PUBLISHED');
    expect(label).toBeTruthy();
  });

  it('should return status class for PENDING', () => {
    const cls = component.getStatusClass('PENDING');
    expect(cls).toContain('yellow');
  });

  it('should return status class for COMPLETED', () => {
    const cls = component.getStatusClass('COMPLETED');
    expect(cls).toContain('green');
  });

  it('should return status class for CANCELLED', () => {
    const cls = component.getStatusClass('CANCELLED');
    expect(cls).toContain('red');
  });

  it('should return fallback class for unknown status', () => {
    const cls = component.getStatusClass('UNKNOWN');
    expect(cls).toContain('gray');
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2026-01-15T10:00:00Z');
    expect(formatted).toContain('15');
    expect(formatted).toContain('01');
    expect(formatted).toContain('2026');
  });

  describe('error handling', () => {
    beforeEach(async () => {
      apiServiceSpy.get.and.returnValue(throwError(() => new Error('HTTP error')));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          DashboardComponent,
          RouterTestingModule,
          NoopAnimationsModule,
          TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
          }),
        ],
        providers: [
          { provide: ApiService, useValue: apiServiceSpy },
          { provide: AuthService, useValue: authServiceSpy },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should use default stats on error', () => {
      expect(component.stats()).toEqual({
        totalOrders: 0,
        pendingReadings: 0,
        completedReadings: 0,
        upcomingAppointments: 0,
      });
    });

    it('should set empty orders on error', () => {
      expect(component.recentOrders()).toEqual([]);
    });

    it('should set empty readings on error', () => {
      expect(component.recentReadings()).toEqual([]);
    });
  });
});
