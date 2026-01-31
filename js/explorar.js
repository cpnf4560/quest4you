/**
 * Quest4You - Explorar Page
 * Artigos, Fórum, Chat Público, Mensagens Privadas
 */

// ================================
// FIRESTORE COLLECTIONS
// ================================
const COLLECTION_ARTICLES = "quest4you_articles";
const COLLECTION_COMMENTS = "quest4you_comments";
const COLLECTION_TOPICS = "quest4you_topics";
const COLLECTION_REPLIES = "quest4you_replies";
const COLLECTION_CHAT = "quest4you_chat";
const COLLECTION_MESSAGES = "quest4you_messages";
const COLLECTION_CONVERSATIONS = "quest4you_conversations";

// ================================
// STATE
// ================================
let currentUser = null;
let currentUserNickname = null; // User's public nickname
let currentUserEmoji = '👤'; // User's emoji avatar
let currentTab = 'artigos';
let currentRoom = 'geral';
let currentForumCategory = 'geral';
let currentArticleCategory = 'all';
let currentArticleId = null;
let currentTopicId = null;
let currentConversationId = null;
let chatUnsubscribe = null;
let messagesUnsubscribe = null;
let conversationsUnsubscribe = null;
let isAdmin = false;
let isEditMode = false;
let customArticles = []; // Articles from Firestore (admin-created)

