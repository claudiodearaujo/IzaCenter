import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AdminAvailabilityComponent } from './availability.component';
import { SettingsService, BusinessHour } from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      admin: {
        availability: {
          title: 'Availability',
          subtitle: 'Configure hours',
          save: 'Save',
          saveAll: 'Save All',
          weeklySchedule: 'Weekly Schedule',
          generalSettings: 'General Settings',
          slotDuration: 'Slot Duration (min)',
          bufferMinutes: 'Buffer (min)',
          advanceBookingDays: 'Advance Booking (days)',
          minNoticeHours: 'Min Notice (hours)',
          saved: 'Settings saved',
          errorSaving: 'Error saving',
          open: 'Open',
          closed: 'Closed',
          from: 'From',
          to: 'To',
          dayOff: 'Day Off',
          days: {
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday',
          },
        },
      },
    });
  }
}

const mockBusinessHours: BusinessHour[] = [
  { day: 'monday', dayName: 'Monday', isOpen: true, start: '08:00', end: '17:00' },
  { day: 'tuesday', dayName: 'Tuesday', isOpen: true, start: '08:00', end: '17:00' },
  { day: 'wednesday', dayName: 'Wednesday', isOpen: true, start: '08:00', end: '17:00' },
  { day: 'thursday', dayName: 'Thursday', isOpen: true, start: '08:00', end: '17:00' },
  { day: 'friday', dayName: 'Friday', isOpen: true, start: '08:00', end: '17:00' },
  { day: 'saturday', dayName: 'Saturday', isOpen: false },
  { day: 'sunday', dayName: 'Sunday', isOpen: false },
];

describe('AdminAvailabilityComponent', () => {
  let component: AdminAvailabilityComponent;
  let fixture: ComponentFixture<AdminAvailabilityComponent>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', [
      'getBusinessHours',
      'updateBusinessHours',
    ]);
    notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    settingsServiceSpy.getBusinessHours.and.returnValue(
      of({ data: mockBusinessHours })
    );

    await TestBed.configureTestingModule({
      imports: [
        AdminAvailabilityComponent,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: NotificationService, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load settings on init', () => {
    expect(settingsServiceSpy.getBusinessHours).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('should map business hours to weekday config', () => {
    const monday = component.scheduleSettings.weekdays.find(w => w.day === 'monday');
    expect(monday).toBeDefined();
    expect(monday!.enabled).toBeTrue();
    expect(monday!.startTime).toBe('08:00');
    expect(monday!.endTime).toBe('17:00');
  });

  it('should set disabled days correctly', () => {
    const saturday = component.scheduleSettings.weekdays.find(w => w.day === 'saturday');
    expect(saturday!.enabled).toBeFalse();
  });

  it('should use labelKey for day names', () => {
    const monday = component.scheduleSettings.weekdays.find(w => w.day === 'monday');
    expect(monday!.labelKey).toBe('admin.availability.days.monday');
  });

  it('should have 7 weekdays configured', () => {
    expect(component.scheduleSettings.weekdays.length).toBe(7);
  });

  it('should have default schedule settings', () => {
    expect(component.scheduleSettings.slotDuration).toBe(60);
    expect(component.scheduleSettings.bufferMinutes).toBe(15);
    expect(component.scheduleSettings.advanceBookingDays).toBe(30);
    expect(component.scheduleSettings.minNoticeHours).toBe(24);
  });

  it('should handle error when loading settings', fakeAsync(() => {
    settingsServiceSpy.getBusinessHours.and.returnValue(throwError(() => new Error('HTTP error')));
    component.loadSettings();
    tick();
    expect(component.loading()).toBeFalse();
  }));

  it('should call updateBusinessHours on save', fakeAsync(() => {
    settingsServiceSpy.updateBusinessHours.and.returnValue(
      of({ data: mockBusinessHours })
    );
    component.saveSettings();
    tick();
    expect(settingsServiceSpy.updateBusinessHours).toHaveBeenCalled();
    expect(notificationSpy.success).toHaveBeenCalled();
    expect(component.saving()).toBeFalse();
  }));

  it('should handle error when saving settings', fakeAsync(() => {
    settingsServiceSpy.updateBusinessHours.and.returnValue(throwError(() => new Error('HTTP error')));
    component.saveSettings();
    tick();
    expect(notificationSpy.error).toHaveBeenCalled();
    expect(component.saving()).toBeFalse();
  }));
});
