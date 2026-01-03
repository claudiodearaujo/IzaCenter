// apps/backend/src/modules/cards/cards.service.ts

import { prisma } from '../../config/database';
import { NotFoundException, BadRequestException } from '../../utils/errors';

interface CreateCardDTO {
  number: number;
  name: string;
  keywords?: string[];
  generalMeaning?: string;
  loveMeaning?: string;
  careerMeaning?: string;
  healthMeaning?: string;
  advice?: string;
  imageUrl?: string;
  isPositive?: boolean;
  element?: string;
}

interface UpdateCardDTO extends Partial<CreateCardDTO> {}

// Baralho Cigano - 36 cards
const CIGANO_DECK = [
  { number: 1, name: 'O Cavaleiro', keywords: ['notícias', 'viagem', 'movimento'], isPositive: true },
  { number: 2, name: 'O Trevo', keywords: ['sorte', 'oportunidade', 'esperança'], isPositive: true },
  { number: 3, name: 'O Navio', keywords: ['viagem', 'mudança', 'distância'], isPositive: true },
  { number: 4, name: 'A Casa', keywords: ['lar', 'família', 'segurança'], isPositive: true },
  { number: 5, name: 'A Árvore', keywords: ['saúde', 'crescimento', 'raízes'], isPositive: true },
  { number: 6, name: 'As Nuvens', keywords: ['dúvida', 'confusão', 'incerteza'], isPositive: false },
  { number: 7, name: 'A Cobra', keywords: ['traição', 'inveja', 'sabedoria'], isPositive: false },
  { number: 8, name: 'O Caixão', keywords: ['fim', 'transformação', 'encerramento'], isPositive: false },
  { number: 9, name: 'As Flores', keywords: ['felicidade', 'alegria', 'convite'], isPositive: true },
  { number: 10, name: 'A Foice', keywords: ['corte', 'decisão', 'separação'], isPositive: false },
  { number: 11, name: 'O Chicote', keywords: ['conflito', 'discussão', 'paixão'], isPositive: false },
  { number: 12, name: 'Os Pássaros', keywords: ['comunicação', 'casal', 'nervosismo'], isPositive: true },
  { number: 13, name: 'A Criança', keywords: ['início', 'inocência', 'novo'], isPositive: true },
  { number: 14, name: 'A Raposa', keywords: ['astúcia', 'trabalho', 'cuidado'], isPositive: false },
  { number: 15, name: 'O Urso', keywords: ['força', 'proteção', 'chefe'], isPositive: true },
  { number: 16, name: 'A Estrela', keywords: ['esperança', 'espiritualidade', 'fama'], isPositive: true },
  { number: 17, name: 'A Cegonha', keywords: ['mudança', 'nascimento', 'evolução'], isPositive: true },
  { number: 18, name: 'O Cachorro', keywords: ['amizade', 'lealdade', 'confiança'], isPositive: true },
  { number: 19, name: 'A Torre', keywords: ['solidão', 'empresa', 'autoridade'], isPositive: true },
  { number: 20, name: 'O Jardim', keywords: ['sociedade', 'público', 'reunião'], isPositive: true },
  { number: 21, name: 'A Montanha', keywords: ['obstáculo', 'desafio', 'bloqueio'], isPositive: false },
  { number: 22, name: 'Os Caminhos', keywords: ['escolha', 'decisão', 'opções'], isPositive: true },
  { number: 23, name: 'Os Ratos', keywords: ['perda', 'roubo', 'stress'], isPositive: false },
  { number: 24, name: 'O Coração', keywords: ['amor', 'romance', 'sentimento'], isPositive: true },
  { number: 25, name: 'O Anel', keywords: ['compromisso', 'contrato', 'ciclo'], isPositive: true },
  { number: 26, name: 'O Livro', keywords: ['segredo', 'estudo', 'conhecimento'], isPositive: true },
  { number: 27, name: 'A Carta', keywords: ['mensagem', 'documento', 'notícia'], isPositive: true },
  { number: 28, name: 'O Homem', keywords: ['significador masculino', 'homem', 'parceiro'], isPositive: true },
  { number: 29, name: 'A Mulher', keywords: ['significador feminino', 'mulher', 'parceira'], isPositive: true },
  { number: 30, name: 'Os Lírios', keywords: ['paz', 'pureza', 'maturidade'], isPositive: true },
  { number: 31, name: 'O Sol', keywords: ['sucesso', 'energia', 'vitalidade'], isPositive: true },
  { number: 32, name: 'A Lua', keywords: ['intuição', 'emoção', 'reconhecimento'], isPositive: true },
  { number: 33, name: 'A Chave', keywords: ['solução', 'destino', 'certeza'], isPositive: true },
  { number: 34, name: 'Os Peixes', keywords: ['dinheiro', 'abundância', 'negócios'], isPositive: true },
  { number: 35, name: 'A Âncora', keywords: ['estabilidade', 'trabalho', 'segurança'], isPositive: true },
  { number: 36, name: 'A Cruz', keywords: ['destino', 'karma', 'fardo'], isPositive: false },
];