// ================================
// ARTICLES DATA (Static for now)
// ================================
const articlesData = [
  {
    id: "cuckold-dinamicas",
    title: "Dinâmicas Cuckold/Cuckquean: Guia Completo",
    excerpt: "Entende as diferentes dinâmicas de voyeurismo e partilha: Cuckold, Hotwife, Stag, Bull, Vixen e mais.",
    category: "dinamicas",
    categoryLabel: "Dinâmicas",
    icon: "👀",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop",
    readTime: 12,
    content: `
      <h3>O que são as dinâmicas de Cuckold/Cuckquean?</h3>
      <p>Estas dinâmicas envolvem casais onde um dos parceiros (ou ambos) sentem excitação ao ver ou saber que o outro está com alguém. Existem várias variações:</p>
      
      <h4>🐂 Bull / Vixen</h4>
      <p>O <strong>Bull</strong> é o homem dominante que se envolve com a esposa/namorada de outro homem. A <strong>Vixen</strong> é a versão feminina - uma mulher dominante que se envolve com o marido de outra mulher.</p>
      
      <h4>👀 Cuckold / Cuckquean</h4>
      <p>O <strong>Cuckold</strong> é o homem que sente prazer ao ver a sua parceira com outro. A <strong>Cuckquean</strong> é a versão feminina. Frequentemente inclui elementos de humilhação consensual.</p>
      
      <h4>🦌 Stag / Hotwife</h4>
      <p>Semelhante ao cuckold, mas sem humilhação. O <strong>Stag</strong> tem orgulho na sua <strong>Hotwife</strong> e gosta de a partilhar. É mais sobre compersion e voyeurismo.</p>
      
      <h4>🌟 Trophy</h4>
      <p>O <strong>Trophy</strong> é alguém exibido com orgulho pelo parceiro, sendo "oferecido" a outros como prova do seu valor.</p>
      
      <h3>Comunicação é Fundamental</h3>
      <p>Estas dinâmicas requerem:</p>
      <ul>
        <li>Confiança absoluta entre parceiros</li>
        <li>Limites claros e respeitados</li>
        <li>Comunicação constante antes, durante e depois</li>
        <li>Safe words definidas</li>
      </ul>
      
      <h3>Como Começar?</h3>
      <p>Se tens curiosidade, começa por:</p>
      <ol>
        <li>Conversar abertamente com o teu parceiro</li>
        <li>Ler sobre experiências de outros casais</li>
        <li>Definir limites claros</li>
        <li>Começar devagar (fantasias, sexting, etc.)</li>
      </ol>
    `
  },
  {
    id: "brinquedos-casais",
    title: "Brinquedos Sexuais para Casais: Guia Iniciante",
    excerpt: "Descobre os melhores brinquedos para experimentar a dois e como introduzir este tema na relação.",
    category: "brinquedos",
    categoryLabel: "Brinquedos",
    icon: "🎲",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=400&fit=crop",
    readTime: 8,
    content: `
      <h3>Porque usar brinquedos?</h3>
      <p>Brinquedos sexuais podem adicionar variedade, intensidade e novas sensações à vida sexual do casal. Não substituem o parceiro - complementam!</p>
      
      <h4>Para Iniciantes</h4>
      <ul>
        <li><strong>Vibrador bullet:</strong> Pequeno, discreto e versátil</li>
        <li><strong>Anel peniano vibratório:</strong> Prazer para ambos</li>
        <li><strong>Dados eróticos:</strong> Adiciona aleatoriedade</li>
        <li><strong>Vendas:</strong> Desperta outros sentidos</li>
      </ul>
      
      <h4>Para Casais Mais Experientes</h4>
      <ul>
        <li><strong>Vibradores para casais (We-Vibe, etc.):</strong> Usados durante a penetração</li>
        <li><strong>Controlos remotos:</strong> Um controla o prazer do outro</li>
        <li><strong>Plugs anais:</strong> Para explorar novas zonas</li>
        <li><strong>Máquinas de sexo:</strong> Para os mais aventureiros</li>
      </ul>
      
      <h3>Dicas de Introdução</h3>
      <ol>
        <li>Escolham juntos - visitar uma loja ou site a dois</li>
        <li>Comecem simples - não compliquem no início</li>
        <li>Sem pressão - é para divertir, não obrigar</li>
        <li>Higiene - limpem sempre antes e depois</li>
      </ol>
    `
  },
  {
    id: "tasklists-sexuais",
    title: "Tasklists Sexuais: Aventuras Planeadas",
    excerpt: "Como criar listas de tarefas eróticas para manter a chama acesa e explorar fantasias.",
    category: "dicas",
    categoryLabel: "Dicas",
    icon: "📋",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
    readTime: 6,
    content: `
      <h3>O que são Tasklists Sexuais?</h3>
      <p>Listas de "tarefas" eróticas que o casal cria para cumprir ao longo do tempo. Podem ser diárias, semanais ou especiais.</p>
      
      <h4>Exemplos de Tarefas Leves</h4>
      <ul>
        <li>Enviar uma mensagem provocadora</li>
        <li>Fazer uma massagem sensual de 10 minutos</li>
        <li>Beijar apaixonadamente durante 2 minutos</li>
        <li>Dizer 3 coisas que adoras no corpo do parceiro</li>
      </ul>
      
      <h4>Exemplos de Tarefas Picantes</h4>
      <ul>
        <li>Usar roupa interior nova</li>
        <li>Roleplay de 15 minutos</li>
        <li>Experimentar uma posição nova</li>
        <li>Sexo num local diferente da casa</li>
      </ul>
      
      <h3>Apps Úteis</h3>
      <p>Existem várias apps para casais que incluem funcionalidades de tasklists:</p>
      <ul>
        <li>Desire - Jogo de desafios</li>
        <li>Kindu - Match de fantasias</li>
        <li>Spicer - Desafios e ideias</li>
      </ul>
    `
  },
  {
    id: "turismo-adulto",
    title: "Turismo Adulto: Destinos para Casais Liberais",
    excerpt: "Conhece os melhores destinos de turismo adulto no mundo e em Portugal.",
    category: "viagens",
    categoryLabel: "Viagens",
    icon: "✈️",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    readTime: 10,
    content: `
      <h3>Destinos Populares</h3>
      
      <h4>🇲🇽 México - Cancun/Riviera Maya</h4>
      <p>Resorts como Desire e Temptation são famosos mundialmente. Lifestyle, festas e ambiente liberal.</p>
      
      <h4>🇯🇲 Jamaica - Hedonism II</h4>
      <p>O resort lifestyle mais conhecido do mundo. Tudo incluído, praias nudistas, festas temáticas.</p>
      
      <h4>🇫🇷 França - Cap d'Agde</h4>
      <p>A famosa "cidade nudista" do sul de França. Ambiente liberal, clubes, praias e muito mais. Fica na região de Occitânia, junto ao Mediterrâneo.</p>
      
      <h4>🇵🇹 Portugal</h4>
      <p>Clubes de swing em Lisboa, Porto e Algarve. Praias nudistas como Meco, Bela Vista, Ilha Deserta.</p>
      
      <h3>Dicas para Primeira Viagem</h3>
      <ul>
        <li>Pesquisem bem o resort/destino</li>
        <li>Definam limites antes de ir</li>
        <li>Não sintam pressão - podem só observar</li>
        <li>Respeitem sempre o "não"</li>
      </ul>
    `
  },
  {
    id: "praias-nudistas-portugal",
    title: "Praias Nudistas em Portugal: Guia Completo",
    excerpt: "Descobre as melhores praias naturistas de norte a sul do país.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    icon: "🏖️",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
    readTime: 7,
    content: `
      <h3>Praias Oficiais</h3>
      <p>Portugal tem várias praias naturistas oficiais:</p>
      
      <h4>Zona Norte</h4>
      <ul>
        <li><strong>Praia do Meco (Sesimbra):</strong> A mais famosa, ambiente liberal</li>
      </ul>
      
      <h4>Zona Centro</h4>
      <ul>
        <li><strong>Praia da Bela Vista (Costa da Caparica):</strong> Perto de Lisboa</li>
        <li><strong>Praia do Salto (Lourinhã):</strong> Mais tranquila</li>
      </ul>
      
      <h4>Algarve</h4>
      <ul>
        <li><strong>Ilha Deserta (Faro):</strong> Acesso só de barco, paradisíaca</li>
        <li><strong>Praia de Adegas (Odeceixe):</strong> Pequena e secreta</li>
        <li><strong>Praia dos Alteirinhos (Zambujeira):</strong> Beleza natural</li>
      </ul>
      
      <h3>Etiqueta Naturista</h3>
      <ul>
        <li>Leva uma toalha para sentar</li>
        <li>Não olhes fixamente para outros</li>
        <li>Nada de fotos sem consentimento</li>
        <li>Comportamento sexual é proibido</li>
      </ul>
    `
  },
  {
    id: "massagem-tantrica",
    title: "Massagem Tântrica: Yoni e Lingam",
    excerpt: "Aprende os fundamentos da massagem tântrica e como aplicar com o teu parceiro.",
    category: "dicas",
    categoryLabel: "Dicas",
    icon: "💆",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
    readTime: 15,
    content: `
      <h3>O que é Massagem Tântrica?</h3>
      <p>Uma forma de massagem que combina técnicas de relaxamento com estimulação sensual. O objetivo não é o orgasmo, mas a conexão e o prazer prolongado.</p>
      
      <h4>🌸 Massagem Yoni (Feminina)</h4>
      <p>Yoni significa "portal sagrado" em sânscrito. A massagem yoni foca-se nos genitais femininos com respeito e intenção de cura e prazer.</p>
      <ul>
        <li>Ambiente calmo com velas e música</li>
        <li>Começar pelo corpo todo</li>
        <li>Respiração sincronizada</li>
        <li>Toques suaves e progressivos</li>
        <li>Sem pressa ou expectativa de orgasmo</li>
      </ul>
      
      <h4>🌿 Massagem Lingam (Masculina)</h4>
      <p>Lingam significa "varinha de luz". Foca-se nos genitais masculinos para prazer e cura.</p>
      <ul>
        <li>Massagear primeiro pernas e abdómen</li>
        <li>Usar óleo de coco ou específico</li>
        <li>Variar ritmos e técnicas</li>
        <li>Incluir períneo e testículos</li>
        <li>Edge play - aproximar do orgasmo sem culminar</li>
      </ul>
      
      <h3>Benefícios</h3>
      <ul>
        <li>Maior intimidade e conexão</li>
        <li>Redução de ansiedade sexual</li>
        <li>Descoberta de novas zonas erógenas</li>
        <li>Orgasmos mais intensos</li>
      </ul>
    `
  },
  {
    id: "anorgasmia",
    title: "Anorgasmia: Quando o Orgasmo Não Vem",
    excerpt: "Entende as causas e soluções para a dificuldade em atingir o orgasmo.",
    category: "saude",
    categoryLabel: "Saúde",
    icon: "🩺",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    readTime: 9,
    content: `
      <h3>O que é Anorgasmia?</h3>
      <p>A dificuldade persistente em atingir o orgasmo, mesmo com estimulação adequada. Afeta mais mulheres, mas homens também podem sofrer.</p>
      
      <h4>Causas Físicas</h4>
      <ul>
        <li>Medicamentos (antidepressivos, anti-hipertensivos)</li>
        <li>Alterações hormonais</li>
        <li>Doenças neurológicas</li>
        <li>Cirurgias pélvicas</li>
      </ul>
      
      <h4>Causas Psicológicas</h4>
      <ul>
        <li>Ansiedade e stress</li>
        <li>Traumas passados</li>
        <li>Problemas de relacionamento</li>
        <li>Educação sexual repressiva</li>
        <li>Baixa autoestima</li>
      </ul>
      
      <h3>Soluções</h3>
      <ol>
        <li><strong>Terapia sexual:</strong> Com profissional especializado</li>
        <li><strong>Autoexploração:</strong> Conhecer o próprio corpo</li>
        <li><strong>Comunicação:</strong> Guiar o parceiro</li>
        <li><strong>Brinquedos:</strong> Vibradores podem ajudar</li>
        <li><strong>Mindfulness:</strong> Estar presente no momento</li>
        <li><strong>Revisão médica:</strong> Verificar medicação</li>
      </ol>
      
      <h3>Importante</h3>
      <p>O orgasmo não deve ser o único objetivo do sexo. Prazer, conexão e intimidade são igualmente válidos.</p>
    `
  },
  {
    id: "sexo-pos-filhos",
    title: "Sexualidade Pós-Filhos: Reavivar a Chama",
    excerpt: "Como manter uma vida sexual saudável depois de ter filhos.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    icon: "👶",
    image: "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=600&h=400&fit=crop",
    readTime: 8,
    content: `
      <h3>O Desafio</h3>
      <p>Após o nascimento de um filho, a vida sexual do casal muda drasticamente. Cansaço, falta de tempo e mudanças corporais são comuns.</p>
      
      <h4>Desafios Comuns</h4>
      <ul>
        <li>Exaustão física e mental</li>
        <li>Falta de privacidade</li>
        <li>Mudanças hormonais</li>
        <li>Insegurança com o corpo</li>
        <li>Dessincronização de desejos</li>
      </ul>
      
      <h3>Estratégias</h3>
      
      <h4>1. Agendar Intimidade</h4>
      <p>Pode parecer pouco romântico, mas marcar "encontros" garante que aconteçam. Vejam isso como prioridade.</p>
      
      <h4>2. Quickies</h4>
      <p>Nem todo o sexo precisa de ser longo e elaborado. 10 minutos podem ser suficientes.</p>
      
      <h4>3. Ajuda Externa</h4>
      <p>Avós, babysitters, troca de filhos com amigos. Criem tempo só para vocês.</p>
      
      <h4>4. Comunicação</h4>
      <p>Falem sobre desejos, medos e expectativas. Sem julgamento.</p>
      
      <h4>5. Novidades</h4>
      <p>Experimentem coisas novas para quebrar a rotina: brinquedos, locais diferentes, roleplay.</p>
    `
  },
  {
    id: "comunicacao-casal",
    title: "Comunicação Sexual: Falar Sobre Desejos",
    excerpt: "Como abordar fantasias e desejos com o parceiro de forma saudável.",
    category: "dicas",
    categoryLabel: "Dicas",
    icon: "💬",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    readTime: 7,
    content: `
      <h3>Porque é Difícil Falar?</h3>
      <p>Muitos casais têm dificuldade em falar abertamente sobre sexo. Medo de julgamento, vergonha ou receio de magoar o outro.</p>
      
      <h3>Dicas Práticas</h3>
      
      <h4>1. Escolhe o Momento Certo</h4>
      <p>Não durante o sexo ou discussões. Escolhe um momento calmo e privado.</p>
      
      <h4>2. Usa "Eu" em vez de "Tu"</h4>
      <p>Em vez de "Tu nunca fazes X", diz "Eu gostava de experimentar X".</p>
      
      <h4>3. Começa Pelo Positivo</h4>
      <p>"Adoro quando fazes X. Sabes o que também me excitava?"</p>
      
      <h4>4. Questionários em Casal</h4>
      <p>Apps como Kindu ou questionários (como os do Quest4You!) mostram só os matches.</p>
      
      <h4>5. Jogo das Fantasias</h4>
      <p>Cada um escreve 3 fantasias em papéis. Leiam juntos e discutam.</p>
      
      <h3>Respeitar Limites</h3>
      <p>Quando o outro diz "não" a algo:</p>
      <ul>
        <li>Aceita sem pressão</li>
        <li>Não insistas repetidamente</li>
        <li>Pergunta se há alternativas</li>
        <li>O "não" pode mudar no futuro</li>
      </ul>
    `
  },
  {
    id: "bdsm-iniciantes",
    title: "BDSM para Iniciantes: Primeiros Passos",
    excerpt: "Introdução segura ao mundo do BDSM para casais curiosos.",
    category: "dinamicas",
    categoryLabel: "Dinâmicas",
    icon: "⛓️",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
    readTime: 11,
    content: `
      <h3>O que é BDSM?</h3>
      <p>BDSM é um acrónimo para:</p>
      <ul>
        <li><strong>B</strong>ondage & <strong>D</strong>iscipline</li>
        <li><strong>D</strong>ominance & <strong>S</strong>ubmission</li>
        <li><strong>S</strong>adism & <strong>M</strong>asochism</li>
      </ul>
      
      <h3>Princípios Fundamentais</h3>
      
      <h4>SSC - Safe, Sane, Consensual</h4>
      <ul>
        <li><strong>Seguro:</strong> Minimizar riscos físicos e emocionais</li>
        <li><strong>São:</strong> Ambos em estado mental adequado</li>
        <li><strong>Consensual:</strong> Acordo claro de ambas as partes</li>
      </ul>
      
      <h4>Safe Words</h4>
      <p>Palavras que param a ação imediatamente. Sistema de semáforos:</p>
      <ul>
        <li><strong>Verde:</strong> Continua, está ótimo</li>
        <li><strong>Amarelo:</strong> Abranda, estou no limite</li>
        <li><strong>Vermelho:</strong> Para tudo imediatamente</li>
      </ul>
      
      <h3>Começar Devagar</h3>
      
      <h4>Bondage Leve</h4>
      <ul>
        <li>Vendas nos olhos</li>
        <li>Mãos amarradas com lenços (não cordas)</li>
        <li>Imobilização com as próprias mãos</li>
      </ul>
      
      <h4>Power Play</h4>
      <ul>
        <li>Dar ordens simples</li>
        <li>Controlar o prazer do outro</li>
        <li>Roleplay dom/sub</li>
      </ul>
      
      <h4>Sensações</h4>
      <ul>
        <li>Gelo e calor</li>
        <li>Penas e texturas</li>
        <li>Palmadas leves</li>
      </ul>
      
      <h3>Aftercare</h3>
      <p>Cuidados após a sessão. Abraços, água, conversa, mimos. Fundamental para o bem-estar emocional.</p>
    `
  },
  {
    id: "poliamor",
    title: "Poliamor Ético: Amar Mais do que Um",
    excerpt: "Entende o que é o poliamor, como funciona e se é para ti.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    icon: "💕",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop",
    readTime: 10,
    content: `
      <h3>O que é Poliamor?</h3>
      <p>A prática de ter múltiplas relações românticas e/ou sexuais simultâneas, com o conhecimento e consentimento de todos os envolvidos.</p>
      
      <h4>Diferença de Outros Termos</h4>
      <ul>
        <li><strong>Poliamor:</strong> Múltiplas relações amorosas</li>
        <li><strong>Relação Aberta:</strong> Sexo fora do casal, sem romance</li>
        <li><strong>Swing:</strong> Troca de casais, geralmente só sexual</li>
        <li><strong>Poligamia:</strong> Múltiplos casamentos (geralmente religioso)</li>
      </ul>
      
      <h3>Estruturas Comuns</h3>
      
      <h4>Vee (V)</h4>
      <p>Uma pessoa tem dois parceiros que não estão envolvidos entre si.</p>
      
      <h4>Triad</h4>
      <p>Três pessoas todas envolvidas umas com as outras.</p>
      
      <h4>Hierárquico</h4>
      <p>Parceiro primário, secundário, etc. Com níveis diferentes de compromisso.</p>
      
      <h4>Anarquia Relacional</h4>
      <p>Sem hierarquias ou rótulos. Cada relação é única.</p>
      
      <h3>É para Mim?</h3>
      <p>Perguntas a fazer:</p>
      <ul>
        <li>Consigo sentir-me feliz pelo parceiro com outro?</li>
        <li>Tenho tempo e energia para múltiplas relações?</li>
        <li>Comunico bem e sou honesto?</li>
        <li>Lido bem com ciúmes (ou quero aprender)?</li>
      </ul>
      
      <h3>Recursos</h3>
      <p>Livros recomendados:</p>
      <ul>
        <li>"The Ethical Slut" - Dossie Easton</li>
        <li>"More Than Two" - Franklin Veaux</li>
        <li>"Polysecure" - Jessica Fern</li>
      </ul>
    `
  },
  {
    id: "swing-iniciantes",
    title: "Swing para Casais: O Primeiro Passo",
    excerpt: "Tudo o que precisas saber antes de entrar no mundo do swing.",
    category: "dinamicas",
    categoryLabel: "Dinâmicas",
    icon: "🔄",
    image: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=600&h=400&fit=crop",
    readTime: 9,
    content: `
      <h3>O que é Swing?</h3>
      <p>Prática em que casais consentem em ter experiências sexuais com outros casais ou pessoas.</p>
      
      <h4>Tipos de Swing</h4>
      <ul>
        <li><strong>Soft Swap:</strong> Tudo menos penetração</li>
        <li><strong>Full Swap:</strong> Inclui penetração</li>
        <li><strong>Same Room:</strong> Casais na mesma sala</li>
        <li><strong>Separate Room:</strong> Cada casal em quartos diferentes</li>
      </ul>
      
      <h3>Antes de Começar</h3>
      
      <h4>1. Conversem Muito</h4>
      <p>Porque querem? Quais os limites? O que é OK e o que não é?</p>
      
      <h4>2. Definam Regras</h4>
      <ul>
        <li>Sempre juntos ou podem separar?</li>
        <li>Beijar é permitido?</li>
        <li>Sexo oral?</li>
        <li>Contacto depois do encontro?</li>
      </ul>
      
      <h4>3. Comecem Devagar</h4>
      <p>Primeiro visitem um clube só para observar. Sem pressão para participar.</p>
      
      <h3>Onde Encontrar</h3>
      <p>Em Portugal:</p>
      <ul>
        <li>Clubes de swing em Lisboa e Porto</li>
        <li>Sites/apps: SDC, Feeld, Kasidie</li>
        <li>Festas privadas</li>
      </ul>
      
      <h3>Etiqueta</h3>
      <ul>
        <li>Não significa sim - respeitem sempre</li>
        <li>Higiene impecável</li>
        <li>Não filmem/fotografem sem consentimento</li>
        <li>O que acontece no clube, fica no clube</li>
      </ul>
    `
  }
];

