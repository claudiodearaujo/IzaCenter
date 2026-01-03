// apps/backend/src/utils/email.util.ts

import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template?:string;
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    });
    
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Welcome email
   */
  welcome(name: string): { subject: string; html: string } {
    return {
      subject: 'Bem-vinda ao Izabela Tarot! ✨',
      html: `
        <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #f8f5f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c9a7eb; font-size: 32px; margin-bottom: 10px;">✨ Izabela Tarot ✨</h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; border: 1px solid rgba(201, 167, 235, 0.2);">
            <h2 style="color: #c9a7eb; margin-bottom: 20px;">Olá, ${name}!</h2>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Seja muito bem-vinda ao meu universo do Tarot Cigano! 🌙
            </p>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Fico feliz em ter você aqui. Agora você pode acessar sua área exclusiva, 
              acompanhar suas leituras e descobrir os segredos que as cartas têm para revelar.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.FRONTEND_URL}/cliente" 
                 style="display: inline-block; background: linear-gradient(135deg, #9b6dc6 0%, #c9a7eb 100%); color: #1a1a2e; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Acessar Minha Conta
              </a>
            </div>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Com carinho e luz,<br>
              <strong style="color: #c9a7eb;">Izabela Santos</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
            <p>Izabela Tarot - Tarot Cigano Online</p>
            <p>© ${new Date().getFullYear()} Todos os direitos reservados</p>
          </div>
        </div>
      `,
    };
  },

  /**
   * Password reset email
   */
  passwordReset(name: string, resetUrl: string): { subject: string; html: string } {
    return {
      subject: 'Redefinição de Senha - Izabela Tarot',
      html: `
        <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #f8f5f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c9a7eb; font-size: 32px; margin-bottom: 10px;">✨ Izabela Tarot ✨</h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; border: 1px solid rgba(201, 167, 235, 0.2);">
            <h2 style="color: #c9a7eb; margin-bottom: 20px;">Olá, ${name}!</h2>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Recebemos uma solicitação para redefinir a senha da sua conta.
            </p>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #9b6dc6 0%, #c9a7eb 100%); color: #1a1a2e; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="line-height: 1.8; color: #888; font-size: 14px;">
              Se você não solicitou esta redefinição, pode ignorar este email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
            <p>Izabela Tarot - Tarot Cigano Online</p>
          </div>
        </div>
      `,
    };
  },

  /**
   * Order confirmation email
   */
  orderConfirmation(
    name: string,
    orderNumber: string,
    items: Array<{ name: string; price: number }>,
    total: number
  ): { subject: string; html: string } {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid rgba(201, 167, 235, 0.2);">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid rgba(201, 167, 235, 0.2); text-align: right;">
            R$ ${item.price.toFixed(2).replace('.', ',')}
          </td>
        </tr>
      `
      )
      .join('');

    return {
      subject: `Pedido Confirmado #${orderNumber} - Izabela Tarot`,
      html: `
        <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #f8f5f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c9a7eb; font-size: 32px; margin-bottom: 10px;">✨ Izabela Tarot ✨</h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; border: 1px solid rgba(201, 167, 235, 0.2);">
            <h2 style="color: #c9a7eb; margin-bottom: 20px;">Pedido Confirmado! 🎉</h2>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Olá, ${name}! Seu pedido <strong style="color: #c9a7eb;">#${orderNumber}</strong> foi confirmado com sucesso.
            </p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #c9a7eb;">
                  <th style="padding: 10px; text-align: left; color: #c9a7eb;">Item</th>
                  <th style="padding: 10px; text-align: right; color: #c9a7eb;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 15px 10px; font-weight: bold; color: #c9a7eb;">Total</td>
                  <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #d4af37;">
                    R$ ${total.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              </tfoot>
            </table>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Em breve você receberá sua leitura personalizada. Acompanhe o status na sua área de cliente.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.FRONTEND_URL}/cliente/pedidos" 
                 style="display: inline-block; background: linear-gradient(135deg, #9b6dc6 0%, #c9a7eb 100%); color: #1a1a2e; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Ver Meus Pedidos
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
            <p>Izabela Tarot - Tarot Cigano Online</p>
          </div>
        </div>
      `,
    };
  },

  /**
   * Reading published notification
   */
  readingPublished(name: string, readingTitle: string): { subject: string; html: string } {
    return {
      subject: `Sua Leitura está Pronta! ✨ - Izabela Tarot`,
      html: `
        <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #f8f5f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c9a7eb; font-size: 32px; margin-bottom: 10px;">✨ Izabela Tarot ✨</h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; border: 1px solid rgba(201, 167, 235, 0.2);">
            <h2 style="color: #c9a7eb; margin-bottom: 20px;">Sua Leitura está Pronta! 🌙</h2>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Olá, ${name}! Tenho ótimas notícias!
            </p>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Sua leitura <strong style="color: #c9a7eb;">"${readingTitle}"</strong> 
              está pronta e disponível na sua área de cliente.
            </p>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              As cartas revelaram mensagens importantes para você. Acesse agora e 
              descubra o que o universo tem a dizer.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.FRONTEND_URL}/cliente/leituras" 
                 style="display: inline-block; background: linear-gradient(135deg, #9b6dc6 0%, #c9a7eb 100%); color: #1a1a2e; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Ver Minha Leitura
              </a>
            </div>
            
            <p style="line-height: 1.8; color: #f8f5f0;">
              Com carinho e luz,<br>
              <strong style="color: #c9a7eb;">Izabela Santos</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
            <p>Izabela Tarot - Tarot Cigano Online</p>
          </div>
        </div>
      `,
    };
  },
};

export default sendEmail;
