import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminAppointmentListComponent } from './appointment-list.component';
import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { NotificationService } from '../../../../core/services/notification.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      admin: {
        appointments: {
          title: 'Appointments',
          subtitle: 'Manage appointments',
          upcoming: 'Upcoming',
          today: 'Today',
          completed: 'Completed',
          cancelled: 'Cancelled',
          statusScheduled: 'Scheduled',
          statusConfirmed: 'Confirmed',
          statusInProgress: 'In Progress',
          statusCompleted: 'Completed',
          statusCancelled: 'Cancelled',
          statusNoShow: 'No Show',
          searchClient: 'Search client...',
          client: 'Client',
          service: 'Service',
          dateTime: 'Date/Time',
          duration: 'Duration',
          cancelConfirm: 'Cancel this appointment?',
          confirmCancellation: 'Confirm Cancellation',
          yesCancel: 'Yes, cancel',
          cancelledSuccess: 'Appointment cancelled',
          errorUpdatingStatus: 'Error updating status',
        },
      },
      common: {
        all: 'All',
        no: 'No',
        status: 'Status',
        actions: 'Actions',
        search: 'Search',
      },
    });
  }
}

const today = new Date();

const mockAppointment: Appointment = {
  id: 'appt-1',
  scheduledDate: today,
  startTime: '09:00',
  endTime: '10:00',
  durationMinutes: 60,
  status: 'CONFIRMED',
  createdAt: today,
  updatedAt: today,
};

describe('AdminAppointmentListComponent', () => {
  let component: AdminAppointmentListComponent;
  let fixture: ComponentFixture<AdminAppointmentListComponent>;
  let appointmentsServiceSpy: jasmine.SpyObj<AppointmentsService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    appointmentsServiceSpy = jasmine.createSpyObj('AppointmentsService', [
      'findAll',
      'updateStatus',
      'reschedule',
    ]);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    appointmentsServiceSpy.findAll.and.returnValue(
      of({ data: [mockAppointment], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } })
    );

    await TestBed.configureTestingModule({
      imports: [
        AdminAppointmentListComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [
        { provide: AppointmentsService, useValue: appointmentsServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    expect(appointmentsServiceSpy.findAll).toHaveBeenCalled();
    expect(component.appointments().length).toBe(1);
    expect(component.loading()).toBeFalse();
  });

  it('should compute upcomingCount for CONFIRMED appointments', () => {
    expect(component.upcomingCount()).toBe(1);
  });

  it('should compute completedCount as 0', () => {
    expect(component.completedCount()).toBe(0);
  });

  it('should compute cancelledCount as 0', () => {
    expect(component.cancelledCount()).toBe(0);
  });

  it('should handle error when loading appointments', fakeAsync(() => {
    appointmentsServiceSpy.findAll.and.returnValue(throwError(() => new Error('HTTP error')));
    component.loadAppointments();
    tick();
    expect(component.appointments()).toEqual([]);
    expect(component.loading()).toBeFalse();
  }));

  describe('statusOptions getter', () => {
    it('should return all status options', () => {
      const options = component.statusOptions;
      expect(options.length).toBe(7);
    });
  });

  it('should open reschedule dialog', () => {
    component.openRescheduleDialog(mockAppointment);
    expect(component.rescheduleDialogVisible()).toBeTrue();
    expect(component.selectedAppointment()).toEqual(mockAppointment);
  });

  it('should open notes dialog', () => {
    component.openNotesDialog(mockAppointment);
    expect(component.notesDialogVisible()).toBeTrue();
  });
});
