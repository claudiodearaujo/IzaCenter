import { AppointmentsService } from './appointments.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

// Mock email utils
jest.mock('../../utils/email.util', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    orderConfirmation: jest.fn().mockReturnValue({
      subject: 'Pedido Confirmado',
      html: '<p>Pedido confirmado</p>',
    }),
  },
}));

// Mock utils
jest.mock('../../utils', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {},
}));

// Mock settings service to return default business hours
jest.mock('../settings', () => ({
  settingsService: {
    getBusinessHours: jest.fn().mockResolvedValue({
      data: [
        { day: 'saturday', dayName: 'Sábado', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'sunday', dayName: 'Domingo', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'monday', dayName: 'Segunda', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'tuesday', dayName: 'Terça', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'wednesday', dayName: 'Quarta', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'thursday', dayName: 'Quinta', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'friday', dayName: 'Sexta', isOpen: true, start: '09:00', end: '18:00' },
      ],
    }),
  },
}));

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(() => {
    service = new AppointmentsService();
    jest.clearAllMocks();
  });

  // =============================================
  // MOCK DATA
  // =============================================
  const mockClient = {
    id: 'user-123',
    fullName: 'Cliente Teste',
    email: 'client@test.com',
    phone: '11999999999',
    avatarUrl: null,
  };

  const mockProduct = {
    id: 'product-123',
    name: 'Leitura Completa',
  };

  const mockOrderItem = {
    id: 'item-123',
    productId: 'product-123',
    product: mockProduct,
  };

  const mockAppointment = {
    id: 'appt-123',
    clientId: 'user-123',
    orderItemId: 'item-123',
    scheduledDate: new Date('2026-03-15'),
    startTime: '10:00',
    endTime: '10:30',
    durationMinutes: 30,
    status: 'SCHEDULED',
    clientNotes: 'Notas do cliente',
    adminNotes: null,
    meetingUrl: null,
    meetingPassword: null,
    confirmedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    client: mockClient,
    orderItem: { ...mockOrderItem, product: mockProduct },
  };

  // =============================================
  // FIND ALL
  // =============================================
  describe('findAll', () => {
    it('should list appointments with default pagination', async () => {
      // Arrange
      prismaMock.appointment.findMany.mockResolvedValue([mockAppointment] as any);
      prismaMock.appointment.count.mockResolvedValue(1);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(result.data).toEqual([mockAppointment]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
        })
      );
    });

    it('should filter by status', async () => {
      // Arrange
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      // Act
      await service.findAll({ status: 'CONFIRMED' });

      // Assert
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'CONFIRMED' }),
        })
      );
    });

    it('should filter by date', async () => {
      // Arrange
      const date = new Date('2026-03-15');
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      // Act
      await service.findAll({ date });

      // Assert
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });

    it('should filter by search (client name/email)', async () => {
      // Arrange
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      // Act
      await service.findAll({ search: 'Cliente' });

      // Assert
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            client: {
              OR: [
                { fullName: { contains: 'Cliente', mode: 'insensitive' } },
                { email: { contains: 'Cliente', mode: 'insensitive' } },
              ],
            },
          }),
        })
      );
    });

    it('should apply custom pagination', async () => {
      // Arrange
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(25);

      // Act
      const result = await service.findAll({ page: 2, limit: 5 });

      // Assert
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      });
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      );
    });
  });

  // =============================================
  // FIND BY USER
  // =============================================
  describe('findByUser', () => {
    it('should list appointments for a user', async () => {
      // Arrange
      prismaMock.appointment.findMany.mockResolvedValue([mockAppointment] as any);

      // Act
      const result = await service.findByUser('user-123');

      // Assert
      expect(result.data).toEqual([mockAppointment]);
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith({
        where: { clientId: 'user-123' },
        include: {
          orderItem: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
      });
    });

    it('should return empty array when user has no appointments', async () => {
      // Arrange
      prismaMock.appointment.findMany.mockResolvedValue([]);

      // Act
      const result = await service.findByUser('user-999');

      // Assert
      expect(result.data).toEqual([]);
    });
  });

  // =============================================
  // FIND BY ID
  // =============================================
  describe('findById', () => {
    it('should get appointment by id', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await service.findById('appt-123');

      // Assert
      expect(result.data).toEqual(mockAppointment);
      expect(prismaMock.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        include: expect.objectContaining({
          client: expect.any(Object),
          orderItem: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException if appointment not found', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('appt-999')).rejects.toThrow(
        'Agendamento não encontrado'
      );
    });
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    const createData = {
      userId: 'user-123',
      orderItemId: 'item-123',
      scheduledDate: new Date('2026-03-15'),
      startTime: '10:00',
      endTime: '10:30',
      durationMinutes: 30,
      clientNotes: 'Notas do cliente',
    };

    it('should create appointment successfully', async () => {
      // Arrange — no conflicts
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.create.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await service.create(createData);

      // Assert
      expect(result.data).toEqual(mockAppointment);
      expect(prismaMock.appointment.create).toHaveBeenCalledWith({
        data: {
          clientId: 'user-123',
          orderItemId: 'item-123',
          scheduledDate: createData.scheduledDate,
          startTime: '10:00',
          endTime: '10:30',
          durationMinutes: 30,
          clientNotes: 'Notas do cliente',
          status: 'SCHEDULED',
        },
        include: {
          client: {
            select: { id: true, fullName: true, email: true },
          },
        },
      });
    });

    it('should throw BadRequestException on time conflict', async () => {
      // Arrange — existing appointment overlaps
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          id: 'existing-appt',
          startTime: '09:45',
          endTime: '10:15',
          status: 'SCHEDULED',
        },
      ] as any);

      // Act & Assert
      await expect(service.create(createData)).rejects.toThrow(
        'Este horário já está ocupado'
      );
      expect(prismaMock.appointment.create).not.toHaveBeenCalled();
    });

    it('should create appointment when no overlap exists', async () => {
      // Arrange — existing appointment does NOT overlap
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          id: 'existing-appt',
          startTime: '08:00',
          endTime: '09:00',
          status: 'SCHEDULED',
        },
      ] as any);
      prismaMock.appointment.create.mockResolvedValue(mockAppointment as any);

      // Act
      const result = await service.create(createData);

      // Assert
      expect(result.data).toEqual(mockAppointment);
    });

    it('should send confirmation email after creation', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.create.mockResolvedValue(mockAppointment as any);

      // Act
      await service.create(createData);

      // Assert
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@test.com',
          subject: 'Agendamento Confirmado - Izabela Tarot',
        })
      );
    });

    it('should not send email if client has no email', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      const noEmailAppointment = {
        ...mockAppointment,
        client: { ...mockClient, email: null },
      };
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.create.mockResolvedValue(noEmailAppointment as any);

      // Act
      await service.create(createData);

      // Assert
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // UPDATE
  // =============================================
  describe('update', () => {
    it('should update appointment successfully', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        adminNotes: 'Admin note',
      } as any);

      // Act
      const result = await service.update('appt-123', { adminNotes: 'Admin note' });

      // Assert
      expect(result.data.adminNotes).toBe('Admin note');
    });

    it('should throw NotFoundException if appointment not found', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update('appt-999', { adminNotes: 'test' })
      ).rejects.toThrow('Agendamento não encontrado');
    });

    it('should set confirmedAt when status is CONFIRMED', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      } as any);

      // Act
      await service.update('appt-123', { status: 'CONFIRMED' });

      // Assert
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        data: expect.objectContaining({
          status: 'CONFIRMED',
          confirmedAt: expect.any(Date),
        }),
      });
    });

    it('should set cancelledAt when status is CANCELLED', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      } as any);

      // Act
      await service.update('appt-123', { status: 'CANCELLED' });

      // Assert
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        data: expect.objectContaining({
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        }),
      });
    });

    it('should send status update email when status changes', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'CONFIRMED',
      } as any);

      // Act
      await service.update('appt-123', { status: 'CONFIRMED' });

      // Assert
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@test.com',
          subject: 'Atualização de Agendamento - Izabela Tarot',
        })
      );
    });

    it('should not send email when status is not changed', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        meetingUrl: 'https://meet.example.com',
      } as any);

      // Act
      await service.update('appt-123', { meetingUrl: 'https://meet.example.com' });

      // Assert
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // RESCHEDULE
  // =============================================
  describe('reschedule', () => {
    const newDate = new Date('2026-03-20');
    const newStartTime = '14:00';
    const newEndTime = '14:30';

    it('should reschedule appointment successfully', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      // checkConflict findMany — no conflicts
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        scheduledDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'SCHEDULED',
        confirmedAt: null,
      } as any);

      // Act
      const result = await service.reschedule('appt-123', newDate, newStartTime, newEndTime);

      // Assert
      expect(result.data.startTime).toBe(newStartTime);
      expect(result.data.status).toBe('SCHEDULED');
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        data: {
          scheduledDate: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'SCHEDULED',
          confirmedAt: null,
        },
      });
    });

    it('should throw NotFoundException if appointment not found', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.reschedule('appt-999', newDate, newStartTime, newEndTime)
      ).rejects.toThrow('Agendamento não encontrado');
    });

    it('should throw BadRequestException on time conflict', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.findMany.mockResolvedValue([
        {
          id: 'other-appt',
          startTime: '13:45',
          endTime: '14:15',
          status: 'SCHEDULED',
        },
      ] as any);

      // Act & Assert
      await expect(
        service.reschedule('appt-123', newDate, newStartTime, newEndTime)
      ).rejects.toThrow('Este horário já está ocupado');
      expect(prismaMock.appointment.update).not.toHaveBeenCalled();
    });

    it('should send reschedule email', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        scheduledDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      } as any);

      // Act
      await service.reschedule('appt-123', newDate, newStartTime, newEndTime);

      // Assert
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@test.com',
          subject: 'Agendamento Reagendado - Izabela Tarot',
        })
      );
    });
  });

  // =============================================
  // CANCEL
  // =============================================
  describe('cancel', () => {
    it('should cancel appointment successfully', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      } as any);

      // Act
      const result = await service.cancel('appt-123');

      // Assert
      expect(result.data.status).toBe('CANCELLED');
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
          cancellationReason: undefined,
        },
      });
    });

    it('should cancel with reason', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'Motivo pessoal',
      } as any);

      // Act
      const result = await service.cancel('appt-123', 'Motivo pessoal');

      // Assert
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-123' },
        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
          cancellationReason: 'Motivo pessoal',
        },
      });
    });

    it('should throw NotFoundException if appointment not found', async () => {
      // Arrange
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancel('appt-999')).rejects.toThrow(
        'Agendamento não encontrado'
      );
    });

    it('should send cancellation email', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...mockAppointment,
        status: 'CANCELLED',
      } as any);

      // Act
      await service.cancel('appt-123', 'Motivo pessoal');

      // Assert
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@test.com',
          subject: 'Agendamento Cancelado - Izabela Tarot',
        })
      );
    });

    it('should not send email if client has no email', async () => {
      // Arrange
      const { sendEmail } = require('../../utils');
      const noEmailAppointment = {
        ...mockAppointment,
        client: { ...mockClient, email: null },
      };
      prismaMock.appointment.findUnique.mockResolvedValue(noEmailAppointment as any);
      prismaMock.appointment.update.mockResolvedValue({
        ...noEmailAppointment,
        status: 'CANCELLED',
      } as any);

      // Act
      await service.cancel('appt-123');

      // Assert
      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // GET AVAILABLE SLOTS
  // =============================================
  describe('getAvailableSlots', () => {
    it('should return all slots as available when no appointments exist', async () => {
      // Arrange
      const date = new Date('2026-03-15');
      prismaMock.appointment.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getAvailableSlots(date);

      // Assert — 09:00 to 18:00 in 30min slots = 18 slots
      expect(result.data).toHaveLength(18);
      expect(result.data[0]).toEqual({
        startTime: '09:00',
        endTime: '09:30',
        available: true,
      });
      expect(result.data[17]).toEqual({
        startTime: '17:30',
        endTime: '18:00',
        available: true,
      });
      expect(result.data.every((s: any) => s.available)).toBe(true);
    });

    it('should mark occupied slots as unavailable', async () => {
      // Arrange
      const date = new Date('2026-03-15');
      prismaMock.appointment.findMany.mockResolvedValue([
        { startTime: '10:00', endTime: '10:30' },
      ] as any);

      // Act
      const result = await service.getAvailableSlots(date);

      // Assert
      const slot10 = result.data.find((s: any) => s.startTime === '10:00');
      const slot0930 = result.data.find((s: any) => s.startTime === '09:30');
      expect(slot10!.available).toBe(false);
      expect(slot0930!.available).toBe(true);
    });

    it('should handle overlapping appointments marking multiple slots', async () => {
      // Arrange
      const date = new Date('2026-03-15');
      prismaMock.appointment.findMany.mockResolvedValue([
        { startTime: '10:00', endTime: '11:00' },
      ] as any);

      // Act
      const result = await service.getAvailableSlots(date);

      // Assert
      const slot10 = result.data.find((s: any) => s.startTime === '10:00');
      const slot1030 = result.data.find((s: any) => s.startTime === '10:30');
      const slot11 = result.data.find((s: any) => s.startTime === '11:00');
      expect(slot10!.available).toBe(false);
      expect(slot1030!.available).toBe(false);
      expect(slot11!.available).toBe(true);
    });

    it('should query only non-cancelled appointments for the date', async () => {
      // Arrange
      const date = new Date('2026-03-15');
      prismaMock.appointment.findMany.mockResolvedValue([]);

      // Act
      await service.getAvailableSlots(date);

      // Assert
      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith({
        where: {
          scheduledDate: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
          status: { notIn: ['CANCELLED'] },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      });
    });
  });
});
