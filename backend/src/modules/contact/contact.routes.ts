// apps/backend/src/modules/contact/contact.routes.ts

import { Router, Request, Response, NextFunction } from 'express';
import { sendEmail } from '../../utils/email.util';
import { env } from '../../config/env';

const router = Router();

/**
 * @openapi
 * /contact:
 *   post:
 *     tags: [Contact]
 *     summary: Send a contact message
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const adminEmail = env.CONTACT_EMAIL;

    await sendEmail({
      to: adminEmail,
      subject: `[Contato Site] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #c9a7eb; text-align: center; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">✉️ Nova Mensagem de Contato</h2>
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; width: 100px;"><strong>Nome:</strong></td>
                <td style="padding: 10px 0;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;"><strong>E-mail:</strong></td>
                <td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;"><strong>Assunto:</strong></td>
                <td style="padding: 10px 0;">${subject}</td>
              </tr>
            </table>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <h3 style="color: #333; margin-top: 0;">Mensagem:</h3>
            <p style="color: #555; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #999; font-size: 13px;">
              Responda diretamente para: <a href="mailto:${email}">${email}</a>
            </p>
          </div>
        </div>
      `,
    });

    res.json({ message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    next(error);
  }
});

export { router as contactRoutes };
