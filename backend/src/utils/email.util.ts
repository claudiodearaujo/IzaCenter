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
 * Base email layout wrapper
 */
function emailLayout(content: string): string {
  return `
    <div style="font-family: 'Cormorant Garamond', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #f8f5f0;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #c9a7eb; font-size: 32px; margin-bottom: 10px;">✨ Izabela Tarot ✨</h1>
      </div>
      
      <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 30px; border: 1px solid rgba(201, 167, 235, 0.2);">
        ${content}
      </div>
      
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
        <p>Izabela Tarot - Tarot Cigano Online</p>
        <p>© ${new Date().getFullYear()} Todos os direitos reservados</p>
      </div>
    </div>
  `;
}

function emailButton(text: string, url: string): string {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" 
         style="display: inline-block; background: linear-gradient(135deg, #9b6dc6 0%, #c9a7eb 100%); color: #1a1a2e; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        ${text}
      </a>
    </div>
  `;
}

function emailSignature(): string {
  return `
    <p style="line-height: 1.8; color: #f8f5f0;">
      Com carinho e luz,<br>
      <strong style="color: #c9a7eb;">Izabela Santos</strong>
    </p>
  `;
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
      html: emailLayout(`
        <h2 style="color: #c9a7eb; margin-bottom: 20px;">Olá, ${name}!</h2>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Seja muito bem-vinda ao meu universo do Tarot Cigano! 🌙
        </p>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Fico feliz em ter você aqui. Agora você pode acessar sua área exclusiva, 
          acompanhar suas leituras e descobrir os segredos que as cartas têm para revelar.
        </p>
        
        ${emailButton('Acessar Minha Conta', `${env.FRONTEND_URL}/cliente`)}
        ${emailSignature()}
      `),
    };
  },

  /**
   * Password reset email
   */
  passwordReset(name: string, resetUrl: string): { subject: string; html: string } {
    return {
      subject: 'Redefinição de Senha - Izabela Tarot',
      html: emailLayout(`
        <h2 style="color: #c9a7eb; margin-bottom: 20px;">Olá, ${name}!</h2>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Recebemos uma solicitação para redefinir a senha da sua conta.
        </p>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.
        </p>
        
        ${emailButton('Redefinir Senha', resetUrl)}
        
        <p style="line-height: 1.8; color: #888; font-size: 14px;">
          Se você não solicitou esta redefinição, pode ignorar este email.
        </p>
      `),
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
      html: emailLayout(`
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
        
        ${emailButton('Ver Meus Pedidos', `${env.FRONTEND_URL}/cliente/pedidos`)}
      `),
    };
  },

  /**
   * Reading published notification
   */
  readingPublished(name: string, readingTitle: string): { subject: string; html: string } {
    return {
      subject: `Sua Leitura está Pronta! ✨ - Izabela Tarot`,
      html: emailLayout(`
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
        
        ${emailButton('Ver Minha Leitura', `${env.FRONTEND_URL}/cliente/leituras`)}
        ${emailSignature()}
      `),
    };
  },

  /**
   * Appointment confirmation email
   */
  appointmentConfirmation(
    name: string,
    date: string,
    startTime: string,
    endTime: string
  ): { subject: string; html: string } {
    return {
      subject: 'Agendamento Confirmado - Izabela Tarot',
      html: emailLayout(`
        <h2 style="color: #c9a7eb; margin-bottom: 20px;">Agendamento Confirmado! 📅</h2>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Olá, ${name}! Seu agendamento foi confirmado com sucesso.
        </p>
        
        <div style="background: rgba(201, 167, 235, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #f8f5f0;"><strong style="color: #c9a7eb;">📅 Data:</strong> ${date}</p>
          <p style="margin: 5px 0; color: #f8f5f0;"><strong style="color: #c9a7eb;">🕐 Horário:</strong> ${startTime} - ${endTime}</p>
        </div>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Aguardamos você!
        </p>
        
        ${emailButton('Ver Meus Agendamentos', `${env.FRONTEND_URL}/cliente/agendamentos`)}
        ${emailSignature()}
      `),
    };
  },

  /**
   * Appointment cancellation email
   */
  appointmentCancellation(
    name: string,
    date: string,
    startTime: string,
    reason?: string
  ): { subject: string; html: string } {
    return {
      subject: 'Agendamento Cancelado - Izabela Tarot',
      html: emailLayout(`
        <h2 style="color: #c9a7eb; margin-bottom: 20px;">Agendamento Cancelado</h2>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Olá, ${name}! Seu agendamento foi cancelado.
        </p>
        
        <div style="background: rgba(201, 167, 235, 0.1); border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 5px 0; color: #f8f5f0;"><strong style="color: #c9a7eb;">📅 Data:</strong> ${date}</p>
          <p style="margin: 5px 0; color: #f8f5f0;"><strong style="color: #c9a7eb;">🕐 Horário:</strong> ${startTime}</p>
          ${reason ? `<p style="margin: 5px 0; color: #f8f5f0;"><strong style="color: #c9a7eb;">📝 Motivo:</strong> ${reason}</p>` : ''}
        </div>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Se desejar, você pode reagendar através da sua área de cliente.
        </p>
        
        ${emailButton('Reagendar', `${env.FRONTEND_URL}/cliente/agendamentos`)}
        ${emailSignature()}
      `),
    };
  },

  /**
   * Refund notification email
   */
  refundNotification(
    name: string,
    orderNumber: string
  ): { subject: string; html: string } {
    return {
      subject: `Reembolso Processado - Pedido #${orderNumber} - Izabela Tarot`,
      html: emailLayout(`
        <h2 style="color: #c9a7eb; margin-bottom: 20px;">Reembolso Processado ↩️</h2>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          Olá, ${name}! O reembolso do seu pedido <strong style="color: #c9a7eb;">#${orderNumber}</strong> foi processado com sucesso.
        </p>
        
        <p style="line-height: 1.8; color: #f8f5f0;">
          O valor será creditado na sua conta em até 10 dias úteis, dependendo da sua instituição financeira.
        </p>
        
        ${emailButton('Ver Meus Pedidos', `${env.FRONTEND_URL}/cliente/pedidos`)}
        ${emailSignature()}
      `),
    };
  },
};

export default sendEmail;