// ================================
// INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTabs();
  initFilters();
  loadArticles();
});

function initAuth() {
  firebase.auth().onAuthStateChanged(async (user) => {
    currentUser = user;
    
    // Check admin status and load user profile (nickname)
    if (user) {
      await checkAdminStatus(user.uid);
      await loadUserNickname(user.uid);
    } else {
      isAdmin = false;
      currentUserNickname = null;
      currentUserEmoji = '👤';
    }
    
    updateAuthUI();
    updateAdminUI();
    
    if (user) {
      // Enable chat and messages
      if (currentTab === 'chat') {
        enableChatInput();
        subscribeToChat(currentRoom);
      }
      if (currentTab === 'mensagens') {
        loadConversations();
      }
    }
    
    // Load articles (including custom ones)
    loadAllArticles();
  });
}

// Load user's nickname from Firestore
async function loadUserNickname(userId) {
  if (!db) return;
  
  try {
    const userDoc = await db.collection('quest4you_users').doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      currentUserNickname = data.nickname || null;
      currentUserEmoji = data.nicknameEmoji || '👤';
      console.log('Loaded nickname:', currentUserEmoji, currentUserNickname);
    }
  } catch (e) {
    console.log('Error loading nickname:', e);
    currentUserNickname = null;
    currentUserEmoji = '👤';
  }
}

