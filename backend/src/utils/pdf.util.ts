// apps/backend/src/utils/pdf.util.ts

import PDFDocument from 'pdfkit';
import { Response } from 'express';

const PURPLE = '#9b6dc6';
const DARK = '#1a1a2e';
const GOLD = '#d4af37';
const LIGHT_GRAY = '#f5f5f5';
const TEXT_DARK = '#333333';
const TEXT_GRAY = '#666666';

function addHeader(doc: InstanceType<typeof PDFDocument>, title: string) {
  doc.rect(0, 0, doc.page.width, 80).fill(DARK);
  doc.fillColor(PURPLE).fontSize(22).font('Helvetica-Bold').text('Izabela Tarot', 40, 22);
  doc.fillColor('#f8f5f0').fontSize(11).font('Helvetica').text(title, 40, 52);
  doc.moveDown(3);
}

function addSectionRow(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  const y = doc.y;
  doc.fillColor(TEXT_GRAY).fontSize(9).font('Helvetica').text(label.toUpperCase(), 40, y);
  doc.fillColor(TEXT_DARK).fontSize(11).font('Helvetica-Bold').text(value, 40, y + 13);
  doc.moveDown(0.8);
}

function addDivider(doc: InstanceType<typeof PDFDocument>) {
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y)
    .strokeColor('#e0e0e0').lineWidth(0.5).stroke();
  doc.moveDown(0.6);
}

function addFooter(doc: InstanceType<typeof PDFDocument>) {
  const y = doc.page.height - 40;
  doc.fillColor(TEXT_GRAY).fontSize(8).font('Helvetica').text(
    `Izabela Tarot \u00A9 ${new Date().getFullYear()} \u2014 Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
    40, y, { align: 'center', width: doc.page.width - 80 }
  );
}

function formatBrl(value: any): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

// ============================================================
// ORDER PDF
// ============================================================

interface OrderItemForPdf {
  productName: string;
  productType: string;
  quantity: number;
  unitPrice: any;
  totalPrice: any;
}

interface OrderForPdf {
  orderNumber: string;
  status: string;
  createdAt: Date;
  paidAt?: Date | null;
  total: any;
  subtotal: any;
  discount: any;
  paymentMethod?: string | null;
  client: { fullName: string; email: string };
  items: OrderItemForPdf[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando Pagamento', PAID: 'Pago', PROCESSING: 'Em Processamento',
  COMPLETED: 'Conclu\u00EDdo', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
};
const PAYMENT_LABELS: Record<string, string> = {
  card: 'Cart\u00E3o de Cr\u00E9dito', pix: 'Pix', boleto: 'Boleto',
};
const TYPE_LABELS: Record<string, string> = {
  READING: 'Leitura', LIVE_SESSION: 'Sess\u00E3o ao Vivo',
  COURSE: 'Curso', DIGITAL_PRODUCT: 'Produto Digital',
};

export function generateOrderPdf(order: OrderForPdf, res: Response): void {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="pedido-${order.orderNumber}.pdf"`);
  doc.pipe(res);

  addHeader(doc, `Comprovante de Pedido \u2014 #${order.orderNumber}`);

  doc.fillColor(TEXT_DARK).fontSize(14).font('Helvetica-Bold').text('Informa\u00E7\u00F5es', 40);
  addDivider(doc);
  addSectionRow(doc, 'Cliente', order.client.fullName);
  addSectionRow(doc, 'E-mail', order.client.email);
  addSectionRow(doc, 'Data', new Date(order.createdAt).toLocaleDateString('pt-BR'));
  if (order.paidAt) addSectionRow(doc, 'Pagamento', new Date(order.paidAt).toLocaleDateString('pt-BR'));
  addSectionRow(doc, 'Status', STATUS_LABELS[order.status] ?? order.status);
  if (order.paymentMethod) addSectionRow(doc, 'Forma de Pagamento', PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod);

  doc.moveDown();
  doc.fillColor(TEXT_DARK).fontSize(14).font('Helvetica-Bold').text('Itens', 40);
  addDivider(doc);

  // Table
  const col = { item: 40, type: 270, qty: 370, unit: 420, total: 490 };
  doc.rect(40, doc.y, doc.page.width - 80, 22).fill(LIGHT_GRAY);
  const thY = doc.y + 5;
  doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold');
  doc.text('PRODUTO', col.item, thY);
  doc.text('TIPO', col.type, thY);
  doc.text('QTD', col.qty, thY);
  doc.text('UNIT.', col.unit, thY);
  doc.text('TOTAL', col.total, thY);
  doc.moveDown(1.5);

  order.items.forEach((item, idx) => {
    const rowY = doc.y;
    if (idx % 2 === 0) doc.rect(40, rowY - 2, doc.page.width - 80, 22).fill('#fafafa');
    doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica');
    doc.text(item.productName, col.item, rowY, { width: 220 });
    doc.text(TYPE_LABELS[item.productType] ?? item.productType, col.type, rowY);
    doc.text(String(item.quantity), col.qty, rowY);
    doc.text(formatBrl(item.unitPrice), col.unit, rowY);
    doc.text(formatBrl(item.totalPrice), col.total, rowY);
    doc.moveDown(1.1);
  });

  addDivider(doc);

  // Totals
  const rX = doc.page.width - 200;
  doc.fillColor(TEXT_GRAY).fontSize(10).font('Helvetica').text('Subtotal:', rX, doc.y);
  doc.fillColor(TEXT_DARK).text(formatBrl(order.subtotal), rX + 85, doc.y - 13, { align: 'right', width: 75 });

  if (Number(order.discount) > 0) {
    doc.moveDown(0.5);
    doc.fillColor(TEXT_GRAY).fontSize(10).text('Desconto:', rX, doc.y);
    doc.fillColor('green').text(`-${formatBrl(order.discount)}`, rX + 85, doc.y - 13, { align: 'right', width: 75 });
  }

  doc.moveDown(0.6);
  doc.rect(rX - 10, doc.y - 4, 175, 28).fill(DARK);
  doc.fillColor(GOLD).fontSize(13).font('Helvetica-Bold').text('TOTAL:', rX, doc.y);
  doc.fillColor(GOLD).text(formatBrl(order.total), rX + 70, doc.y - 16, { align: 'right', width: 90 });

  addFooter(doc);
  doc.end();
}

