// apps/backend/src/modules/appointments/appointments.controller.ts

import { Request, Response, NextFunction } from 'express';
import { appointmentsService } from './appointments.service';

export class AppointmentsController {
  // Admin endpoints
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, date, search, page, limit } = req.query;

      const result = await appointmentsService.findAll({
        status: status as string,
        date: date ? new Date(date as string) : undefined,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await appointmentsService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await appointmentsService.update(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await appointmentsService.update(id, { status });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, startTime, endTime } = req.body;
      const result = await appointmentsService.reschedule(
        id,
        new Date(date),
        startTime,
        endTime
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Client endpoints
  async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await appointmentsService.findByUser(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const result = await appointmentsService.cancel(id, reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      const result = await appointmentsService.getAvailableSlots(
        new Date(date as string)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentsController = new AppointmentsController();