// Get the display name to use (nickname > displayName > 'Anónimo')
function getDisplayName() {
  if (currentUserNickname) {
    return currentUserNickname;
  }
  if (currentUser && currentUser.displayName) {
    return currentUser.displayName;
  }
  return 'Anónimo';
}

async function checkAdminStatus(userId) {
  if (!db) {
    console.log('❌ Firestore não disponível');
    isAdmin = false;
    return;
  }
  
  try {
    const userDoc = await db.collection('quest4you_users').doc(userId).get();
    console.log('🔍 A verificar admin status para:', userId);
    
    if (userDoc.exists) {
      const data = userDoc.data();
      console.log('📄 Dados do utilizador:', data);
      
      isAdmin = data.role === 'admin' || data.role === 'superadmin' || data.isAdmin === true;
      console.log('🛡️ É admin?', isAdmin, '| role:', data.role, '| isAdmin:', data.isAdmin);
    } else {
      console.log('⚠️ Documento do utilizador não existe');
      isAdmin = false;
    }
  } catch (e) {
    console.error('❌ Erro ao verificar admin status:', e);
    isAdmin = false;
  }
}

function updateAdminUI() {
  const adminControls = document.getElementById('adminControls');
  const adminEditHeader = document.getElementById('adminEditHeader');
  const articlesSection = document.getElementById('artigosTab');
  
  console.log('🎨 A atualizar UI admin. isAdmin =', isAdmin);
  console.log('📍 Elementos encontrados:', {
    adminControls: !!adminControls,
    adminEditHeader: !!adminEditHeader,
    articlesSection: !!articlesSection
  });
  
  if (isAdmin) {
    console.log('✅ Modo admin ATIVADO');
    if (adminControls) {
      adminControls.classList.add('visible');
      console.log('✅ Admin controls agora visível');
    }
    if (articlesSection) {
      articlesSection.classList.add('admin-mode');
      console.log('✅ Articles section em modo admin');
    }
  } else {
    if (adminControls) adminControls.classList.remove('visible');
    if (adminEditHeader) adminEditHeader.classList.remove('visible');
    if (articlesSection) articlesSection.classList.remove('admin-mode');
  }
}

function updateAuthUI() {
  const authLink = document.getElementById('authLink');
  const chatLoginRequired = document.getElementById('chatLoginRequired');
  const chatInputWrapper = document.getElementById('chatInputWrapper');
  const messagesLoginRequired = document.getElementById('messagesLoginRequired');
  const messagesContainer = document.querySelector('.messages-container');
  
  if (currentUser) {
    if (authLink) {
      authLink.textContent = '👤 Perfil';
      authLink.href = 'profile.html';
    }
    if (chatLoginRequired) chatLoginRequired.style.display = 'none';
    if (chatInputWrapper) chatInputWrapper.style.display = 'flex';
    if (messagesLoginRequired) messagesLoginRequired.style.display = 'none';
    if (messagesContainer) messagesContainer.style.display = 'grid';
  } else {
    if (chatLoginRequired) chatLoginRequired.style.display = 'block';
    if (chatInputWrapper) chatInputWrapper.style.display = 'none';
    if (messagesLoginRequired) messagesLoginRequired.style.display = 'block';
    if (messagesContainer) messagesContainer.style.display = 'none';
  }
}

// ================================
// TABS
// ================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  // Tab-specific actions
  if (tab === 'artigos') {
    loadArticles();
  } else if (tab === 'forum') {
    loadTopics();
  } else if (tab === 'chat') {
    if (currentUser) {
      enableChatInput();
      subscribeToChat(currentRoom);
    }
  } else if (tab === 'mensagens') {
    if (currentUser) {
      loadConversations();
    }
  }
}

