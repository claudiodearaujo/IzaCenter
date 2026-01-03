// apps/backend/src/modules/orders/orders.controller.ts

import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, QueryOrdersDto, AddQuestionsDto } from './orders.schema';

export class OrdersController {
  /**
   * POST /orders
   * Create order from cart
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const data = req.body as CreateOrderDto;
      const result = await ordersService.create(clientId, data);

      res.status(201).json({
        success: true,
        message: 'Pedido criado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders/my
   * List current user orders
   */
  async listMy(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const query = req.query as unknown as QueryOrdersDto;
      const result = await ordersService.list(query, clientId);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders/my/:id
   * Get current user order by ID
   */
  async getMyById(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const { id } = req.params;
      const order = await ordersService.getById(id, clientId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /orders/my/:id/cancel
   * Cancel current user order
   */
  async cancelMy(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const { id } = req.params;
      const result = await ordersService.cancel(id, clientId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /orders/items/:itemId/questions
   * Add questions to order item
   */
  async addQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.user!.id;
      const { itemId } = req.params;
      const data = req.body as AddQuestionsDto;
      const result = await ordersService.addQuestions(itemId, clientId, data);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // =============================================
  // ADMIN ROUTES
  // =============================================

  /**
   * GET /orders (admin)
   * List all orders
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as QueryOrdersDto;
      const result = await ordersService.list(query);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders/:id (admin)
   * Get order by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await ordersService.getById(id);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /orders/:id (admin)
   * Update order
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateOrderDto;
      const order = await ordersService.update(id, data);

      res.json({
        success: true,
        message: 'Pedido atualizado com sucesso',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /orders/:id/cancel (admin)
   * Cancel order
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ordersService.cancel(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /orders/statistics (admin)
   * Get order statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await ordersService.getStatistics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();
