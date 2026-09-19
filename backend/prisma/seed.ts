// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =============================================
// HELPER FUNCTIONS
// =============================================
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function generateOrderNumber(index: number): string {
  return `ORD-2025-${String(index).padStart(3, '0')}`;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // =============================================
  // 1. CREATE ADMIN USER
  // =============================================
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      fullName: 'Profissional Admin',
      role: 'ADMIN',
      phone: '(11) 99999-9999',
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}\n`);

  // =============================================
  // 1b. CREATE CLIENT USER (for testing)
  // =============================================
  console.log('👤 Creating client user...');
  const clientPassword = await bcrypt.hash('Client@123', 12);

  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: clientPassword,
      fullName: 'Maria Silva Santos',
      role: 'CLIENT',
      phone: '(11) 98765-4321',
      birthDate: new Date('1988-05-15'),
      avatarUrl: '/avatars/client-maria.jpg',
      preferredLanguage: 'pt-BR',
      notificationEmail: true,
      notificationWhatsapp: true,
      notes: 'Cliente fiel desde 2023. Prefere leituras de amor e carreira.',
      stripeCustomerId: 'cus_test_maria_silva',
      lastLoginAt: daysAgo(2),
    },
  });
  console.log(`   ✅ Client created: ${client.email}\n`);

  // =============================================
  // 2. CREATE CIGANO TAROT CARDS (36 cards)
  // =============================================
  console.log('🃏 Creating Cigano Tarot cards...');
  
  const ciganoCards = [
    {
      number: 1,
      name: 'O Cavaleiro',
      nameEn: 'The Rider',
      keywords: ['notícias', 'mensagens', 'novidades', 'viagens curtas', 'movimento'],
      generalMeaning: 'O Cavaleiro traz notícias e novidades. Representa mensagens chegando, movimentação e mudanças rápidas na vida.',
      loveMeaning: 'Notícias sobre o amor estão a caminho. Pode indicar um novo pretendente ou mensagens de uma pessoa amada.',
      careerMeaning: 'Novidades profissionais chegando. Oportunidades de curto prazo e movimentação na carreira.',
      healthMeaning: 'Resultados de exames chegando. Recuperação rápida de doenças.',
      advice: 'Esteja atento às mensagens e sinais. As novidades que você espera estão próximas.',
      imageUrl: '/cards/01-cavaleiro.jpg',
      isPositive: true,
      element: 'Ar',
    },
    {
      number: 2,
      name: 'O Trevo',
      nameEn: 'The Clover',
      keywords: ['sorte', 'fortuna', 'oportunidades', 'pequenas alegrias', 'esperança'],
      generalMeaning: 'O Trevo representa a sorte e as pequenas alegrias da vida. Indica momentos de boa fortuna e oportunidades inesperadas.',
      loveMeaning: 'Sorte no amor. Encontros fortuitos que podem se tornar significativos.',
      careerMeaning: 'Golpe de sorte nos negócios. Oportunidades inesperadas de crescimento.',
      healthMeaning: 'Boa fase para a saúde. Recuperação favorável.',
      advice: 'Aproveite as pequenas alegrias e esteja aberto às oportunidades que surgem.',
      imageUrl: '/cards/02-trevo.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 3,
      name: 'O Navio',
      nameEn: 'The Ship',
      keywords: ['viagens', 'jornadas', 'comércio', 'mudanças', 'exploração'],
      generalMeaning: 'O Navio simboliza viagens longas, mudanças significativas e a busca por novos horizontes.',
      loveMeaning: 'Relacionamento à distância ou viagem romântica. Amor que vem de longe.',
      careerMeaning: 'Negócios internacionais, viagens a trabalho ou mudança de emprego.',
      healthMeaning: 'Tratamentos no exterior ou mudança de médico pode ser benéfica.',
      advice: 'Seja corajoso para explorar novos caminhos. A jornada é tão importante quanto o destino.',
      imageUrl: '/cards/03-navio.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 4,
      name: 'A Casa',
      nameEn: 'The House',
      keywords: ['lar', 'família', 'segurança', 'tradição', 'estabilidade'],
      generalMeaning: 'A Casa representa o lar, a família e a segurança. Indica estabilidade e proteção.',
      loveMeaning: 'Relacionamento sólido e estável. Possibilidade de morar junto ou casamento.',
      careerMeaning: 'Trabalho em casa ou negócio familiar. Estabilidade profissional.',
      healthMeaning: 'Saúde favorecida pelo ambiente familiar. Descanso em casa necessário.',
      advice: 'Valorize sua família e seu lar. A segurança vem de dentro para fora.',
      imageUrl: '/cards/04-casa.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 5,
      name: 'A Árvore',
      nameEn: 'The Tree',
      keywords: ['saúde', 'crescimento', 'raízes', 'vida', 'estabilidade'],
      generalMeaning: 'A Árvore representa a saúde, o crescimento pessoal e as raízes familiares. Indica vitalidade e longevidade.',
      loveMeaning: 'Amor duradouro com raízes profundas. Relacionamento que cresce com o tempo.',
      careerMeaning: 'Crescimento profissional gradual e consistente. Carreira sólida.',
      healthMeaning: 'Boa saúde e vitalidade. Atenção às questões de saúde de longo prazo.',
      advice: 'Cultive suas raízes e permita-se crescer. O tempo é seu aliado.',
      imageUrl: '/cards/05-arvore.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 6,
      name: 'As Nuvens',
      nameEn: 'The Clouds',
      keywords: ['confusão', 'dúvidas', 'incerteza', 'turbulência', 'clareza chegando'],
      generalMeaning: 'As Nuvens indicam confusão, dúvidas e incertezas. Porém, assim como as nuvens passam, a clareza virá.',
      loveMeaning: 'Período de confusão no relacionamento. Mal-entendidos que precisam ser esclarecidos.',
      careerMeaning: 'Incertezas profissionais. Decisões importantes precisam de mais clareza.',
      healthMeaning: 'Confusão mental ou emocional. Busque clareza através do descanso.',
      advice: 'Não tome decisões importantes agora. Espere a clareza chegar.',
      imageUrl: '/cards/06-nuvens.jpg',
      isPositive: false,
      element: 'Ar',
    },
    {
      number: 7,
      name: 'A Serpente',
      nameEn: 'The Snake',
      keywords: ['sabedoria', 'traição', 'tentação', 'transformação', 'cuidado'],
      generalMeaning: 'A Serpente representa sabedoria ancestral, mas também alerta para traições e pessoas falsas ao redor.',
      loveMeaning: 'Cuidado com rivais ou pessoas que querem atrapalhar seu relacionamento.',
      careerMeaning: 'Atenção a colegas invejosos ou negócios desonestos.',
      healthMeaning: 'Transformação e cura, mas cuidado com diagnósticos errados.',
      advice: 'Use sua sabedoria para identificar quem realmente está ao seu lado.',
      imageUrl: '/cards/07-serpente.jpg',
      isPositive: false,
      element: 'Água',
    },
    {
      number: 8,
      name: 'O Caixão',
      nameEn: 'The Coffin',
      keywords: ['fim', 'transformação', 'encerramento', 'renascimento', 'liberação'],
      generalMeaning: 'O Caixão representa o fim de um ciclo, uma transformação profunda. Algo precisa morrer para o novo nascer.',
      loveMeaning: 'Fim de um relacionamento ou transformação profunda na relação.',
      careerMeaning: 'Encerramento de um trabalho ou projeto. Tempo de mudança.',
      healthMeaning: 'Fim de uma doença ou necessidade de cuidar da saúde com seriedade.',
      advice: 'Aceite os finais como parte natural da vida. O novo está por vir.',
      imageUrl: '/cards/08-caixao.jpg',
      isPositive: false,
      element: 'Terra',
    },
    {
      number: 9,
      name: 'O Buquê',
      nameEn: 'The Bouquet',
      keywords: ['beleza', 'felicidade', 'presentes', 'convites', 'celebração'],
      generalMeaning: 'O Buquê traz alegria, beleza e celebrações. Indica presentes, convites e momentos felizes.',
      loveMeaning: 'Romance florescendo. Presentes e demonstrações de amor.',
      careerMeaning: 'Reconhecimento profissional. Convites para eventos ou promoções.',
      healthMeaning: 'Vitalidade e bem-estar. Fase de alegria e saúde.',
      advice: 'Celebre a vida e espalhe alegria. A felicidade atrai mais felicidade.',
      imageUrl: '/cards/09-buque.jpg',
      isPositive: true,
      element: 'Ar',
    },
    {
      number: 10,
      name: 'A Foice',
      nameEn: 'The Scythe',
      keywords: ['corte', 'decisão', 'perigo', 'rapidez', 'separação'],
      generalMeaning: 'A Foice indica cortes abruptos, decisões rápidas e possíveis perigos. Algo será cortado de sua vida.',
      loveMeaning: 'Separação abrupta ou decisão drástica no relacionamento.',
      careerMeaning: 'Demissão ou cortes no trabalho. Decisões rápidas necessárias.',
      healthMeaning: 'Cirurgias ou procedimentos médicos. Cuidado com acidentes.',
      advice: 'Esteja preparado para mudanças repentinas. Aja com rapidez quando necessário.',
      imageUrl: '/cards/10-foice.jpg',
      isPositive: false,
      element: 'Fogo',
    },
    {
      number: 11,
      name: 'O Chicote',
      nameEn: 'The Whip',
      keywords: ['conflito', 'discussões', 'repetição', 'disciplina', 'paixão'],
      generalMeaning: 'O Chicote representa conflitos, discussões e situações repetitivas. Pode indicar também paixão intensa.',
      loveMeaning: 'Discussões no relacionamento. Paixão turbulenta ou padrões repetitivos.',
      careerMeaning: 'Conflitos no trabalho. Trabalho repetitivo ou exigente.',
      healthMeaning: 'Dores crônicas ou problemas recorrentes. Atenção ao estresse.',
      advice: 'Quebre os padrões negativos. Discipline-se para evitar conflitos.',
      imageUrl: '/cards/11-chicote.jpg',
      isPositive: false,
      element: 'Fogo',
    },
    {
      number: 12,
      name: 'Os Pássaros',
      nameEn: 'The Birds',
      keywords: ['comunicação', 'casal', 'nervosismo', 'conversas', 'preocupação'],
      generalMeaning: 'Os Pássaros representam comunicação, conversas e pode indicar nervosismo ou ansiedade.',
      loveMeaning: 'Casal em comunicação. Conversas importantes sobre o relacionamento.',
      careerMeaning: 'Reuniões, ligações e comunicação intensa no trabalho.',
      healthMeaning: 'Ansiedade e nervosismo. Atenção à saúde mental.',
      advice: 'Comunique-se claramente, mas evite fofocas e preocupações excessivas.',
      imageUrl: '/cards/12-passaros.jpg',
      isPositive: true,
      element: 'Ar',
    },
    {
      number: 13,
      name: 'A Criança',
      nameEn: 'The Child',
      keywords: ['novo começo', 'inocência', 'filho', 'pureza', 'vulnerabilidade'],
      generalMeaning: 'A Criança representa novos começos, inocência e pureza. Pode indicar uma criança real ou algo novo nascendo.',
      loveMeaning: 'Amor puro e inocente. Possibilidade de gravidez ou novo relacionamento.',
      careerMeaning: 'Novo projeto ou emprego. Início de carreira ou empreendimento.',
      healthMeaning: 'Nova fase de saúde. Tratamentos novos ou nascimento.',
      advice: 'Abrace os novos começos com a pureza de uma criança.',
      imageUrl: '/cards/13-crianca.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 14,
      name: 'A Raposa',
      nameEn: 'The Fox',
      keywords: ['astúcia', 'engano', 'trabalho', 'sobrevivência', 'esperteza'],
      generalMeaning: 'A Raposa indica astúcia e pode alertar sobre enganos. Também representa trabalho e sobrevivência.',
      loveMeaning: 'Cuidado com mentiras ou manipulação no relacionamento.',
      careerMeaning: 'Trabalho que exige esperteza. Atenção a colegas desonestos.',
      healthMeaning: 'Busque segundas opiniões médicas. Algo pode não ser o que parece.',
      advice: 'Seja esperto, mas não enganoso. Proteja-se de pessoas falsas.',
      imageUrl: '/cards/14-raposa.jpg',
      isPositive: false,
      element: 'Fogo',
    },
    {
      number: 15,
      name: 'O Urso',
      nameEn: 'The Bear',
      keywords: ['força', 'poder', 'proteção', 'chefe', 'mãe'],
      generalMeaning: 'O Urso representa força, poder e proteção. Pode indicar uma figura de autoridade ou mãe.',
      loveMeaning: 'Relacionamento protetor. Parceiro forte ou ciumento.',
      careerMeaning: 'Chefe ou figura de autoridade. Poder nos negócios.',
      healthMeaning: 'Força física. Atenção ao peso e alimentação.',
      advice: 'Use sua força com sabedoria. Proteja quem você ama.',
      imageUrl: '/cards/15-urso.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 16,
      name: 'A Estrela',
      nameEn: 'The Stars',
      keywords: ['esperança', 'inspiração', 'tecnologia', 'internet', 'fama'],
      generalMeaning: 'A Estrela traz esperança, inspiração e conexão com o divino. Representa também tecnologia e fama.',
      loveMeaning: 'Amor inspirador e esperançoso. Conexão espiritual com o parceiro.',
      careerMeaning: 'Reconhecimento e fama. Trabalho com tecnologia ou internet.',
      healthMeaning: 'Cura espiritual. Tratamentos alternativos favoráveis.',
      advice: 'Mantenha a esperança viva. Sua luz brilha para guiar seu caminho.',
      imageUrl: '/cards/16-estrela.jpg',
      isPositive: true,
      element: 'Ar',
    },
    {
      number: 17,
      name: 'A Cegonha',
      nameEn: 'The Stork',
      keywords: ['mudança', 'gravidez', 'progresso', 'melhorias', 'evolução'],
      generalMeaning: 'A Cegonha anuncia mudanças positivas e progresso. Tradicionalmente associada à gravidez e novidades.',
      loveMeaning: 'Mudanças positivas no relacionamento. Gravidez ou novo ciclo.',
      careerMeaning: 'Promoção ou mudança de emprego favorável. Progresso na carreira.',
      healthMeaning: 'Melhora na saúde. Gravidez ou recuperação.',
      advice: 'Aceite as mudanças com otimismo. O progresso está chegando.',
      imageUrl: '/cards/17-cegonha.jpg',
      isPositive: true,
      element: 'Ar',
    },
    {
      number: 18,
      name: 'O Cachorro',
      nameEn: 'The Dog',
      keywords: ['amizade', 'lealdade', 'confiança', 'amigo', 'fidelidade'],
      generalMeaning: 'O Cachorro representa amizade verdadeira, lealdade e confiança. Indica um amigo fiel.',
      loveMeaning: 'Parceiro leal e confiável. Amor baseado em amizade.',
      careerMeaning: 'Colega de confiança. Parcerias leais nos negócios.',
      healthMeaning: 'Apoio de amigos na recuperação. Animais de estimação ajudam na saúde.',
      advice: 'Valorize suas amizades verdadeiras. A lealdade é um tesouro.',
      imageUrl: '/cards/18-cachorro.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 19,
      name: 'A Torre',
      nameEn: 'The Tower',
      keywords: ['isolamento', 'autoridade', 'governo', 'empresa', 'solidão'],
      generalMeaning: 'A Torre representa instituições, autoridade e pode indicar isolamento ou solidão.',
      loveMeaning: 'Necessidade de espaço no relacionamento. Amor solitário.',
      careerMeaning: 'Grandes empresas ou governo. Trabalho em corporações.',
      healthMeaning: 'Hospitais ou instituições de saúde. Isolamento para recuperação.',
      advice: 'Às vezes a solidão é necessária. Respeite seus limites.',
      imageUrl: '/cards/19-torre.jpg',
      isPositive: null,
      element: 'Terra',
    },
    {
      number: 20,
      name: 'O Jardim',
      nameEn: 'The Garden',
      keywords: ['sociedade', 'eventos', 'público', 'redes sociais', 'grupo'],
      generalMeaning: 'O Jardim representa a vida social, eventos públicos e grupos de pessoas. Indica networking e celebrações.',
      loveMeaning: 'Conhecer pessoas em eventos. Relacionamento público ou social.',
      careerMeaning: 'Eventos profissionais, networking. Trabalho público.',
      healthMeaning: 'Atividades em grupo beneficiam a saúde. Vida social ativa.',
      advice: 'Cultive suas conexões sociais. O networking abre portas.',
      imageUrl: '/cards/20-jardim.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 21,
      name: 'A Montanha',
      nameEn: 'The Mountain',
      keywords: ['obstáculo', 'bloqueio', 'desafio', 'atraso', 'paciência'],
      generalMeaning: 'A Montanha representa obstáculos e bloqueios. Indica desafios que exigem paciência para serem superados.',
      loveMeaning: 'Bloqueios no relacionamento. Obstáculos para ficar junto.',
      careerMeaning: 'Dificuldades profissionais. Projeto travado.',
      healthMeaning: 'Bloqueios na recuperação. Paciência no tratamento.',
      advice: 'Os obstáculos podem ser superados com paciência e persistência.',
      imageUrl: '/cards/21-montanha.jpg',
      isPositive: false,
      element: 'Terra',
    },
    {
      number: 22,
      name: 'Os Caminhos',
      nameEn: 'The Crossroads',
      keywords: ['decisão', 'escolha', 'alternativas', 'dúvida', 'direção'],
      generalMeaning: 'Os Caminhos indicam uma decisão importante a ser tomada. Representa escolhas e diferentes direções.',
      loveMeaning: 'Decisão sobre o relacionamento. Escolha entre duas pessoas.',
      careerMeaning: 'Escolha de carreira ou proposta de trabalho. Decisão profissional.',
      healthMeaning: 'Escolha de tratamento. Decisão sobre procedimentos.',
      advice: 'Analise todas as opções antes de decidir. Confie em sua intuição.',
      imageUrl: '/cards/22-caminhos.jpg',
      isPositive: null,
      element: 'Ar',
    },
    {
      number: 23,
      name: 'Os Ratos',
      nameEn: 'The Mice',
      keywords: ['perda', 'estresse', 'deterioração', 'roubo', 'preocupação'],
      generalMeaning: 'Os Ratos indicam perdas gradativas, estresse e deterioração. Algo está sendo corroído.',
      loveMeaning: 'Desgaste no relacionamento. Pequenas perdas que acumulam.',
      careerMeaning: 'Perdas financeiras graduais. Estresse no trabalho.',
      healthMeaning: 'Saúde sendo desgastada pelo estresse. Perdas de energia.',
      advice: 'Identifique o que está drenando sua energia e elimine.',
      imageUrl: '/cards/23-ratos.jpg',
      isPositive: false,
      element: 'Terra',
    },
    {
      number: 24,
      name: 'O Coração',
      nameEn: 'The Heart',
      keywords: ['amor', 'paixão', 'romance', 'sentimentos', 'emoção'],
      generalMeaning: 'O Coração é a carta do amor por excelência. Representa paixão, romance e sentimentos profundos.',
      loveMeaning: 'Grande amor. Paixão verdadeira e sentimentos intensos.',
      careerMeaning: 'Trabalho com amor. Paixão pela profissão.',
      healthMeaning: 'Saúde do coração. Equilíbrio emocional importante.',
      advice: 'Siga seu coração. O amor é o caminho.',
      imageUrl: '/cards/24-coracao.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 25,
      name: 'O Anel',
      nameEn: 'The Ring',
      keywords: ['compromisso', 'contrato', 'casamento', 'ciclo', 'parceria'],
      generalMeaning: 'O Anel representa compromissos, contratos e parcerias. Indica ciclos e acordos.',
      loveMeaning: 'Noivado, casamento ou compromisso sério no relacionamento.',
      careerMeaning: 'Contratos de trabalho. Parcerias de negócios.',
      healthMeaning: 'Compromisso com a saúde. Tratamentos cíclicos.',
      advice: 'Honre seus compromissos. Os acordos são sagrados.',
      imageUrl: '/cards/25-anel.jpg',
      isPositive: true,
      element: 'Metal',
    },
    {
      number: 26,
      name: 'O Livro',
      nameEn: 'The Book',
      keywords: ['segredo', 'conhecimento', 'estudo', 'mistério', 'educação'],
      generalMeaning: 'O Livro representa segredos, conhecimento oculto e educação. Indica estudos e mistérios.',
      loveMeaning: 'Segredos no relacionamento. Amor oculto ou caso secreto.',
      careerMeaning: 'Estudos, cursos ou trabalho com educação. Informações confidenciais.',
      healthMeaning: 'Diagnóstico oculto. Busque mais conhecimento sobre sua saúde.',
      advice: 'O conhecimento é poder. Desvende os mistérios com estudo.',
      imageUrl: '/cards/26-livro.jpg',
      isPositive: null,
      element: 'Ar',
    },
    {
      number: 27,
      name: 'A Carta',
      nameEn: 'The Letter',
      keywords: ['documento', 'mensagem', 'comunicação escrita', 'notícias', 'email'],
      generalMeaning: 'A Carta representa documentos, mensagens escritas e comunicação formal. Indica notícias por escrito.',
      loveMeaning: 'Cartas de amor. Mensagens românticas ou documentos do relacionamento.',
      careerMeaning: 'Documentos de trabalho. Contratos, emails importantes.',
      healthMeaning: 'Resultados de exames. Receitas e laudos médicos.',
      advice: 'Preste atenção às mensagens escritas. Documentos são importantes.',
      imageUrl: '/cards/27-carta.jpg',
      isPositive: true,
      element: 'Ar',
    },
    {
      number: 28,
      name: 'O Cigano',
      nameEn: 'The Man',
      keywords: ['homem', 'consulente masculino', 'figura masculina', 'parceiro', 'pai'],
      generalMeaning: 'O Cigano representa uma figura masculina importante. Pode ser o consulente, um parceiro ou outra pessoa significativa.',
      loveMeaning: 'O homem amado. Parceiro romântico masculino.',
      careerMeaning: 'Chefe, colega ou parceiro de negócios masculino.',
      healthMeaning: 'Saúde do homem em questão. Médico ou terapeuta masculino.',
      advice: 'Esta carta representa você ou um homem importante em sua vida.',
      imageUrl: '/cards/28-cigano.jpg',
      isPositive: true,
      element: 'Fogo',
    },
    {
      number: 29,
      name: 'A Cigana',
      nameEn: 'The Woman',
      keywords: ['mulher', 'consulente feminina', 'figura feminina', 'parceira', 'mãe'],
      generalMeaning: 'A Cigana representa uma figura feminina importante. Pode ser a consulente, uma parceira ou outra pessoa significativa.',
      loveMeaning: 'A mulher amada. Parceira romântica feminina.',
      careerMeaning: 'Chefe, colega ou parceira de negócios feminina.',
      healthMeaning: 'Saúde da mulher em questão. Médica ou terapeuta feminina.',
      advice: 'Esta carta representa você ou uma mulher importante em sua vida.',
      imageUrl: '/cards/29-cigana.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 30,
      name: 'Os Lírios',
      nameEn: 'The Lilies',
      keywords: ['paz', 'maturidade', 'sabedoria', 'sensualidade', 'harmonia'],
      generalMeaning: 'Os Lírios representam paz, harmonia e maturidade. Indicam sabedoria e também sensualidade.',
      loveMeaning: 'Amor maduro e harmonioso. Sensualidade e paz no relacionamento.',
      careerMeaning: 'Carreira madura. Trabalho estável e harmonioso.',
      healthMeaning: 'Boa saúde na maturidade. Paz de espírito.',
      advice: 'A paz interior traz harmonia externa. Cultive a serenidade.',
      imageUrl: '/cards/30-lirios.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 31,
      name: 'O Sol',
      nameEn: 'The Sun',
      keywords: ['sucesso', 'alegria', 'vitalidade', 'energia', 'vitória'],
      generalMeaning: 'O Sol é uma das cartas mais positivas. Representa sucesso, alegria, vitalidade e conquistas.',
      loveMeaning: 'Relacionamento feliz e radiante. Amor cheio de alegria.',
      careerMeaning: 'Sucesso profissional. Reconhecimento e vitória.',
      healthMeaning: 'Excelente saúde e vitalidade. Energia abundante.',
      advice: 'O sucesso está ao seu alcance. Brilhe com toda sua luz.',
      imageUrl: '/cards/31-sol.jpg',
      isPositive: true,
      element: 'Fogo',
    },
    {
      number: 32,
      name: 'A Lua',
      nameEn: 'The Moon',
      keywords: ['intuição', 'emoções', 'feminino', 'sonhos', 'ciclos'],
      generalMeaning: 'A Lua representa intuição, emoções profundas e o feminino. Indica sonhos, ciclos e reconhecimento.',
      loveMeaning: 'Amor romântico e emocional. Conexão intuitiva com o parceiro.',
      careerMeaning: 'Reconhecimento e fama. Trabalho criativo ou artístico.',
      healthMeaning: 'Atenção aos ciclos hormonais. Saúde emocional.',
      advice: 'Confie em sua intuição. Seus sonhos têm mensagens importantes.',
      imageUrl: '/cards/32-lua.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 33,
      name: 'A Chave',
      nameEn: 'The Key',
      keywords: ['solução', 'destino', 'certeza', 'resposta', 'abertura'],
      generalMeaning: 'A Chave traz soluções e respostas. Indica destino, certeza e portas se abrindo.',
      loveMeaning: 'A resposta que você busca no amor. Certeza sobre o relacionamento.',
      careerMeaning: 'Solução para problemas profissionais. Oportunidade certa.',
      healthMeaning: 'Diagnóstico correto. Tratamento que funciona.',
      advice: 'A solução está mais perto do que você imagina. A chave está em suas mãos.',
      imageUrl: '/cards/33-chave.jpg',
      isPositive: true,
      element: 'Metal',
    },
    {
      number: 34,
      name: 'Os Peixes',
      nameEn: 'The Fish',
      keywords: ['dinheiro', 'abundância', 'negócios', 'fluxo', 'prosperidade'],
      generalMeaning: 'Os Peixes representam dinheiro, abundância e prosperidade. Indicam negócios e fluxo financeiro.',
      loveMeaning: 'Abundância no amor. Relacionamento próspero.',
      careerMeaning: 'Sucesso financeiro. Negócios lucrativos e prosperidade.',
      healthMeaning: 'Fluxo de energia. Atenção ao consumo de líquidos e álcool.',
      advice: 'A abundância flui para você. Esteja aberto para receber.',
      imageUrl: '/cards/34-peixes.jpg',
      isPositive: true,
      element: 'Água',
    },
    {
      number: 35,
      name: 'A Âncora',
      nameEn: 'The Anchor',
      keywords: ['estabilidade', 'trabalho', 'persistência', 'segurança', 'meta'],
      generalMeaning: 'A Âncora representa estabilidade, trabalho e persistência. Indica segurança e alcançar metas.',
      loveMeaning: 'Relacionamento estável e seguro. Amor que ancora.',
      careerMeaning: 'Trabalho estável. Persistência leva ao sucesso.',
      healthMeaning: 'Saúde estável. Manter-se firme nos tratamentos.',
      advice: 'A persistência é a chave. Mantenha-se firme em seus objetivos.',
      imageUrl: '/cards/35-ancora.jpg',
      isPositive: true,
      element: 'Terra',
    },
    {
      number: 36,
      name: 'A Cruz',
      nameEn: 'The Cross',
      keywords: ['destino', 'karma', 'provação', 'fé', 'espiritualidade'],
      generalMeaning: 'A Cruz representa o destino, karma e provações. Indica fé, espiritualidade e fardos a carregar.',
      loveMeaning: 'Amor destinado ou kármico. Provações no relacionamento.',
      careerMeaning: 'Trabalho como missão. Fardos profissionais.',
      healthMeaning: 'Provações de saúde. Fé ajuda na recuperação.',
      advice: 'Aceite seu destino com fé. As provações fortalecem sua alma.',
      imageUrl: '/cards/36-cruz.jpg',
      isPositive: null,
      element: 'Éter',
    },
  ];

  for (const card of ciganoCards) {
    await prisma.ciganoCard.upsert({
      where: { number: card.number },
      update: card,
      create: card,
    });
  }
  console.log(`   ✅ ${ciganoCards.length} Cigano cards created\n`);

  // =============================================
  // 3. CREATE PRODUCT CATEGORIES
  // =============================================
  console.log('📁 Creating product categories...');
  
  const categories = [
    {
      name: 'Consultas',
      slug: 'consultas',
      description: 'Consultas personalizadas de Tarot Cigano',
      icon: 'pi-comments',
      displayOrder: 1,
    },
    {
      name: 'Leituras por Escrito',
      slug: 'leituras-escritas',
      description: 'Leituras detalhadas entregues por escrito',
      icon: 'pi-file-edit',
      displayOrder: 2,
    },
    {
      name: 'Pacotes Mensais',
      slug: 'pacotes-mensais',
      description: 'Acompanhamento mensal com o Tarot',
      icon: 'pi-calendar',
      displayOrder: 3,
    },
    {
      name: 'Especiais',
      slug: 'especiais',
      description: 'Leituras especiais e sazonais',
      icon: 'pi-star',
      displayOrder: 4,
    },
  ];

  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log(`   ✅ ${categories.length} categories created\n`);

  // =============================================
  // 4. CREATE PRODUCTS
  // =============================================
  console.log('🛍️ Creating products...');

  const consultasCategory = await prisma.productCategory.findUnique({ where: { slug: 'consultas' } });
  const leiturasCategory = await prisma.productCategory.findUnique({ where: { slug: 'leituras-escritas' } });
  const pacotesCategory = await prisma.productCategory.findUnique({ where: { slug: 'pacotes-mensais' } });
  const especialCategory = await prisma.productCategory.findUnique({ where: { slug: 'especiais' } });

  const products = [
    {
      categoryId: leiturasCategory?.id,
      name: 'Pergunta Única',
      slug: 'pergunta-unica',
      shortDescription: 'Uma pergunta, uma resposta do Tarot Cigano',
      fullDescription: 'Faça uma pergunta específica e receba uma leitura detalhada com as cartas do Tarot Cigano. Ideal para quem precisa de orientação rápida sobre uma situação específica.',
      productType: 'QUESTION' as const,
      price: 47.00,
      numQuestions: 1,
      numCards: 3,
      validityDays: 30,
      isActive: true,
      isFeatured: true,
      requiresScheduling: false,
      galleryUrls: [],
    },
    {
      categoryId: leiturasCategory?.id,
      name: 'Três Perguntas',
      slug: 'tres-perguntas',
      shortDescription: 'Pacote com três perguntas ao Tarot',
      fullDescription: 'Faça três perguntas sobre diferentes áreas da sua vida. Receba uma leitura completa e aprofundada para cada questão.',
      productType: 'QUESTION' as const,
      price: 127.00,
      originalPrice: 141.00,
      numQuestions: 3,
      numCards: 5,
      validityDays: 60,
      isActive: true,
      isFeatured: true,
      requiresScheduling: false,
      galleryUrls: [],
    },
    {
      categoryId: consultasCategory?.id,
      name: 'Consulta Online 30min',
      slug: 'consulta-online-30min',
      shortDescription: 'Consulta ao vivo por videochamada',
      fullDescription: 'Sessão ao vivo de 30 minutos onde faremos uma leitura completa do Tarot Cigano. Você poderá fazer perguntas em tempo real.',
      productType: 'SESSION' as const,
      price: 197.00,
      sessionDurationMinutes: 30,
      numCards: 7,
      validityDays: 30,
      isActive: true,
      isFeatured: true,
      requiresScheduling: true,
      galleryUrls: [],
    },
    {
      categoryId: consultasCategory?.id,
      name: 'Consulta Online 60min',
      slug: 'consulta-online-60min',
      shortDescription: 'Consulta completa por videochamada',
      fullDescription: 'Sessão ao vivo de 1 hora para uma leitura completa e aprofundada. Ideal para quem busca orientação detalhada sobre múltiplas áreas da vida.',
      productType: 'SESSION' as const,
      price: 347.00,
      originalPrice: 394.00,
      sessionDurationMinutes: 60,
      numCards: 12,
      validityDays: 30,
      isActive: true,
      isFeatured: false,
      requiresScheduling: true,
      galleryUrls: [],
    },
    {
      categoryId: pacotesCategory?.id,
      name: 'Acompanhamento Mensal',
      slug: 'acompanhamento-mensal',
      shortDescription: 'Orientação contínua durante todo o mês',
      fullDescription: 'Receba uma leitura semanal durante um mês completo. Acompanhe a evolução das energias e receba orientações contínuas.',
      productType: 'MONTHLY' as const,
      price: 297.00,
      originalPrice: 376.00,
      numQuestions: 4,
      validityDays: 30,
      isActive: true,
      isFeatured: true,
      requiresScheduling: false,
      galleryUrls: [],
    },
    {
      categoryId: especialCategory?.id,
      name: 'Leitura de Ano Novo',
      slug: 'leitura-ano-novo',
      shortDescription: 'Previsões para os próximos 12 meses',
      fullDescription: 'Uma leitura especial e completa sobre os próximos 12 meses da sua vida. Receba orientações para cada mês do ano.',
      productType: 'SPECIAL' as const,
      price: 247.00,
      numCards: 12,
      validityDays: 365,
      isActive: true,
      isFeatured: true,
      requiresScheduling: false,
      galleryUrls: [],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`   ✅ ${products.length} products created\n`);

  // =============================================
  // 5. CREATE SCHEDULE SETTINGS
  // =============================================
  console.log('📅 Creating schedule settings...');
  
  const existingSettings = await prisma.scheduleSettings.findFirst();
  
  if (!existingSettings) {
    await prisma.scheduleSettings.create({
      data: {
        mondayStart: '09:00',
        mondayEnd: '18:00',
        mondayEnabled: true,
        tuesdayStart: '09:00',
        tuesdayEnd: '18:00',
        tuesdayEnabled: true,
        wednesdayStart: '09:00',
        wednesdayEnd: '18:00',
        wednesdayEnabled: true,
        thursdayStart: '09:00',
        thursdayEnd: '18:00',
        thursdayEnabled: true,
        fridayStart: '09:00',
        fridayEnd: '18:00',
        fridayEnabled: true,
        saturdayStart: '10:00',
        saturdayEnd: '14:00',
        saturdayEnabled: false,
        sundayEnabled: false,
        slotDurationMinutes: 30,
        bufferMinutes: 15,
        advanceBookingDays: 30,
        minNoticeHours: 24,
        blockedDates: [],
        timezone: 'America/Sao_Paulo',
      },
    });
    console.log('   ✅ Schedule settings created\n');
  } else {
    console.log('   ⏭️ Schedule settings already exist\n');
  }

  // =============================================
  // 6. CREATE SITE SETTINGS
  // =============================================
  console.log('⚙️ Creating site settings...');

  const siteSettings = [
    {
      key: 'general',
      value: {
        siteName: 'Therapist Platform',
        siteDescription: 'Leituras de Tarot Cigano com o profissional',
        email: 'contato@example.com',
        phone: '(11) 99999-9999',
        whatsapp: '5511999999999',
        address: 'São Paulo, SP - Brasil',
      },
    },
    {
      key: 'social',
      value: {
        instagram: 'https://instagram.com/profissionaltarot',
        facebook: 'https://facebook.com/profissionaltarot',
        youtube: 'https://youtube.com/@profissionaltarot',
        tiktok: '',
      },
    },
    {
      key: 'seo',
      value: {
        metaTitle: 'Therapist Platform - Leituras de Tarot Cigano Online',
        metaDescription: 'Consultas e leituras de Tarot Cigano online com o profissional. Orientação espiritual para amor, carreira e vida.',
        keywords: ['tarot cigano', 'leitura de tarot', 'consulta online', 'tarot online', 'profissional tarot'],
      },
    },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`   ✅ ${siteSettings.length} site settings created\n`);

  // =============================================
  // 7. CREATE SAMPLE TESTIMONIALS
  // =============================================
  console.log('💬 Creating sample testimonials...');

  const testimonials = [
    {
      clientName: 'Maria S.',
      content: 'A leitura do profissional foi incrível! Ela descreveu minha situação com detalhes que eu não tinha contado. As orientações me ajudaram muito a tomar uma decisão importante.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      clientName: 'Ana Paula R.',
      content: 'Fiz a consulta online e foi uma experiência transformadora. A Profissional é muito atenciosa e as cartas trouxeram clareza para questões que me angustiavam há meses.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      clientName: 'Juliana M.',
      content: 'Já fiz várias leituras e sempre saio impressionada. O Tarot Cigano nas mãos do profissional é uma ferramenta poderosa de autoconhecimento.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
      displayOrder: 3,
    },
    {
      clientName: 'Carla F.',
      content: 'O acompanhamento mensal mudou minha perspectiva. Ter orientação semanal me ajuda a navegar os desafios com mais clareza.',
      rating: 5,
      isApproved: true,
      isFeatured: false,
      displayOrder: 4,
    },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { clientName: testimonial.clientName },
    });

    if (!existing) {
      await prisma.testimonial.create({
        data: testimonial,
      });
    }
  }
  console.log(`   ✅ ${testimonials.length} testimonials created\n`);

  // =============================================
  // 8. CREATE TEST DATA FOR CLIENT USER
  // =============================================
  console.log('🧪 Creating test data for client user...\n');

  // Fetch products for orders
  const perguntaUnica = await prisma.product.findUnique({ where: { slug: 'pergunta-unica' } });
  const tresPerguntas = await prisma.product.findUnique({ where: { slug: 'tres-perguntas' } });
  const consulta30 = await prisma.product.findUnique({ where: { slug: 'consulta-online-30min' } });
  const acompanhamento = await prisma.product.findUnique({ where: { slug: 'acompanhamento-mensal' } });
  const anoNovo = await prisma.product.findUnique({ where: { slug: 'leitura-ano-novo' } });

  // =============================================
  // 8a. CREATE ORDERS
  // =============================================
  console.log('📦 Creating orders for client...');

  // Order 1: Pergunta Única - COMPLETED
  const order1 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(1),
      clientId: client.id,
      subtotal: perguntaUnica!.price,
      discount: 0,
      total: perguntaUnica!.price,
      status: 'COMPLETED',
      paymentStatus: 'SUCCEEDED',
      stripeCheckoutSessionId: 'cs_test_order1',
      stripePaymentIntentId: 'pi_test_order1',
      paidAt: daysAgo(15),
      completedAt: daysAgo(12),
      createdAt: daysAgo(15),
    },
  });

  // Order 2: Três Perguntas - PROCESSING
  const order2 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(2),
      clientId: client.id,
      subtotal: tresPerguntas!.price,
      discount: 0,
      total: tresPerguntas!.price,
      status: 'PROCESSING',
      paymentStatus: 'SUCCEEDED',
      stripeCheckoutSessionId: 'cs_test_order2',
      stripePaymentIntentId: 'pi_test_order2',
      paidAt: daysAgo(3),
      createdAt: daysAgo(3),
    },
  });

  // Order 3: Consulta 30min - PROCESSING
  const order3 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(3),
      clientId: client.id,
      subtotal: consulta30!.price,
      discount: 0,
      total: consulta30!.price,
      status: 'PROCESSING',
      paymentStatus: 'SUCCEEDED',
      stripeCheckoutSessionId: 'cs_test_order3',
      stripePaymentIntentId: 'pi_test_order3',
      paidAt: daysAgo(7),
      createdAt: daysAgo(7),
    },
  });

  // Order 4: Acompanhamento Mensal - COMPLETED
  const order4 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(4),
      clientId: client.id,
      subtotal: acompanhamento!.price,
      discount: 0,
      total: acompanhamento!.price,
      status: 'COMPLETED',
      paymentStatus: 'SUCCEEDED',
      stripeCheckoutSessionId: 'cs_test_order4',
      stripePaymentIntentId: 'pi_test_order4',
      paidAt: daysAgo(60),
      completedAt: daysAgo(30),
      createdAt: daysAgo(60),
    },
  });

  // Order 5: Leitura de Ano Novo - COMPLETED
  const order5 = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(5),
      clientId: client.id,
      subtotal: anoNovo!.price,
      discount: 0,
      total: anoNovo!.price,
      status: 'COMPLETED',
      paymentStatus: 'SUCCEEDED',
      stripeCheckoutSessionId: 'cs_test_order5',
      stripePaymentIntentId: 'pi_test_order5',
      paidAt: daysAgo(30),
      completedAt: daysAgo(25),
      createdAt: daysAgo(30),
    },
  });

  console.log('   ✅ 5 orders created\n');

  // =============================================
  // 8b. CREATE ORDER ITEMS
  // =============================================
  console.log('📋 Creating order items...');

  // Order 1 Item - Pergunta Única
  const orderItem1 = await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: perguntaUnica!.id,
      productName: perguntaUnica!.name,
      productType: perguntaUnica!.productType,
      unitPrice: perguntaUnica!.price,
      quantity: 1,
      totalPrice: perguntaUnica!.price,
      clientQuestions: ['Como está a energia do meu relacionamento atual? Há perspectivas de evolução?'],
      createdAt: daysAgo(15),
    },
  });

  // Order 2 Items - Três Perguntas (3 items)
  const orderItem2a = await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: tresPerguntas!.id,
      productName: `${tresPerguntas!.name} - Pergunta 1`,
      productType: tresPerguntas!.productType,
      unitPrice: tresPerguntas!.price,
      quantity: 1,
      totalPrice: tresPerguntas!.price,
      clientQuestions: ['Devo aceitar a nova proposta de emprego ou permanecer na empresa atual?'],
      createdAt: daysAgo(3),
    },
  });

  const orderItem2b = await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: tresPerguntas!.id,
      productName: `${tresPerguntas!.name} - Pergunta 2`,
      productType: tresPerguntas!.productType,
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0,
      clientQuestions: ['Como posso melhorar minha energia e disposição neste momento?'],
      createdAt: daysAgo(3),
    },
  });

  const orderItem2c = await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: tresPerguntas!.id,
      productName: `${tresPerguntas!.name} - Pergunta 3`,
      productType: tresPerguntas!.productType,
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0,
      clientQuestions: ['Qual é a melhor forma de resolver o conflito familiar que estou vivendo?'],
      createdAt: daysAgo(3),
    },
  });

  // Order 3 Item - Consulta 30min
  const orderItem3 = await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: consulta30!.id,
      productName: consulta30!.name,
      productType: consulta30!.productType,
      unitPrice: consulta30!.price,
      quantity: 1,
      totalPrice: consulta30!.price,
      clientQuestions: [],
      createdAt: daysAgo(7),
    },
  });

  // Order 4 Items - Acompanhamento Mensal (4 leituras semanais)
  const orderItem4a = await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: acompanhamento!.id,
      productName: `${acompanhamento!.name} - Semana 1`,
      productType: acompanhamento!.productType,
      unitPrice: acompanhamento!.price,
      quantity: 1,
      totalPrice: acompanhamento!.price,
      clientQuestions: ['Como estão as energias para esta semana?'],
      createdAt: daysAgo(60),
    },
  });

  const orderItem4b = await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: acompanhamento!.id,
      productName: `${acompanhamento!.name} - Semana 2`,
      productType: acompanhamento!.productType,
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0,
      clientQuestions: ['O que preciso saber para esta segunda semana?'],
      createdAt: daysAgo(53),
    },
  });

  const orderItem4c = await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: acompanhamento!.id,
      productName: `${acompanhamento!.name} - Semana 3`,
      productType: acompanhamento!.productType,
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0,
      clientQuestions: ['Quais são os desafios da terceira semana?'],
      createdAt: daysAgo(46),
    },
  });

  const orderItem4d = await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: acompanhamento!.id,
      productName: `${acompanhamento!.name} - Semana 4`,
      productType: acompanhamento!.productType,
      unitPrice: 0,
      quantity: 1,
      totalPrice: 0,
      clientQuestions: ['Como encerro este mês da melhor forma?'],
      createdAt: daysAgo(39),
    },
  });

  // Order 5 Item - Leitura de Ano Novo
  const orderItem5 = await prisma.orderItem.create({
    data: {
      orderId: order5.id,
      productId: anoNovo!.id,
      productName: anoNovo!.name,
      productType: anoNovo!.productType,
      unitPrice: anoNovo!.price,
      quantity: 1,
      totalPrice: anoNovo!.price,
      clientQuestions: ['Quais são as previsões e orientações para os próximos 12 meses?'],
      createdAt: daysAgo(30),
    },
  });

  console.log('   ✅ 10 order items created\n');

  // =============================================
  // 8c. CREATE READINGS
  // =============================================
  console.log('📖 Creating readings...');

  // Reading 1: Order 1 - PUBLISHED (Amor)
  const reading1 = await prisma.reading.create({
    data: {
      orderItemId: orderItem1.id,
      clientId: client.id,
      title: 'Leitura sobre Amor',
      status: 'PUBLISHED',
      clientQuestion: 'Como está a energia do meu relacionamento atual? Há perspectivas de evolução?',
      focusArea: 'Amor',
      introduction: 'Querida Maria, que alegria fazer esta leitura para você! Vamos ver o que as cartas revelam sobre seu relacionamento atual.',
      generalGuidance: 'As cartas mostram um momento de transição positiva em seu relacionamento. O Cavaleiro traz notícias e novidades que estão a caminho, indicando que mudanças benéficas se aproximam. O Coração, no centro da leitura, confirma que o amor verdadeiro está presente e forte. Por fim, O Sol ilumina o futuro com alegria e sucesso, mostrando que sim, há excelentes perspectivas de evolução para vocês dois.',
      recommendations: '1. Mantenha-se aberta para as novidades que estão chegando\n2. Cultive a comunicação honesta com seu parceiro\n3. Celebre as pequenas conquistas do dia a dia\n4. Confie no amor que vocês construíram juntos',
      closingMessage: 'O caminho está iluminado pelo Sol! Acredite no amor de vocês e permita que ele floresça ainda mais. As energias estão favoráveis para uma evolução linda em seu relacionamento.',
      audioUrl: '/readings/audio-001.mp3',
      readingDate: daysAgo(14),
      publishedAt: daysAgo(13),
      expiresAt: daysFromNow(17),
      createdAt: daysAgo(15),
    },
  });

  // Reading 2: Order 2a - PUBLISHED (Carreira)
  const reading2 = await prisma.reading.create({
    data: {
      orderItemId: orderItem2a.id,
      clientId: client.id,
      title: 'Leitura sobre Carreira',
      status: 'PUBLISHED',
      clientQuestion: 'Devo aceitar a nova proposta de emprego ou permanecer na empresa atual?',
      focusArea: 'Carreira',
      introduction: 'Maria, vamos consultar as cartas sobre esta importante decisão profissional.',
      generalGuidance: 'A Cigana representa você neste momento, mostrando que você está no centro desta decisão e tem o poder de escolha. A Montanha aparece como desafio, indicando que ambas as opções têm seus obstáculos. A Chave traz a solução: a resposta está em olhar para onde você terá mais crescimento a longo prazo. A Estrela mostra que seguir sua inspiração e intuição será fundamental. Os Peixes no resultado indicam prosperidade financeira, especialmente se você escolher o caminho que oferece mais abundância e reconhecimento.',
      recommendations: '1. Analise qual opção oferece mais crescimento profissional\n2. Considere os aspectos financeiros com atenção\n3. Confie em sua intuição - ela está aguçada\n4. Não tenha medo dos desafios - eles fazem parte do crescimento',
      closingMessage: 'A decisão é sua, mas as cartas mostram que a prosperidade virá quando você escolher com coragem e visão de futuro. Confie em si mesma!',
      readingDate: daysAgo(2),
      publishedAt: daysAgo(1),
      expiresAt: daysFromNow(59),
      createdAt: daysAgo(3),
    },
  });

  // Reading 3: Order 2b - PUBLISHED (Saúde)
  const reading3 = await prisma.reading.create({
    data: {
      orderItemId: orderItem2b.id,
      clientId: client.id,
      title: 'Leitura sobre Saúde e Energia',
      status: 'PUBLISHED',
      clientQuestion: 'Como posso melhorar minha energia e disposição neste momento?',
      focusArea: 'Saúde',
      introduction: 'Vamos ver o que as cartas aconselham sobre sua energia vital e bem-estar.',
      generalGuidance: 'A Árvore aparece como carta central, representando sua saúde e vitalidade. Ela pede que você cultive suas raízes - ou seja, cuide dos fundamentos: alimentação, sono, exercícios. O Trevo traz a boa notícia de que pequenas mudanças podem trazer grandes melhorias. O Buquê sugere que buscar alegria e beleza no dia a dia será transformador. O Jardim indica que atividades sociais e ao ar livre farão muito bem. O Sol no resultado mostra que você recuperará plenamente sua energia e vitalidade.',
      recommendations: '1. Estabeleça uma rotina saudável de sono\n2. Inclua mais alimentos naturais em sua dieta\n3. Pratique atividades ao ar livre regularmente\n4. Busque momentos de alegria e leveza\n5. Conecte-se com amigos e natureza',
      closingMessage: 'Sua energia vital está pronta para florescer novamente! Comece com pequenos passos e você verá grandes resultados.',
      readingDate: daysAgo(1),
      publishedAt: hoursAgo(18),
      expiresAt: daysFromNow(59),
      createdAt: daysAgo(3),
    },
  });

  // Reading 4: Order 2c - IN_PROGRESS (Família)
  const reading4 = await prisma.reading.create({
    data: {
      orderItemId: orderItem2c.id,
      clientId: client.id,
      title: 'Leitura sobre Conflito Familiar',
      status: 'IN_PROGRESS',
      clientQuestion: 'Qual é a melhor forma de resolver o conflito familiar que estou vivendo?',
      focusArea: 'Família',
      introduction: null,
      generalGuidance: null,
      recommendations: null,
      closingMessage: null,
      readingDate: null,
      publishedAt: null,
      expiresAt: daysFromNow(57),
      createdAt: daysAgo(3),
    },
  });

  // Reading 5: Order 4a - PUBLISHED (Acompanhamento Semana 1)
  const reading5 = await prisma.reading.create({
    data: {
      orderItemId: orderItem4a.id,
      clientId: client.id,
      title: 'Acompanhamento Mensal - Semana 1',
      status: 'PUBLISHED',
      clientQuestion: 'Como estão as energias para esta semana?',
      focusArea: 'Geral',
      introduction: 'Bem-vinda ao seu acompanhamento mensal, Maria! Vamos ver as energias da primeira semana.',
      generalGuidance: 'Esta semana começa com O Cavaleiro trazendo notícias importantes. A Estrela ilumina seu caminho com esperança e inspiração. O Coração mostra que decisões tomadas com amor serão as mais acertadas.',
      recommendations: '1. Esteja atenta às mensagens e sinais\n2. Mantenha-se esperançosa e positiva\n3. Deixe o amor guiar suas escolhas',
      closingMessage: 'Uma semana promissora se inicia! Aproveite as oportunidades.',
      readingDate: daysAgo(59),
      publishedAt: daysAgo(58),
      expiresAt: daysAgo(28),
      createdAt: daysAgo(60),
    },
  });

  // Reading 6: Order 4b - PUBLISHED (Acompanhamento Semana 2)
  const reading6 = await prisma.reading.create({
    data: {
      orderItemId: orderItem4b.id,
      clientId: client.id,
      title: 'Acompanhamento Mensal - Semana 2',
      status: 'PUBLISHED',
      clientQuestion: 'O que preciso saber para esta segunda semana?',
      focusArea: 'Geral',
      introduction: 'Segunda semana do seu acompanhamento mensal!',
      generalGuidance: 'Os Caminhos aparecem pedindo uma decisão importante. A Chave indica que a solução está mais próxima do que imagina. O Sol garante um desfecho positivo.',
      recommendations: '1. Não tenha medo de decidir\n2. Confie em sua intuição\n3. O sucesso está garantido',
      closingMessage: 'Escolha com confiança - você está no caminho certo!',
      readingDate: daysAgo(52),
      publishedAt: daysAgo(51),
      expiresAt: daysAgo(21),
      createdAt: daysAgo(53),
    },
  });

  // Reading 7: Order 4c - PUBLISHED (Acompanhamento Semana 3)
  const reading7 = await prisma.reading.create({
    data: {
      orderItemId: orderItem4c.id,
      clientId: client.id,
      title: 'Acompanhamento Mensal - Semana 3',
      status: 'PUBLISHED',
      clientQuestion: 'Quais são os desafios da terceira semana?',
      focusArea: 'Geral',
      introduction: 'Terceira semana - vamos ver os desafios e oportunidades!',
      generalGuidance: 'A Montanha surge como desafio temporário. A Âncora pede persistência. O Trevo traz a sorte necessária para superar obstáculos.',
      recommendations: '1. Seja persistente diante dos desafios\n2. Mantenha a calma e a paciência\n3. A sorte está ao seu lado',
      closingMessage: 'Os obstáculos são temporários. Continue firme!',
      readingDate: daysAgo(45),
      publishedAt: daysAgo(44),
      expiresAt: daysAgo(14),
      createdAt: daysAgo(46),
    },
  });

  // Reading 8: Order 4d - PUBLISHED (Acompanhamento Semana 4)
  const reading8 = await prisma.reading.create({
    data: {
      orderItemId: orderItem4d.id,
      clientId: client.id,
      title: 'Acompanhamento Mensal - Semana 4',
      status: 'PUBLISHED',
      clientQuestion: 'Como encerro este mês da melhor forma?',
      focusArea: 'Geral',
      introduction: 'Última semana do acompanhamento - vamos fechar com chave de ouro!',
      generalGuidance: 'O Buquê traz celebração e alegria. Os Peixes indicam abundância chegando. O Sol ilumina o encerramento deste ciclo mensal com sucesso.',
      recommendations: '1. Celebre suas conquistas do mês\n2. Agradeça pela abundância\n3. Prepare-se para novos inícios',
      closingMessage: 'Que mês maravilhoso! Você cresceu e prosperou. Parabéns!',
      readingDate: daysAgo(38),
      publishedAt: daysAgo(37),
      expiresAt: daysAgo(7),
      createdAt: daysAgo(39),
    },
  });

  // Reading 9: Order 5 - PUBLISHED (Ano Novo - 12 meses)
  const reading9 = await prisma.reading.create({
    data: {
      orderItemId: orderItem5.id,
      clientId: client.id,
      title: 'Leitura de Ano Novo - 12 Meses',
      status: 'PUBLISHED',
      clientQuestion: 'Quais são as previsões e orientações para os próximos 12 meses?',
      focusArea: 'Anual',
      introduction: 'Maria, que honra fazer sua leitura anual! Vamos ver mês a mês o que o universo reserva para você.',
      generalGuidance: 'Seu ano será marcado por transformações positivas, crescimento pessoal e muitas bênçãos. Cada mês traz suas lições e oportunidades. Janeiro começa com O Cavaleiro trazendo novidades. Fevereiro com O Coração convida ao amor. Março com A Estrela traz inspiração. Abril com A Chave abre portas importantes. Maio com Os Peixes traz abundância. Junho com O Sol ilumina conquistas. Julho com A Lua aprofunda intuição. Agosto com O Trevo traz sorte. Setembro com O Buquê celebra alegrias. Outubro com A Âncora estabiliza. Novembro com Os Lírios traz paz. Dezembro com A Cruz fecha ciclos importantes.',
      recommendations: '1. Confie no processo do ano\n2. Cada mês tem seu presente\n3. Mantenha-se aberta e receptiva\n4. Celebre cada etapa do caminho\n5. Agradeça pelas bênçãos recebidas',
      closingMessage: 'Que ano abençoado se desenha para você, Maria! Caminhe com fé, amor e gratidão. O universo conspira a seu favor!',
      audioUrl: '/readings/audio-ano-novo.mp3',
      readingDate: daysAgo(29),
      publishedAt: daysAgo(28),
      expiresAt: daysFromNow(337),
      createdAt: daysAgo(30),
    },
  });

  console.log('   ✅ 9 readings created\n');

  // =============================================
  // 8d. CREATE READING CARDS
  // =============================================
  console.log('🃏 Creating reading cards...');

  // Fetch cigano cards needed
  const card1 = await prisma.ciganoCard.findUnique({ where: { number: 1 } }); // Cavaleiro
  const card2 = await prisma.ciganoCard.findUnique({ where: { number: 2 } }); // Trevo
  const card5 = await prisma.ciganoCard.findUnique({ where: { number: 5 } }); // Árvore
  const card9 = await prisma.ciganoCard.findUnique({ where: { number: 9 } }); // Buquê
  const card16 = await prisma.ciganoCard.findUnique({ where: { number: 16 } }); // Estrela
  const card20 = await prisma.ciganoCard.findUnique({ where: { number: 20 } }); // Jardim
  const card21 = await prisma.ciganoCard.findUnique({ where: { number: 21 } }); // Montanha
  const card24 = await prisma.ciganoCard.findUnique({ where: { number: 24 } }); // Coração
  const card29 = await prisma.ciganoCard.findUnique({ where: { number: 29 } }); // Cigana
  const card31 = await prisma.ciganoCard.findUnique({ where: { number: 31 } }); // Sol
  const card32 = await prisma.ciganoCard.findUnique({ where: { number: 32 } }); // Lua
  const card33 = await prisma.ciganoCard.findUnique({ where: { number: 33 } }); // Chave
  const card34 = await prisma.ciganoCard.findUnique({ where: { number: 34 } }); // Peixes
  const card35 = await prisma.ciganoCard.findUnique({ where: { number: 35 } }); // Âncora
  const card30 = await prisma.ciganoCard.findUnique({ where: { number: 30 } }); // Lírios
  const card36 = await prisma.ciganoCard.findUnique({ where: { number: 36 } }); // Cruz
  const card22 = await prisma.ciganoCard.findUnique({ where: { number: 22 } }); // Caminhos

  // Reading 1 Cards (3 cartas)
  await prisma.readingCard.createMany({
    data: [
      {
        readingId: reading1.id,
        cardId: card1!.id,
        position: 1,
        positionName: 'Passado',
        isReversed: false,
        interpretation: 'O Cavaleiro no passado mostra que você já vinha recebendo sinais e mensagens sobre mudanças no relacionamento. Essas novidades começaram a se formar há algum tempo.',
      },
      {
        readingId: reading1.id,
        cardId: card24!.id,
        position: 2,
        positionName: 'Presente',
        isReversed: false,
        interpretation: 'O Coração no presente confirma que o amor verdadeiro está vivo e forte entre vocês agora. Este é um momento de reconhecer e valorizar os sentimentos que compartilham.',
      },
      {
        readingId: reading1.id,
        cardId: card31!.id,
        position: 3,
        positionName: 'Futuro',
        isReversed: false,
        interpretation: 'O Sol no futuro é extremamente positivo! Indica que sim, há excelentes perspectivas de evolução. Vocês caminham para uma fase de alegria, sucesso e realização juntos.',
      },
    ],
  });

  // Reading 2 Cards (5 cartas)
  await prisma.readingCard.createMany({
    data: [
      {
        readingId: reading2.id,
        cardId: card29!.id,
        position: 1,
        positionName: 'Você',
        isReversed: false,
        interpretation: 'A Cigana representa você no centro desta decisão, mostrando que você tem autonomia e poder de escolha. Esta decisão está em suas mãos.',
      },
      {
        readingId: reading2.id,
        cardId: card21!.id,
        position: 2,
        positionName: 'Desafio',
        isReversed: false,
        interpretation: 'A Montanha como desafio indica que ambas as opções têm seus obstáculos. Não existe escolha sem dificuldades, mas isso não deve paralisá-la.',
      },
      {
        readingId: reading2.id,
        cardId: card33!.id,
        position: 3,
        positionName: 'Conselho',
        isReversed: false,
        interpretation: 'A Chave aconselha que você olhe para onde terá mais crescimento e realização a longo prazo. A resposta certa está na opção que abre mais portas para seu futuro.',
      },
      {
        readingId: reading2.id,
        cardId: card16!.id,
        position: 4,
        positionName: 'Caminho',
        isReversed: false,
        interpretation: 'A Estrela ilumina seu caminho, mostrando que seguir sua inspiração e intuição será fundamental. Confie nos sinais que o universo está enviando.',
      },
      {
        readingId: reading2.id,
        cardId: card34!.id,
        position: 5,
        positionName: 'Resultado',
        isReversed: false,
        interpretation: 'Os Peixes no resultado indicam prosperidade financeira. Escolha o caminho que oferece mais abundância, reconhecimento e satisfação profissional.',
      },
    ],
  });

  // Reading 3 Cards (5 cartas)
  await prisma.readingCard.createMany({
    data: [
      {
        readingId: reading3.id,
        cardId: card5!.id,
        position: 1,
        positionName: 'Situação Atual',
        isReversed: false,
        interpretation: 'A Árvore representa sua saúde vital. Ela pede que você cuide das raízes - alimentação, sono, exercícios. Volte aos fundamentos do bem-estar.',
      },
      {
        readingId: reading3.id,
        cardId: card2!.id,
        position: 2,
        positionName: 'Oportunidade',
        isReversed: false,
        interpretation: 'O Trevo traz a boa notícia de que pequenas mudanças podem trazer grandes melhorias. A sorte está ao seu lado nesta jornada de renovação.',
      },
      {
        readingId: reading3.id,
        cardId: card9!.id,
        position: 3,
        positionName: 'Ação',
        isReversed: false,
        interpretation: 'O Buquê sugere que buscar alegria e beleza no dia a dia será transformador. Celebre a vida e encontre prazer nas pequenas coisas.',
      },
      {
        readingId: reading3.id,
        cardId: card20!.id,
        position: 4,
        positionName: 'Apoio',
        isReversed: false,
        interpretation: 'O Jardim indica que atividades sociais e ao ar livre farão muito bem. Conecte-se com amigos e natureza para renovar suas energias.',
      },
      {
        readingId: reading3.id,
        cardId: card31!.id,
        position: 5,
        positionName: 'Resultado',
        isReversed: false,
        interpretation: 'O Sol garante que você recuperará plenamente sua energia e vitalidade. Um futuro radiante e cheio de disposição aguarda você.',
      },
    ],
  });

  // Reading 5-8 Cards (3 cartas cada - acompanhamento mensal)
  await prisma.readingCard.createMany({
    data: [
      // Semana 1
      { readingId: reading5.id, cardId: card1!.id, position: 1, positionName: 'Energia Principal', isReversed: false, interpretation: 'O Cavaleiro traz notícias e movimento para sua semana.' },
      { readingId: reading5.id, cardId: card16!.id, position: 2, positionName: 'Influência', isReversed: false, interpretation: 'A Estrela ilumina com esperança e inspiração.' },
      { readingId: reading5.id, cardId: card24!.id, position: 3, positionName: 'Orientação', isReversed: false, interpretation: 'O Coração guia suas decisões com amor.' },
      // Semana 2
      { readingId: reading6.id, cardId: card22!.id, position: 1, positionName: 'Energia Principal', isReversed: false, interpretation: 'Os Caminhos pedem uma decisão importante.' },
      { readingId: reading6.id, cardId: card33!.id, position: 2, positionName: 'Influência', isReversed: false, interpretation: 'A Chave indica que a solução está próxima.' },
      { readingId: reading6.id, cardId: card31!.id, position: 3, positionName: 'Orientação', isReversed: false, interpretation: 'O Sol garante um desfecho positivo.' },
      // Semana 3
      { readingId: reading7.id, cardId: card21!.id, position: 1, positionName: 'Energia Principal', isReversed: false, interpretation: 'A Montanha surge como desafio temporário.' },
      { readingId: reading7.id, cardId: card35!.id, position: 2, positionName: 'Influência', isReversed: false, interpretation: 'A Âncora pede persistência e estabilidade.' },
      { readingId: reading7.id, cardId: card2!.id, position: 3, positionName: 'Orientação', isReversed: false, interpretation: 'O Trevo traz a sorte necessária para superar.' },
      // Semana 4
      { readingId: reading8.id, cardId: card9!.id, position: 1, positionName: 'Energia Principal', isReversed: false, interpretation: 'O Buquê traz celebração e alegria.' },
      { readingId: reading8.id, cardId: card34!.id, position: 2, positionName: 'Influência', isReversed: false, interpretation: 'Os Peixes indicam abundância chegando.' },
      { readingId: reading8.id, cardId: card31!.id, position: 3, positionName: 'Orientação', isReversed: false, interpretation: 'O Sol ilumina o encerramento com sucesso.' },
    ],
  });

  // Reading 9 Cards (12 cartas - uma por mês)
  await prisma.readingCard.createMany({
    data: [
      { readingId: reading9.id, cardId: card1!.id, position: 1, positionName: 'Janeiro', isReversed: false, interpretation: 'Janeiro começa com O Cavaleiro trazendo notícias importantes e movimento. Prepare-se para novidades que mudarão sua perspectiva.' },
      { readingId: reading9.id, cardId: card24!.id, position: 2, positionName: 'Fevereiro', isReversed: false, interpretation: 'Fevereiro é o mês do Coração. O amor estará em evidência - seja no romance, na família ou no amor-próprio.' },
      { readingId: reading9.id, cardId: card16!.id, position: 3, positionName: 'Março', isReversed: false, interpretation: 'Março traz A Estrela com inspiração e esperança renovadas. Um mês para sonhar e planejar o futuro.' },
      { readingId: reading9.id, cardId: card33!.id, position: 4, positionName: 'Abril', isReversed: false, interpretation: 'Abril é marcado pela Chave - portas importantes se abrirão. Soluções chegam e destinos se revelam.' },
      { readingId: reading9.id, cardId: card34!.id, position: 5, positionName: 'Maio', isReversed: false, interpretation: 'Maio traz Os Peixes com abundância financeira. Um mês próspero para seus negócios e finanças.' },
      { readingId: reading9.id, cardId: card31!.id, position: 6, positionName: 'Junho', isReversed: false, interpretation: 'Junho brilha com O Sol - sucesso, alegria e conquistas marcam este mês radiante.' },
      { readingId: reading9.id, cardId: card32!.id, position: 7, positionName: 'Julho', isReversed: false, interpretation: 'Julho é iluminado pela Lua - sua intuição estará aguçada. Confie em seus sonhos e pressentimentos.' },
      { readingId: reading9.id, cardId: card2!.id, position: 8, positionName: 'Agosto', isReversed: false, interpretation: 'Agosto traz O Trevo com sorte e oportunidades inesperadas. Esteja atenta aos sinais.' },
      { readingId: reading9.id, cardId: card9!.id, position: 9, positionName: 'Setembro', isReversed: false, interpretation: 'Setembro celebra com O Buquê - alegrias, convites e momentos felizes em abundância.' },
      { readingId: reading9.id, cardId: card35!.id, position: 10, positionName: 'Outubro', isReversed: false, interpretation: 'Outubro ancora com A Âncora - estabilidade e realização de metas. Sua persistência será recompensada.' },
      { readingId: reading9.id, cardId: card30!.id, position: 11, positionName: 'Novembro', isReversed: false, interpretation: 'Novembro floresce com Os Lírios - paz, harmonia e maturidade. Um mês sereno e equilibrado.' },
      { readingId: reading9.id, cardId: card36!.id, position: 12, positionName: 'Dezembro', isReversed: false, interpretation: 'Dezembro fecha com A Cruz - ciclos importantes se encerram, preparando terreno para novos começos. Um mês de fé e transformação espiritual.' },
    ],
  });

  console.log('   ✅ Reading cards created\n');

  // =============================================
  // 8e. CREATE APPOINTMENTS
  // =============================================
  console.log('📅 Creating appointments...');

  // Appointment 1: SCHEDULED (Futuro - vinculado ao order3)
  await prisma.appointment.create({
    data: {
      orderItemId: orderItem3.id,
      clientId: client.id,
      scheduledDate: daysFromNow(3),
      startTime: '14:00',
      endTime: '14:30',
      durationMinutes: 30,
      status: 'SCHEDULED',
      clientNotes: 'Prefiro falar sobre questões de carreira',
      meetingUrl: 'https://meet.example.com/maria-20260108',
      meetingPassword: 'tarot2026',
      createdAt: daysAgo(7),
    },
  });

  // Appointment 2: CONFIRMED (Futuro - sem order)
  await prisma.appointment.create({
    data: {
      clientId: client.id,
      scheduledDate: daysFromNow(7),
      startTime: '10:00',
      endTime: '11:00',
      durationMinutes: 60,
      status: 'CONFIRMED',
      confirmedAt: daysAgo(2),
      reminderSentAt: daysAgo(1),
      meetingUrl: 'https://meet.example.com/maria-20260112',
      meetingPassword: 'tarot2026',
      createdAt: daysAgo(10),
    },
  });

  // Appointment 3: COMPLETED (Passado)
  await prisma.appointment.create({
    data: {
      clientId: client.id,
      scheduledDate: daysAgo(20),
      startTime: '15:00',
      endTime: '15:30',
      durationMinutes: 30,
      status: 'COMPLETED',
      adminNotes: 'Ótima sessão, cliente muito satisfeita. Focamos em questões de relacionamento.',
      confirmedAt: daysAgo(22),
      reminderSentAt: daysAgo(21),
      meetingUrl: 'https://meet.example.com/maria-20251216',
      createdAt: daysAgo(25),
    },
  });

  // Appointment 4: CANCELLED (Passado)
  await prisma.appointment.create({
    data: {
      clientId: client.id,
      scheduledDate: daysAgo(45),
      startTime: '16:00',
      endTime: '16:30',
      durationMinutes: 30,
      status: 'CANCELLED',
      cancelledAt: daysAgo(46),
      cancellationReason: 'Cliente solicitou reagendamento por motivo pessoal',
      createdAt: daysAgo(50),
    },
  });

  console.log('   ✅ 4 appointments created\n');

  // =============================================
  // 8f. CREATE CLIENT TESTIMONIALS
  // =============================================
  console.log('💬 Creating client testimonials...');

  await prisma.testimonial.createMany({
    data: [
      {
        clientId: client.id,
        clientName: 'Maria S.',
        clientAvatarUrl: '/avatars/client-maria.jpg',
        content: 'A leitura do profissional me ajudou muito em um momento de decisão importante na carreira. As cartas trouxeram clareza e eu consegui tomar a melhor decisão para minha vida profissional. Recomendo muito!',
        rating: 5,
        isApproved: true,
        isFeatured: true,
        displayOrder: 5,
        createdAt: daysAgo(30),
      },
      {
        clientId: client.id,
        clientName: 'Maria S.',
        clientAvatarUrl: '/avatars/client-maria.jpg',
        content: 'Segunda consulta e continuo impressionada com a precisão das leituras. A Profissional tem um dom especial para interpretar as cartas do Tarot Cigano. Sempre saio das sessões mais leve e confiante.',
        rating: 5,
        isApproved: true,
        isFeatured: false,
        displayOrder: 6,
        createdAt: daysAgo(10),
      },
    ],
  });

  console.log('   ✅ 2 client testimonials created\n');

  // =============================================
  // 8g. CREATE NOTIFICATIONS
  // =============================================
  console.log('🔔 Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: client.id,
        title: 'Nova leitura disponível',
        message: 'Sua leitura sobre amor está pronta! Acesse agora para ver o que as cartas revelaram.',
        type: 'READING_PUBLISHED',
        referenceId: reading1.id,
        isRead: false,
        createdAt: daysAgo(1),
      },
      {
        userId: client.id,
        title: 'Consulta confirmada',
        message: 'Sua consulta para 08/01/2026 às 14:00 foi confirmada. Preparamos um espaço especial para você!',
        type: 'APPOINTMENT_CONFIRMED',
        referenceId: orderItem3.id,
        isRead: true,
        readAt: hoursAgo(6),
        createdAt: daysAgo(2),
      },
      {
        userId: client.id,
        title: 'Lembrete: Consulta em breve',
        message: 'Lembrete: Você tem uma consulta agendada para daqui a 3 dias, dia 08/01 às 14:00. Nos vemos em breve!',
        type: 'APPOINTMENT_REMINDER',
        isRead: false,
        createdAt: hoursAgo(12),
      },
      {
        userId: client.id,
        title: 'Pedido confirmado',
        message: 'Seu pedido #ORD-2025-001 foi confirmado com sucesso! Em breve sua leitura estará pronta.',
        type: 'ORDER_CONFIRMED',
        referenceId: order1.id,
        isRead: true,
        readAt: daysAgo(14),
        createdAt: daysAgo(15),
      },
      {
        userId: client.id,
        title: 'Pagamento aprovado',
        message: 'Seu pagamento de R$ 127,00 foi aprovado. Obrigada pela confiança!',
        type: 'PAYMENT_APPROVED',
        referenceId: order2.id,
        isRead: true,
        readAt: daysAgo(2),
        createdAt: daysAgo(3),
      },
      {
        userId: client.id,
        title: 'Seu depoimento foi publicado',
        message: 'Obrigada por compartilhar sua experiência conosco! Seu depoimento foi publicado e ajudará outras pessoas.',
        type: 'TESTIMONIAL_APPROVED',
        isRead: true,
        readAt: daysAgo(29),
        createdAt: daysAgo(30),
      },
      {
        userId: client.id,
        title: 'Bem-vinda, Maria!',
        message: 'É um prazer receber você aqui! Explore nossos serviços de Tarot Cigano e descubra o que as cartas têm a revelar.',
        type: 'WELCOME',
        isRead: true,
        readAt: daysAgo(89),
        createdAt: daysAgo(90),
      },
      {
        userId: client.id,
        title: 'Leitura em andamento',
        message: 'Sua leitura sobre o conflito familiar está sendo preparada com todo carinho. Em breve estará disponível!',
        type: 'READING_IN_PROGRESS',
        referenceId: reading4.id,
        isRead: false,
        createdAt: daysAgo(2),
      },
    ],
  });

  console.log('   ✅ 8 notifications created\n');

  console.log('✅ Test data for client created successfully!\n');
  console.log('📊 Client Statistics:');
  console.log('   - Total Orders: 5');
  console.log('   - Total Spent: R$ 1.162,00');
  console.log('   - Readings: 9 (6 published, 1 in progress, 2 pending)');
  console.log('   - Appointments: 4 (2 upcoming, 1 completed, 1 cancelled)');
  console.log('   - Testimonials: 2');
  console.log('   - Notifications: 8 (4 unread)\n');

  console.log('📋 Summary:');
  console.log('   - 1 Admin user (admin@example.com / Admin@123)');
  console.log('   - 1 Client user (client@example.com / Client@123)');
  console.log('   - 36 Cigano Tarot cards');
  console.log('   - 4 Product categories');
  console.log('   - 6 Products');
  console.log('   - Schedule settings configured');
  console.log('   - Site settings configured');
  console.log('   - 6 Sample testimonials (4 general + 2 from client)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
