// apps/backend/src/modules/readings/readings.controller.ts

import { Request, Response, NextFunction } from 'express';
import { readingsService } from './readings.service';
import { generateReadingPdf } from '../../utils/pdf.util';

export class ReadingsController {
  // Admin endpoints
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;

      const result = await readingsService.findAll({
        status: status as string,
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
      const result = await readingsService.findById(id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await readingsService.update(id as string, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await readingsService.updateStatus(id as string, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Handle file upload - audioUrl would come from upload middleware
      const audioUrl = req.body.audioUrl || (req.file as any)?.location;
      
      if (!audioUrl) {
        return res.status(400).json({ message: 'Audio file is required' });
      }

      const result = await readingsService.updateAudio(id as string, audioUrl);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await readingsService.delete(id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await readingsService.getStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Client endpoints
  async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await readingsService.findByUser(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByIdForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const result = await readingsService.findById(id as string, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Sprint 3.2b — GET /readings/:id/pdf
  async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { data: reading } = await readingsService.findById(id as string, userId);

      if (reading.status !== 'PUBLISHED') {
        return res.status(403).json({ message: 'Leitura ainda não está disponível para download' });
      }

      generateReadingPdf(
        {
          title: reading.title ?? reading.orderItem.product.name,
          introduction: reading.introduction,
          generalGuidance: (reading as any).generalGuidance,
          recommendations: (reading as any).recommendations,
          goals: (reading as any).goals,
          closingMessage: (reading as any).closingMessage,
          publishedAt: reading.publishedAt ?? null,
          client: { fullName: reading.client.fullName, email: reading.client.email },
          orderItem: {
            clientQuestions: reading.orderItem.clientQuestions as string[],
            product: { name: reading.orderItem.product.name },
          },
          cards: reading.cards.map((rc: any) => ({
            position: rc.position,
            positionName: rc.positionName ?? null,
            isReversed: rc.isReversed,
            interpretation: rc.interpretation ?? null,
            card: {
              name: rc.card.name,
              keywords: rc.card.keywords ?? [],
              advice: rc.card.advice ?? null,
            },
          })),
        },
        res
      );
    } catch (error) {
      next(error);
    }
  }
}

export const readingsController = new ReadingsController();