export class CardsService {
  async findAll() {
    const cards = await prisma.ciganoCard.findMany({
      orderBy: { number: 'asc' },
    });

    return { data: cards };
  }

  async findById(id: string) {
    const card = await prisma.ciganoCard.findUnique({
      where: { id },
    });

    if (!card) {
      throw new NotFoundException('Carta não encontrada');
    }

    return { data: card };
  }

  async findByNumber(number: number) {
    const card = await prisma.ciganoCard.findUnique({
      where: { number },
    });

    if (!card) {
      throw new NotFoundException('Carta não encontrada');
    }

    return { data: card };
  }

  async create(data: CreateCardDTO) {
    const existingNumber = await prisma.ciganoCard.findUnique({
      where: { number: data.number },
    });

    if (existingNumber) {
      throw new BadRequestException(`Já existe uma carta com o número ${data.number}`);
    }

    const card = await prisma.ciganoCard.create({
      data: {
        number: data.number,
        name: data.name,
        keywords: data.keywords || [],
        generalMeaning: data.generalMeaning,
        loveMeaning: data.loveMeaning,
        careerMeaning: data.careerMeaning,
        healthMeaning: data.healthMeaning,
        advice: data.advice,
        imageUrl: data.imageUrl || '',
        isPositive: data.isPositive,
        element: data.element,
      },
    });

    return { data: card };
  }

  async update(id: string, data: UpdateCardDTO) {
    const card = await prisma.ciganoCard.findUnique({ where: { id } });

    if (!card) {
      throw new NotFoundException('Carta não encontrada');
    }

    const updateData: any = { ...data };

    if (data.keywords && typeof data.keywords === 'string') {
      updateData.keywords = JSON.parse(data.keywords);
    }

    const updated = await prisma.ciganoCard.update({
      where: { id },
      data: updateData,
    });

    return { data: updated };
  }

  async delete(id: string) {
    const card = await prisma.ciganoCard.findUnique({ where: { id } });

    if (!card) {
      throw new NotFoundException('Carta não encontrada');
    }

    // Check if card is used in any readings
    const usedInReadings = await prisma.readingCard.findFirst({
      where: { cardId: id },
    });

    if (usedInReadings) {
      throw new BadRequestException('Esta carta está sendo usada em leituras e não pode ser excluída');
    }

    await prisma.ciganoCard.delete({ where: { id } });

    return { message: 'Carta excluída com sucesso' };
  }

  async generateDeck() {
    // Check if deck already exists
    const existingCards = await prisma.ciganoCard.count();

    if (existingCards > 0) {
      throw new BadRequestException('O baralho já foi gerado. Exclua as cartas existentes primeiro.');
    }

    // Create all cards
    const cards = await prisma.ciganoCard.createMany({
      data: CIGANO_DECK.map((card) => ({
        number: card.number,
        name: card.name,
        keywords: card.keywords,
        isPositive: card.isPositive,
        imageUrl: `/assets/cards/${card.number}.jpg`,
      })),
    });

    return {
      message: `Baralho gerado com sucesso! ${cards.count} cartas criadas.`,
      count: cards.count,
    };
  }
}

export const cardsService = new CardsService();
