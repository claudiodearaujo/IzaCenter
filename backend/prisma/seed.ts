// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // =============================================
  // 1. CREATE ADMIN USER
  // =============================================
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@izabelatarot.com.br' },
    update: {},
    create: {
      email: 'admin@izabelatarot.com.br',
      passwordHash: adminPassword,
      fullName: 'Izabela Admin',
      role: 'ADMIN',
      phone: '(11) 99999-9999',
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}\n`);

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
      imageUrl: '/cards/01-cavaleiro.png',
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
      imageUrl: '/cards/02-trevo.png',
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
      imageUrl: '/cards/03-navio.png',
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
      imageUrl: '/cards/04-casa.png',
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
      imageUrl: '/cards/05-arvore.png',
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
      imageUrl: '/cards/06-nuvens.png',
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
      imageUrl: '/cards/07-serpente.png',
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
      imageUrl: '/cards/08-caixao.png',
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
      imageUrl: '/cards/09-buque.png',
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
      imageUrl: '/cards/10-foice.png',
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
      imageUrl: '/cards/11-chicote.png',
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
      imageUrl: '/cards/12-passaros.png',
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
      imageUrl: '/cards/13-crianca.png',
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
      imageUrl: '/cards/14-raposa.png',
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
      imageUrl: '/cards/15-urso.png',
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
      imageUrl: '/cards/16-estrela.png',
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
      imageUrl: '/cards/17-cegonha.png',
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
      imageUrl: '/cards/18-cachorro.png',
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
      imageUrl: '/cards/19-torre.png',
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
      imageUrl: '/cards/20-jardim.png',
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
      imageUrl: '/cards/21-montanha.png',
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
      imageUrl: '/cards/22-caminhos.png',
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
      imageUrl: '/cards/23-ratos.png',
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
      imageUrl: '/cards/24-coracao.png',
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
      imageUrl: '/cards/25-anel.png',
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
      imageUrl: '/cards/26-livro.png',
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
      imageUrl: '/cards/27-carta.png',
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
      imageUrl: '/cards/28-cigano.png',
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
      imageUrl: '/cards/29-cigana.png',
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
      imageUrl: '/cards/30-lirios.png',
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
      imageUrl: '/cards/31-sol.png',
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
      imageUrl: '/cards/32-lua.png',
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
      imageUrl: '/cards/33-chave.png',
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
      imageUrl: '/cards/34-peixes.png',
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
      imageUrl: '/cards/35-ancora.png',
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
      imageUrl: '/cards/36-cruz.png',
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
        siteName: 'Izabela Tarot',
        siteDescription: 'Leituras de Tarot Cigano com Izabela',
        email: 'contato@izabelatarot.com.br',
        phone: '(11) 99999-9999',
        whatsapp: '5511999999999',
        address: 'São Paulo, SP - Brasil',
      },
    },
    {
      key: 'social',
      value: {
        instagram: 'https://instagram.com/izabelatarot',
        facebook: 'https://facebook.com/izabelatarot',
        youtube: 'https://youtube.com/@izabelatarot',
        tiktok: '',
      },
    },
    {
      key: 'seo',
      value: {
        metaTitle: 'Izabela Tarot - Leituras de Tarot Cigano Online',
        metaDescription: 'Consultas e leituras de Tarot Cigano online com Izabela. Orientação espiritual para amor, carreira e vida.',
        keywords: ['tarot cigano', 'leitura de tarot', 'consulta online', 'tarot online', 'izabela tarot'],
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
      content: 'A leitura da Izabela foi incrível! Ela descreveu minha situação com detalhes que eu não tinha contado. As orientações me ajudaram muito a tomar uma decisão importante.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      clientName: 'Ana Paula R.',
      content: 'Fiz a consulta online e foi uma experiência transformadora. A Izabela é muito atenciosa e as cartas trouxeram clareza para questões que me angustiavam há meses.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      clientName: 'Juliana M.',
      content: 'Já fiz várias leituras e sempre saio impressionada. O Tarot Cigano nas mãos da Izabela é uma ferramenta poderosa de autoconhecimento.',
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

  console.log('✨ Database seed completed successfully!\n');
  console.log('📋 Summary:');
  console.log('   - 1 Admin user (admin@izabelatarot.com.br / Admin@123)');
  console.log('   - 36 Cigano Tarot cards');
  console.log('   - 4 Product categories');
  console.log('   - 6 Products');
  console.log('   - Schedule settings configured');
  console.log('   - Site settings configured');
  console.log('   - 4 Sample testimonials');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