// ================================
// ARTICLES
// ================================
function initFilters() {
  // Article filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterArticles(category);
    });
  });
  
  // Forum filters
  const forumBtns = document.querySelectorAll('.forum-cat-btn');
  forumBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.forum;
      filterTopics(category);
    });
  });
  
  // Chat rooms
  const roomBtns = document.querySelectorAll('.room-btn');
  roomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const room = btn.dataset.room;
      switchRoom(room);
    });
  });
}

function loadArticles() {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  
  const allArticles = getAllArticles();
  const filtered = currentArticleCategory === 'all' 
    ? allArticles 
    : allArticles.filter(a => a.category === currentArticleCategory);
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-articles">
        <p>Nenhum artigo encontrado nesta categoria.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map(article => {
    const hasImage = article.image && article.image.length > 0;
    const imageStyle = hasImage ? `background-image: url('${article.image}')` : '';
    const imageClass = hasImage ? 'article-image has-image' : 'article-image';
    
    return `
    <div class="article-card" onclick="openArticle('${article.id}')">
      ${isAdmin ? `<span class="article-admin-badge">${article.isCustom ? '✏️ Custom' : '📦 Estático'}</span>` : ''}
      <div class="${imageClass}" style="${imageStyle}">
        ${hasImage ? `<span class="article-icon">${article.icon}</span>` : article.icon}
      </div>
      <div class="article-body">
        <span class="article-category">${article.categoryLabel}</span>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        <div class="article-meta">
          <span>📖 ${article.readTime} min</span>
          <span>💬 <span id="comments-${article.id}">0</span></span>
        </div>
      </div>
    </div>
  `}).join('');
  
  // Load comment counts
  loadCommentCounts();
}

// Get all articles (custom + static)
function getAllArticles() {
  return [...customArticles, ...articlesData];
}

// Load custom articles from Firestore
async function loadAllArticles() {
  if (db) {
    try {
      const snapshot = await db.collection(COLLECTION_ARTICLES).orderBy('createdAt', 'desc').get();
      customArticles = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        isCustom: true
      }));
    } catch (e) {
      console.log('Error loading custom articles:', e);
      customArticles = [];
    }
  }
  
  loadArticles();
}

function filterArticles(category) {
  currentArticleCategory = category;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  loadArticles();
}

async function loadCommentCounts() {
  if (!db) return;
  
  const allArticles = getAllArticles();
  
  for (const article of allArticles) {
    try {
      const snapshot = await db.collection(COLLECTION_COMMENTS)
        .where('articleId', '==', article.id)
        .get();
      
      const countEl = document.getElementById(`comments-${article.id}`);
      if (countEl) {
        countEl.textContent = snapshot.size;
      }
    } catch (e) {
      console.log('Error loading comment count:', e);
    }
  }
}

function openArticle(articleId) {
  const allArticles = getAllArticles();
  const article = allArticles.find(a => a.id === articleId);
  if (!article) return;
  
  currentArticleId = articleId;
  isEditMode = false;
  
  document.getElementById('articleModalTitle').textContent = article.title;
  document.getElementById('articleModalBody').innerHTML = article.content;
  document.getElementById('articleModal').classList.add('active');
  
  // Show/hide admin controls
  const adminEditHeader = document.getElementById('adminEditHeader');
  const articleEditForm = document.getElementById('articleEditForm');
  
  if (isAdmin && article.isCustom) {
    if (adminEditHeader) adminEditHeader.classList.add('visible');
  } else {
    if (adminEditHeader) adminEditHeader.classList.remove('visible');
  }
  
  // Hide edit form
  if (articleEditForm) articleEditForm.classList.remove('visible');
  
  loadComments(articleId);
}

function closeArticleModal() {
  document.getElementById('articleModal').classList.remove('active');
  currentArticleId = null;
}

