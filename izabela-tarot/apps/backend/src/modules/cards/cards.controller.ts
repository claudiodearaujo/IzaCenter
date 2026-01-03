// apps/backend/src/modules/cards/cards.controller.ts

import { Request, Response, NextFunction } from 'express';
import { cardsService } from './cards.service';

export class CardsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cardsService.findAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await cardsService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { number } = req.params;
      const result = await cardsService.findByNumber(parseInt(number));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        imageUrl: req.body.imageUrl || (req.file as any)?.location,
      };
      const result = await cardsService.create(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = {
        ...req.body,
        imageUrl: req.body.imageUrl || (req.file as any)?.location,
      };
      const result = await cardsService.update(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await cardsService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async generateDeck(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cardsService.generateDeck();
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const cardsController = new CardsController();
