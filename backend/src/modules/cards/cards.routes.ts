// apps/backend/src/modules/cards/cards.routes.ts

import { Router } from 'express';
import { cardsController } from './cards.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /cards:
 *   get:
 *     tags: [Cards]
 *     summary: List all tarot cards
 *     security: []
 *     responses:
 *       200:
 *         description: List of tarot cards
 */
router.get('/cards', cardsController.findAll.bind(cardsController));

/**
 * @openapi
 * /cards/{id}:
 *   get:
 *     tags: [Cards]
 *     summary: Get a tarot card by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Card details
 *       404:
 *         description: Card not found
 */
router.get('/cards/:id', cardsController.findById.bind(cardsController));

/**
 * @openapi
 * /cards/number/{number}:
 *   get:
 *     tags: [Cards]
 *     summary: Get a tarot card by its number
 *     security: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Card details
 *       404:
 *         description: Card not found
 */
router.get('/cards/number/:number', cardsController.findByNumber.bind(cardsController));

/**
 * @openapi
 * /admin/cards:
 *   get:
 *     tags: [Cards]
 *     summary: List all tarot cards (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cards
 *   post:
 *     tags: [Cards]
 *     summary: Create a new tarot card (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number, name]
 *             properties:
 *               number:
 *                 type: integer
 *               name:
 *                 type: string
 *               arcana:
 *                 type: string
 *                 enum: [MAJOR, MINOR]
 *               suit:
 *                 type: string
 *               keywords:
 *                 type: string
 *               uprightMeaning:
 *                 type: string
 *               reversedMeaning:
 *                 type: string
 *     responses:
 *       201:
 *         description: Card created
 */
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

/**
 * @openapi
 * /admin/cards/generate-deck:
 *   post:
 *     tags: [Cards]
 *     summary: Generate the full 78-card tarot deck (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deck generated (78 cards created)
 */
router.post(
  '/admin/cards/generate-deck',
  authenticate,
  requireAdmin,
  cardsController.generateDeck.bind(cardsController)
);

/**
 * @openapi
 * /admin/cards/{id}:
 *   put:
 *     tags: [Cards]
 *     summary: Update a tarot card (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Card updated
 *   delete:
 *     tags: [Cards]
 *     summary: Delete a tarot card (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Card deleted
 */
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
