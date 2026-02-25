// apps/backend/src/modules/orders/orders.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import { OrdersController } from './orders.controller';
import { ordersService } from './orders.service';

// Mock the orders service
jest.mock('./orders.service', () => ({
  ordersService: {
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    cancel: jest.fn(),
    update: jest.fn(),
    addQuestions: jest.fn(),
    getStatistics: jest.fn(),
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

describe('OrdersController', () => {
  let controller: OrdersController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new OrdersController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // =============================================
  // CLIENT ROUTES
  // =============================================
  describe('create', () => {
    it('should create an order and return 201', async () => {
      const orderData = { items: [{ productId: 'prod-1', quantity: 1 }] };
      const mockOrder = { id: 'order-1', status: 'PENDING', clientId: 'user-1' };
      req.body = orderData;
      (ordersService.create as jest.Mock).mockResolvedValue(mockOrder);

      await controller.create(req as Request, res as Response, mockNext);

      expect(ordersService.create).toHaveBeenCalledWith('user-1', orderData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pedido criado com sucesso',
        data: mockOrder,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Product not found');
      req.body = { items: [] };
      (ordersService.create as jest.Mock).mockRejectedValue(error);

      await controller.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('listMy', () => {
    it('should return current user orders', async () => {
      const mockResult = {
        data: [{ id: 'order-1', status: 'PENDING' }],
        meta: { total: 1, page: 1, limit: 10 },
      };
      req.query = {};
      (ordersService.list as jest.Mock).mockResolvedValue(mockResult);

      await controller.listMy(req as Request, res as Response, mockNext);

      expect(ordersService.list).toHaveBeenCalledWith({}, 'user-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        meta: mockResult.meta,
      });
    });
  });

  describe('getMyById', () => {
    it('should return specific order for current user', async () => {
      const mockOrder = { id: 'order-1', clientId: 'user-1', status: 'PAID' };
      req.params = { id: 'order-1' };
      (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

      await controller.getMyById(req as Request, res as Response, mockNext);

      expect(ordersService.getById).toHaveBeenCalledWith('order-1', 'user-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
      });
    });

    it('should call next with error if order not found', async () => {
      const error = new Error('Pedido não encontrado');
      req.params = { id: 'nonexistent' };
      (ordersService.getById as jest.Mock).mockRejectedValue(error);

      await controller.getMyById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('cancelMy', () => {
    it('should cancel current user order', async () => {
      req.params = { id: 'order-1' };
      (ordersService.cancel as jest.Mock).mockResolvedValue({
        message: 'Pedido cancelado com sucesso',
      });

      await controller.cancelMy(req as Request, res as Response, mockNext);

      expect(ordersService.cancel).toHaveBeenCalledWith('order-1', 'user-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pedido cancelado com sucesso',
      });
    });
  });

  describe('addQuestions', () => {
    it('should add questions to an order item', async () => {
      req.params = { itemId: 'item-1' };
      req.body = { questions: ['What does the future hold?'] };
      (ordersService.addQuestions as jest.Mock).mockResolvedValue({
        message: 'Perguntas adicionadas com sucesso',
      });

      await controller.addQuestions(req as Request, res as Response, mockNext);

      expect(ordersService.addQuestions).toHaveBeenCalledWith(
        'item-1',
        'user-1',
        { questions: ['What does the future hold?'] }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Perguntas adicionadas com sucesso',
      });
    });
  });

  // =============================================
  // ADMIN ROUTES
  // =============================================
  describe('list', () => {
    it('should return all orders for admin', async () => {
      const mockResult = {
        data: [{ id: 'order-1' }, { id: 'order-2' }],
        meta: { total: 2, page: 1, limit: 10 },
      };
      req.query = {};
      (ordersService.list as jest.Mock).mockResolvedValue(mockResult);

      await controller.list(req as Request, res as Response, mockNext);

      expect(ordersService.list).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        meta: mockResult.meta,
      });
    });
  });

  describe('getById', () => {
    it('should return order by ID (admin)', async () => {
      const mockOrder = { id: 'order-1', clientId: 'user-2', status: 'PAID' };
      req.params = { id: 'order-1' };
      (ordersService.getById as jest.Mock).mockResolvedValue(mockOrder);

      await controller.getById(req as Request, res as Response, mockNext);

      expect(ordersService.getById).toHaveBeenCalledWith('order-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
      });
    });
  });

  describe('update', () => {
    it('should update order and return success', async () => {
      const updateData = { status: 'COMPLETED' };
      const mockOrder = { id: 'order-1', status: 'COMPLETED' };
      req.params = { id: 'order-1' };
      req.body = updateData;
      (ordersService.update as jest.Mock).mockResolvedValue(mockOrder);

      await controller.update(req as Request, res as Response, mockNext);

      expect(ordersService.update).toHaveBeenCalledWith('order-1', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pedido atualizado com sucesso',
        data: mockOrder,
      });
    });
  });

  describe('cancel', () => {
    it('should cancel order (admin)', async () => {
      req.params = { id: 'order-1' };
      (ordersService.cancel as jest.Mock).mockResolvedValue({
        message: 'Pedido cancelado com sucesso',
      });

      await controller.cancel(req as Request, res as Response, mockNext);

      expect(ordersService.cancel).toHaveBeenCalledWith('order-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pedido cancelado com sucesso',
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Pedido não encontrado');
      req.params = { id: 'nonexistent' };
      (ordersService.cancel as jest.Mock).mockRejectedValue(error);

      await controller.cancel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getStatistics', () => {
    it('should return order statistics', async () => {
      const mockStats = {
        totalOrders: 50,
        totalRevenue: 5000,
        byStatus: { PAID: 30, PENDING: 10, CANCELLED: 10 },
      };
      req.query = {};
      (ordersService.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      await controller.getStatistics(req as Request, res as Response, mockNext);

      expect(ordersService.getStatistics).toHaveBeenCalledWith(undefined, undefined);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });

    it('should pass date filters to service', async () => {
      req.query = { startDate: '2026-01-01', endDate: '2026-01-31' };
      (ordersService.getStatistics as jest.Mock).mockResolvedValue({});

      await controller.getStatistics(req as Request, res as Response, mockNext);

      expect(ordersService.getStatistics).toHaveBeenCalledWith(
        new Date('2026-01-01'),
        new Date('2026-01-31')
      );
    });
  });
});
