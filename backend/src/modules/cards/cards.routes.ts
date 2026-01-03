// apps/backend/src/modules/cards/cards.routes.ts

import { Router } from 'express';
import { cardsController } from './cards.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/cards', cardsController.findAll.bind(cardsController));
router.get('/cards/:id', cardsController.findById.bind(cardsController));
router.get('/cards/number/:number', cardsController.findByNumber.bind(cardsController));

// Admin routes
router.get(
  '/admin/cards',
  authenticate,
  requireAdmin,
  cardsController.findAll.bind(cardsController)
);

router.post(
  '/admin/cards',
  authenticate,
  requireAdmin,
  cardsController.create.bind(cardsController)
);

router.post(
  '/admin/cards/generate-deck',
  authenticate,
  requireAdmin,
  cardsController.generateDeck.bind(cardsController)
);

router.put(
  '/admin/cards/:id',
  authenticate,
  requireAdmin,
  cardsController.update.bind(cardsController)
);

router.delete(
  '/admin/cards/:id',
  authenticate,
  requireAdmin,
  cardsController.delete.bind(cardsController)
);

export default router;
