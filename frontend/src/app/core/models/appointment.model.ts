export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  orderItemId?: string;
  clientId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  clientNotes?: string;
  adminNotes?: string;
  meetingUrl?: string;
  meetingPassword?: string;
  reminderSentAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailableDay {
  date: string;
  slots: TimeSlot[];
}
