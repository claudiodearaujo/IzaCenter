// apps/backend/src/modules/appointments/appointments.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import { AppointmentsController } from './appointments.controller';
import { appointmentsService } from './appointments.service';

// Mock the appointments service
jest.mock('./appointments.service', () => ({
  appointmentsService: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    reschedule: jest.fn(),
    cancel: jest.fn(),
    getAvailableSlots: jest.fn(),
  },
}));

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  user: { id: 'user-1', email: 'user@test.com', role: 'CLIENT' } as any,
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new AppointmentsController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // =============================================
  // ADMIN — findAll
  // =============================================
  describe('findAll', () => {
    it('should return list of appointments', async () => {
      const mockAppointments = {
        data: [{ id: 'appt-1', status: 'PENDING' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      req.query = { status: 'PENDING', page: '1', limit: '10' };
      (appointmentsService.findAll as jest.Mock).mockResolvedValue(mockAppointments);

      await controller.findAll(req as Request, res as Response, mockNext);

      expect(appointmentsService.findAll).toHaveBeenCalledWith({
        status: 'PENDING',
        date: undefined,
        search: undefined,
        page: 1,
        limit: 10,
      });
      expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });

    it('should parse date query param', async () => {
      const dateStr = '2026-02-15';
      req.query = { date: dateStr };
      (appointmentsService.findAll as jest.Mock).mockResolvedValue({ data: [] });

      await controller.findAll(req as Request, res as Response, mockNext);

      expect(appointmentsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ date: new Date(dateStr) })
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (appointmentsService.findAll as jest.Mock).mockRejectedValue(error);

      await controller.findAll(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — findById
  // =============================================
  describe('findById', () => {
    it('should return a single appointment', async () => {
      const mockAppointment = { id: 'appt-1', status: 'PENDING' };
      req.params = { id: 'appt-1' };
      (appointmentsService.findById as jest.Mock).mockResolvedValue(mockAppointment);

      await controller.findById(req as Request, res as Response, mockNext);

      expect(appointmentsService.findById).toHaveBeenCalledWith('appt-1');
      expect(res.json).toHaveBeenCalledWith(mockAppointment);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Not found');
      req.params = { id: 'appt-999' };
      (appointmentsService.findById as jest.Mock).mockRejectedValue(error);

      await controller.findById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — update
  // =============================================
  describe('update', () => {
    it('should update an appointment', async () => {
      const updateData = { notes: 'Updated notes' };
      const mockUpdated = { id: 'appt-1', notes: 'Updated notes' };
      req.params = { id: 'appt-1' };
      req.body = updateData;
      (appointmentsService.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.update(req as Request, res as Response, mockNext);

      expect(appointmentsService.update).toHaveBeenCalledWith('appt-1', updateData);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Not found');
      req.params = { id: 'appt-999' };
      (appointmentsService.update as jest.Mock).mockRejectedValue(error);

      await controller.update(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — updateStatus
  // =============================================
  describe('updateStatus', () => {
    it('should update appointment status', async () => {
      const mockUpdated = { id: 'appt-1', status: 'CONFIRMED' };
      req.params = { id: 'appt-1' };
      req.body = { status: 'CONFIRMED' };
      (appointmentsService.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.updateStatus(req as Request, res as Response, mockNext);

      expect(appointmentsService.update).toHaveBeenCalledWith('appt-1', { status: 'CONFIRMED' });
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Invalid status');
      req.params = { id: 'appt-1' };
      req.body = { status: 'INVALID' };
      (appointmentsService.update as jest.Mock).mockRejectedValue(error);

      await controller.updateStatus(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — reschedule
  // =============================================
  describe('reschedule', () => {
    it('should reschedule an appointment', async () => {
      const mockRescheduled = { id: 'appt-1', date: '2026-03-01' };
      req.params = { id: 'appt-1' };
      req.body = { date: '2026-03-01', startTime: '10:00', endTime: '11:00' };
      (appointmentsService.reschedule as jest.Mock).mockResolvedValue(mockRescheduled);

      await controller.reschedule(req as Request, res as Response, mockNext);

      expect(appointmentsService.reschedule).toHaveBeenCalledWith(
        'appt-1',
        new Date('2026-03-01'),
        '10:00',
        '11:00'
      );
      expect(res.json).toHaveBeenCalledWith(mockRescheduled);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Conflict');
      req.params = { id: 'appt-1' };
      req.body = { date: '2026-03-01', startTime: '10:00', endTime: '11:00' };
      (appointmentsService.reschedule as jest.Mock).mockRejectedValue(error);

      await controller.reschedule(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CLIENT — findByUser
  // =============================================
  describe('findByUser', () => {
    it('should return appointments for the authenticated user', async () => {
      const mockAppointments = { data: [{ id: 'appt-1', userId: 'user-1' }] };
      req.user = { id: 'user-1', email: 'user@test.com', role: 'CLIENT' } as any;
      (appointmentsService.findByUser as jest.Mock).mockResolvedValue(mockAppointments);

      await controller.findByUser(req as Request, res as Response, mockNext);

      expect(appointmentsService.findByUser).toHaveBeenCalledWith('user-1');
      expect(res.json).toHaveBeenCalledWith(mockAppointments);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Unauthorized');
      (appointmentsService.findByUser as jest.Mock).mockRejectedValue(error);

      await controller.findByUser(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CLIENT — cancel
  // =============================================
  describe('cancel', () => {
    it('should cancel an appointment with reason', async () => {
      const mockCancelled = { id: 'appt-1', status: 'CANCELLED' };
      req.params = { id: 'appt-1' };
      req.body = { reason: 'Client request' };
      (appointmentsService.cancel as jest.Mock).mockResolvedValue(mockCancelled);

      await controller.cancel(req as Request, res as Response, mockNext);

      expect(appointmentsService.cancel).toHaveBeenCalledWith('appt-1', 'Client request');
      expect(res.json).toHaveBeenCalledWith(mockCancelled);
    });

    it('should cancel an appointment without reason', async () => {
      const mockCancelled = { id: 'appt-1', status: 'CANCELLED' };
      req.params = { id: 'appt-1' };
      req.body = {};
      (appointmentsService.cancel as jest.Mock).mockResolvedValue(mockCancelled);

      await controller.cancel(req as Request, res as Response, mockNext);

      expect(appointmentsService.cancel).toHaveBeenCalledWith('appt-1', undefined);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Not found');
      req.params = { id: 'appt-999' };
      (appointmentsService.cancel as jest.Mock).mockRejectedValue(error);

      await controller.cancel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CLIENT — getAvailableSlots
  // =============================================
  describe('getAvailableSlots', () => {
    it('should return available slots for a given date', async () => {
      const mockSlots = { data: ['09:00', '10:00', '11:00'] };
      req.query = { date: '2026-03-01' };
      (appointmentsService.getAvailableSlots as jest.Mock).mockResolvedValue(mockSlots);

      await controller.getAvailableSlots(req as Request, res as Response, mockNext);

      expect(appointmentsService.getAvailableSlots).toHaveBeenCalledWith(
        new Date('2026-03-01')
      );
      expect(res.json).toHaveBeenCalledWith(mockSlots);
    });

    it('should return 400 when date is missing', async () => {
      req.query = {};

      await controller.getAvailableSlots(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Date is required' });
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('DB error');
      req.query = { date: '2026-03-01' };
      (appointmentsService.getAvailableSlots as jest.Mock).mockRejectedValue(error);

      await controller.getAvailableSlots(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