// ============================================================
// READING PDF
// ============================================================

interface ReadingCardForPdf {
  position: number;
  positionName?: string | null;
  isReversed: boolean;
  interpretation?: string | null;
  card: { name: string; keywords: string[]; advice?: string | null };
}

interface ReadingForPdf {
  title: string;
  introduction?: string | null;
  generalGuidance?: string | null;
  recommendations?: string | null;
  goals?: string | null;
  closingMessage?: string | null;
  publishedAt?: Date | null;
  client: { fullName: string; email: string };
  orderItem: { clientQuestions: string[]; product: { name: string } };
  cards: ReadingCardForPdf[];
}

function addTextBlock(doc: InstanceType<typeof PDFDocument>, heading: string, content: string) {
  if (doc.y > doc.page.height - 160) { doc.addPage(); doc.moveDown(2); }
  doc.fillColor(PURPLE).fontSize(12).font('Helvetica-Bold').text(heading, 40);
  addDivider(doc);
  doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica').text(content, 40, doc.y, { lineGap: 4 });
  doc.moveDown();
}

export function generateReadingPdf(reading: ReadingForPdf, res: Response): void {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const docTitle = reading.title ?? reading.orderItem.product.name;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="leitura-${docTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf"`
  );
  doc.pipe(res);

  addHeader(doc, `Leitura de Tarot \u2014 ${docTitle}`);

  doc.fillColor(TEXT_DARK).fontSize(14).font('Helvetica-Bold').text('Informa\u00E7\u00F5es', 40);
  addDivider(doc);
  addSectionRow(doc, 'Cliente', reading.client.fullName);
  addSectionRow(doc, 'Consulta', reading.orderItem.product.name);
  if (reading.publishedAt) addSectionRow(doc, 'Data', new Date(reading.publishedAt).toLocaleDateString('pt-BR'));

  if (reading.orderItem.clientQuestions?.length > 0) {
    doc.moveDown(0.5);
    doc.fillColor(PURPLE).fontSize(11).font('Helvetica-Bold').text('Suas Perguntas', 40);
    addDivider(doc);
    reading.orderItem.clientQuestions.forEach((q, i) => {
      doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica').text(`${i + 1}. ${q}`, 50);
      doc.moveDown(0.3);
    });
  }

  if (reading.introduction) addTextBlock(doc, 'Introdu\u00E7\u00E3o', reading.introduction);
  if (reading.generalGuidance) addTextBlock(doc, 'Orienta\u00E7\u00E3o Geral', reading.generalGuidance);

  // Cards page
  if (reading.cards?.length > 0) {
    doc.addPage();
    addHeader(doc, `As Cartas \u2014 ${docTitle}`);
    doc.fillColor(TEXT_DARK).fontSize(14).font('Helvetica-Bold').text('As Cartas', 40);
    addDivider(doc);

    reading.cards.forEach((rc) => {
      if (doc.y > doc.page.height - 160) {
        doc.addPage();
        addHeader(doc, `Cartas (cont.) \u2014 ${docTitle}`);
      }
      const posLabel = rc.positionName ? ` \u2014 ${rc.positionName}` : '';
      const rev = rc.isReversed ? ' (Invertida)' : '';
      doc.rect(40, doc.y, doc.page.width - 80, 24).fill(LIGHT_GRAY);
      doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold')
        .text(`${rc.position}. ${rc.card.name}${rev}${posLabel}`, 45, doc.y + 6);
      doc.moveDown(1.4);

      if (rc.card.keywords?.length > 0) {
        doc.fillColor(PURPLE).fontSize(9).font('Helvetica')
          .text(`Palavras-chave: ${rc.card.keywords.join(' \u2022 ')}`, 45);
        doc.moveDown(0.4);
      }
      if (rc.interpretation) {
        doc.fillColor(TEXT_DARK).fontSize(10).font('Helvetica')
          .text(rc.interpretation, 45, doc.y, { lineGap: 3 });
      }
      doc.moveDown(1);
    });
  }

  if (reading.recommendations) addTextBlock(doc, 'Recomenda\u00E7\u00F5es', reading.recommendations);
  if (reading.goals) addTextBlock(doc, 'Objetivos', reading.goals);
  if (reading.closingMessage) addTextBlock(doc, 'Mensagem Final', reading.closingMessage);

  addFooter(doc);
  doc.end();
}