async function loadComments(articleId) {
  const list = document.getElementById('commentsList');
  if (!list || !db) return;
  
  list.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // Sem orderBy para evitar índices compostos - ordenar no cliente
    const snapshot = await db.collection(COLLECTION_COMMENTS)
      .where('articleId', '==', articleId)
      .limit(100)
      .get();
    
    if (snapshot.empty) {
      list.innerHTML = '<p class="no-comments">Ainda não há comentários. Sê o primeiro!</p>';
      return;
    }
    
    // Ordenar no cliente por createdAt (mais recente primeiro)
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    comments.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    // Limitar a 50 comentários
    const limitedComments = comments.slice(0, 50);
    
    list.innerHTML = limitedComments.map(data => {
      const date = data.createdAt?.toDate?.() || new Date();
      return `
        <div class="comment">
          <div class="comment-avatar">${data.userEmoji || '👤'}</div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">${data.userName || 'Anónimo'}</span>
              <span class="comment-time">${formatTime(date)}</span>
            </div>
            <p class="comment-text">${escapeHtml(data.text)}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Error loading comments:', e);
    list.innerHTML = '<p class="error">Erro ao carregar comentários.</p>';
  }
}

async function submitComment() {
  if (!currentUser || !currentArticleId) {
    alert('Faz login para comentar.');
    return;
  }
  
  const textarea = document.getElementById('commentText');
  const text = textarea.value.trim();
  
  if (!text) return;
  if (text.length > 1000) {
    alert('Comentário demasiado longo (máx. 1000 caracteres)');
    return;
  }
  
  try {
    await db.collection(COLLECTION_COMMENTS).add({
      articleId: currentArticleId,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    textarea.value = '';
    loadComments(currentArticleId);
  } catch (e) {
    console.error('Error submitting comment:', e);
    alert('Erro ao enviar comentário.');
  }
}

// ================================
// FORUM
// ================================
async function loadTopics() {
  const container = document.getElementById('forumTopics');
  if (!container || !db) return;
  
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>A carregar tópicos...</p></div>';
  
  try {
    // Buscar todos os tópicos e filtrar/ordenar no cliente para evitar índices compostos
    let query = db.collection(COLLECTION_TOPICS).limit(200);
    
    const snapshot = await query.get();
    
    // Filtrar por categoria no cliente
    let topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (currentForumCategory !== 'geral') {
      topics = topics.filter(t => t.category === currentForumCategory);
    }
    
    // Ordenar por lastActivity (mais recente primeiro)
    topics.sort((a, b) => {
      const dateA = a.lastActivity?.toDate?.() || new Date(0);
      const dateB = b.lastActivity?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    // Limitar a 50 resultados
    topics = topics.slice(0, 50);
    
    if (topics.length === 0) {
      container.innerHTML = `
        <div class="no-topics">
          <p>Ainda não há tópicos nesta categoria.</p>
          <p>Sê o primeiro a criar um!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = topics.map(data => {
      const date = data.lastActivity?.toDate?.() || new Date();
      const categoryIcons = {
        'geral': '🌐',
        'experiencias': '💭',
        'duvidas': '❓',
        'sugestoes': '💡',
        'off-topic': '🎲'
      };
      
      return `
        <div class="topic-card" onclick="openTopic('${data.id}')">
          <div class="topic-avatar">${data.userEmoji || '👤'}</div>
          <div class="topic-content">
            <div class="topic-header">
              <h3 class="topic-title">${escapeHtml(data.title)}</h3>
              <span class="topic-category-badge">${categoryIcons[data.category] || '🌐'} ${data.category}</span>
            </div>
            <p class="topic-preview">${escapeHtml((data.content || '').substring(0, 150))}...</p>
            <div class="topic-meta">
              <span>👤 ${data.userName || 'Anónimo'}</span>
              <span>🕐 ${formatTime(date)}</span>
            </div>
          </div>
          <div class="topic-stats">
            <div class="topic-stat">
              <span class="topic-stat-value">${data.replyCount || 0}</span>
              <span class="topic-stat-label">respostas</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Error loading topics:', e);
    container.innerHTML = '<p class="error">Erro ao carregar tópicos.</p>';
  }
}

function filterTopics(category) {
  currentForumCategory = category;
  
  document.querySelectorAll('.forum-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.forum === category);
  });
  
  loadTopics();
}

function showNewTopicModal() {
  if (!currentUser) {
    alert('Faz login para criar um tópico.');
    return;
  }
  document.getElementById('newTopicModal').classList.add('active');
}

function closeNewTopicModal() {
  document.getElementById('newTopicModal').classList.remove('active');
  document.getElementById('newTopicForm').reset();
}

async function createTopic(event) {
  event.preventDefault();
  
  if (!currentUser) {
    alert('Faz login para criar um tópico.');
    return;
  }
  
  const category = document.getElementById('topicCategory').value;
  const title = document.getElementById('topicTitle').value.trim();
  const content = document.getElementById('topicContent').value.trim();
  
  if (!title || !content) return;
  
  try {
    await db.collection(COLLECTION_TOPICS).add({
      category: category,
      title: title,
      content: content,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      replyCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    closeNewTopicModal();
    loadTopics();
  } catch (e) {
    console.error('Error creating topic:', e);
    alert('Erro ao criar tópico.');
  }
}

async function openTopic(topicId) {
  currentTopicId = topicId;
  
  try {
    const doc = await db.collection(COLLECTION_TOPICS).doc(topicId).get();
    
    if (!doc.exists) {
      alert('Tópico não encontrado.');
      return;
    }
    
    const data = doc.data();
    
    document.getElementById('topicModalTitle').textContent = data.title;
    document.getElementById('topicModalBody').innerHTML = `
      <div class="topic-full">
        <div class="topic-author">
          <span class="author-avatar">${data.userEmoji || '👤'}</span>
          <span class="author-name">${data.userName || 'Anónimo'}</span>
          <span class="topic-date">• ${formatTime(data.createdAt?.toDate() || new Date())}</span>
        </div>
        <div class="topic-text">${escapeHtml(data.content).replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    document.getElementById('topicModal').classList.add('active');
    loadReplies(topicId);
  } catch (e) {
    console.error('Error opening topic:', e);
    alert('Erro ao abrir tópico.');
  }
}

function closeTopicModal() {
  document.getElementById('topicModal').classList.remove('active');
  currentTopicId = null;
}

async function loadReplies(topicId) {
  const list = document.getElementById('repliesList');
  if (!list || !db) return;
  
  list.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // Buscar respostas sem orderBy para evitar índices compostos
    const snapshot = await db.collection(COLLECTION_REPLIES)
      .where('topicId', '==', topicId)
      .get();
    
    if (snapshot.empty) {
      list.innerHTML = '<p class="no-replies">Ainda não há respostas. Sê o primeiro!</p>';
      return;
    }
    
    // Ordenar no cliente por createdAt (mais antigo primeiro)
    const replies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    replies.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA - dateB;
    });
    
    list.innerHTML = replies.map(data => {
      const date = data.createdAt?.toDate?.() || new Date();
      return `
        <div class="reply">
          <div class="reply-avatar">${data.userEmoji || '👤'}</div>
          <div class="reply-content">
            <div class="reply-header">
              <span class="reply-author">${data.userName || 'Anónimo'}</span>
              <span class="reply-time">${formatTime(date)}</span>
            </div>
            <p class="reply-text">${escapeHtml(data.text).replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Error loading replies:', e);
    list.innerHTML = '<p class="error">Erro ao carregar respostas.</p>';
  }
}

async function submitReply() {
  if (!currentUser || !currentTopicId) {
    alert('Faz login para responder.');
    return;
  }
  
  const textarea = document.getElementById('replyText');
  const text = textarea.value.trim();
  
  if (!text) return;
  if (text.length > 2000) {
    alert('Resposta demasiado longa (máx. 2000 caracteres)');
    return;
  }
  
  try {
    // Add reply
    await db.collection(COLLECTION_REPLIES).add({
      topicId: currentTopicId,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update topic
    await db.collection(COLLECTION_TOPICS).doc(currentTopicId).update({
      replyCount: firebase.firestore.FieldValue.increment(1),
      lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    textarea.value = '';
    loadReplies(currentTopicId);
  } catch (e) {
    console.error('Error submitting reply:', e);
    alert('Erro ao enviar resposta.');
  }
}

// ================================
// PUBLIC CHAT
// ================================
function switchRoom(room) {
  currentRoom = room;
  
  // Update buttons
  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.room === room);
  });
  
  // Update header
  const roomNames = {
    'geral': '🌐 Sala Geral',
    'apresentacoes': '👋 Apresentações',
    'dicas': '💡 Dicas & Truques',
    'encontros': '💕 Encontros'
  };
  document.getElementById('currentRoomName').textContent = roomNames[room] || room;
  
  // Unsubscribe from previous room
  if (chatUnsubscribe) {
    chatUnsubscribe();
  }
  
  // Subscribe to new room
  if (currentUser) {
    subscribeToChat(room);
  }
}

function enableChatInput() {
  const loginRequired = document.getElementById('chatLoginRequired');
  const inputWrapper = document.getElementById('chatInputWrapper');
  
  if (loginRequired) loginRequired.style.display = 'none';
  if (inputWrapper) inputWrapper.style.display = 'flex';
}

function subscribeToChat(room) {
  if (!db) return;
  
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;
  
  // Clear existing messages
  messagesContainer.innerHTML = `
    <div class="chat-welcome">
      <p>👋 Bem-vindo à sala! Sê respeitoso e diverte-te.</p>
    </div>
  `;
  
  // Subscribe to realtime updates - sem orderBy para evitar índices compostos
  chatUnsubscribe = db.collection(COLLECTION_CHAT)
    .where('room', '==', room)
    .limit(100)
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar no cliente por createdAt (mais antigo primeiro para exibir em ordem)
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB;
      });
      
      // Mostrar apenas as últimas 100 mensagens
      const recentMessages = messages.slice(-100);
      
      renderChatMessages(recentMessages);
    }, error => {
      console.error('Chat subscription error:', error);
      messagesContainer.innerHTML = `
        <div class="chat-welcome">
          <p>⚠️ Erro ao carregar mensagens. Tenta recarregar a página.</p>
        </div>
      `;
    });
}

function renderChatMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  if (messages.length === 0) {
    container.innerHTML = `
      <div class="chat-welcome">
        <p>👋 Bem-vindo à sala! Sê o primeiro a enviar uma mensagem.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = messages.map(msg => {
    const isOwn = currentUser && msg.userId === currentUser.uid;
    const time = msg.createdAt?.toDate() || new Date();
    
    return `
      <div class="chat-message ${isOwn ? 'own' : ''}">
        <div class="chat-message-avatar">${msg.userEmoji || '👤'}</div>
        <div class="chat-message-content">
          <div class="chat-message-header">
            <span class="chat-message-name">${msg.userName || 'Anónimo'}</span>
            <span class="chat-message-time">${formatTime(time)}</span>
          </div>
          <p class="chat-message-text">${escapeHtml(msg.text)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  if (!currentUser) {
    alert('Faz login para enviar mensagens.');
    return;
  }
  
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  
  if (!text) return;
  if (text.length > 500) {
    alert('Mensagem demasiado longa (máx. 500 caracteres)');
    return;
  }
  
  try {
    await db.collection(COLLECTION_CHAT).add({
      room: currentRoom,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    input.value = '';
  } catch (e) {
    console.error('Error sending message:', e);
    alert('Erro ao enviar mensagem.');
  }
}

// Handle Enter key in chat
document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
});

// ================================
// PRIVATE MESSAGES
// ================================
async function loadConversations() {
  if (!currentUser || !db) return;
  
  const list = document.getElementById('conversationsList');
  const noConversations = document.getElementById('noConversations');
  
  if (!list) return;
  
  // Subscribe to conversations
  if (conversationsUnsubscribe) {
    conversationsUnsubscribe();
  }
  
  conversationsUnsubscribe = db.collection(COLLECTION_CONVERSATIONS)
    .where('participants', 'array-contains', currentUser.uid)
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        if (noConversations) noConversations.style.display = 'block';
        list.innerHTML = '';
        return;
      }
      
      if (noConversations) noConversations.style.display = 'none';
      
      // Ordenar no cliente por lastMessage.createdAt (mais recente primeiro)
      const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      conversations.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt?.toDate?.() || new Date(0);
        const dateB = b.lastMessage?.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      list.innerHTML = conversations.map(data => {
        const otherUserId = data.participants.find(p => p !== currentUser.uid);
        const otherUser = data.participantInfo?.[otherUserId] || {};
        const lastMsg = data.lastMessage || {};
        const time = lastMsg.createdAt?.toDate?.() || new Date();
        const unread = data.unreadCount?.[currentUser.uid] || 0;
        
        return `
          <div class="conversation-item ${currentConversationId === data.id ? 'active' : ''}" 
               onclick="openConversation('${data.id}')">
            <div class="conversation-avatar">${otherUser.emoji || '👤'}</div>
            <div class="conversation-info">
              <div class="conversation-name">${otherUser.name || 'Utilizador'}</div>
              <div class="conversation-preview">${lastMsg.text || 'Nova conversa'}</div>
            </div>
            <div class="conversation-meta">
              <span>${formatTime(time)}</span>
              ${unread > 0 ? `<span class="conversation-unread">${unread}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }, error => {
      console.error('Conversations subscription error:', error);
    });
}

async function openConversation(conversationId) {
  if (!currentUser || !db) return;
  
  currentConversationId = conversationId;
  
  // Update active state
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget?.classList.add('active');
  
  const mainArea = document.getElementById('messagesMain');
  if (!mainArea) return;
  
  try {
    const convDoc = await db.collection(COLLECTION_CONVERSATIONS).doc(conversationId).get();
    
    if (!convDoc.exists) return;
    
    const convData = convDoc.data();
    const otherUserId = convData.participants.find(p => p !== currentUser.uid);
    const otherUser = convData.participantInfo?.[otherUserId] || {};
    
    mainArea.innerHTML = `
      <div class="messages-header">
        <div class="messages-user">
          <div class="messages-user-avatar">${otherUser.emoji || '👤'}</div>
          <div class="messages-user-info">
            <span class="messages-user-name">${otherUser.name || 'Utilizador'}</span>
          </div>
        </div>
      </div>
      <div class="private-messages-list" id="privateMessagesList">
        <div class="loading-spinner"><div class="spinner"></div></div>
      </div>
      <div class="private-message-input">
        <input type="text" id="privateMessageInput" placeholder="Escreve uma mensagem...">
        <button class="btn btn-primary" onclick="sendPrivateMessage()">Enviar</button>
      </div>
    `;
    
    // Subscribe to messages
    subscribeToPrivateMessages(conversationId);
    
    // Mark as read
    await db.collection(COLLECTION_CONVERSATIONS).doc(conversationId).update({
      [`unreadCount.${currentUser.uid}`]: 0
    });
    
    // Handle Enter key
    const input = document.getElementById('privateMessageInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendPrivateMessage();
        }
      });
      input.focus();
    }
  } catch (e) {
    console.error('Error opening conversation:', e);
  }
}

function subscribeToPrivateMessages(conversationId) {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
  }
  
  const list = document.getElementById('privateMessagesList');
  if (!list || !db) return;
  
  // Sem orderBy para evitar índices compostos - ordenar no cliente
  messagesUnsubscribe = db.collection(COLLECTION_MESSAGES)
    .where('conversationId', '==', conversationId)
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar no cliente por createdAt (mais antigo primeiro)
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB;
      });
      
      renderPrivateMessages(messages);
    }, error => {
      console.error('Messages subscription error:', error);
      list.innerHTML = '<p class="error">Erro ao carregar mensagens.</p>';
    });
}

function renderPrivateMessages(messages) {
  const list = document.getElementById('privateMessagesList');
  if (!list) return;
  
  if (messages.length === 0) {
    list.innerHTML = '<p class="no-messages">Começa a conversa!</p>';
    return;
  }
  
  list.innerHTML = messages.map(msg => {
    const isOwn = currentUser && msg.senderId === currentUser.uid;
    const time = msg.createdAt?.toDate() || new Date();
    
    return `
      <div class="private-message ${isOwn ? 'own' : ''}">
        <div class="private-message-content">
          <p>${escapeHtml(msg.text)}</p>
          <span class="private-message-time">${formatTime(time)}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  list.scrollTop = list.scrollHeight;
}

async function sendPrivateMessage() {
  if (!currentUser || !currentConversationId) return;
  
  const input = document.getElementById('privateMessageInput');
  const text = input.value.trim();
  
  if (!text) return;
  
  try {
    const convDoc = await db.collection(COLLECTION_CONVERSATIONS).doc(currentConversationId).get();
    const convData = convDoc.data();
    const otherUserId = convData.participants.find(p => p !== currentUser.uid);
    
    // Add message
    await db.collection(COLLECTION_MESSAGES).add({
      conversationId: currentConversationId,
      senderId: currentUser.uid,
      senderName: getDisplayName(),
      senderEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update conversation
    await db.collection(COLLECTION_CONVERSATIONS).doc(currentConversationId).update({
      lastMessage: {
        text: text,
        senderId: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      [`unreadCount.${otherUserId}`]: firebase.firestore.FieldValue.increment(1)
    });
    
    input.value = '';
  } catch (e) {
    console.error('Error sending private message:', e);
    alert('Erro ao enviar mensagem.');
  }
}

// Function to start a new conversation (called from Smart Match)
async function startConversation(otherUserId, otherUserName, otherUserEmoji) {
  if (!currentUser || !db) return null;
  
  try {
    // Check if conversation already exists
    const existing = await db.collection(COLLECTION_CONVERSATIONS)
      .where('participants', 'array-contains', currentUser.uid)
      .get();
    
    for (const doc of existing.docs) {
      if (doc.data().participants.includes(otherUserId)) {
        return doc.id; // Return existing conversation
      }
    }
    
    // Create new conversation
    const convRef = await db.collection(COLLECTION_CONVERSATIONS).add({
      participants: [currentUser.uid, otherUserId],
      participantInfo: {
        [currentUser.uid]: {
          name: getDisplayName(),
          emoji: currentUserEmoji
        },
        [otherUserId]: {
          name: otherUserName || 'Utilizador',
          emoji: otherUserEmoji || '👤'
        }
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
      unreadCount: {
        [currentUser.uid]: 0,
        [otherUserId]: 0
      }
    });
    
    return convRef.id;
  } catch (e) {
    console.error('Error starting conversation:', e);
    return null;
  }
}

// ================================
// UTILITIES
// ================================
function formatTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'agora';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d`;
  }
  
  // Format as date
  return date.toLocaleDateString('pt-PT', { 
    day: 'numeric', 
    month: 'short' 
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ================================
// MODAL CLOSE ON CLICK OUTSIDE
// ================================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
    cancelDelete();
  }
});

// ================================
// ADMIN FUNCTIONS
// ================================
const categoryLabels = {
  'dinamicas': 'Dinâmicas',
  'brinquedos': 'Brinquedos',
  'dicas': 'Dicas',
  'viagens': 'Viagens',
  'saude': 'Saúde',
  'lifestyle': 'Lifestyle'
};

function showCreateArticleModal() {
  if (!isAdmin) {
    alert('Não tens permissão para criar artigos.');
    return;
  }
  document.getElementById('createArticleModal').classList.add('active');
}

function closeCreateArticleModal() {
  document.getElementById('createArticleModal').classList.remove('active');
  document.getElementById('createArticleForm').reset();
}

async function createArticle(event) {
  event.preventDefault();
  
  if (!isAdmin || !db) {
    alert('Não tens permissão para criar artigos.');
    return;
  }
  
  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCategory').value;
  const excerpt = document.getElementById('newExcerpt').value.trim();
  const icon = document.getElementById('newIcon').value.trim() || '📖';
  const readTime = parseInt(document.getElementById('newReadTime').value) || 5;
  const content = document.getElementById('newContent').value.trim();
  
  if (!title || !excerpt || !content) {
    alert('Preenche todos os campos obrigatórios.');
    return;
  }
  
  try {
    await db.collection(COLLECTION_ARTICLES).add({
      title: title,
      category: category,
      categoryLabel: categoryLabels[category] || category,
      excerpt: excerpt,
      icon: icon,
      readTime: readTime,
      content: content,
      createdBy: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    closeCreateArticleModal();
    await loadAllArticles();
    alert('✅ Artigo criado com sucesso!');
  } catch (e) {
    console.error('Error creating article:', e);
    alert('Erro ao criar artigo: ' + e.message);
  }
}

function toggleEditMode() {
  if (!isAdmin) return;
  
  const allArticles = getAllArticles();
  const article = allArticles.find(a => a.id === currentArticleId);
  if (!article || !article.isCustom) {
    alert('Apenas artigos custom podem ser editados.');
    return;
  }
  
  isEditMode = !isEditMode;
  
  const editForm = document.getElementById('articleEditForm');
  const modalBody = document.getElementById('articleModalBody');
  
  if (isEditMode) {
    // Fill form with article data
    document.getElementById('editTitle').value = article.title;
    document.getElementById('editCategory').value = article.category;
    document.getElementById('editExcerpt').value = article.excerpt;
    document.getElementById('editIcon').value = article.icon;
    document.getElementById('editReadTime').value = article.readTime;
    document.getElementById('editContent').value = article.content;
    
    editForm.classList.add('visible');
    modalBody.style.display = 'none';
  } else {
    editForm.classList.remove('visible');
    modalBody.style.display = 'block';
  }
}

function cancelEdit() {
  isEditMode = false;
  const editForm = document.getElementById('articleEditForm');
  const modalBody = document.getElementById('articleModalBody');
  
  if (editForm) editForm.classList.remove('visible');
  if (modalBody) modalBody.style.display = 'block';
}

async function saveArticleEdit() {
  if (!isAdmin || !currentArticleId || !db) {
    alert('Não tens permissão para editar artigos.');
    return;
  }
  
  const title = document.getElementById('editTitle').value.trim();
  const category = document.getElementById('editCategory').value;
  const excerpt = document.getElementById('editExcerpt').value.trim();
  const icon = document.getElementById('editIcon').value.trim() || '📖';
  const readTime = parseInt(document.getElementById('editReadTime').value) || 5;
  const content = document.getElementById('editContent').value.trim();
  
  if (!title || !excerpt || !content) {
    alert('Preenche todos os campos obrigatórios.');
    return;
  }
  
  try {
    await db.collection(COLLECTION_ARTICLES).doc(currentArticleId).update({
      title: title,
      category: category,
      categoryLabel: categoryLabels[category] || category,
      excerpt: excerpt,
      icon: icon,
      readTime: readTime,
      content: content,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    const index = customArticles.findIndex(a => a.id === currentArticleId);
    if (index !== -1) {
      customArticles[index] = {
        ...customArticles[index],
        title, category, categoryLabel: categoryLabels[category], excerpt, icon, readTime, content
      };
    }
    
    // Update modal display
    document.getElementById('articleModalTitle').textContent = title;
    document.getElementById('articleModalBody').innerHTML = content;
    
    cancelEdit();
    loadArticles();
    alert('✅ Artigo atualizado com sucesso!');
  } catch (e) {
    console.error('Error saving article:', e);
    alert('Erro ao guardar artigo: ' + e.message);
  }
}

function confirmDeleteArticle() {
  if (!isAdmin) return;
  
  const allArticles = getAllArticles();
  const article = allArticles.find(a => a.id === currentArticleId);
  if (!article || !article.isCustom) {
    alert('Apenas artigos custom podem ser eliminados.');
    return;
  }
  
  document.getElementById('deleteConfirmOverlay').classList.add('active');
  document.getElementById('deleteConfirm').classList.add('active');
}

function cancelDelete() {
  document.getElementById('deleteConfirmOverlay').classList.remove('active');
  document.getElementById('deleteConfirm').classList.remove('active');
}

async function deleteArticle() {
  if (!isAdmin || !currentArticleId || !db) {
    alert('Não tens permissão para eliminar artigos.');
    return;
  }
  
  try {
    // Delete article
    await db.collection(COLLECTION_ARTICLES).doc(currentArticleId).delete();
    
    // Delete associated comments
    const commentsSnapshot = await db.collection(COLLECTION_COMMENTS)
      .where('articleId', '==', currentArticleId)
      .get();
    
    const batch = db.batch();
    commentsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    // Remove from local data
    customArticles = customArticles.filter(a => a.id !== currentArticleId);
    
    cancelDelete();
    closeArticleModal();
    loadArticles();
    alert('✅ Artigo eliminado com sucesso!');
  } catch (e) {
    console.error('Error deleting article:', e);
    alert('Erro ao eliminar artigo: ' + e.message);
  }
}
