// apps/backend/src/modules/appointments/appointments.service.ts

import { prisma } from '../../config/database';
import { sendEmail, emailTemplates } from '../../utils';
import { NotFoundException, BadRequestException } from '../../utils/errors';

interface CreateAppointmentDTO {
  userId: string;
  orderItemId?: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  clientNotes?: string;
}

interface UpdateAppointmentDTO {
  status?: string;
  adminNotes?: string;
  meetingUrl?: string;
  meetingPassword?: string;
}

export class AppointmentsService {
  async findAll(filters: {
    status?: string;
    date?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, date, search, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (search) {
      where.client = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          orderItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { scheduledDate: 'asc' },
          { startTime: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string) {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: userId },
      include: {
        orderItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    return { data: appointments };
  }

  async findById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return { data: appointment };
  }

  async create(data: CreateAppointmentDTO) {
    // Check for conflicts
    const hasConflict = await this.checkConflict(
      data.scheduledDate,
      data.startTime,
      data.endTime
    );

    if (hasConflict) {
      throw new BadRequestException('Este horário já está ocupado');
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId: data.userId,
        orderItemId: data.orderItemId,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        clientNotes: data.clientNotes,
        status: 'SCHEDULED',
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Send confirmation email
    if (appointment.client.email) {
      const formattedDate = new Date(appointment.scheduledDate).toLocaleDateString('pt-BR');
      await sendEmail({
        to: appointment.client.email,
        subject: 'Agendamento Confirmado - Izabela Tarot',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Olá, ${appointment.client.fullName}!</h2>
            <p>Seu agendamento foi confirmado com sucesso.</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Horário:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
            <p>Aguardamos você!</p>
            <p>Com carinho,<br>Izabela Tarot</p>
          </div>
        `,
      });
    }

    return { data: appointment };
  }

  async update(id: string, data: UpdateAppointmentDTO) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const updateData: any = { ...data };

    // Handle status transitions
    if (data.status) {
      switch (data.status) {
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          break;
      }

      // Send status update email
      if (appointment.client.email) {
        const formattedDate = new Date(appointment.scheduledDate).toLocaleDateString('pt-BR');
        await sendEmail({
          to: appointment.client.email,
          subject: `Atualização de Agendamento - Izabela Tarot`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Olá, ${appointment.client.fullName}!</h2>
              <p>Seu agendamento foi atualizado.</p>
              <p><strong>Data:</strong> ${formattedDate}</p>
              <p><strong>Horário:</strong> ${appointment.startTime}</p>
              <p><strong>Status:</strong> ${data.status}</p>
              <p>Com carinho,<br>Izabela Tarot</p>
            </div>
          `,
        });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return { data: updated };
  }

  async reschedule(id: string, newDate: Date, newStartTime: string, newEndTime: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Check for conflicts
    const hasConflict = await this.checkConflict(newDate, newStartTime, newEndTime, id);

    if (hasConflict) {
      throw new BadRequestException('Este horário já está ocupado');
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'SCHEDULED', // Reset status after reschedule
        confirmedAt: null,
      },
    });

    // Send reschedule email
    if (appointment.client.email) {
      const oldFormattedDate = new Date(appointment.scheduledDate).toLocaleDateString('pt-BR');
      const newFormattedDate = newDate.toLocaleDateString('pt-BR');
      await sendEmail({
        to: appointment.client.email,
        subject: 'Agendamento Reagendado - Izabela Tarot',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Olá, ${appointment.client.fullName}!</h2>
            <p>Seu agendamento foi reagendado.</p>
            <p><strong>Data anterior:</strong> ${oldFormattedDate} às ${appointment.startTime}</p>
            <p><strong>Nova data:</strong> ${newFormattedDate} às ${newStartTime}</p>
            <p>Com carinho,<br>Izabela Tarot</p>
          </div>
        `,
      });
    }

    return { data: updated };
  }

  async cancel(id: string, reason?: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Send cancellation email
    if (appointment.client.email) {
      const formattedDate = new Date(appointment.scheduledDate).toLocaleDateString('pt-BR');
      await sendEmail({
        to: appointment.client.email,
        subject: 'Agendamento Cancelado - Izabela Tarot',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Olá, ${appointment.client.fullName}!</h2>
            <p>Seu agendamento foi cancelado.</p>
            <p><strong>Data:</strong> ${formattedDate} às ${appointment.startTime}</p>
            ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
            <p>Com carinho,<br>Izabela Tarot</p>
          </div>
        `,
      });
    }

    return { data: updated };
  }

  async getAvailableSlots(date: Date) {
    // Get business hours (simplified - in real app would come from settings)
    const businessHours = {
      start: '09:00',
      end: '18:00',
      slotDuration: 30, // minutes
    };

    // Get existing appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate all possible slots
    const slots: { startTime: string; endTime: string; available: boolean }[] = [];
    let currentTime = this.parseTime(businessHours.start);
    const endTime = this.parseTime(businessHours.end);

    while (currentTime < endTime) {
      const slotStart = this.formatTime(currentTime);
      currentTime += businessHours.slotDuration;
      const slotEnd = this.formatTime(currentTime);

      // Check if slot is available
      const isOccupied = existingAppointments.some((apt) => {
        const aptStart = this.parseTime(apt.startTime);
        const aptEnd = this.parseTime(apt.endTime);
        const slotStartMin = this.parseTime(slotStart);
        const slotEndMin = this.parseTime(slotEnd);

        return slotStartMin < aptEnd && slotEndMin > aptStart;
      });

      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: !isOccupied,
      });
    }

    return { data: slots };
  }

  private async checkConflict(
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      scheduledDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { notIn: ['CANCELLED'] },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const appointments = await prisma.appointment.findMany({ where });

    const newStart = this.parseTime(startTime);
    const newEnd = this.parseTime(endTime);

    return appointments.some((apt) => {
      const aptStart = this.parseTime(apt.startTime);
      const aptEnd = this.parseTime(apt.endTime);

      return newStart < aptEnd && newEnd > aptStart;
    });
  }

  private parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export const appointmentsService = new AppointmentsService();
