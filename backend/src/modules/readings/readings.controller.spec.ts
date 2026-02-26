// apps/backend/src/modules/readings/readings.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import { ReadingsController } from './readings.controller';
import { readingsService } from './readings.service';

// Mock the readings service
jest.mock('./readings.service', () => ({
  readingsService: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    updateAudio: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(),
  },
}));

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  user: { id: 'user-1', email: 'user@test.com', role: 'ADMIN' } as any,
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('ReadingsController', () => {
  let controller: ReadingsController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new ReadingsController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // =============================================
  // ADMIN — findAll
  // =============================================
  describe('findAll', () => {
    it('should return list of readings', async () => {
      const mockReadings = {
        data: [{ id: 'reading-1', status: 'WAITING' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      req.query = { status: 'WAITING', page: '1', limit: '10' };
      (readingsService.findAll as jest.Mock).mockResolvedValue(mockReadings);

      await controller.findAll(req as Request, res as Response, mockNext);

      expect(readingsService.findAll).toHaveBeenCalledWith({
        status: 'WAITING',
        search: undefined,
        page: 1,
        limit: 10,
      });
      expect(res.json).toHaveBeenCalledWith(mockReadings);
    });

    it('should handle search query param', async () => {
      req.query = { search: 'amor' };
      (readingsService.findAll as jest.Mock).mockResolvedValue({ data: [] });

      await controller.findAll(req as Request, res as Response, mockNext);

      expect(readingsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'amor' })
      );
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (readingsService.findAll as jest.Mock).mockRejectedValue(error);

      await controller.findAll(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — findById
  // =============================================
  describe('findById', () => {
    it('should return a single reading', async () => {
      const mockReading = { id: 'reading-1', title: 'My Reading' };
      req.params = { id: 'reading-1' };
      (readingsService.findById as jest.Mock).mockResolvedValue(mockReading);

      await controller.findById(req as Request, res as Response, mockNext);

      expect(readingsService.findById).toHaveBeenCalledWith('reading-1');
      expect(res.json).toHaveBeenCalledWith(mockReading);
    });

    it('should call next with error when not found', async () => {
      const error = new Error('Not found');
      req.params = { id: 'reading-999' };
      (readingsService.findById as jest.Mock).mockRejectedValue(error);

      await controller.findById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — update
  // =============================================
  describe('update', () => {
    it('should update a reading', async () => {
      const updateData = { title: 'Updated Title', content: 'Updated content' };
      const mockUpdated = { id: 'reading-1', ...updateData };
      req.params = { id: 'reading-1' };
      req.body = updateData;
      (readingsService.update as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.update(req as Request, res as Response, mockNext);

      expect(readingsService.update).toHaveBeenCalledWith('reading-1', updateData);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Not found');
      req.params = { id: 'reading-999' };
      req.body = { title: 'New Title' };
      (readingsService.update as jest.Mock).mockRejectedValue(error);

      await controller.update(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — updateStatus
  // =============================================
  describe('updateStatus', () => {
    it('should update reading status', async () => {
      const mockUpdated = { id: 'reading-1', status: 'IN_PROGRESS' };
      req.params = { id: 'reading-1' };
      req.body = { status: 'IN_PROGRESS' };
      (readingsService.updateStatus as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.updateStatus(req as Request, res as Response, mockNext);

      expect(readingsService.updateStatus).toHaveBeenCalledWith('reading-1', 'IN_PROGRESS');
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Invalid status');
      req.params = { id: 'reading-1' };
      req.body = { status: 'INVALID' };
      (readingsService.updateStatus as jest.Mock).mockRejectedValue(error);

      await controller.updateStatus(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — updateAudio
  // =============================================
  describe('updateAudio', () => {
    it('should update reading audio from body', async () => {
      const audioUrl = 'https://storage.example.com/audio.mp3';
      const mockUpdated = { id: 'reading-1', audioUrl };
      req.params = { id: 'reading-1' };
      req.body = { audioUrl };
      (readingsService.updateAudio as jest.Mock).mockResolvedValue(mockUpdated);

      await controller.updateAudio(req as Request, res as Response, mockNext);

      expect(readingsService.updateAudio).toHaveBeenCalledWith('reading-1', audioUrl);
      expect(res.json).toHaveBeenCalledWith(mockUpdated);
    });

    it('should return 400 when no audio file is provided', async () => {
      req.params = { id: 'reading-1' };
      req.body = {};

      await controller.updateAudio(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Audio file is required' });
    });

    it('should call next with error on service failure', async () => {
      const error = new Error('Storage error');
      req.params = { id: 'reading-1' };
      req.body = { audioUrl: 'https://example.com/audio.mp3' };
      (readingsService.updateAudio as jest.Mock).mockRejectedValue(error);

      await controller.updateAudio(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — delete
  // =============================================
  describe('delete', () => {
    it('should delete a reading', async () => {
      const mockResult = { message: 'Reading deleted successfully' };
      req.params = { id: 'reading-1' };
      (readingsService.delete as jest.Mock).mockResolvedValue(mockResult);

      await controller.delete(req as Request, res as Response, mockNext);

      expect(readingsService.delete).toHaveBeenCalledWith('reading-1');
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Not found');
      req.params = { id: 'reading-999' };
      (readingsService.delete as jest.Mock).mockRejectedValue(error);

      await controller.delete(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // ADMIN — getStats
  // =============================================
  describe('getStats', () => {
    it('should return reading statistics', async () => {
      const mockStats = {
        data: { total: 50, waiting: 10, inProgress: 5, published: 35 },
      };
      (readingsService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await controller.getStats(req as Request, res as Response, mockNext);

      expect(readingsService.getStats).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      (readingsService.getStats as jest.Mock).mockRejectedValue(error);

      await controller.getStats(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CLIENT — findByUser
  // =============================================
  describe('findByUser', () => {
    it('should return readings for the authenticated user', async () => {
      const mockReadings = { data: [{ id: 'reading-1', userId: 'user-1' }] };
      req.user = { id: 'user-1', email: 'user@test.com', role: 'CLIENT' } as any;
      (readingsService.findByUser as jest.Mock).mockResolvedValue(mockReadings);

      await controller.findByUser(req as Request, res as Response, mockNext);

      expect(readingsService.findByUser).toHaveBeenCalledWith('user-1');
      expect(res.json).toHaveBeenCalledWith(mockReadings);
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Unauthorized');
      (readingsService.findByUser as jest.Mock).mockRejectedValue(error);

      await controller.findByUser(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CLIENT — findByIdForUser
  // =============================================
  describe('findByIdForUser', () => {
    it('should return a reading for the authenticated user', async () => {
      const mockReading = { id: 'reading-1', userId: 'user-1', title: 'My Reading' };
      req.params = { id: 'reading-1' };
      req.user = { id: 'user-1', email: 'user@test.com', role: 'CLIENT' } as any;
      (readingsService.findById as jest.Mock).mockResolvedValue(mockReading);

      await controller.findByIdForUser(req as Request, res as Response, mockNext);

      expect(readingsService.findById).toHaveBeenCalledWith('reading-1', 'user-1');
      expect(res.json).toHaveBeenCalledWith(mockReading);
    });

    it('should call next with error when reading not accessible', async () => {
      const error = new Error('Forbidden');
      req.params = { id: 'reading-1' };
      req.user = { id: 'user-2', email: 'other@test.com', role: 'CLIENT' } as any;
      (readingsService.findById as jest.Mock).mockRejectedValue(error);

      await controller.findByIdForUser(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
