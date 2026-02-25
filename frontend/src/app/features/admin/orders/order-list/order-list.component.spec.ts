import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminOrderListComponent } from './order-list.component';
import { OrdersService, Order } from '../../../../core/services/orders.service';
import { NotificationService } from '../../../../core/services/notification.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      admin: {
        orders: {
          title: 'Orders',
          subtitle: 'Manage orders',
          pending: 'Pending',
          paid: 'Paid',
          completed: 'Completed',
          cancelled: 'Cancelled',
          statusPending: 'Pending',
          statusPaid: 'Paid',
          statusProcessing: 'Processing',
          statusCompleted: 'Completed',
          statusCancelled: 'Cancelled',
          statusRefunded: 'Refunded',
          cancelConfirm: 'Are you sure?',
          confirmCancellation: 'Confirm Cancellation',
          yesCancel: 'Yes, cancel',
          cancelledSuccess: 'Order cancelled',
          errorUpdatingStatus: 'Error updating status',
          notesSaved: 'Notes saved',
          errorSaving: 'Error saving',
        },
      },
      common: { all: 'All', no: 'No' },
    });
  }
}

const mockOrder: Order = {
  id: 'order-1',
  orderNumber: 'ORD-001',
  clientId: 'client-1',
  subtotal: 100,
  discount: 0,
  total: 100,
  status: 'PENDING',
  paymentStatus: 'PENDING',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  items: [],
};

describe('AdminOrderListComponent', () => {
  let component: AdminOrderListComponent;
  let fixture: ComponentFixture<AdminOrderListComponent>;
  let ordersServiceSpy: jasmine.SpyObj<OrdersService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    ordersServiceSpy = jasmine.createSpyObj('OrdersService', [
      'findAll',
      'updateStatus',
      'updateAdminNotes',
    ]);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    ordersServiceSpy.findAll.and.returnValue(
      of({ data: [mockOrder], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } })
    );

    await TestBed.configureTestingModule({
      imports: [
        AdminOrderListComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    expect(ordersServiceSpy.findAll).toHaveBeenCalled();
    expect(component.orders().length).toBe(1);
    expect(component.orders()[0].id).toBe('order-1');
  });

  it('should set totalRecords from response', () => {
    expect(component.totalRecords()).toBe(1);
  });

  it('should compute pendingCount correctly', () => {
    expect(component.pendingCount()).toBe(1);
  });

  it('should compute paidCount as 0', () => {
    expect(component.paidCount()).toBe(0);
  });

  it('should compute completedCount as 0', () => {
    expect(component.completedCount()).toBe(0);
  });

  it('should compute cancelledCount as 0', () => {
    expect(component.cancelledCount()).toBe(0);
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('PENDING')).toBe('Pending');
    expect(component.getStatusLabel('PAID')).toBe('Paid');
    expect(component.getStatusLabel('COMPLETED')).toBe('Completed');
    expect(component.getStatusLabel('CANCELLED')).toBe('Cancelled');
  });

  it('should return correct status severity', () => {
    expect(component.getStatusSeverity('PENDING')).toBe('warn');
    expect(component.getStatusSeverity('PAID')).toBe('info');
    expect(component.getStatusSeverity('COMPLETED')).toBe('success');
    expect(component.getStatusSeverity('CANCELLED')).toBe('danger');
    expect(component.getStatusSeverity('REFUNDED')).toBe('secondary');
  });

  it('should format date correctly', () => {
    const date = new Date('2026-01-15T10:30:00');
    const formatted = component.formatDate(date);
    expect(formatted).toContain('15');
    expect(formatted).toContain('01');
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(100);
    expect(formatted).toContain('100');
  });

  it('should handle error when loading orders', fakeAsync(() => {
    ordersServiceSpy.findAll.and.returnValue(throwError(() => new Error('HTTP error')));
    component.loadOrders();
    tick();
    expect(component.orders()).toEqual([]);
    expect(component.loading()).toBeFalse();
  }));

  it('should open notes dialog', () => {
    component.openNotesDialog(mockOrder);
    expect(component.notesDialogVisible()).toBeTrue();
    expect(component.selectedOrder()).toEqual(mockOrder);
    expect(component.notes).toBe('');
  });

  it('should open notes dialog with existing notes', () => {
    const orderWithNotes = { ...mockOrder, adminNotes: 'Test notes' };
    component.openNotesDialog(orderWithNotes);
    expect(component.notes).toBe('Test notes');
  });

  it('should not save notes when no order selected', () => {
    component.selectedOrder.set(null);
    component.saveNotes();
    expect(ordersServiceSpy.updateAdminNotes).not.toHaveBeenCalled();
  });

  describe('statusOptions getter', () => {
    it('should return all status options', () => {
      const options = component.statusOptions;
      expect(options.length).toBe(7);
    });
  });
});
