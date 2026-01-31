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
const articlesData = [  {
    id: "cuckold-dinamicas",
    title: "Dinâmicas Cuckold/Cuckquean: Guia Completo",
    excerpt: "Entende as diferentes dinâmicas de voyeurismo e partilha: Cuckold, Hotwife, Stag, Bull, Vixen e mais.",
    category: "dinamicas",
    categoryLabel: "Dinâmicas",
    icon: "👀",
    image: "https://images.unsplash.com/photo-1445633883498-7f9922d37a3f?w=600&h=400&fit=crop&q=80",
    readTime: 15,
    content: `
      <div style="text-align: left;">
      <h3>O que são as dinâmicas de Cuckold/Cuckquean?</h3>
      <p>Estas dinâmicas envolvem casais onde um dos parceiros (ou ambos) sentem excitação ao ver, ouvir ou saber que o outro está a ter encontros sexuais ou românticos com terceiros. Ao contrário do que muitos pensam, não se trata de infidelidade - todas as partes estão conscientes e consentem. Esta prática tem raízes profundas na psicologia humana e explora conceitos como voyeurismo, compersion (felicidade pela felicidade do parceiro) e, em alguns casos, elementos de power play e humilhação erótica.</p>
      
      <h4>🐂 Bull / Vixen - Os "Terceiros"</h4>
      <p>O <strong>Bull</strong> é o termo usado para descrever o homem convidado a ter relações com a parceira do casal. Geralmente, é alguém escolhido pelas suas características físicas, confiança ou experiência. O Bull pode ter diferentes níveis de envolvimento - desde encontros puramente sexuais a relações mais continuadas.</p>
      
      <p>A <strong>Vixen</strong> é a versão feminina - uma mulher que se envolve com o marido/namorado de outra mulher. Este papel é menos comum no universo cuckold/cuckquean, mas igualmente válido e praticado.</p>
      
      <p><strong>Características importantes:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Respeito pelos limites do casal</li>
        <li>Discrição absoluta</li>
        <li>Compreensão do papel que desempenha</li>
        <li>Comunicação clara sobre expectativas</li>
        <li>Testes de saúde sexual atualizados</li>
      </ul>
      
      <h4>👀 Cuckold / Cuckquean - O Observador</h4>
      <p>O <strong>Cuckold</strong> é o homem que sente excitação e prazer ao ver, ouvir ou simplesmente saber que a sua parceira está com outro homem. Esta dinâmica pode incluir elementos de humilhação consensual - onde o cuckold é "diminuído" verbalmente ou de outras formas durante o ato. No entanto, isto é sempre consensual e parte do jogo erótico.</p>
      
      <p>A <strong>Cuckquean</strong> é a versão feminina. Embora menos comum culturalmente, muitas mulheres sentem excitação ao ver ou saber que o seu parceiro está com outra mulher. Alguns estudos sugerem que isto pode estar relacionado com a competição sexual e a reafirmação da desejabilidade do parceiro.</p>
      
      <p><strong>Níveis de envolvimento:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Observação passiva:</strong> Apenas assistir ao ato</li>
        <li><strong>Participação limitada:</strong> Pode preparar o cenário, dar ordens, etc.</li>
        <li><strong>Humilhação leve:</strong> Comentários sobre comparações, tamanho, performance</li>
        <li><strong>Humilhação intensa:</strong> Elementos de SPH (small penis humiliation), denial, chastity</li>
        <li><strong>Reclamação:</strong> Sexo com a parceira após o Bull, como "limpeza"</li>
      </ul>
      
      <h4>🦌 Stag / Hotwife - Orgulho e Partilha</h4>
      <p>A dinâmica <strong>Stag/Hotwife</strong> é semelhante ao cuckold, mas com uma diferença fundamental: não há elementos de humilhação. O Stag tem orgulho na sua Hotwife e adora vê-la dar e receber prazer. Vê-a como um "troféu" que outros admiram mas que é dele.</p>
      
      <p>A <strong>Hotwife</strong> é vista como empoderada, desejável e sexualmente livre. O Stag encoraja-a ativamente a explorar a sua sexualidade com outros, sentindo excitação vicária através do prazer dela.</p>
      
      <p><strong>Diferenças-chave do Cuckold:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Sem humilhação ou degradação</li>
        <li>Foco no empoderamento feminino</li>
        <li>O Stag mantém sempre o "controlo" ou aprovação</li>
        <li>Ambiente mais positivo e celebratório</li>
        <li>Ênfase na beleza e sensualidade da parceira</li>
      </ul>
      
      <h4>🌟 Trophy - Exibição com Orgulho</h4>
      <p>O <strong>Trophy</strong> (troféu) é alguém exibido com orgulho pelo parceiro. Esta pessoa é "emprestada" a outros como demonstração de generosidade, confiança ou estatuto. O conceito pode ser visto em ambos os géneros e tem forte componente de exibicionismo.</p>
      
      <h3>A Psicologia Por Detrás</h3>
      <p>Estas dinâmicas podem parecer contraintuitivas, mas têm bases psicológicas interessantes:</p>
      
      <h4>Compersion</h4>
      <p>O oposto de ciúme - sentir felicidade pela felicidade do parceiro. Ver o teu parceiro em êxtase sexual pode ser imensamente excitante.</p>
      
      <h4>Voyeurismo</h4>
      <p>Observar atos sexuais é uma das fantasias mais comuns. Nestas dinâmicas, podes viver isso com segurança.</p>
      
      <h4>Novidade e Excitação</h4>
      <p>Ver o parceiro com outra pessoa traz novidade à relação. O "perigo" controlado aumenta a adrenalina e a paixão.</p>
      
      <h4>Reafirmação</h4>
      <p>Ver que outros desejam o teu parceiro pode reacender o desejo e a apreciação que tinhas inicialmente.</p>
      
      <h3>Comunicação é TUDO</h3>
      <p>Estas dinâmicas requerem um nível de comunicação e confiança que vai além do "normal":</p>
      
      <h4>Antes de Começar:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Conversas honestas:</strong> Porque querem isto? Quais são as motivações reais?</li>
        <li><strong>Limites claríssimos:</strong> O que está OK e o que está OFF limits?</li>
        <li><strong>Cenários hipotéticos:</strong> "E se acontecer X?" - preparem-se para várias situações</li>
        <li><strong>Safe words:</strong> Sistema de semáforos (verde/amarelo/vermelho)</li>
        <li><strong>Plano de saída:</strong> Qualquer um pode parar a qualquer momento, sem explicações</li>
      </ul>
      
      <h4>Durante:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Check-ins regulares (especialmente na primeira vez)</li>
        <li>Respeito pelos sinais não-verbais do parceiro</li>
        <li>Flexibilidade para ajustar limites em tempo real</li>
      </ul>
      
      <h4>Depois:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Aftercare emocional:</strong> Abraços, carinho, reafirmação</li>
        <li><strong>Debrief:</strong> Conversar sobre o que correu bem e menos bem</li>
        <li><strong>Reconexão:</strong> Sexo entre o casal, intimidade exclusiva</li>
        <li><strong>Processing:</strong> Podem surgir emoções inesperadas dias depois - falem sobre elas</li>
      </ul>
      
      <h3>Como Começar? (Guia Passo a Passo)</h3>
      
      <h4>Fase 1: Fantasia e Exploração Mental</h4>
      <ol style="text-align: left; padding-left: 20px;">
        <li><strong>Dirty talk:</strong> Introduzir a fantasia durante o sexo</li>
        <li><strong>Role play verbal:</strong> Descrever cenários hipotéticos</li>
        <li><strong>Pornografia temática:</strong> Ver conteúdo relacionado juntos</li>
        <li><strong>Leitura:</strong> Ler histórias eróticas sobre o tema</li>
      </ol>
      
      <h4>Fase 2: Simulação Segura</h4>
      <ol style="text-align: left; padding-left: 20px;">
        <li><strong>Role play físico:</strong> Fingir que um é outra pessoa</li>
        <li><strong>Uso de brinquedos:</strong> Simular a presença de terceiro</li>
        <li><strong>Clubes/festas lifestyle:</strong> Ir só para observar (soft swap)</li>
        <li><strong>Apps e sites:</strong> Criar perfis para "sentir as águas"</li>
      </ol>
      
      <h4>Fase 3: Primeira Experiência Real</h4>
      <ol style="text-align: left; padding-left: 20px;">
        <li><strong>Escolher o terceiro com cuidado:</strong> Alguém de confiança, experiente</li>
        <li><strong>Local neutro:</strong> Hotel, nunca a vossa casa (na primeira vez)</li>
        <li><strong>Começar devagar:</strong> Soft play antes de full swap</li>
        <li><strong>Ter um sinal de paragem:</strong> Que ambos conhecem e respeitam</li>
      </ol>
      
      <h3>Red Flags e Avisos</h3>
      <p><strong>NÃO experimentem se:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>A relação já tem problemas sérios de confiança</li>
        <li>Um dos dois está a ser pressionado</li>
        <li>É para "salvar" a relação (vai piorar)</li>
        <li>Há ciúmes doentios ou possessividade extrema</li>
        <li>Não conseguem comunicar abertamente sobre sexo</li>
      </ul>
      
      <h3>Recursos e Comunidades</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>r/Cuckold e r/Hotwife (Reddit):</strong> Comunidades ativas e acolhedoras</li>
        <li><strong>Fetlife:</strong> Rede social para o lifestyle alternativo</li>
        <li><strong>Clubes de swing:</strong> Muitos têm noites específicas para estes estilos</li>
        <li><strong>Apps:</strong> Feeld, 3Fun, SDC (Swingers Date Club)</li>
      </ul>
      
      <p><strong>Lembrete final:</strong> Não há pressa. Estas dinâmicas devem ser exploradas ao vosso ritmo, com total honestidade e respeito mútuo. O objectivo é aumentar o prazer e a conexão do casal, nunca criar distância ou mágoa.</p>
      </div>
    `
  },  {
    id: "brinquedos-casais",
    title: "Brinquedos Sexuais para Casais: Guia Iniciante",
    excerpt: "Descobre os melhores brinquedos para experimentar a dois e como introduzir este tema na relação.",
    category: "brinquedos",
    categoryLabel: "Brinquedos",
    icon: "🎲",
    image: "https://images.unsplash.com/photo-1522442439760-36f5d83b81c3?w=600&h=400&fit=crop&q=80",
    readTime: 12,
    content: `
      <div style="text-align: left;">
      <h3>Porque usar brinquedos sexuais?</h3>
      <p>Os brinquedos sexuais são ferramentas incríveis para adicionar variedade, intensidade e novas sensações à vida íntima do casal. Ao contrário do que alguns possam pensar, não substituem o parceiro - pelo contrário, complementam e enriquecem a experiência partilhada. Estudos mostram que casais que incorporam brinquedos na sua vida sexual reportam maior satisfação, comunicação mais aberta e menos monotonia.</p>
      
      <p>Muitos casais sentem receio inicial, especialmente se um dos parceiros se sente "ameaçado" pelos brinquedos. É importante desmistificar: um vibrador não vai "substituir" ninguém. É apenas uma ferramenta que pode proporcionar sensações diferentes e complementares ao toque humano.</p>
      
      <h3>Brinquedos para Iniciantes</h3>
      <p>Se estão a começar agora, o melhor é optar por algo simples, não intimidante e versátil:</p>
      
      <h4>🔹 Vibrador Bullet (Bala Vibradora)</h4>
      <p>Pequeno, discreto e extremamente versátil. Pode ser usado durante a penetração para estimular o clitóris, nos mamilos, períneo, ou qualquer zona erógena. É perfeito porque:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Não é intimidante pelo tamanho</li>
        <li>Fácil de controlar</li>
        <li>Relativamente silencioso</li>
        <li>Preço acessível (a partir de 15-20€)</li>
        <li>Pode ser usado em qualquer posição</li>
      </ul>
      <p><strong>Dica:</strong> Usa-o durante o sexo oral ou penetração para um boost extra de prazer.</p>
      
      <h4>💍 Anel Peniano Vibratório</h4>
      <p>Um dos favoritos para casais. Este anel coloca-se na base do pénis e tem um pequeno vibrador que estimula o clitóris durante a penetração. Benefícios:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Para ela:</strong> Estimulação clitoriana contínua durante o sexo</li>
        <li><strong>Para ele:</strong> O anel pode ajudar a manter a ereção por mais tempo e proporcionar novas sensações</li>
        <li><strong>Para ambos:</strong> As vibrações são sentidas por ambos</li>
        <li>Descartáveis (mais higiénicos) ou recarregáveis (mais económicos)</li>
      </ul>
      <p><strong>Marcas recomendadas:</strong> Durex, We-Vibe, Satisfyer</p>
      
      <h4>🎲 Dados Eróticos</h4>
      <p>Não é tecnicamente um "brinquedo sexual", mas é uma excelente forma de adicionar aleatoriedade e brincadeira:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Um dado indica a ação (beijar, lamber, massajar, etc.)</li>
        <li>Outro dado indica a zona do corpo</li>
        <li>Quebra a rotina e tira a "pressão" de decidir</li>
        <li>Pode criar situações engraçadas e descontraídas</li>
      </ul>
      
      <h4>🌑 Vendas e Algemas Macias</h4>
      <p>Para casais interessados em experimentar leve bondage:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Vendas:</strong> Privação sensorial intensifica outras sensações</li>
        <li><strong>Algemas de velcro/cetim:</strong> Fáceis de remover, não deixam marcas</li>
        <li>Introduzem dinâmicas de poder de forma segura</li>
        <li>Aumentam a antecipação e o desejo</li>
      </ul>
      
      <h3>Brinquedos para Casais Experientes</h3>
      <p>Quando já estão confortáveis com os básicos e querem explorar mais:</p>
      
      <h4>🎮 Vibradores para Casais (We-Vibe, etc.)</h4>
      <p>Estes vibradores são desenhados para serem usados DURANTE a penetração vaginal:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Formato em "C" ou "U" que se adapta ao corpo</li>
        <li>Uma extremidade dentro, outra sobre o clitóris</li>
        <li>Controlados por app (pode ser divertido dar o controlo ao parceiro)</li>
        <li>Estimulação simultânea interna e externa</li>
        <li>Investimento maior (80-150€), mas qualidade premium</li>
      </ul>
      <p><strong>Top picks:</strong> We-Vibe Chorus, Lovense Lush 3, Satisfyer Partners Plus</p>
      
      <h4>📱 Brinquedos com Controlo Remoto</h4>
      <p>O parceiro controla o prazer do outro através de uma app ou controlo remoto:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pode ser usado em público (se ambos consentirem) para foreplay discreto</li>
        <li>Excelente para relações à distância</li>
        <li>Dinâmica de poder excitante</li>
        <li>Sincronização com música ou voz possível em alguns modelos</li>
      </ul>
      <p><strong>Ideias:</strong> Jantar fora com ela a usar um vibrador interno controlado por ele; ele em reunião com um plug controlado por ela.</p>
      
      <h4>🍑 Plugs Anais (Iniciação)</h4>
      <p>Para explorar a estimulação anal de forma progressiva:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Começar por tamanhos pequenos (diâmetro < 3cm)</li>
        <li>Material seguro: silicone médico, aço inoxidável</li>
        <li>Base alargada (ESSENCIAL por segurança)</li>
        <li>Usar SEMPRE lubrificante à base de água</li>
        <li>Para ele: estimulação da próstata pode intensificar orgasmos</li>
        <li>Para ela: sensação de "preenchimento" durante sexo vaginal</li>
      </ul>
      <p><strong>Importante:</strong> Nunca forçar. Se dói, parar. Relaxamento e lubrificação são fundamentais.</p>
      
      <h4>🔥 Máquinas de Sexo</h4>
      <p>Para os verdadeiramente aventureiros:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Proporcionam penetração mecânica com velocidade e profundidade ajustáveis</li>
        <li>Libertam as mãos para outras atividades</li>
        <li>Excelente para dinâmicas de observação (cuckold/hotwife)</li>
        <li>Podem ser intimidantes, mas muito eficazes</li>
        <li>Investimento significativo (200€+)</li>
      </ul>
      
      <h3>Como Introduzir o Tema</h3>
      <p>Muitos casais querem experimentar mas têm receio de sugerir. Aqui estão estratégias comprovadas:</p>
      
      <h4>1. Navegação Online Conjunta</h4>
      <p>"Olha para este artigo engraçado sobre brinquedos... já pensaste em experimentar alguma coisa assim?" Tornem a exploração um momento de casal.</p>
      
      <h4>2. Começar com Algo "Inofensivo"</h4>
      <p>Massajadores que "por acaso" também servem para outras coisas. Óleos de massagem aquecíveis. Velas de massagem. São entradas suaves no mundo dos "acessórios".</p>
      
      <h4>3. Oferecer como Presente</h4>
      <p>Aniversário, Natal, ou simplesmente "vi isto e pensei em nós". Embrulhar num pacote bonito torna-o mais especial e menos "estranho".</p>
      
      <h4>4. Enquadrar como Complemento</h4>
      <p>"Adoro o que fazemos, e acho que isto podia tornar ainda melhor" em vez de "acho que precisamos de algo novo porque isto está monótono".</p>
      
      <h4>5. Perguntar Diretamente</h4>
      <p>Se têm boa comunicação: "Tenho curiosidade sobre vibradores para casais. Tu tens?" Honestidade direta funciona para muitos.</p>
      
      <h3>Dicas de Uso e Manutenção</h3>
      
      <h4>Antes de Usar:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Ler instruções:</strong> Parece óbvio, mas muitos não leem</li>
        <li><strong>Carregar ou colocar pilhas:</strong> Nada mata o mood como bateria fraca</li>
        <li><strong>Lavar:</strong> Sempre antes da primeira utilização</li>
        <li><strong>Testar fora do quarto:</strong> Conhecer os níveis de vibração, ruído, etc.</li>
      </ul>
      
      <h4>Durante:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Lubrificante:</strong> À base de água para silicone; à base de silicone para toys de vidro/metal</li>
        <li><strong>Começar devagar:</strong> Baixa intensidade primeiro</li>
        <li><strong>Comunicar:</strong> "Assim está bom?" "Mais forte?" "Muda para aqui"</li>
        <li><strong>Não ter vergonha:</strong> Se algo não está a funcionar, não insistir</li>
      </ul>
      
      <h4>Depois:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Limpar IMEDIATAMENTE:</strong> Sabão neutro e água morna</li>
        <li><strong>Secar bem:</strong> Humidade = bactérias</li>
        <li><strong>Guardar adequadamente:</strong> Sacos próprios, longe de outros toys de materiais diferentes</li>
        <li><strong>Verificar desgaste:</strong> Rachas, odores estranhos = substituir</li>
      </ul>
      
      <h3>Segurança e Saúde</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Materiais seguros:</strong> Silicone médico, vidro borossilicato, aço inoxidável, ABS. EVITAR: jelly, PVC com ftalatos</li>
        <li><strong>Não partilhar toys penetrativos:</strong> Sem proteção (preservativo)</li>
        <li><strong>Nada anal vai depois ao vaginal:</strong> Sem limpeza rigorosa pelo meio</li>
        <li><strong>Substituir baterias regularmente:</strong> Oxidação pode ser perigosa</li>
        <li><strong>Se irritação ocorrer:</strong> Parar uso, lavar área, consultar médico se persistir</li>
      </ul>
      
      <h3>Onde Comprar?</h3>
      <p><strong>Online (Portugal):</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>EllaSecret.pt - Grande variedade, entregas discretas</li>
        <li>Dol2.pt - Preços competitivos</li>
        <li>Amazon.es - Reviews de utilizadores, envio rápido</li>
      </ul>
      
      <p><strong>Lojas Físicas (Lisboa/Porto):</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Love Therapy - Staff simpático e aconselhamento</li>
        <li>Espaço dos Sentidos - Ambiente descontraído</li>
        <li>Algumas farmácias - Secções cada vez mais completas</li>
      </ul>
      
      <h3>Mitos vs. Realidade</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">❌ Mito</th>
          <th style="padding: 10px; border: 1px solid #ddd;">✅ Realidade</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Vibradores viciam</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Não existe dependência fisiológica. Podes simplesmente habituar-te a sensações intensas.</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Significa que o parceiro não é suficiente</td>
          <td style="padding: 10px; border: 1px solid #ddd;">É um complemento, não substituto. Como cozinhar com e sem batedeira - ambos são válidos.</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Só mulheres usam vibradores</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Cada vez mais homens exploram estimulação prostática, anéis vibradores, masturbadores, etc.</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Quanto maior, melhor</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Técnica, formato e tipo de estimulação importam mais que tamanho.</td>
        </tr>
      </table>
      
      <p style="margin-top: 20px;"><strong>Conclusão:</strong> Brinquedos sexuais são ferramentas fantásticas para explorar, aprender e intensificar o prazer do casal. A chave é comunicação aberta, escolhas informadas e uma atitude de curiosidade e diversão. Não há julgamento - só há o que funciona para VOCÊS.</p>
      </div>
    `
  },
  {
    id: "tasklists-sexuais",
    title: "Tasklists Sexuais: Aventuras Planeadas",
    excerpt: "Como criar listas de tarefas eróticas para manter a chama acesa, explorar fantasias e adicionar novidade à relação.",
    category: "dicas",
    categoryLabel: "Dicas",
    icon: "📋",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=400&fit=crop&q=80",
    readTime: 14,
    content: `
      <div style="text-align: left;">
      <h3>O Que São Tasklists Sexuais?</h3>
      <p>Tasklists sexuais são listas de "desafios" ou "missões" eróticas que os casais criam para cumprir ao longo do tempo. Funcionam como gamificação da intimidade - adicionam antecipação, novidade e um elemento lúdico à vida sexual. Podem ser simples ou elaboradas, diárias ou mensais, e adaptadas ao nível de conforto de cada casal.</p>
      
      <p>A ideia não é transformar sexo em "obrigação" ou "tarefa a cumprir", mas sim criar oportunidades intencionais para conexão íntima. Muitos casais descobrem que ter "tarefas" remove a pressão de "quem inicia" e cria igualdade na responsabilidade pelo prazer mútuo.</p>
      
      <h3>Porquê Usar Tasklists?</h3>
      
      <h4>📅 Combater a Rotina</h4>
      <p>Após anos juntos, é fácil cair em padrões repetitivos. Tasklists obrigam a experimentar coisas novas que, de outra forma, talvez nunca experimentassem.</p>
      
      <h4>💬 Abrir Comunicação</h4>
      <p>Criar a lista JUNTOS obriga a falar sobre desejos, fantasias e limites. Isto, por si só, já melhora a intimidade.</p>
      
      <h4>🔥 Construir Antecipação</h4>
      <p>Saber que "hoje é dia da tarefa X" cria excitação ao longo do dia. Podem trocar mensagens sobre isso, provocar um ao outro.</p>
      
      <h4>⚖️ Igualdade na Iniciativa</h4>
      <p>Quando há tarefas definidas, não é sempre a mesma pessoa a "ter que iniciar". O peso é partilhado.</p>
      
      <h3>Como Criar a Vossa Lista</h3>
      
      <h4>1️⃣ Sessão de Brainstorm</h4>
      <p>Sentem-se juntos, talvez com uma bebida, e cada um escreve ideias em papéis separados:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>O que sempre quiseste experimentar?</li>
        <li>O que gostaste muito e querias repetir?</li>
        <li>O que nunca fizemos que te intriga?</li>
        <li>Inspiração de filmes, livros, conversas com amigos?</li>
      </ul>
      
      <h4>2️⃣ Classificar por Níveis</h4>
      <p>Organizem as ideias em categorias de intensidade:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">Nível</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Descrição</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Exemplos</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">🟢 Leve</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Romântico, intimidade sem ser sexual</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Massagem, beijos longos, banho juntos</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">🟡 Médio</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Sexual mas dentro do confortável</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Posição nova, local diferente, striptease</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">🔴 Intenso</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Fora da zona de conforto</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Brinquedos novos, roleplay elaborado, BDSM leve</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">⚫ Extremo</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Fantasias mais ousadas (se ambos quiserem)</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Exibicionismo, elementos de terceiros, experiências novas</td>
        </tr>
      </table>
      
      <h4>3️⃣ Definir Frequência e Formato</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Semanal:</strong> Uma tarefa por semana para cumprir</li>
        <li><strong>Diária (desafio):</strong> Para períodos curtos (ex: 7 dias de paixão)</li>
        <li><strong>Mensal:</strong> Uma experiência maior por mês</li>
        <li><strong>Aleatória:</strong> Tirar de um frasco quando quiserem</li>
      </ul>
      
      <h3>Ideias de Tarefas por Nível</h3>
      
      <h4>🟢 Nível Leve - Conexão e Romance</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Fazer uma massagem sensual de 20 minutos (com óleo quente)</li>
        <li>Escrever uma carta/mensagem descrevendo o que adoras fisicamente no outro</li>
        <li>Beijar apaixonadamente durante 5 minutos (timer ligado, sem parar)</li>
        <li>Tomar banho juntos com velas e música</li>
        <li>Dormir nus abraçados (mesmo sem sexo)</li>
        <li>Fazer elogios específicos ao corpo do parceiro durante o dia (mínimo 5)</li>
        <li>Dançar juntos lentamente no quarto</li>
        <li>Pequeno-almoço na cama a alimentar um ao outro</li>
        <li>Enviar mensagem provocadora a meio do dia</li>
        <li>Ir para a cama 30 minutos mais cedo só para conversar</li>
      </ul>
      
      <h4>🟡 Nível Médio - Exploração Sexual</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Experimentar uma posição sexual nova (pesquisar juntos antes)</li>
        <li>Sexo noutro local da casa (cozinha, casa de banho, varanda)</li>
        <li>Fazer striptease um para o outro</li>
        <li>Usar roupa interior nova/sexy comprada especialmente</li>
        <li>Roleplay leve (desconhecidos num bar, professor/aluno)</li>
        <li>Assistir conteúdo erótico juntos e replicar algo que viram</li>
        <li>Edging: levar o parceiro quase ao orgasmo e parar (3 vezes)</li>
        <li>Masturbação mútua (cada um toca-se enquanto o outro observa)</li>
        <li>Sexo com apenas uma regra: não tocar em certas zonas (ex: só mãos)</li>
        <li>Despertar o parceiro com sexo (com consentimento prévio)</li>
        <li>Sexo cronometrado: 5 minutos de preliminares, 10 de ato, 5 de afterglow</li>
      </ul>
      
      <h4>🔴 Nível Intenso - Fora da Zona de Conforto</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Introduzir um brinquedo sexual novo (comprar juntos)</li>
        <li>Venda nos olhos + mãos amarradas (leve bondage)</li>
        <li>Roleplay elaborado com disfarces e cenário</li>
        <li>Sessão de massagem tântrica completa</li>
        <li>Fotografias/vídeos sensuais (só para vocês, com segurança)</li>
        <li>Sexo num local semi-público (carro, praia deserta, provador)</li>
        <li>Noite de "escravo/a": um obedece a TUDO que o outro pede (com safe word)</li>
        <li>Maratona sexual: fazer amor 3+ vezes no mesmo dia</li>
        <li>Explorar estimulação anal (se nunca experimentaram)</li>
        <li>Controlo do orgasmo: um decide quando o outro pode gozar</li>
      </ul>
      
      <h4>⚫ Nível Extremo - Para Casais Muito Aventureiros</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Visitar uma praia nudista juntos</li>
        <li>Ver um filme pornográfico em sala (onde legal e aceite)</li>
        <li>Visitar um clube de swing só para observar</li>
        <li>Fazer sexo com janela/cortinas abertas (sem ser visto diretamente)</li>
        <li>Sessão de BDSM com equipamento adequado</li>
        <li>Jogo de controlo remoto: vibrador discreto usado em público</li>
        <li>Threesome fantasy talk: descrever em detalhe durante sexo</li>
        <li>Escrever ficção erótica sobre vocês e ler em voz alta</li>
      </ul>
      
      <h3>Formatos Criativos</h3>
      
      <h4>🎲 Frasco das Fantasias</h4>
      <p>Cada um escreve 10-20 tarefas em papéis. Dobram e colocam num frasco. Uma vez por semana (ou quando quiserem), tiram um papel aleatório e cumprem nessa semana.</p>
      
      <h4>📆 Calendário do Advento Erótico</h4>
      <p>24 tarefas para dezembro (ou qualquer mês). Cada dia abrem uma "porta" com uma tarefa. Podem comprar calendários prontos ou criar o vosso.</p>
      
      <h4>🎯 Bingo Sexual</h4>
      <p>Criar cartão de bingo 5x5 com 25 tarefas. Objetivo: fazer linha, coluna, diagonal ou cartela cheia. Prémio para quem completar primeiro (ou prémio conjunto).</p>
      
      <h4>🃏 Deck de Cartas</h4>
      <p>52 cartas, 52 tarefas. Baralhar e tirar uma por semana = um ano de novidade garantida.</p>
      
      <h4>📱 Sistemas de Pontos</h4>
      <p>Cada tarefa vale X pontos. Acumular pontos para "prémios" maiores (massagem profissional, noite fora, brinquedo novo).</p>
      
      <h3>Apps e Ferramentas</h3>
      
      <h4>📱 Apps Especializadas</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Desire:</strong> Jogo de desafios e dares para casais</li>
        <li><strong>Kindu:</strong> Match de fantasias - só vêem as que ambos marcaram "sim"</li>
        <li><strong>Spicer:</strong> Desafios e ideias com níveis de intensidade</li>
        <li><strong>Gottman Card Decks:</strong> Mais focado em conexão emocional</li>
        <li><strong>iPassion:</strong> Jogo de perguntas e desafios</li>
      </ul>
      
      <h4>🛠️ Ferramentas DIY</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Trello/Notion:</strong> Criar board partilhado com listas por nível</li>
        <li><strong>Google Sheets:</strong> Lista com checkbox para marcar cumpridas</li>
        <li><strong>Randomizer online:</strong> Para escolher tarefas aleatoriamente</li>
        <li><strong>Pinterest:</strong> Inspiração para ideias novas</li>
      </ul>
      
      <h3>Dicas de Sucesso</h3>
      
      <h4>✅ O Que Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Criar a lista JUNTOS - não impor unilateralmente</li>
        <li>Incluir tarefas que ambos gostem (não só as de um)</li>
        <li>Começar por níveis leves e ir subindo</li>
        <li>Permitir "passes" - se um não está no mood para tarefa X, trocar</li>
        <li>Celebrar quando completam tarefas (não é "trabalho")</li>
        <li>Revisar e atualizar a lista regularmente</li>
        <li>Manter privado e seguro (apps com password)</li>
      </ul>
      
      <h4>❌ O Que Evitar:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Transformar em obrigação ("tens que fazer")</li>
        <li>Julgar as ideias do outro ("isso é esquisito")</li>
        <li>Incluir coisas que um claramente não quer</li>
        <li>Comparar com outros casais</li>
        <li>Partilhar lista com terceiros sem consentimento</li>
        <li>Usar como arma ("não cumpriste a tarefa, estás em falta")</li>
      </ul>
      
      <h3>Exemplo de Lista Semanal (30 Dias)</h3>
      
      <p><strong>Semana 1 - Reconexão:</strong></p>
      <ol style="text-align: left; padding-left: 20px;">
        <li>Dia 1: Massagem de 15 min</li>
        <li>Dia 2: 5 elogios físicos</li>
        <li>Dia 3: Banho juntos</li>
        <li>Dia 4: Beijos de 3 min (só beijos)</li>
        <li>Dia 5: Dormem nus abraçados</li>
        <li>Dia 6: Dançam juntos</li>
        <li>Dia 7: Sexo lento e romântico</li>
      </ol>
      
      <p><strong>Semana 2 - Exploração:</strong></p>
      <ol style="text-align: left; padding-left: 20px;" start="8">
        <li>Dia 8: Striptease (quem quiser)</li>
        <li>Dia 9: Posição nova</li>
        <li>Dia 10: Sexo noutro local da casa</li>
        <li>Dia 11: Masturbação mútua</li>
        <li>Dia 12: Dirty talk intenso</li>
        <li>Dia 13: Roleplay leve</li>
        <li>Dia 14: Orgasmo só oral (um cada)</li>
      </ol>
      
      <p><strong>Semana 3 - Intensificar:</strong></p>
      <ol style="text-align: left; padding-left: 20px;" start="15">
        <li>Dia 15: Venda nos olhos</li>
        <li>Dia 16: Brinquedo novo</li>
        <li>Dia 17: Fotos sensuais (só para vocês)</li>
        <li>Dia 18: Sexo fora de casa (carro, hotel)</li>
        <li>Dia 19: Noite de "obediência"</li>
        <li>Dia 20: Maratona (3+ rounds)</li>
        <li>Dia 21: Sessão tântrica</li>
      </ol>
      
      <p><strong>Semana 4 - Consolidar:</strong></p>
      <ol style="text-align: left; padding-left: 20px;" start="22">
        <li>Dia 22-28: Repetir os favoritos das semanas anteriores</li>
        <li>Dia 29: Conversar sobre o que mais gostaram</li>
        <li>Dia 30: Criar nova lista para próximo mês!</li>
      </ol>
      
      <p style="margin-top: 20px; font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;"><strong>Testemunho anónimo:</strong> "Depois de 12 anos de casamento, o sexo tinha caído para uma vez por mês e sempre igual. Começámos com o frasco das fantasias - cada um escreveu 15 papéis. Nas primeiras semanas foi um bocado awkward, mas rapidamente tornou-se o nosso jogo favorito. Hoje, 8 meses depois, fazemos sexo 2-3x por semana e a variedade é incomparável. O mais importante: voltámos a FALAR sobre sexo, coisa que não fazíamos há anos."</p>
      
      <p><strong>Mensagem final:</strong> Tasklists sexuais são uma ferramenta poderosa para casais que querem sair da rotina e explorar novos territórios juntos. Não são para todos, e está OK se não for a vossa praia. Mas se decidirem experimentar, abordem com espírito lúdico, flexibilidade e sem pressão. O objetivo é diversão e conexão - não performance ou obrigação.</p>
      </div>
    `
  },
  {
    id: "turismo-adulto",
    title: "Turismo Adulto: Destinos para Casais Liberais",
    excerpt: "Conhece os melhores destinos de turismo adulto no mundo e em Portugal - resorts eróticos, praias nudistas e experiências inesquecíveis.",
    category: "viagens",
    categoryLabel: "Viagens",
    icon: "✈️",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=400&fit=crop&q=80",
    readTime: 18,
    content: `
      <div style="text-align: left;">
      <h3>O Que É Turismo Adulto?</h3>
      <p>O turismo adulto engloba viagens focadas em experiências sensuais, eróticas ou de lifestyle liberal. Não é só sobre sexo - é sobre liberdade, nudismo, ambiente descontraído e conexão com outros casais ou indivíduos que partilham valores semelhantes sobre sexualidade aberta. É uma indústria em crescimento, com resorts de luxo, cruzeiros temáticos e destinos dedicados.</p>
      
      <p>Para casais que querem explorar além do convencional, estas viagens podem ser transformadoras - seja para experimentar swing, voyeurismo, exibicionismo, ou simplesmente para estar num ambiente onde a nudez e a sexualidade são normalizadas.</p>
      
      <h3>Destinos de Topo Mundial</h3>
      
      <h4>🇲🇽 México - Cancun & Riviera Maya</h4>
      <p>O México é a Meca do turismo adulto graças a resorts que combinam luxo all-inclusive com ambiente lifestyle:</p>
      
      <p><strong>Desire Resorts (Riviera Maya & Pearl):</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Desire Riviera Maya:</strong> O original, mais focado em lifestyle swing</li>
        <li><strong>Desire Pearl:</strong> Mais sofisticado e sensual, menos "explícito"</li>
        <li>Praias de topless/nudismo opcional</li>
        <li>Jacuzzis sensuais, sala de playroom discreta</li>
        <li>Festas temáticas (noite branca, noite romana, noite lingerie)</li>
        <li>Preços: ~€300-500/noite all-inclusive para casal</li>
        <li>Apenas casais (não aceitam solteiros)</li>
      </ul>
      
      <p><strong>Temptation Cancun Resort:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Mais party-focused, ambiente de festa constante</li>
        <li>Topless pool, sexy pool games</li>
        <li>Aceita casais e solteiros</li>
        <li>Mais jovem e festivo que Desire</li>
        <li>Ideal para quem quer diversão sem compromisso de lifestyle</li>
        <li>Preços: ~€200-350/noite all-inclusive</li>
      </ul>
      
      <p><strong>Intima Resort (Tulum):</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Boutique resort adults-only</li>
        <li>Mais exclusivo e privado</li>
        <li>Ideal para casais que querem experiência VIP</li>
      </ul>
      
      <h4>🇯🇲 Jamaica - Hedonism II</h4>
      <p>O resort lifestyle MAIS famoso do mundo. Existe desde 1976 e é uma instituição:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Prude Side:</strong> Para quem quer ambiente liberal mas com fato de banho</li>
        <li><strong>Nude Side:</strong> Praia totalmente nu, piscina, jacuzzis</li>
        <li><strong>Playroom:</strong> Espaço para swing com equipamento completo</li>
        <li><strong>Toga Party, Pajama Party, Glow Party:</strong> Festas temáticas épicas</li>
        <li><strong>Noche de Amor:</strong> Evento especial mais sensual</li>
        <li>Aceita solteiros (mas com proporções controladas)</li>
        <li>Ambiente mais diverso em termos de idade e nacionalidade</li>
        <li>Preços: ~€250-400/noite all-inclusive</li>
      </ul>
      
      <p><strong>Dica insider:</strong> A melhor semana é durante eventos específicos (Naughty Week, Hot & Sexy Week). Procurem no calendário antes de reservar.</p>
      
      <h4>🇫🇷 França - Cap d'Agde</h4>
      <p>A lendária "cidade nudista" do sul de França, junto ao Mediterrâneo na região de Occitânia:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Quartier Naturiste:</strong> Zona fechada onde nudismo é obrigatório</li>
        <li>Supermercados, restaurantes, lojas - tudo nu</li>
        <li>Praia nudista de quilómetros</li>
        <li>Múltiplos clubes de swing dentro e fora da zona</li>
        <li>Le Glamour, Le Melrose, Le Jardin d'Eden - clubes famosos</li>
        <li>Ambiente liberal extremo (especialmente em agosto)</li>
        <li>Apartamentos para alugar - cozinha própria</li>
        <li>Preços: Apartamento ~€80-150/noite; clubes ~€50-80 entrada casal</li>
        <li>Melhor época: Julho-Agosto (mais animado, mais cheio)</li>
      </ul>
      
      <p><strong>Atenção:</strong> Cap d'Agde pode ser muito intenso para iniciantes. O ambiente é muito explícito, especialmente à noite. Considerem começar por outros destinos se for a primeira experiência.</p>
      
      <h4>🇳🇱 Holanda - Clubes e Resorts</h4>
      <p>A Holanda tem uma cena lifestyle muito desenvolvida:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Fun4Two:</strong> Um dos maiores clubes de swing da Europa</li>
        <li><strong>Fata Morgana:</strong> Resort nudista com eventos lifestyle</li>
        <li>Mentalidade aberta holandesa = ambiente relaxado</li>
        <li>Ideal para quem quer combinar com turismo tradicional</li>
      </ul>
      
      <h4>🇪🇸 Espanha - Costa del Sol & Ibiza</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Vera Playa:</strong> Zona naturista com apartamentos e ambiente nudista</li>
        <li><strong>Ibiza:</strong> Festas, beach clubs, ambiente libertino (não necessariamente lifestyle)</li>
        <li>Clubes de swing em Málaga e Barcelona</li>
        <li>Mais acessível para portugueses (proximidade e preço)</li>
      </ul>
      
      <h4>🇵🇹 Portugal - O Que Temos Cá</h4>
      <p>Portugal não tem resorts lifestyle dedicados, mas tem opções:</p>
      
      <p><strong>Clubes de Swing:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Lisboa:</strong> Épices (encerrado temporariamente), eventos privados</li>
        <li><strong>Porto:</strong> Clubes privados, festas organizadas</li>
        <li><strong>Algarve:</strong> Festas de verão, especialmente agosto</li>
        <li>Comunidade crescente mas discreta</li>
      </ul>
      
      <p><strong>Praias Nudistas:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Meco, Bela Vista, Ilha Deserta (ver artigo dedicado)</li>
        <li>Nudismo sim, lifestyle não (comportamento sexual proibido)</li>
        <li>Boas para casais que querem começar com nudismo social</li>
      </ul>
      
      <h3>Cruzeiros Adultos</h3>
      <p>Uma forma única de fazer turismo lifestyle - resorts flutuantes!</p>
      
      <h4>🚢 Desire Cruises</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Navios charter 100% lifestyle (fretados pela Desire)</li>
        <li>Destinos: Caraíbas, Mediterrâneo, México</li>
        <li>Playroom a bordo, festas temáticas, nudismo no deck</li>
        <li>Preços: €2000-5000+ por pessoa para 4-7 noites</li>
        <li>Experiência premium, muito procurada</li>
      </ul>
      
      <h4>🚢 Bliss Cruise</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Outra linha de cruzeiros lifestyle</li>
        <li>Foco no Caribe</li>
        <li>Eventos anuais muito concorridos</li>
      </ul>
      
      <h4>🚢 Temptation Caribbean Cruise</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ambiente mais party, menos swing</li>
        <li>Topless permitido, não necessariamente nudismo total</li>
        <li>Mais acessível em preço</li>
      </ul>
      
      <h3>Como Preparar a Primeira Viagem</h3>
      
      <h4>1️⃣ Pesquisa Exaustiva</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ler reviews em sites específicos (SDC, Tripadvisor tem alguns)</li>
        <li>Ver vídeos de viajantes (YouTube tem bastante conteúdo)</li>
        <li>Entrar em fóruns/grupos de Facebook de lifestyle</li>
        <li>Perceber o nível de "intensidade" de cada destino</li>
      </ul>
      
      <h4>2️⃣ Conversa Profunda entre o Casal</h4>
      <p>ANTES de reservar, falem sobre:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Expectativas:</strong> "Vamos só observar ou participar?"</li>
        <li><strong>Limites:</strong> "O que está OK? O que não está?"</li>
        <li><strong>Cenários:</strong> "E se acontecer X? E se um de nós quiser parar?"</li>
        <li><strong>Ciúme:</strong> "Como vamos lidar se surgir?"</li>
        <li><strong>Privacidade:</strong> "Partilhamos isto com alguém?"</li>
      </ul>
      
      <h4>3️⃣ Começar "Leve"</h4>
      <p>Se nunca fizeram nada lifestyle:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Primeira viagem: Resort sensual mas não explícito (ex: Desire Pearl)</li>
        <li>Ou: Praia nudista primeiro (só para testar nudismo social)</li>
        <li>Evitar Cap d'Agde em agosto como primeira experiência</li>
        <li>Dar-se permissão para NÃO fazer nada - só estar lá já é uma experiência</li>
      </ul>
      
      <h4>4️⃣ Safe Words e Check-ins</h4>
      <p>Mesmo de férias, manter comunicação:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ter uma palavra/gesto que significa "vamos sair daqui"</li>
        <li>Check-ins regulares: "Como te sentes? Queres continuar?"</li>
        <li>Se um quiser parar, o outro apoia sem questionar</li>
      </ul>
      
      <h4>5️⃣ Gestão de Expectativas</h4>
      <p>A realidade muitas vezes difere da fantasia:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Não vão ser "atacados" por casais - tem que haver interesse mútuo</li>
        <li>Podem não encontrar ninguém que atraía a ambos</li>
        <li>Pode haver momentos awkward - é normal</li>
        <li>A melhor experiência pode ser simplesmente a liberdade de estar nus juntos</li>
      </ul>
      
      <h3>O Que Levar</h3>
      
      <h4>👙 Roupa</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Menos fatos de banho do que achas (vais estar nu)</li>
        <li>Roupa sexy para festas temáticas</li>
        <li>Lingerie/underwear provocadora</li>
        <li>Vestido/camisa que pareça elegante para jantares</li>
        <li>Sapatos confortáveis E uns tacões/sapatos elegantes</li>
      </ul>
      
      <h4>🧴 Higiene e Saúde</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Protetor solar (vão apanhar sol em zonas novas!)</li>
        <li>Lubrificante pessoal (pode não estar disponível)</li>
        <li>Preservativos (mesmo que resort forneça, levem os vossos)</li>
        <li>Medicação habitual + anti-histamínicos/anti-inflamatórios</li>
      </ul>
      
      <h4>📱 Tecnologia</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Verificar política de fotos - muitos resorts proíbem</li>
        <li>Apps de comunicação em caso de separação</li>
        <li>Plano roaming ou SIM local</li>
      </ul>
      
      <h3>Etiqueta nos Resorts Lifestyle</h3>
      
      <h4>✅ Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Cumprimentar outros casais de forma amigável</li>
        <li>Respeitar "não obrigado" graciosamente</li>
        <li>Manter higiene impecável</li>
        <li>Participar em eventos e atividades sociais</li>
        <li>Elogiar com sinceridade (não de forma predatória)</li>
      </ul>
      
      <h4>❌ Não Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Fotografar ou filmar sem consentimento EXPLÍCITO</li>
        <li>Tocar sem permissão</li>
        <li>Insistir após recusa</li>
        <li>Ficar bêbado de forma descontrolada</li>
        <li>Contar segredos de outros hóspedes fora do resort</li>
        <li>Homem sozinho aproximar-se de mulher sozinha (ela pode estar a esperar o marido)</li>
      </ul>
      
      <h3>Depois da Viagem</h3>
      
      <h4>💬 Conversa de Debriefing</h4>
      <p>Uns dias depois, falem sobre:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"O que gostaste mais?"</li>
        <li>"Houve algo que te incomodou?"</li>
        <li>"Repetiríamos? O que fariam diferente?"</li>
        <li>"Isto mudou algo na nossa relação?"</li>
      </ul>
      
      <h4>🔒 Privacidade</h4>
      <p>Acordar se isto fica entre vocês ou se partilham com amigos próximos. Muitos casais mantêm discreto; outros são abertos. Ambas as opções são válidas.</p>
      
      <p style="margin-top: 20px; font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;"><strong>Testemunho anónimo:</strong> "A nossa primeira viagem a um resort lifestyle foi transformadora. Passámos 4 noites no Desire e não fizemos swing com ninguém - mas a liberdade de estar nus, dançar juntos em festas sensuais, e simplesmente SER quem somos sem julgamento foi incrível. Voltámos com uma ligação mais forte do que tivemos em anos."</p>
      
      <p><strong>Mensagem final:</strong> Turismo adulto não é sobre fazer swing ou ter sexo com desconhecidos (embora possa incluir isso se ambos quiserem). É sobre liberdade, exploração e aventura em casal. Façam ao vosso ritmo, respeitem os vossos limites e os dos outros, e divirtam-se!</p>
      </div>
    `
  },
  {
    id: "praias-nudistas-portugal",
    title: "Praias Nudistas em Portugal: Guia Completo",
    excerpt: "Descobre as melhores praias naturistas de norte a sul do país - dicas, etiqueta e o que esperar.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    icon: "🏖️",
    image: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=600&h=400&fit=crop&q=80",
    readTime: 14,
    content: `
      <div style="text-align: left;">
      <h3>Naturismo em Portugal: Uma Tradição Discreta</h3>
      <p>Portugal tem uma longa tradição naturista, embora menos visível que países como França ou Alemanha. Temos praias oficialmente reconhecidas como naturistas, outras toleradas, e uma comunidade crescente de praticantes. O clima ameno, especialmente no sul, torna-nos um destino atrativo para o nudismo social.</p>
      
      <p>Se nunca experimentaste nudismo de praia, Portugal é um excelente lugar para começar - ambiente relativamente descontraído, boas praias e comunidade respeitadora.</p>
      
      <h3>Praias Naturistas Oficiais</h3>
      <p>Estas praias são legalmente reconhecidas para prática naturista:</p>
      
      <h4>🏖️ Praia do Meco (Sesimbra) - A Rainha</h4>
      <p>A mais famosa e frequentada de Portugal. Zona naturista demarcada por bandeira.</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Localização:</strong> Sul de Lisboa (~40km), entre Sesimbra e Lagoa de Albufeira</li>
        <li><strong>Acesso:</strong> Estacionamento pago, depois descida de escadas (íngreme)</li>
        <li><strong>Ambiente:</strong> Maioritariamente casais e famílias naturistas; zona gay-friendly na extremidade sul</li>
        <li><strong>Infraestruturas:</strong> Restaurante no topo, nadador-salvador na época</li>
        <li><strong>Melhor época:</strong> Junho-Setembro (água menos fria)</li>
        <li><strong>Dica:</strong> Chegar cedo aos fins de semana de verão - enche rapidamente</li>
        <li><strong>Nudez:</strong> Zona naturista bem definida; respeitar delimitações</li>
      </ul>
      
      <p><strong>O que esperar:</strong> Pessoas de todas as idades, corpos diversos, ambiente familiar durante o dia. Evitar comportamentos sexuais - é proibido e mal visto.</p>
      
      <h4>🏖️ Praia da Bela Vista (Costa da Caparica) - Perto de Lisboa</h4>
      <p>A opção mais acessível para lisboetas. Praias 17-19 são tradicionalmente naturistas.</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Localização:</strong> Costa da Caparica, acesso por mini-comboio ou a pé</li>
        <li><strong>Acesso:</strong> Estacionamento gratuito perto do fim da estrada; comboio de praia (Transpraia)</li>
        <li><strong>Ambiente:</strong> Mais jovem e diverso que Meco; muito popular comunidade LGBT+</li>
        <li><strong>Infraestruturas:</strong> Bares de praia nas praias adjacentes</li>
        <li><strong>Melhor época:</strong> Maio-Outubro</li>
        <li><strong>Dica:</strong> Praias 17 e 18 mais naturistas; 19 mais gay-friendly</li>
        <li><strong>Nudez:</strong> Menos demarcada oficialmente - observar os outros antes de despir</li>
      </ul>
      
      <h4>🏖️ Praia da Ursa (Sintra) - Selvagem e Secreta</h4>
      <p>Uma das praias mais bonitas de Portugal. Difícil acesso mas recompensadora.</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Localização:</strong> Junto ao Cabo da Roca, Sintra</li>
        <li><strong>Acesso:</strong> Trilho íngreme de ~30min descida (e ~45min subida!)</li>
        <li><strong>Ambiente:</strong> Selvagem, poucas pessoas, formações rochosas impressionantes</li>
        <li><strong>Infraestruturas:</strong> NENHUMAS - levar tudo</li>
        <li><strong>Dica:</strong> Não apta para mobilidade reduzida; levar água e snacks</li>
        <li><strong>Nudez:</strong> Tolerada mas não oficial; mais afastado da entrada = mais nudismo</li>
      </ul>
      
      <h3>Praias Naturistas no Centro</h3>
      
      <h4>🏖️ Praia do Salto (Lourinhã)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Acesso por escadas íngremes</li>
        <li>Mais tranquila que Meco</li>
        <li>Ambiente familiar</li>
        <li>Menos frequentada = mais privacidade</li>
      </ul>
      
      <h4>🏖️ Praia da Adiça (Almada)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pequena e discreta</li>
        <li>Acesso por trilho de terra</li>
        <li>Popular entre nudistas locais</li>
      </ul>
      
      <h3>Praias Naturistas no Algarve</h3>
      
      <h4>🏖️ Ilha Deserta / Ilha da Barreta (Faro) - Paradisíaca</h4>
      <p>A joia do naturismo português. Acesso só de barco torna-a exclusiva.</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Localização:</strong> Parque Natural da Ria Formosa, Faro</li>
        <li><strong>Acesso:</strong> Barco desde Faro (~15-20min, ~5-8€ ida e volta)</li>
        <li><strong>Ambiente:</strong> Praia praticamente deserta (daí o nome), areia branca</li>
        <li><strong>Infraestruturas:</strong> Restaurante perto do cais; resto da ilha selvagem</li>
        <li><strong>Dica:</strong> Caminhar para sul (oposto ao restaurante) para zona mais naturista</li>
        <li><strong>Nudez:</strong> Quanto mais longe do cais, mais nudismo</li>
        <li><strong>Experiência:</strong> Das melhores praias de Portugal, naturista ou não</li>
      </ul>
      
      <h4>🏖️ Praia de Adegas (Odeceixe)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pequena enseada escondida</li>
        <li>Acesso por trilho desde Odeceixe</li>
        <li>Ambiente muito tranquilo</li>
        <li>Popular entre naturistas experientes</li>
      </ul>
      
      <h4>🏖️ Praia dos Alteirinhos (Zambujeira do Mar)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Costa Vicentina, beleza natural impressionante</li>
        <li>Acesso por escadaria</li>
        <li>Menos turística</li>
        <li>Bom nudismo social</li>
      </ul>
      
      <h4>🏖️ Praia do Homem Nu (Tavira)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Nome não oficial mas revelador!</li>
        <li>Na Ilha de Tavira, acesso de barco</li>
        <li>Tradição naturista estabelecida</li>
      </ul>
      
      <h3>Praias Naturistas no Norte</h3>
      <p>O norte tem menos tradição naturista (clima menos favorável), mas existem opções:</p>
      
      <h4>🏖️ Praia do Magoito (Sintra)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Zona naturista na parte sul</li>
        <li>Menos frequentada que Meco</li>
      </ul>
      
      <h3>Etiqueta Naturista - O Código Não Escrito</h3>
      
      <h4>✅ O Que FAZER:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Usar toalha para sentar:</strong> Higiene básica, sempre sentar em toalha própria</li>
        <li><strong>Aplicar protetor solar:</strong> Em TODAS as partes (zonas nunca expostas queimam facilmente!)</li>
        <li><strong>Cumprimentar naturalmente:</strong> Olhar nos olhos, sorriso simpático</li>
        <li><strong>Manter distância respeitosa:</strong> Não colar toalha aos vizinhos</li>
        <li><strong>Vestir ao sair da zona:</strong> Respeitar zonas não-naturistas</li>
        <li><strong>Levar saco para lixo:</strong> Não deixar vestígios</li>
      </ul>
      
      <h4>❌ O Que NÃO FAZER:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Olhar fixamente:</strong> Discreto está bem; stare prolongado é desconfortável</li>
        <li><strong>Fotografar pessoas:</strong> SEM consentimento explícito - NUNCA</li>
        <li><strong>Comportamento sexual:</strong> Proibido e ilegal em espaço público</li>
        <li><strong>Comentários sobre corpos:</strong> Não elogiar nem criticar</li>
        <li><strong>Aproximar-se de desconhecidos:</strong> Manter distância a menos que conversa seja iniciada</li>
        <li><strong>Usar binóculos/teleobjetivas:</strong> Obviamente proibido</li>
        <li><strong>Ereções visíveis:</strong> Se acontecer, deitar de barriga para baixo ou ir à água</li>
      </ul>
      
      <h3>Primeira Vez? Guia Passo a Passo</h3>
      
      <h4>1️⃣ Antes de Ir</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Escolher praia com boa reputação (Meco ou Ilha Deserta são boas opções)</li>
        <li>Conversar com o parceiro sobre expectativas</li>
        <li>Lembrar: É sobre liberdade, não exibicionismo</li>
        <li>Não ter expectativas de "acontecer alguma coisa" - é praia, não clube</li>
      </ul>
      
      <h4>2️⃣ À Chegada</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Observar o ambiente primeiro</li>
        <li>Encontrar um sítio com alguma privacidade inicial</li>
        <li>Não precisam de despir imediatamente - instalem-se primeiro</li>
        <li>Começar por topless (para ela) é uma opção gradual</li>
      </ul>
      
      <h4>3️⃣ O Grande Momento</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Quando se sentirem prontos, despir naturalmente</li>
        <li>Deitar na toalha, aplicar protetor</li>
        <li>Surpreendentemente, após 5 minutos, sente-se completamente normal</li>
        <li>Focar nas sensações: sol na pele toda, brisa, liberdade</li>
      </ul>
      
      <h4>4️⃣ Durante o Tempo na Praia</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ir à água nus - sensação incrível</li>
        <li>Não se preocupar com os outros - estão tão focados neles como vocês</li>
        <li>Conversar normalmente - sobre tudo menos os corpos uns dos outros</li>
      </ul>
      
      <h3>Perguntas Frequentes</h3>
      
      <p><strong>P: E se tiver uma ereção?</strong><br>
      R: Acontece, especialmente aos homens na primeira vez (nervosismo ou excitação). Não é crime. Deitar de barriga para baixo, pensar em coisas não-sensuais, ou ir dar um mergulho. Passa rapidamente.</p>
      
      <p><strong>P: Tenho vergonha do meu corpo.</strong><br>
      R: Numa praia naturista vais ver TODOS os tipos de corpos. Velhos, jovens, gordos, magros, com cicatrizes, com imperfeições. Ninguém está a julgar. A maioria sente-se mais confortável com o próprio corpo DEPOIS de experimentar naturismo.</p>
      
      <p><strong>P: Posso ir sozinho/a?</strong><br>
      R: Sim, mas mulheres sozinhas podem sentir-se mais observadas. Homens sozinhos também são bem-vindos mas devem estar atentos para não parecerem "creepy".</p>
      
      <p><strong>P: Posso levar crianças?</strong><br>
      R: Sim! Naturismo é prática familiar em muitas culturas. Crianças crescem com imagem corporal mais saudável. Claro, sempre com supervisão e protector solar reforçado.</p>
      
      <p><strong>P: É só para casais ou swingers?</strong><br>
      R: Absolutamente não. A maioria dos naturistas são pessoas "normais" que simplesmente preferem estar sem roupa ao sol. Não há componente sexual no naturismo de praia (é proibido).</p>
      
      <p><strong>P: E a depilação?</strong><br>
      R: Como preferirem! Há de tudo - totalmente depilados, parcialmente, naturais. Não há regra.</p>
      
      <p><strong>P: E se encontrar conhecidos?</strong><br>
      R: Eles também estão lá pelo mesmo motivo! Acena, cumprimenta, e pronto. Discrição mútua.</p>
      
      <h3>Naturismo vs. Lifestyle</h3>
      <p>É importante distinguir:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">Naturismo/Nudismo</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Lifestyle/Swing</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Nudez sem conotação sexual</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Ambiente erótico/sexual</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Legal em espaços públicos designados</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Apenas em espaços privados/clubes</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Famílias bem-vindas</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Apenas adultos</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Foco na liberdade corporal</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Foco na exploração sexual</td>
        </tr>
      </table>
      
      <p style="margin-top: 15px;"><strong>Atenção:</strong> Comportamento sexual em praias públicas (naturistas ou não) é ilegal e pode resultar em multa ou detenção.</p>
      
      <h3>Recursos em Portugal</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Federação Portuguesa de Naturismo (FPN):</strong> fpn.pt</li>
        <li><strong>Grupos Facebook:</strong> "Naturismo Portugal", "Praias Nudistas Portugal"</li>
        <li><strong>Parques de campismo naturistas:</strong> Quinta do Maral (Abrantes)</li>
      </ul>
      
      <p style="margin-top: 20px; font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;"><strong>Testemunho anónimo:</strong> "Levei anos a criar coragem para ir a uma praia naturista. Tinha vergonha do meu corpo pós-gravidez. Quando finalmente fui ao Meco com o meu marido, descobri que NINGUÉM estava a olhar para as minhas estrias. Havia corpos de todas as formas e tamanhos. Chorei de libertação. Agora é o nosso programa de verão favorito."</p>
      
      <p><strong>Mensagem final:</strong> O naturismo é sobre liberdade, aceitação corporal e conexão com a natureza. Não tem nada de sexual ou escandaloso - é simplesmente a forma mais natural de estar. Se têm curiosidade, experimentem. O máximo que pode acontecer é descobrirem que afinal não é para vocês. Mas a maioria das pessoas que experimenta... nunca mais quer vestir fato de banho!</p>
      </div>
    `
  },
  {
    id: "massagem-tantrica",
    title: "Massagem Tântrica: Yoni e Lingam",
    excerpt: "Aprende os fundamentos da massagem tântrica e como aplicar com o teu parceiro para maior intimidade e prazer.",
    category: "dicas",
    categoryLabel: "Dicas",
    icon: "💆",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop&q=80",
    readTime: 20,
    content: `
      <div style="text-align: left;">
      <h3>O Que É a Massagem Tântrica?</h3>
      <p>A massagem tântrica é muito mais do que uma técnica de massagem sensual - é uma prática espiritual milenar que usa o toque consciente, a respiração e a energia sexual como caminhos para a conexão profunda, cura emocional e prazer intensificado. Originária das tradições hindus e budistas, o Tantra vê a energia sexual (kundalini) como uma força vital poderosa que pode ser canalizada para além do orgasmo físico.</p>
      
      <p>Para casais, a massagem tântrica oferece uma forma de se reconectarem intimamente, saírem da rotina sexual mecânica e descobrirem novas formas de dar e receber prazer. Não é sobre performance ou orgasmo rápido - é sobre presença, vulnerabilidade e expansão sensorial.</p>
      
      <h3>Conceitos Fundamentais do Tantra</h3>
      
      <h4>🔥 Energia Sexual (Kundalini)</h4>
      <p>O Tantra vê a energia sexual como uma serpente adormecida na base da coluna. Através da respiração, toque e intenção, essa energia pode ser despertada e movida pelo corpo, criando estados de êxtase que vão além do orgasmo genital tradicional.</p>
      
      <h4>☯️ Shiva e Shakti</h4>
      <p>Princípios masculino (Shiva - consciência) e feminino (Shakti - energia criativa). Na massagem tântrica, honramos ambas as energias, independentemente do género físico dos participantes.</p>
      
      <h4>🧘 Presença e Mindfulness</h4>
      <p>Cada toque é consciente e intencional. Não há pressa para "chegar a algum lado". O prazer está no momento presente.</p>
      
      <h4>💨 Respiração Consciente</h4>
      <p>A respiração é o veículo que move a energia. Respiração sincronizada entre parceiros amplifica a conexão.</p>
      
      <h3>Preparação do Espaço Sagrado</h3>
      <p>O ambiente é crucial para uma sessão tântrica bem-sucedida:</p>
      
      <h4>🕯️ Ambiente Físico</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Temperatura:</strong> Quarto aquecido (24-26°C) - corpos nus arrefecem</li>
        <li><strong>Iluminação:</strong> Velas, luzes baixas, nada de luz fluorescente</li>
        <li><strong>Superfície:</strong> Colchão no chão com lençóis limpos, ou cama com protetor</li>
        <li><strong>Almofadas:</strong> Várias para suporte (debaixo de joelhos, cabeça)</li>
        <li><strong>Música:</strong> Playlist suave sem letras (música ambiente, sons naturais, música indiana)</li>
        <li><strong>Aromas:</strong> Incenso suave ou óleos essenciais (sândalo, jasmim, ylang-ylang)</li>
        <li><strong>Privacidade:</strong> Porta fechada, telemóveis desligados, crianças/pets noutra divisão</li>
      </ul>
      
      <h4>🧴 Materiais Necessários</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Óleo de massagem:</strong> Coco (natural, aquece), amêndoas doces, ou óleos específicos</li>
        <li><strong>Toalhas extras:</strong> Para limpar e cobrir</li>
        <li><strong>Água:</strong> Hidratação durante a sessão</li>
        <li><strong>Frutas/chocolate:</strong> Para depois (opcional)</li>
        <li><strong>Cobertor:</strong> Para envolver no final (temperatura corporal baixa após)</li>
      </ul>
      
      <h4>💭 Preparação Mental</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Banho antes (ambos)</li>
        <li>Não comer refeição pesada antes</li>
        <li>Definir intenção: "O que queremos desta sessão?"</li>
        <li>Sem expectativa de orgasmo ou sexo depois (pode acontecer, mas não é o objetivo)</li>
        <li>Acordar tempo disponível (mínimo 90min para sessão completa)</li>
      </ul>
      
      <h3>🌸 Massagem Yoni: Honrar o Feminino</h3>
      <p>"Yoni" é a palavra sânscrita para vulva/vagina, significando "portal sagrado" ou "fonte de vida". A massagem Yoni é uma prática de cura e prazer que permite à mulher receber sem pressão de dar de volta ou performar.</p>
      
      <h4>Para Quem Recebe (Ela)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Posição deitada de barriga para cima, pernas ligeiramente abertas</li>
        <li>Almofada debaixo dos quadris para elevação</li>
        <li>Permissão para fazer sons, respirar profundamente, mover-se</li>
        <li>Comunicar o que sente (se quiser)</li>
        <li>Não há obrigação de orgasmo - o prazer é o caminho, não o destino</li>
      </ul>
      
      <h4>Para Quem Dá (Ele ou Ela)</h4>
      <p><strong>Fase 1: Relaxamento Corporal (20-30 min)</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Começar pelos pés - massagem firme</li>
        <li>Subir pelas pernas, evitando ainda a zona genital</li>
        <li>Barriga, peito (evitar mamilos inicialmente), braços, mãos</li>
        <li>Pescoço, rosto, couro cabeludo</li>
        <li>Virar de barriga para baixo: costas, glúteos, parte de trás das pernas</li>
        <li>Objetivo: Desligar a mente, relaxar completamente</li>
      </ul>
      
      <p><strong>Fase 2: Despertar Sensual (15-20 min)</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Voltar à posição de barriga para cima</li>
        <li>Toques mais leves e provocantes</li>
        <li>Incluir zona do peito, mamilos (se ela gostar)</li>
        <li>Interior das coxas - aproximar mas não tocar na Yoni</li>
        <li>Respiração sincronizada com ela</li>
        <li>Construir antecipação</li>
      </ul>
      
      <p><strong>Fase 3: Honrar a Yoni (20-40 min)</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pedir permissão antes de tocar: "Posso tocar a tua Yoni?"</li>
        <li>Começar pelo monte de vénus - massagem suave</li>
        <li>Lábios externos - deslizar com óleo, sem pressa</li>
        <li>Lábios internos - entre polegar e indicador, movimentos suaves</li>
        <li>Clitóris - MUITO suave inicialmente, variar pressão e padrões (circular, de lado a lado, batimentos)</li>
        <li><strong>Não focar só no clitóris!</strong> A vulva toda é sensível</li>
        <li>Entrada vaginal - círculos suaves, sem penetrar (a menos que ela peça)</li>
        <li>Se penetração: Um dedo, devagar, curva para cima (ponto G)</li>
        <li>Ponto G: Área rugosa no interior, ~5cm, na parede anterior</li>
        <li>Movimento "vem cá" suave, combinado com estimulação externa</li>
      </ul>
      
      <p><strong>Dicas Cruciais:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Manter contacto visual por momentos</li>
        <li>Perguntar: "Como sentes isto?"</li>
        <li>Se ela começar a aproximar-se do orgasmo, ABRANDAR (não acelerar)</li>
        <li>Edging tântrico: Levar perto do pico, recuar, repetir - amplifica sensações</li>
        <li>Se ela chorar, é normal - libertação emocional. Abraçar, não parar abruptamente</li>
        <li>Orgasmo pode ou não acontecer - ambos os resultados são perfeitos</li>
      </ul>
      
      <h4>Tipos de Orgasmo Feminino no Tantra</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Clitoriano:</strong> Mais localizado, intenso, rápido</li>
        <li><strong>Vaginal/Ponto G:</strong> Mais profundo, ondas pelo corpo</li>
        <li><strong>Cervical:</strong> Estímulo do colo do útero (muito profundo)</li>
        <li><strong>Energético:</strong> Sem toque genital - apenas respiração e energia</li>
        <li><strong>Full-body:</strong> Ondas de prazer percorrem o corpo inteiro</li>
      </ul>
      
      <h3>🌿 Massagem Lingam: Honrar o Masculino</h3>
      <p>"Lingam" significa "varinha de luz" em sânscrito. A massagem Lingam permite ao homem receber prazer prolongado sem a pressão de performance ou ejaculação rápida.</p>
      
      <h4>Para Quem Recebe (Ele)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Posição deitada de barriga para cima</li>
        <li>Almofada debaixo dos quadris para elevação</li>
        <li>Pernas ligeiramente afastadas</li>
        <li>Respirar profundamente, relaxar músculos do périneum</li>
        <li>Permissão para sons, movimentos, expressão</li>
        <li><strong>Objetivo:</strong> NÃO ejacular (ou pelo menos não rapidamente)</li>
      </ul>
      
      <h4>Para Quem Dá (Ela ou Ele)</h4>
      <p><strong>Fase 1: Relaxamento Corporal (20-30 min)</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Idêntico à Yoni - corpo todo, evitando genitais</li>
        <li>Especial atenção a: peito, abdómen, interior das coxas</li>
        <li>Homens tendem a ter mais tensão nos ombros e lombar</li>
      </ul>
      
      <p><strong>Fase 2: Despertar Sensual (10-15 min)</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Toques mais leves, provocantes</li>
        <li>Mamilos masculinos também são sensíveis</li>
        <li>Trilha do umbigo para baixo</li>
        <li>Interior das coxas, área da virilha</li>
        <li>Ele pode já ter ereção ou não - ambas as opções são OK</li>
      </ul>
      
      <p><strong>Fase 3: Honrar o Lingam (20-40 min)</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pedir permissão: "Posso tocar o teu Lingam?"</li>
        <li>Começar pelos testículos - massagem suave, segurá-los com carinho</li>
        <li>Períneo (área entre testículos e ânus) - zona muito sensível, pressão suave</li>
        <li>Base do pénis - massagem circular</li>
        <li>Toda a haste - movimentos de torção, deslizamento, variação de pressão</li>
        <li>Glande - especial atenção ao frênulo (parte de baixo da glande)</li>
        <li>Variar velocidades - lento é o objetivo principal</li>
      </ul>
      
      <p><strong>Técnicas Especiais:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>"Squeeze":</strong> Quando próximo de ejacular, apertar base do pénis firmemente durante 10-30seg</li>
        <li><strong>Respiração profunda:</strong> Ele inspira fundo e "distribui" a energia pelo corpo</li>
        <li><strong>Massagem prostática:</strong> Com consentimento, um dedo lubrificado no ânus, curva para cima em direção ao umbigo - a próstata é o "ponto G masculino"</li>
        <li><strong>Edging repetido:</strong> Levar perto do orgasmo 3-5 vezes antes de permitir ejaculação (se ele quiser)</li>
      </ul>
      
      <p><strong>Orgasmos Separados de Ejaculação</strong></p>
      <p>No Tantra, homens podem aprender a ter orgasmos sem ejaculação - permitindo múltiplos orgasmos e sessões mais longas. Requer prática:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Contrair músculo PC (Kegel) quando próximo do orgasmo</li>
        <li>Respiração profunda no momento crítico</li>
        <li>Visualizar energia a subir pela coluna em vez de sair</li>
        <li>Requer muita prática - não esperar resultados imediatos</li>
      </ul>
      
      <h3>Massagem Tântrica para Casais</h3>
      <p>Podem alternar quem dá e quem recebe, ou podem praticar toque simultâneo:</p>
      
      <h4>Práticas de Conexão</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Olhar nos olhos:</strong> 5-10 minutos a olhar nos olhos um do outro em silêncio</li>
        <li><strong>Respiração sincronizada:</strong> Inspirar e expirar juntos</li>
        <li><strong>Heartbeat meditation:</strong> Mão no coração um do outro, sentir batimentos</li>
        <li><strong>Toque espelhado:</strong> Um toca no outro exatamente o que quer receber</li>
        <li><strong>Abraço de corpo inteiro:</strong> 5 minutos abraçados, nus, sem movimento</li>
      </ul>
      
      <h4>Posição Yab-Yum</h4>
      <p>A posição tântrica clássica:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ele sentado de pernas cruzadas</li>
        <li>Ela sentada no colo dele, pernas à volta da cintura</li>
        <li>Genitais encostados (com ou sem penetração)</li>
        <li>Olhar nos olhos, respirar juntos</li>
        <li>Movimento mínimo, foco na energia e conexão</li>
      </ul>
      
      <h3>Benefícios da Prática Regular</h3>
      
      <h4>Para Ela:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Maior conexão com o próprio corpo</li>
        <li>Cura de bloqueios emocionais/traumas</li>
        <li>Orgasmos mais intensos e variados</li>
        <li>Redução de ansiedade sobre performance</li>
        <li>Aumento da lubrificação natural</li>
        <li>Maior prazer durante penetração</li>
      </ul>
      
      <h4>Para Ele:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Controlo sobre ejaculação</li>
        <li>Potencial para múltiplos orgasmos</li>
        <li>Ereções mais fortes</li>
        <li>Maior sensibilidade</li>
        <li>Menos pressão de performance</li>
        <li>Conexão mais profunda com a parceira</li>
      </ul>
      
      <h4>Para o Casal:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Comunicação melhorada</li>
        <li>Intimidade emocional profundada</li>
        <li>Saída da rotina sexual</li>
        <li>Redescoberta mútua</li>
        <li>Menos foco no orgasmo, mais no prazer</li>
        <li>Experiências espirituais partilhadas</li>
      </ul>
      
      <h3>Cuidados e Considerações</h3>
      
      <h4>⚠️ Quando NÃO Praticar:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Se houver traumas sexuais não processados (procurar terapeuta primeiro)</li>
        <li>Durante conflitos no relacionamento (resolver primeiro)</li>
        <li>Sob efeito de álcool/drogas (perda de consciência e presença)</li>
        <li>Com parceiro que não consinta entusiasticamente</li>
        <li>Se houver infeções genitais ativas</li>
      </ul>
      
      <h4>💭 Expectativas Realistas:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Primeira sessão pode ser awkward - é normal</li>
        <li>Podem surgir emoções inesperadas (choro, riso, raiva)</li>
        <li>Orgasmo não é garantido nem o objetivo</li>
        <li>Requer prática regular para benefícios completos</li>
        <li>Não substitui terapia sexual profissional se houver disfunções</li>
      </ul>
      
      <h3>Recursos para Aprofundar</h3>
      
      <h4>📚 Livros:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"The Art of Sexual Ecstasy" - Margot Anand</li>
        <li>"Urban Tantra" - Barbara Carrellas</li>
        <li>"The Multi-Orgasmic Man" - Mantak Chia</li>
        <li>"Slow Sex" - Diana Richardson</li>
      </ul>
      
      <h4>🎓 Workshops em Portugal:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pesquisar "workshop tantra Lisboa/Porto"</li>
        <li>Centros de yoga por vezes oferecem introduções</li>
        <li>Retiros de fim de semana para casais</li>
      </ul>
      
      <h4>🌐 Online:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Beducated.com - cursos de sexualidade</li>
        <li>OMGyes.com - investigação sobre prazer feminino</li>
        <li>YouTube - tutoriais básicos (com roupa, demonstração teórica)</li>
      </ul>
      
      <p style="margin-top: 20px; font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;"><strong>Testemunho anónimo:</strong> "Após 15 anos de casamento, pensava que conhecia o corpo da minha mulher. A primeira sessão de massagem tântrica que fizemos juntos durou 2 horas e ela teve 4 orgasmos - sendo que normalmente tinha dificuldade em ter um. Chorámos os dois no final. Percebemos que andávamos a fazer sexo com pressa toda a vida. Agora praticamos pelo menos uma vez por mês e a nossa intimidade nunca esteve melhor."</p>
      
      <p><strong>Mensagem final:</strong> A massagem tântrica não é apenas uma técnica - é uma forma de estar presente, honrar o parceiro e transformar a sexualidade em algo mais profundo do que a procura do orgasmo. Requer paciência, prática e abertura de mente. Mas os casais que a integram na sua vida reportam níveis de intimidade e prazer que não sabiam ser possíveis. Vale a pena explorar.</p>
      </div>
    `
  },
  {
    id: "anorgasmia",
    title: "Anorgasmia: Quando o Orgasmo Não Vem",
    excerpt: "Entende as causas e soluções para a dificuldade em atingir o orgasmo - guia completo para casais.",
    category: "saude",
    categoryLabel: "Saúde",
    icon: "🩺",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
    readTime: 16,
    content: `
      <div style="text-align: left;">
      <h3>O Que É Anorgasmia?</h3>
      <p>A anorgasmia é a dificuldade persistente ou incapacidade de atingir o orgasmo, mesmo com estimulação sexual adequada e desejo presente. É uma das disfunções sexuais mais comuns, afetando aproximadamente 10-15% das mulheres e 1-4% dos homens de forma crónica. Muitas mais pessoas experienciam dificuldades ocasionais.</p>
      
      <p>É importante distinguir anorgasmia de baixo desejo sexual (libido) ou de falta de excitação. Na anorgasmia, a pessoa QUER ter prazer e até pode estar excitada, mas o orgasmo simplesmente não acontece ou é extremamente difícil de atingir.</p>
      
      <h3>Tipos de Anorgasmia</h3>
      
      <h4>🔵 Anorgasmia Primária</h4>
      <p>Nunca ter tido um orgasmo na vida, independentemente do tipo de estimulação ou parceiro. Mais comum em mulheres que nunca exploraram masturbação ou que tiveram educação sexual muito repressiva.</p>
      
      <h4>🟢 Anorgasmia Secundária</h4>
      <p>Anteriormente conseguia ter orgasmos, mas perdeu essa capacidade. Pode surgir após eventos específicos: parto, menopausa, início de medicação, trauma, mudança de parceiro, etc.</p>
      
      <h4>🟡 Anorgasmia Situacional</h4>
      <p>Consegue ter orgasmos em certas circunstâncias mas não noutras. Exemplos:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Orgasmo com masturbação mas não com parceiro</li>
        <li>Orgasmo com parceiro A mas não com parceiro B</li>
        <li>Orgasmo com sexo oral mas não com penetração</li>
        <li>Orgasmo sozinha mas não quando observada</li>
      </ul>
      
      <h4>🔴 Anorgasmia Generalizada</h4>
      <p>Incapacidade de orgasmo em TODAS as circunstâncias - sozinha, com parceiro, com qualquer tipo de estimulação.</p>
      
      <h3>Causas Físicas</h3>
      
      <h4>💊 Medicação</h4>
      <p>Esta é uma das causas mais comuns e sub-diagnosticadas:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Antidepressivos SSRI/SNRI:</strong> Sertralina, fluoxetina, paroxetina, venlafaxina - afetam 30-80% dos utilizadores</li>
        <li><strong>Antipsicóticos:</strong> Especialmente os mais antigos</li>
        <li><strong>Anti-hipertensivos:</strong> Beta-bloqueadores em particular</li>
        <li><strong>Anti-histamínicos:</strong> Uso prolongado pode afetar</li>
        <li><strong>Anticoncecionais hormonais:</strong> Algumas mulheres reportam diminuição de sensibilidade</li>
        <li><strong>Opioides:</strong> Uso crónico afeta função sexual</li>
      </ul>
      <p><strong>Nota:</strong> NUNCA parar medicação sem consultar médico. Existem alternativas e ajustes possíveis.</p>
      
      <h4>🔬 Condições Médicas</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Diabetes:</strong> Afeta nervos e vasos sanguíneos genitais</li>
        <li><strong>Esclerose múltipla:</strong> Danos neurológicos</li>
        <li><strong>Lesões medulares:</strong> Dependendo do nível</li>
        <li><strong>Doenças cardiovasculares:</strong> Afetam fluxo sanguíneo</li>
        <li><strong>Endometriose:</strong> Pode causar dor e bloqueio</li>
        <li><strong>Vulvodínia:</strong> Dor crónica vulvar</li>
        <li><strong>Síndrome do ovário poliquístico:</strong> Alterações hormonais</li>
      </ul>
      
      <h4>⚖️ Alterações Hormonais</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Menopausa:</strong> Queda de estrogénio afeta lubrificação e sensibilidade</li>
        <li><strong>Pós-parto:</strong> Hormonas de amamentação podem suprimir desejo e resposta</li>
        <li><strong>Baixa testosterona:</strong> Em ambos os géneros, afeta resposta sexual</li>
        <li><strong>Hipotiroidismo:</strong> Afeta energia e função sexual</li>
      </ul>
      
      <h4>🔧 Causas Anatómicas</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Clitóris coberto:</strong> Capuz clitoriano que dificulta estimulação direta</li>
        <li><strong>Danos nervosos:</strong> Após cirurgias pélvicas, histerectomia</li>
        <li><strong>Prolapso:</strong> Órgãos pélvicos deslocados</li>
        <li><strong>Tensão pélvica crónica:</strong> Músculos do pavimento pélvico demasiado tensos</li>
      </ul>
      
      <h3>Causas Psicológicas</h3>
      
      <h4>😰 Ansiedade de Performance</h4>
      <p>O paradoxo do orgasmo: quanto mais te focas em ter um, mais difícil se torna. A pessoa fica "a observar-se" em vez de se entregar às sensações.</p>
      
      <p><strong>Ciclo vicioso:</strong></p>
      <ol style="text-align: left; padding-left: 20px;">
        <li>Dificuldade em ter orgasmo</li>
        <li>Ansiedade sobre conseguir da próxima vez</li>
        <li>Foco excessivo no objetivo</li>
        <li>Desconexão das sensações físicas</li>
        <li>Ainda mais dificuldade</li>
        <li>Mais ansiedade... (repetir)</li>
      </ol>
      
      <h4>🔒 Educação Sexual Repressiva</h4>
      <p>Crescer ouvindo que:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"Sexo é pecado/sujo"</li>
        <li>"Meninas decentes não sentem prazer"</li>
        <li>"Masturbação é errado"</li>
        <li>"O corpo é fonte de vergonha"</li>
      </ul>
      <p>Estas mensagens internalizam-se e bloqueiam a resposta sexual natural, mesmo quando a pessoa racionalmente sabe que sexo é saudável.</p>
      
      <h4>💔 Traumas Passados</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Abuso sexual (infância ou adulto)</li>
        <li>Violação ou agressão</li>
        <li>Experiências sexuais negativas</li>
        <li>Humilhação relacionada com corpo ou sexualidade</li>
      </ul>
      <p><strong>Importante:</strong> Estas situações requerem acompanhamento profissional. Não é algo para "ultrapassar sozinho".</p>
      
      <h4>💬 Problemas de Relacionamento</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Falta de confiança no parceiro</li>
        <li>Ressentimento não resolvido</li>
        <li>Comunicação pobre sobre necessidades</li>
        <li>Parceiro que não investe em foreplay</li>
        <li>Sentir-se usada/o em vez de desejada/o</li>
        <li>Infidelidade passada (mesmo perdoada)</li>
      </ul>
      
      <h4>🧠 Distração Mental</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Stress do trabalho/vida</li>
        <li>Preocupações com filhos, contas, tarefas</li>
        <li>Incapacidade de "desligar" a mente</li>
        <li>Autocrítica durante o ato ("Estou gorda", "Ele está a demorar")</li>
      </ul>
      
      <h4>👁️ Imagem Corporal Negativa</h4>
      <p>Dificuldade em relaxar e sentir prazer quando se está a preocupar com como o corpo parece. Luzes apagadas, posições que "escondem" certas partes, evitar nudez total.</p>
      
      <h3>Soluções e Estratégias</h3>
      
      <h4>🩺 1. Avaliação Médica</h4>
      <p>Primeiro passo sempre - descartar causas físicas:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Análises hormonais (estradiol, testosterona, tiróide)</li>
        <li>Revisão de medicação atual</li>
        <li>Exame ginecológico/urológico</li>
        <li>Avaliação de condições crónicas</li>
      </ul>
      
      <h4>🔄 2. Ajuste de Medicação</h4>
      <p>Se antidepressivos são a causa:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Bupropion (Wellbutrin):</strong> Antidepressivo com menos efeitos sexuais, às vezes adicionado</li>
        <li><strong>Mirtazapina:</strong> Alternativa com perfil diferente</li>
        <li><strong>"Drug holidays":</strong> Pausas curtas antes de atividade sexual (só com supervisão médica!)</li>
        <li><strong>Redução de dose:</strong> Por vezes possível</li>
        <li><strong>Trocar de medicamento:</strong> Existem muitas opções</li>
      </ul>
      
      <h4>🔬 3. Autoexploração</h4>
      <p>Especialmente para anorgasmia primária - conhecer o próprio corpo:</p>
      
      <p><strong>Para mulheres:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Olhar para a vulva com um espelho</li>
        <li>Identificar onde fica o clitóris (pode estar mais coberto em algumas)</li>
        <li>Experimentar toque sem pressão de orgasmo - só exploração</li>
        <li>Usar vibrador - estimulação mais intensa pode ajudar a "desbloquear"</li>
        <li>Descobrir que tipo de toque funciona (direto vs. indireto, pressão, velocidade)</li>
      </ul>
      
      <p><strong>Para homens:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Explorar além do pénis - períneo, testículos, mamilos</li>
        <li>Variar técnicas de masturbação</li>
        <li>Se habituado a "death grip" (punho muito apertado), treinar com menos pressão</li>
        <li>Explorar estimulação prostática</li>
      </ul>
      
      <h4>🧘 4. Mindfulness e Presença</h4>
      <p>Técnicas para sair da cabeça e entrar no corpo:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Body scan:</strong> Prestar atenção a cada parte do corpo durante estimulação</li>
        <li><strong>Respiração consciente:</strong> Inspirar fundo, expirar devagar</li>
        <li><strong>Focar nas sensações:</strong> "O que estou a sentir agora?" em vez de "Vou conseguir?"</li>
        <li><strong>Permitir pensamentos:</strong> Quando a mente divaga, gentilmente voltar às sensações</li>
        <li><strong>Apps de meditação:</strong> Headspace, Calm têm sessões para presença</li>
      </ul>
      
      <h4>💑 5. Comunicação com Parceiro</h4>
      <p>O parceiro tem papel crucial:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Explicar a situação:</strong> Não é culpa de ninguém</li>
        <li><strong>Remover pressão:</strong> "Não precisamos que eu tenha orgasmo para ser bom"</li>
        <li><strong>Dar feedback:</strong> "Mais devagar", "Ali é melhor", "Continua assim"</li>
        <li><strong>Pedir foreplay prolongado:</strong> Muitas mulheres precisam de 20-40min</li>
        <li><strong>Experimentar juntos:</strong> Masturbação mútua, mostrar como se toca</li>
      </ul>
      
      <h4>⚡ 6. Brinquedos Sexuais</h4>
      <p>Especialmente vibradores - estimulação mais intensa pode ajudar:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Satisfyer/Womanizer:</strong> Estimuladores de clitóris por sucção - revolucionários para muitas mulheres</li>
        <li><strong>Vibradores de varinha (Magic Wand):</strong> Potência elevada</li>
        <li><strong>Vibradores internos:</strong> Ponto G</li>
        <li><strong>Estimuladores prostáticos:</strong> Para homens</li>
      </ul>
      <p><strong>Mito:</strong> "Se me habituar ao vibrador, nunca mais consigo sem." Falso - o cérebro adapta-se em ambas as direções.</p>
      
      <h4>🛋️ 7. Terapia Sexual</h4>
      <p>Quando procurar ajuda profissional:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Se há trauma por processar</li>
        <li>Se tentativas sozinho não funcionam há 6+ meses</li>
        <li>Se está a afetar a relação significativamente</li>
        <li>Se há dor associada</li>
        <li>Se causa sofrimento emocional significativo</li>
      </ul>
      
      <p><strong>O que esperar da terapia:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Exploração de causas psicológicas</li>
        <li>Exercícios de sensate focus (tocar sem objetivo de orgasmo)</li>
        <li>Dessensibilização de ansiedade</li>
        <li>Trabalho de imagem corporal</li>
        <li>Comunicação de casal</li>
        <li>Exercícios práticos para casa</li>
      </ul>
      
      <h4>🧪 8. Outras Intervenções</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Fisioterapia pélvica:</strong> Para tensão muscular ou fraqueza do pavimento pélvico</li>
        <li><strong>Cremes/géis:</strong> Alguns aumentam sensibilidade local (mas cuidado com irritação)</li>
        <li><strong>Estrogénio tópico:</strong> Para atrofia vaginal na menopausa</li>
        <li><strong>Testosterona:</strong> Em casos selecionados, com supervisão médica</li>
        <li><strong>Clitoroterapia:</strong> Técnica específica de estimulação prolongada</li>
      </ul>
      
      <h3>O Papel do Parceiro</h3>
      
      <h4>✅ O Que Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ouvir sem julgar</li>
        <li>Não levar a pessoal ("Não é porque não me desejas")</li>
        <li>Investir em foreplay e tempo</li>
        <li>Perguntar o que funciona</li>
        <li>Celebrar progressos, não só "o objetivo"</li>
        <li>Criar ambiente sem pressão</li>
        <li>Lembrar que orgasmo não é a única medida de bom sexo</li>
      </ul>
      
      <h4>❌ O Que NÃO Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Perguntar constantemente "Vens?" durante o ato</li>
        <li>Fazer beicinho se ela/ele não tem orgasmo</li>
        <li>Comparar com ex's ou outras pessoas</li>
        <li>Assumir que é fingimento</li>
        <li>Desistir do foreplay porque "não vai funcionar anyway"</li>
        <li>Tratar como problema a resolver em vez de jornada juntos</li>
      </ul>
      
      <h3>Reframing: O Orgasmo Não É Tudo</h3>
      <p>Uma perspetiva importante:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li>Sexo satisfatório não REQUER orgasmo</li>
        <li>Prazer, conexão, intimidade são igualmente válidos</li>
        <li>Focar no caminho, não no destino</li>
        <li>Orgasmo é apenas UMA das muitas sensações agradáveis</li>
        <li>Pressão para orgasmo pode ser contraproducente</li>
      </ul>
      
      <p><strong>Exercício:</strong> Experimentar sessões de prazer onde orgasmo está "proibido". Paradoxalmente, remover a pressão pode ser o que finalmente permite que aconteça.</p>
      
      <h3>Quando Há Esperança?</h3>
      <p>A boa notícia: a maioria dos casos de anorgasmia são tratáveis:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li>Se causa é medicação: Ajuste resolve em 80%+ dos casos</li>
        <li>Se é anorgasmia primária feminina: 80-90% consegue orgasmo com terapia + autoexploração</li>
        <li>Se é psicológica: Terapia tem taxas de sucesso elevadas</li>
        <li>Se é situacional: Identificar o que funciona e expandir</li>
      </ul>
      
      <p style="margin-top: 20px; font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;"><strong>Testemunho anónimo:</strong> "Nunca tinha tido um orgasmo com 28 anos. Pensava que era 'defeituosa'. Depois de 6 meses de terapia sexual e de comprar o meu primeiro Satisfyer, finalmente aconteceu. Chorei. Não por o orgasmo ser incrível (foi), mas por finalmente saber que o meu corpo funcionava. Agora, 2 anos depois, consigo com o meu parceiro também. Havia um mundo inteiro que me estava vedado e não sabia."</p>
      
      <p><strong>Mensagem final:</strong> Se estás a lutar com anorgasmia, não estás sozinha/o. É uma condição comum, tratável e que NÃO define o teu valor ou a qualidade da tua relação. Procura ajuda médica para descartar causas físicas, considera terapia sexual, comunica com o teu parceiro e, acima de tudo, sê gentil contigo própria/o. O corpo tem capacidade de prazer - às vezes só precisa de tempo, paciência e as ferramentas certas para a desbloquear.</p>
      </div>
    `
  },{
    id: "sexo-pos-filhos",
    title: "Sexualidade Pós-Filhos: Reavivar a Chama",
    excerpt: "Como manter uma vida sexual saudável depois de ter filhos.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    icon: "👶",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&q=80",
    readTime: 14,
    content: `
      <div style="text-align: left;">
      <h3>A Realidade da Sexualidade Pós-Filhos</h3>
      <p>Vamos ser honestos: ter filhos muda TUDO na dinâmica sexual de um casal. E não, não é só durante os primeiros meses - pode ser anos. Mas aqui está a boa notícia: com estratégia, comunicação e criatividade, não só podem recuperar a vida sexual como torná-la ainda melhor do que antes.</p>
      
      <p>Estudos mostram que cerca de 60% dos casais reportam uma diminuição significativa na frequência sexual após o nascimento do primeiro filho, e esse número aumenta com cada filho adicional. Mas também mostram que os casais que trabalham ativamente nesta área conseguem recuperar e até melhorar a sua intimidade.</p>
      
      <h3>Os Desafios Reais (E Como Lidar com Eles)</h3>
      
      <h4>😴 Exaustão Física e Mental</h4>
      <p><strong>O problema:</strong> Noites sem dormir, trabalho, casa, crianças - quando finalmente chegam à cama, só querem dormir.</p>
      <p><strong>A solução:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Sexo matinal:</strong> Acordar 20 minutos mais cedo quando têm energia</li>
        <li><strong>Sestas de fim de semana:</strong> Pôr um filme para as crianças e ir "descansar"</li>
        <li><strong>Aceitar "bom em vez de perfeito":</strong> Não precisa de ser uma sessão épica de 2 horas</li>
        <li><strong>Partilhar tarefas domésticas:</strong> O que mais excita? Ver o parceiro a aspirar a casa</li>
        <li><strong>Ir para a cama juntos:</strong> Em vez de um adormecer no sofá às 22h e outro à 1h</li>
      </ul>
      
      <h4>🚪 Falta de Privacidade</h4>
      <p><strong>O problema:</strong> Crianças que entram no quarto, que chamam no meio da noite, que podem ouvir tudo.</p>
      <p><strong>A solução:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Fechadura na porta:</strong> Investimento básico e essencial</li>
        <li><strong>Máquina de ruído branco:</strong> No quarto das crianças (e no vosso)</li>
        <li><strong>Routine rigorosa de sono:</strong> As crianças na cama às 21h, vocês têm 2-3h</li>
        <li><strong>Fins de semana nos avós:</strong> Negocie uma noite por mês</li>
        <li><strong>Locais alternativos:</strong> Casa de banho com chuveiro a correr, arrecadação, carro na garagem</li>
      </ul>
      
      <h4>💭 Mudanças Hormonais (Especialmente Nelas)</h4>
      <p><strong>O problema:</strong> Amamentação, pós-parto, menopausa precoce - as hormonas são uma montanha-russa.</p>
      <p><strong>A solução:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Lubrificante de qualidade:</strong> Secura vaginal é comum e facilmente resolvida</li>
        <li><strong>Foreplay prolongado:</strong> Pode demorar mais tempo a "entrar no mood"</li>
        <li><strong>Consulta médica:</strong> Cremes hormonais podem ajudar</li>
        <li><strong>Paciência:</strong> Não é falta de atração, são hormonas literais</li>
        <li><strong>Outras formas de intimidade:</strong> Sexo oral, mútua masturbação, massagens</li>
      </ul>
      
      <h4>🪞 Insegurança com o Corpo</h4>
      <p><strong>O problema:</strong> Estrias, peso extra, cicatrizes de cesariana, seios diferentes após amamentação.</p>
      <p><strong>A solução:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Validação verbal constante:</strong> Dizer ESPECIFICAMENTE o que achas sexy nela/nele</li>
        <li><strong>Luz baixa inicialmente:</strong> Velas, luar, semi-escuridão até a confiança voltar</li>
        <li><strong>Foco nas sensações:</strong> Em vez de "como fico", pensar "como sinto"</li>
        <li><strong>Roupa sexy que faça sentir bem:</strong> Lingerie que realça o que gostam, esconde o que não</li>
        <li><strong>Exercício juntos:</strong> Não para "voltar ao corpo de antes", mas para se sentirem bem</li>
      </ul>
      
      <h4>⚖️ Dessincronização de Desejos</h4>
      <p><strong>O problema:</strong> Um quer sempre, outro nunca quer. Ou os timings nunca coincidem.</p>
      <p><strong>A solução:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Sexo "responsivo":</strong> Aceitar começar mesmo sem desejo inicial (ele vem durante)</li>
        <li><strong>Compromisso:</strong> Se um quer 5x/semana e outro 1x/mês, negociem 2x/semana</li>
        <li><strong>Tipos diferentes de sexo:</strong> Às vezes rápido para um, às vezes longo e romântico para outro</li>
        <li><strong>Masturbação sem culpa:</strong> Quando o parceiro não está disponível</li>
        <li><strong>Terapia sexual:</strong> Se a diferença é muito grande e causa sofrimento</li>
      </ul>
      
      <h3>Estratégias Práticas para Reavivar</h3>
      
      <h4>📅 1. Agendar Intimidade (Sim, É OK!)</h4>
      <p>Muitos acham que "agendar" tira o romantismo. Mas sabem o que mais tira? NÃO ACONTECER NUNCA.</p>
      
      <p><strong>Como fazer:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Terça e Sábado à noite:</strong> Bloquear na agenda mental</li>
        <li><strong>Tratar como prioridade:</strong> Não cancelar por "estou cansado" (a não ser que realmente doente)</li>
        <li><strong>Preparação mental:</strong> Ir pensando nisso ao longo do dia (sexting ajuda)</li>
        <li><strong>Ritual:</strong> Duche, roupa fresca, vela acesa - cria antecipação</li>
        <li><strong>Flexibilidade:</strong> Se realmente não dá, reagendar para o dia seguinte (não cancelar)</li>
      </ul>
      
      <h4>⚡ 2. Abraçar os Quickies</h4>
      <p>Nem todo o sexo precisa de ser uma produção hollywoodesca de 90 minutos.</p>
      
      <p><strong>Cenários de quickie:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Manhã antes do trabalho:</strong> 10 minutos, ainda semi-adormecidos</li>
        <li><strong>Hora do almoço:</strong> Se trabalham perto ou de casa</li>
        <li><strong>Durante a sesta das crianças:</strong> Timer de 30 min, façam acontecer</li>
        <li><strong>No carro:</strong> Estacionamento, garagem, após jantar fora</li>
        <li><strong>Casa de banho de festa:</strong> Quando as crianças estão distraídas</li>
      </ul>
      
      <p><strong>Dica:</strong> Quickie não significa necessariamente penetração. Pode ser sexo oral rápido, handjob, fingering. O objetivo é conexão e prazer, não "completar o ato".</p>
      
      <h4>👴 3. Usar a Rede de Apoio</h4>
      <p>Não sejam heróis. USEM a ajuda disponível:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Avós:</strong> Negociar uma noite por mês em que as crianças dormem lá</li>
        <li><strong>Babysitter:</strong> Não só para sair - podem ficar em casa e ter privacy</li>
        <li><strong>Troca com outros pais:</strong> "Este fim de semana ficam cá, próximo vão para vossa casa"</li>
        <li><strong>Campo de férias/ATL:</strong> Quando as crianças estão ocupadas, vocês também podem estar</li>
        <li><strong>Dia de trabalho remoto:</strong> Se ambos trabalham de casa, "almoço prolongado"</li>
      </ul>
      
      <h4>💬 4. Comunicação Brutal (Mas Amorosa)</h4>
      <p>Falem sobre isto. REALMENTE falem:</p>
      
      <p><strong>Conversas necessárias:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"Sinto-me negligenciada sexualmente" - SEM acusação, COM vulnerabilidade</li>
        <li>"Estou exausto e sinto-me culpado por não ter desejo" - honestidade</li>
        <li>"O que podíamos fazer de diferente?" - solução conjunta</li>
        <li>"Posso tocar-te de formas não-sexuais?" - reconstruir intimidade física</li>
        <li>"Quando é que te sentes mais sexy/com mais energia?" - timing</li>
      </ul>
      
      <p><strong>Importante:</strong> Estas conversas FORA do quarto, FORA de momentos de rejeição. Num passeio, num café, durante uma viagem de carro.</p>
      
      <h4>🆕 5. Introduzir Novidades</h4>
      <p>A rotina matou a paixão? Quebrem a rotina:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Brinquedos sexuais:</strong> Um vibrador pode ser o MVP do pós-filhos</li>
        <li><strong>Locais diferentes:</strong> Cozinha, sofá, varanda (se tiverem privacy)</li>
        <li><strong>Roleplay:</strong> Fingir que são outras pessoas pode ser libertador</li>
        <li><strong>Pornografia juntos:</strong> Ou áudio erótico (menos visual, mais imaginação)</li>
        <li><strong>Jogos para casais:</strong> Apps como Desire, Kindu</li>
        <li><strong>Experimentar fantasias antigas:</strong> Aquela coisa que falavam antes de ter filhos</li>
      </ul>
      
      <h3>O Que NÃO Fazer</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li>❌ <strong>Comparar com "como era antes":</strong> Era outra vida. Esta também pode ser boa, só diferente</li>
        <li>❌ <strong>Pressão ou manipulação:</strong> "Se me amavas fazias", "Estou a pensar ter um affair"</li>
        <li>❌ <strong>Desistir:</strong> "Somos pais agora, vida sexual acabou". MENTIRA</li>
        <li>❌ <strong>Sexo como obrigação:</strong> Gera ressentimento de ambos os lados</li>
        <li>❌ <strong>Ignorar problemas médicos:</strong> Dor, disfunção - ver médico, não "aguentar"</li>
      </ul>
      
      <h3>Reconstruir a Intimidade (Não Só Sexo)</h3>
      <p>Às vezes o sexo não volta porque a INTIMIDADE saiu. Reconstruir:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Abraços diários de 20 segundos:</strong> Liberta oxitocina</li>
        <li><strong>Beijos de despedida/chegada:</strong> Não pekinhos - BEIJOS</li>
        <li><strong>Massagens sem expectativa sexual:</strong> Toque pelo toque</li>
        <li><strong>Conversas sem crianças como tema:</strong> Lembrem-se que são um casal, não só pais</li>
        <li><strong>Dates regulares:</strong> Mesmo que seja só café e passeio</li>
        <li><strong>Projectos em comum:</strong> Que não sejam as crianças</li>
      </ul>
      
      <h3>Timeline Realista</h3>
      <p><strong>Primeiras 6 semanas pós-parto:</strong> ZERO pressão. Recuperação física é prioridade.</p>
      <p><strong>6 semanas a 6 meses:</strong> Recomeçar devagar. Expectativas baixas, paciência alta.</p>
      <p><strong>6 meses a 2 anos:</strong> Encontrar nova rotina. Será diferente do pré-bebé, e está OK.</p>
      <p><strong>2+ anos:</strong> Potencialmente de volta a uma frequência "nova normalidade".</p>
      
      <p><strong>MAS:</strong> Cada casal é diferente. Alguns demoram mais, outros menos. Não se comparem com outros casais (ou versões de ficção de casais).</p>
      
      <h3>Quando Procurar Ajuda Profissional</h3>
      <p>Considerem terapia sexual/de casal se:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Há mais de 6 meses sem qualquer atividade sexual e isso causa sofrimento</li>
        <li>Um dos dois está a considerar seriamente infidelidade como saída</li>
        <li>Há ressentimento profundo ou discussões constantes sobre o tema</li>
        <li>Problemas físicos (dor, disfunção erétil) que não melhoram</li>
        <li>Trauma de parto não resolvido</li>
      </ul>
      
      <h3>História Real (Anónima)</h3>
      <p style="font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;">"Após o segundo filho, passámos 14 meses sem sexo. Zero. Eu (pai) estava ressentido, ela estava exausta e culpada. Finalmente marcámos terapia. A terapeuta ajudou-nos a ver que estávamos a esperar que a vida voltasse ao 'normal', quando na verdade precisávamos de criar um NOVO normal. Começámos com massagens sem expectativa, depois intimidade não-penetrativa, depois agendámos um sábado por mês num hotel (avós ficavam com as crianças). Hoje, 2 anos depois, não fazemos sexo com a frequência de antes dos filhos, mas quando fazemos é MELHOR porque comunicamos melhor, conhecemo-nos melhor, e valorizamos mais."</p>
      
      <p><strong>Mensagem final:</strong> A sexualidade pós-filhos não é uma sentença de morte para a paixão. É uma transição que requer esforço consciente, comunicação honesta e vontade de adaptar. Mas casais que navegam esta fase com sucesso frequentemente reportam uma intimidade mais profunda e gratificante do que alguma vez tiveram. Vale a pena lutar por isto.</p>
      </div>
    `
  },  {
    id: "comunicacao-casal",
    title: "Comunicação Sexual: Falar Sobre Desejos",
    excerpt: "Como abordar fantasias e desejos com o parceiro de forma saudável.",
    category: "dicas",
    categoryLabel: "Dicas",
    icon: "💬",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&q=80",
    readTime: 12,
    content: `
      <div style="text-align: left;">
      <h3>O Elefante no Quarto (ou na Cama)</h3>
      <p>Estudos mostram que cerca de 70% dos casais têm dificuldade em falar abertamente sobre sexo, mesmo após anos juntos. Porquê? Medo de julgamento, vergonha internalizada, receio de magoar o outro, ou simplesmente não saberem COMO começar a conversa.</p>
      
      <p>A ironia? A comunicação sexual é o preditor número 1 de satisfação sexual a longo prazo. Casais que falam abertamente sobre sexo têm mais sexo, melhor sexo e mais proximidade emocional. Por isso, vamos aprender a falar.</p>
      
      <h3>Porque É Tão Difícil?</h3>
      
      <h4>🔒 Educação Sexual Repressiva</h4>
      <p>Muitos crescemos ouvindo que sexo é "sujo", "pecado" ou algo que "não se fala". Resultado: adultos que transam, mas não conseguem dizer "gosto quando tocas aqui".</p>
      
      <h4>😨 Medo de Rejeição</h4>
      <p>"E se ele achar a minha fantasia esquisita?" "E se ela rir de mim?" "E se isto significar que não somos compatíveis?"</p>
      
      <h4>😔 Medo de Magoar</h4>
      <p>"Se disser que gostava de mais variedade, vai pensar que não é suficiente." Este é talvez o maior bloqueio de todos.</p>
      
      <h4>🤐 Não Saber as Palavras Certas</h4>
      <p>Vocabulário sexual é limitado: ou demasiado clínico ("gostaria de estimulação do clitóris") ou demasiado vulgar. Falta um meio-termo confortável.</p>
      
      <h3>O Framework da Comunicação Sexual</h3>
      
      <h4>1️⃣ Escolher o Momento CERTO</h4>
      <p><strong>❌ Maus momentos:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Durante o sexo (pressão imediata)</li>
        <li>Imediatamente após (vulnerabilidade elevada)</li>
        <li>Durante uma discussão</li>
        <li>Quando um dos dois está stressado</li>
        <li>Na frente de outras pessoas</li>
      </ul>
      
      <p><strong>✅ Bons momentos:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Durante um passeio tranquilo</li>
        <li>Num café/restaurante (público obriga a manter calma)</li>
        <li>Durante uma viagem de carro (olhar para a estrada ajuda a não sentir pressão visual)</li>
        <li>Após uma massagem relaxante</li>
        <li>Durante um banho a dois (contexto íntimo mas não sexual)</li>
      </ul>
      
      <h4>2️⃣ Usar Linguagem "EU" em vez de "TU"</h4>
      <p>Esta é PSICOLOGIA BÁSICA mas muita gente ignora:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">❌ Linguagem "TU" (Acusatória)</th>
          <th style="padding: 10px; border: 1px solid #ddd;">✅ Linguagem "EU" (Vulnerável)</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">"Tu nunca me tocas da forma que gosto"</td>
          <td style="padding: 10px; border: 1px solid #ddd;">"Eu fico muito excitada quando me tocas devagar aqui"</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">"Tu és sempre tão rápido"</td>
          <td style="padding: 10px; border: 1px solid #ddd;">"Eu adoro quando prolongamos o momento, sinto-me mais ligada a ti"</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">"Tu não me deixas experimentar coisas novas"</td>
          <td style="padding: 10px; border: 1px solid #ddd;">"Eu tenho curiosidade sobre [X], poderíamos explorar juntos?"</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">"Tu só pensas em ti"</td>
          <td style="padding: 10px; border: 1px solid #ddd;">"Eu preciso de mais tempo para chegar ao orgasmo, podemos trabalhar nisso?"</td>
        </tr>
      </table>
      
      <h4>3️⃣ Sanduíche de Elogio</h4>
      <p>Técnica clássica mas eficaz: <strong>Positivo + Pedido + Positivo</strong></p>
      
      <p><strong>Exemplo 1:</strong></p>
      <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">"Adoro a forma como me beijas o pescoço, deixa-me super excitada. <strong>Sabes o que também me faria perder a cabeça? Se usasses mais pressão quando me tocas ali.</strong> Quando combinas essas duas coisas, fico completamente louca."</p>
      
      <p><strong>Exemplo 2:</strong></p>
      <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">"Quando entraste no quarto assim ontem à noite, fiquei logo pronto. <strong>Tenho uma fantasia de fazeres isso outra vez, mas com lingerie nova.</strong> Algo sexy como o que viste naquele filme que vimos juntos. Achas que conseguias fazer isso por mim?"</p>
      
      <h4>4️⃣ Usar Ferramentas de Terceiros</h4>
      <p>Às vezes é mais fácil ter a conversa "através" de algo:</p>
      
      <p><strong>📱 Apps de Match de Fantasias:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Kindu:</strong> Ambos respondem a perguntas, só vêem os "matches"</li>
        <li><strong>Desire:</strong> Jogo com desafios progressivos</li>
        <li><strong>Spicer:</strong> Níveis de "ousadia" personalizáveis</li>
        <li><strong>Quest4You Quiz:</strong> O nosso próprio questionário de compatibilidade!</li>
      </ul>
      
      <p><strong>📖 Conteúdo Partilhado:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"Li este artigo interessante sobre [X]. O que achas?"</li>
        <li>"Vi este vídeo e lembrei-me de ti/nós"</li>
        <li>Podcasts sobre sexualidade ouvidos juntos no carro</li>
      </ul>
      
      <p><strong>🎲 Jogo das Fantasias:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Cada um escreve 3 fantasias em papéis separados</li>
        <li>Dobram e misturam</li>
        <li>Abrem e lêem em voz alta</li>
        <li>Discutem cada uma com mente aberta</li>
        <li>Classificam: "Sim/Talvez/Não para já/Nunca"</li>
      </ul>
      
      <h3>Como Abordar Temas Específicos</h3>
      
      <h4>🆕 Querer Experimentar Algo Novo</h4>
      <p><strong>Abordagem soft:</strong> "Tenho tido curiosidade sobre [X]. Já pensaste nisso alguma vez?"</p>
      <p><strong>Abordagem através de fantasia:</strong> "Imagina se fizéssemos [X]... Como é que te faria sentir?"</p>
      <p><strong>Abordagem gradual:</strong> "Não estou a sugerir fazermos já, mas gostava de explorar a ideia verbalmente primeiro."</p>
      
      <h4>🔁 Querer Mais Frequência</h4>
      <p><strong>NÃO:</strong> "Nunca temos sexo!"</p>
      <p><strong>SIM:</strong> "Sinto-me mais ligado/a a ti quando temos intimidade física. Podíamos tentar priorizar isso mais? Tipo, duas vezes por semana?"</p>
      
      <h4>🎯 Dar Feedback Durante</h4>
      <p><strong>Positivo:</strong> "Sim, assim!" "Continua!" "Mais rápido/devagar" "Isso é perfeito"</p>
      <p><strong>Redirecionamento gentil:</strong> "Aqui está melhor" (guiando a mão), "Posso mostrar-te uma coisa?"</p>
      <p><strong>Parar algo:</strong> "Pera, isso não está a funcionar para mim. Vamos tentar [alternativa]?"</p>
      
      <h4>💔 Quando Algo Magoa/Incomoda</h4>
      <p><strong>Imediato:</strong> "Amor, isso dói. Pára por favor." (Não aguentar por educação)</p>
      <p><strong>Depois:</strong> "Sobre aquela coisa ontem... não resultou para mim. Da próxima podemos fazer [alternativa]?"</p>
      
      <h4>🔥 Revelar Fantasias "Extremas"</h4>
      <p><strong>Testar as águas:</strong> "Qual é a coisa mais ousada que já fantasiaste?" (Reciprocidade cria segurança)</p>
      <p><strong>Contextualizar:</strong> "Isto é só fantasia, não significa que queira fazer mesmo. Mas às vezes penso em [X]..."</p>
      <p><strong>Normalizar:</strong> "Li que [X]% das pessoas fantasiam sobre isto. É mais comum do que parece."</p>
      
      <h3>Respeitar (e Processar) o "Não"</h3>
      <p>Esta parte é CRUCIAL e onde muitos casais falham:</p>
      
      <h4>Quando o Outro Diz "Não":</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>✅ <strong>Aceitar graciosamente:</strong> "OK, obrigado pela honestidade"</li>
        <li>✅ <strong>Perguntar (uma vez) porquê:</strong> "Podes explicar o que te incomoda nisso?"</li>
        <li>✅ <strong>Propor alternativas:</strong> "E se fizéssemos uma versão mais suave?"</li>
        <li>❌ <strong>Insistir repetidamente</strong></li>
        <li>❌ <strong>Fazer beicinho/chantagem emocional</strong></li>
        <li>❌ <strong>Comparar com ex's ou amigos</strong></li>
        <li>❌ <strong>Assumir que nunca mudará</strong></li>
      </ul>
      
      <h4>Tipos de "Não":</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>"Não para já":</strong> Significa talvez no futuro com mais confiança/contexto</li>
        <li><strong>"Não compreendo":</strong> Precisa de mais informação/educação sobre o tema</li>
        <li><strong>"Não me sinto seguro":</strong> Questão de confiança, não da atividade em si</li>
        <li><strong>"Não absoluto":</strong> Limite rígido, respeitar sem questionar</li>
      </ul>
      
      <p><strong>Importante:</strong> Um "não" hoje pode ser um "sim" amanhã, ou pode continuar a ser "não" para sempre. Ambas as opções são válidas e devem ser respeitadas.</p>
      
      <h3>Conversas Difíceis</h3>
      
      <h4>🚩 "Não Estou Satisfeito/a"</h4>
      <p><strong>Preparação:</strong> Ter pelo menos 2-3 sugestões concretas de melhoria</p>
      <p><strong>Abordagem:</strong> "Amo o que temos, E gostava de explorar formas de tornar ainda melhor. Posso partilhar algumas ideias?"</p>
      
      <h4>🩺 "Tenho um Problema Físico"</h4>
      <p>Dor, disfunção, falta de desejo por motivos médicos:</p>
      <p><strong>Honestidade:</strong> "Tenho tido [problema]. Não é sobre ti, mas preciso de ir ao médico. Podemos trabalhar juntos nisso?"</p>
      
      <h4>🤐 "Fingi Orgasmos"</h4>
      <p>Situação delicada mas mais comum do que se pensa:</p>
      <p><strong>Abordagem:</strong> "Preciso de te dizer algo difícil. Às vezes finjo porque não quero que te sintas mal, mas sei que não é justo para nenhum de nós. Podemos recomeçar com honestidade total?"</p>
      
      <h4>👥 "Quero Abrir a Relação"</h4>
      <p>Provavelmente a conversa mais difícil:</p>
      <p><strong>NÃO começar com:</strong> "Quero transar com outras pessoas"</p>
      <p><strong>Começar com:</strong> "Tenho lido sobre relações não-monogâmicas e fiquei curioso sobre a perspectiva. Alguma vez pensaste nisso?" (Exploração intelectual primeiro)</p>
      
      <h3>Criar Cultura de Comunicação</h3>
      <p>Não esperem por "conversas importantes". Normalizem falar sobre sexo:</p>
      
      <h4>💬 Check-ins Regulares</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Semanal:</strong> "Como está a nossa vida sexual esta semana?"</li>
        <li><strong>Pós-sexo:</strong> "O que gostaste mais?" "Algo que queiras diferente da próxima?"</li>
        <li><strong>Mensal:</strong> "Há algo novo que queiras experimentar este mês?"</li>
      </ul>
      
      <h4>🎭 Role Reversal Game</h4>
      <p>Cada um descreve como acha que o outro se sente sobre a vida sexual do casal. Depois comparam com a realidade. Revela mal-entendidos.</p>
      
      <h4>📝 "Sex Journal" Partilhado</h4>
      <p>Caderno onde ambos escrevem pensamentos, fantasias, feedback. Podem ler juntos uma vez por mês.</p>
      
      <h3>Red Flags em Comunicação Sexual</h3>
      <p><strong>Quando procurar terapia de casal:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Um dos dois recusa-se completamente a ter "a conversa"</li>
        <li>Conversas sobre sexo sempre descambam em discussões</li>
        <li>Um dos dois usa informação partilhada como "arma" em discussões futuras</li>
        <li>Sentimento de que estão a falar línguas completamente diferentes</li>
        <li>Ressentimento acumulado que já não conseguem resolver sozinhos</li>
      </ul>
      
      <h3>Exemplos Reais de Conversas Bem-Sucedidas</h3>
      
      <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d; margin-bottom: 15px;">
      <strong>Ela:</strong> "Amor, posso falar contigo sobre uma coisa? Tenho reparado que quando fazemos amor, sinto que às vezes vais muito direto ao ponto. Eu adoro quando me tocas, mas precisava de mais tempo de preparação. Tipo, mais beijos, mais toque pelo corpo todo. Não é que estejas a fazer mal, só preciso de um ritmo diferente. Podíamos experimentar prolongar o início?"<br><br>
      <strong>Ele:</strong> "Obrigado por me dizeres. Não tinha noção. Achas que 15-20 minutos de foreplay seria suficiente?"<br><br>
      <strong>Ela:</strong> "Isso seria perfeito. E adoro quando me sussurras ao ouvido durante. Isso deixa-me louca."<br><br>
      <strong>Ele:</strong> "Isso eu posso fazer. Na verdade, também queria pedir-te uma coisa..."
      </p>
      
      <p><strong>Resultado:</strong> Ambos saíram ouvidos, validados e com plano de ação. Nenhuma defensividade porque foi abordado com amor e especificidade.</p>
      
      <h3>Recursos Úteis</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Livros:</strong> "Mating in Captivity" (Esther Perel), "Come As You Are" (Emily Nagoski)</li>
        <li><strong>Podcasts:</strong> Where Should We Begin?, Sex With Emily</li>
        <li><strong>Apps:</strong> Kindu, Spicer, Desire</li>
        <li><strong>Terapeutas:</strong> Procurar psicólogos especializados em terapia sexual</li>
      </ul>
      
      <p><strong>Mensagem final:</strong> Falar sobre sexo DEVERIA ser tão natural como falar sobre o jantar. Se conseguem planear férias juntos, negociar finanças e decidir onde viver, conseguem falar sobre o que vos dá prazer. É literalmente sobre conhecer melhor a pessoa que amam e permitir que vos conheçam melhor. E essa vulnerabilidade? Isso é intimidade real.</p>
      </div>
    `
  },  {
    id: "bdsm-iniciantes",
    title: "BDSM para Iniciantes: Primeiros Passos",
    excerpt: "Introdução segura ao mundo do BDSM para casais curiosos.",
    category: "dinamicas",
    categoryLabel: "Dinâmicas",
    icon: "⛓️",
    image: "https://images.unsplash.com/photo-1565461497552-0e35e7c21ae1?w=600&h=400&fit=crop&q=80",
    readTime: 16,
    content: `
      <div style="text-align: left;">
      <h3>Desmistificar o BDSM</h3>
      <p>BDSM não é o que o "50 Shades of Grey" te fez pensar. Não é sobre abuso, não é sempre sobre dor extrema, e definitivamente não é sobre falta de controlo. É sobre consenso, comunicação e exploração de dinâmicas de poder de forma segura. Estudos mostram que praticantes de BDSM tendem a ter relações mais saudáveis, melhor comunicação e menor taxa de ansiedade que a população geral.</p>
      
      <h3>O Que É BDSM? (Além do Acrónimo)</h3>
      <p>BDSM é um termo guarda-chuva que abrange várias práticas:</p>
      
      <h4>🔗 Bondage & Discipline (B&D)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Bondage:</strong> Restrição física - amarrar, algemar, imobilizar</li>
        <li><strong>Discipline:</strong> Regras, punições (consensuais), estrutura</li>
        <li><strong>Exemplo:</strong> Amarrar as mãos do parceiro à cabeceira da cama</li>
      </ul>
      
      <h4>👑 Dominance & Submission (D&S)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Dominance:</strong> Assumir controlo, dar ordens, liderar</li>
        <li><strong>Submission:</strong> Entregar controlo, obedecer, servir</li>
        <li><strong>Exemplo:</strong> Um parceiro decide todas as ações durante o encontro sexual</li>
        <li><strong>Nota:</strong> Pode existir SEM dor física</li>
      </ul>
      
      <h4>💢 Sadism & Masochism (S&M)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Sadism:</strong> Prazer em causar dor/desconforto (consensual)</li>
        <li><strong>Masochism:</strong> Prazer em receber dor/desconforto</li>
        <li><strong>Exemplo:</strong> Spanking, uso de pinças, cera quente</li>
        <li><strong>Importante:</strong> SEMPRE consensual e dentro de limites acordados</li>
      </ul>
      
      <h3>Princípios Fundamentais (NÃO NEGOCIÁVEIS)</h3>
      
      <h4>✅ SSC - Safe, Sane, Consensual</h4>
      <p>O pilar da comunidade BDSM:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>SAFE (Seguro):</strong> Minimizar riscos físicos e emocionais. Usar equipamento apropriado, conhecer anatomia, ter kit de primeiros socorros.</li>
        <li><strong>SANE (São):</strong> Ambos em estado mental adequado. Não sob influência de álcool/drogas pesadas, não em estado emocional fragilizado.</li>
        <li><strong>CONSENSUAL:</strong> Acordo claro, informado e entusiástico de TODAS as partes. Pode ser retirado a qualquer momento.</li>
      </ul>
      
      <h4>🚦 RACK - Risk Aware Consensual Kink</h4>
      <p>Alternativa ao SSC, reconhece que há sempre algum risco:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>RISK AWARE:</strong> Conhecer os riscos envolvidos</li>
        <li><strong>CONSENSUAL:</strong> Todos concordam apesar dos riscos</li>
        <li><strong>KINK:</strong> Práticas fora do "convencional"</li>
      </ul>
      
      <h4>🛑 Safe Words - O Teu Melhor Amigo</h4>
      <p>Sistema de semáforos é o mais usado:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>🟢 VERDE:</strong> "Continua, está ótimo, podes aumentar intensidade"</li>
        <li><strong>🟡 AMARELO:</strong> "Estou no meu limite, não aumentes mais, vamos manter assim ou aliviar um pouco"</li>
        <li><strong>🔴 VERMELHO:</strong> "PARA TUDO IMEDIATAMENTE. Preciso de sair da cena AGORA."</li>
      </ul>
      
      <p><strong>Regra de ouro:</strong> Vermelho para TUDO. Sem perguntas, sem ressentimentos. Depois de aftercare, podem discutir o que aconteceu.</p>
      
      <p><strong>Alternativa não-verbal:</strong> Se boca estiver tapada, segurar um objeto que pode largar = equivalente a "vermelho".</p>
      
      <h3>Níveis de BDSM: Começar MUITO Devagar</h3>
      
      <h4>🌱 NÍVEL 1: Vanilla+ (Primeiro Contacto)</h4>
      <p>Para quem nunca experimentou NADA fora do "convencional":</p>
      
      <p><strong>Power Play Verbal:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Usar linguagem de comando: "Ajoelha", "Não mexas", "Pede permissão"</li>
        <li>Roleplay leve: Professor/Aluno, Chefe/Empregado</li>
        <li>Dirty talk com elementos de dominação</li>
      </ul>
      
      <p><strong>Controlo de Prazer:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Controlar quando o parceiro pode tocar-se</li>
        <li>Edging: levar quase ao orgasmo, parar, repetir</li>
        <li>Orgasm denial/control: só com permissão</li>
      </ul>
      
      <p><strong>Privação Sensorial Leve:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Venda nos olhos:</strong> Lenço de seda, máscara de dormir</li>
        <li><strong>Efeito:</strong> Outros sentidos amplificados - toque, som, antecipação</li>
        <li><strong>Segurança:</strong> Quem está vendado tem controlo total do safe word</li>
      </ul>
      
      <h4>🌿 NÍVEL 2: Light Bondage</h4>
      <p>Quando já estão confortáveis com o básico:</p>
      
      <p><strong>Restrição Suave:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Algemas de velcro/cetim:</strong> Fáceis de remover, confortáveis</li>
        <li><strong>Restraints para cama:</strong> Prendem nos cantos do colchão</li>
        <li><strong>Mãos amarradas com lenço:</strong> Simbólico mais que real</li>
        <li><strong>⚠️ NUNCA:</strong> Amarrar o pescoço. Nunca amarrar sozinho sem supervisão.</li>
      </ul>
      
      <p><strong>Posições de Submissão:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ajoelhado</li>
        <li>De quatro</li>
        <li>Mãos atrás das costas sem serem amarradas (teste de obediência)</li>
      </ul>
      
      <p><strong>Spanking Introdutório:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Começar só com mão aberta</li>
        <li>Áreas seguras: nádegas, coxas (carnudas)</li>
        <li>❌ EVITAR: Coluna, rins, articulações</li>
        <li>Começar suave, aumentar gradualmente</li>
        <li>Fazer massagem entre palmadas</li>
      </ul>
      
      <h4>🌳 NÍVEL 3: Intermediate Play</h4>
      <p>Para quem já praticou o anterior e quer explorar mais:</p>
      
      <p><strong>Impact Play (Além da Mão):</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Paddle (raquete):</strong> Impacto mais espalhado que a mão</li>
        <li><strong>Flogger:</strong> Múltiplas tiras de couro, sensação mais "thuddy"</li>
        <li><strong>Crop/chicote leve:</strong> Mais concentrado, sensação "stingy"</li>
        <li><strong>Regra:</strong> Testar sempre em TI PRÓPRIO primeiro na mesma intensidade</li>
      </ul>
      
      <p><strong>Sensações Intensas:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Cera de velas:</strong> Usar velas ESPECÍFICAS (ponto de fusão baixo), testar altura primeiro</li>
        <li><strong>Gelo:</strong> Passar pelo corpo, contraste com calor</li>
        <li><strong>Pinças para mamilos:</strong> Começar com ajustáveis, não deixar mais de 15 min</li>
        <li><strong>Sensações mistas:</strong> Penas suaves alternadas com unhadas</li>
      </ul>
      
      <p><strong>Protocolo e Regras:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Sub tem que pedir permissão para orgasmo</li>
        <li>Formas de tratamento: "Sir/Ma'am", "Master/Mistress"</li>
        <li>Tarefas/desafios ao longo do dia</li>
        <li>Recompensas e "punições" (consensuais, eróticas)</li>
      </ul>
      
      <h4>🌲 NÍVEL 4+: Avançado (Não Sem Educação)</h4>
      <p><strong>⚠️ REQUEREM EDUCAÇÃO ESPECÍFICA:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Rope bondage (Shibari/Kinbaku)</li>
        <li>Breath play (EXTREMAMENTE perigoso)</li>
        <li>Knife/fear play</li>
        <li>Electrostimulation</li>
        <li>24/7 D/s relationships</li>
      </ul>
      
      <p><strong>Não experimentem isto sem:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Workshops presenciais</li>
        <li>Mentoria de praticantes experientes</li>
        <li>Conhecimento profundo de anatomia e primeiros socorros</li>
      </ul>
      
      <h3>Roles: Quem És Tu?</h3>
      
      <h4>Dom/Domme (Dominante)</h4>
      <p><strong>Responsabilidades:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Planear a cena</li>
        <li>Manter segurança do sub</li>
        <li>Monitorizar estado físico e emocional</li>
        <li>Ter controlo emocional</li>
        <li>Providenciar aftercare</li>
      </ul>
      <p><strong>NÃO é:</strong> Abusador, egoísta, descontrolado</p>
      
      <h4>Sub (Submisso)</h4>
      <p><strong>Responsabilidades:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Comunicar limites claramente</li>
        <li>Usar safe word quando necessário</li>
        <li>Ser honesto sobre estado físico/emocional</li>
        <li>Dar feedback após cenas</li>
      </ul>
      <p><strong>NÃO é:</strong> Fraco, passivo em todos os aspetos da vida, doormat</p>
      
      <h4>Switch</h4>
      <p>Gosta de ambos os papéis, dependendo do humor/parceiro/dia.</p>
      
      <h4>Bratty Sub</h4>
      <p>Submisso que "desobedece" de propósito para provocar "punição" (parte do jogo).</p>
      
      <h4>Service Top</h4>
      <p>Tecnicamente dominante, mas foca-se no prazer do sub.</p>
      
      <p><strong>Verdade:</strong> Podes explorar diferentes roles com diferentes parceiros ou em diferentes momentos. Não é identidade fixa.</p>
      
      <h3>Negociação de Cena (ESSENCIAL)</h3>
      <p>Antes de QUALQUER sessão BDSM, especialmente com novo parceiro:</p>
      
      <h4>1. Discutir Desejos e Fantasias</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"O que queres explorar hoje?"</li>
        <li>"Que sensações procuras?"</li>
        <li>"Há algo específico que fantasiaste?"</li>
      </ul>
      
      <h4>2. Estabelecer Limites (Hard & Soft)</h4>
      <p><strong>Hard limits:</strong> Não negociáveis, NUNCA fazer</p>
      <p><strong>Soft limits:</strong> "Talvez com a pessoa certa/contexto certo"</p>
      <p><strong>Usar listas de checklist BDSM:</strong> Encontram online, marcar interesse em centenas de atividades</p>
      
      <h4>3. Definir Safe Words</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Relembrar sistema de semáforos</li>
        <li>Testar que ambos sabem e vão respeitar</li>
      </ul>
      
      <h4>4. Planear Aftercare</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"Do que precisas depois? Abraços? Silêncio? Chocolate?"</li>
      </ul>
      
      <h4>5. Check-in Durante</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Dom pergunta regularmente: "Cor?" (resposta: verde/amarelo/vermelho)</li>
        <li>Observar linguagem corporal</li>
      </ul>
      
      <h3>Aftercare: A Parte Mais Importante</h3>
      <p>BDSM pode ser intenso física e emocionalmente. Aftercare é o processo de reconexão e cuidado após a cena:</p>
      
      <h4>Para o Sub:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Cobertor quente (temperatura corporal cai)</li>
        <li>Água e snack doce (energia gasta)</li>
        <li>Abraços e carinhos físicos</li>
        <li>Reafirmação verbal: "Foste incrível", "Estou aqui"</li>
        <li>Tempo para processar emocionalmente</li>
      </ul>
      
      <h4>Para o Dom:</h4>
      <p>Doms também precisam de aftercare! Podem sentir:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Culpa por "magoar" o parceiro (mesmo consensual)</li>
        <li>Exaustão emocional de manter controlo</li>
        <li>Necessidade de validação que foram bom dom</li>
      </ul>
      
      <h4>⚠️ Sub Drop & Dom Drop</h4>
      <p>Horas ou dias após, podem sentir:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Tristeza inexplicável</li>
        <li>Ansiedade</li>
        <li>Sensação de vazio</li>
        <li>Dúvidas sobre o que fizeram</li>
      </ul>
      <p><strong>Causa:</strong> Queda de endorfinas/adrenalina</p>
      <p><strong>Solução:</strong> Reconhecer que é normal, contactar o parceiro, autocuidado (banho quente, comida confortável, filme leve)</p>
      
      <h3>Kit BDSM para Iniciantes (Budget-Friendly)</h3>
      
      <p><strong>Total: ~50-80€</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>🎀 <strong>Algemas de velcro (10-15€):</strong> Amazon, lojas eróticas</li>
        <li>👁️ <strong>Venda para olhos (5-10€):</strong> Ou lenço de seda que já tens</li>
        <li>🪶 <strong>Pena para sensações (3-5€):</strong> Loja de manualidades funciona</li>
        <li>🏓 <strong>Paddle leve (15-20€):</strong> Ou usa a tua própria mão (grátis!)</li>
        <li>🧴 <strong>Óleo de massagem (5-10€):</strong> Para aftercare</li>
        <li>🛡️ <strong>Tesoura de segurança (5€):</strong> Para cortar restrições em emergência</li>
        <li>📋 <strong>Checklist BDSM impressa (grátis):</strong> Descarregar online</li>
      </ul>
      
      <p><strong>NÃO precisam de:</strong> Masmorra, equipamento de €1000, trajes de couro (a não ser que queiram!)</p>
      
      <h3>Primeiras Experiências: Cenário Exemplo</h3>
      
      <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d; margin-bottom: 15px;">
      <strong>Preparação:</strong><br>
      - Conversa prévia: Ela quer experimentar ser submissa, ele vai dominar<br>
      - Limites definidos: Sem dor forte, sem anal, safe word "VERMELHO"<br>
      - Aftercare planeado: Abraços, cobertor, chocolate<br><br>
      
      <strong>Cena (45 minutos):</strong><br>
      1. Ele venda os olhos dela com lenço de seda<br>
      2. Guia-a devagar para a cama, vai descrevendo o que vai fazer<br>
      3. Amarra mãos dela à cabeceira com algemas de velcro (verifica circulação)<br>
      4. Usa pena por todo o corpo dela, alternando com toques firmes<br>
      5. Pergunta: "Cor?" Ela: "Verde"<br>
      6. Começa a tease erótico, controla quando ela pode ter prazer<br>
      7. Introduz palmadas leves, pergunta "Queres mais?" Ela: "Sim, Sir"<br>
      8. Continua até orgasmo (com permissão dele)<br>
      9. Remove algemas lentamente, retira venda, abraça-a<br><br>
      
      <strong>Aftercare (30 minutos):</strong><br>
      - Ele envolve-a em cobertor<br>
      - Dá-lhe água e chocolate<br>
      - Ficam abraçados a falar sobre a experiência<br>
      - "O que gostaste mais?" "Algo que não gostaste?"<br>
      - Ela reafirma que ele foi ótimo, ele reafirma que ela é incrível
      </p>
      
      <h3>Comunidade e Recursos</h3>
      
      <h4>🌐 Online:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Fetlife.com:</strong> Rede social BDSM (atenção: muitos predadores, ser crítico)</li>
        <li><strong>r/BDSMcommunity (Reddit):</strong> Comunidade de apoio e educação</li>
        <li><strong>r/BDSMAdvice:</strong> Para perguntas específicas</li>
        <li><strong>Evie Lupine (YouTube):</strong> Educadora sexual com vídeos sobre BDSM</li>
      </ul>
      
      <h4>📚 Livros:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"Screw the Roses, Send Me the Thorns" - Manual clássico</li>
        <li>"SM 101" por Jay Wiseman - Guia completo para iniciantes</li>
        <li>"The New Topping Book" e "The New Bottoming Book" - Dara Goldberg</li>
      </ul>
      
      <h4>🇵🇹 Portugal:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Munches:</strong> Encontros sociais (não sexuais) de comunidade BDSM em Lisboa/Porto</li>
        <li><strong>Workshops:</strong> Ocasionalmente organizados em Love Therapy e espaços similares</li>
        <li><strong>Clubes alternativos:</strong> Alguns têm quartos de jogo BDSM</li>
      </ul>
      
      <h3>Red Flags e Segurança</h3>
      
      <p><strong>🚩 Sinais de que NÃO é BDSM saudável:</strong></p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Pressão para fazer algo fora dos limites acordados</li>
        <li>Não respeitar safe word</li>
        <li>Abuso fora de cenas acordadas (BDSM é consensual, não 24/7 sem acordo)</li>
        <li>Isolamento de amigos/família</li>
        <li>Controlo financeiro não consensual</li>
        <li>Fazer sentir que "não és submisso de verdade se não..."</li>
        <li>Não providenciar aftercare</li>
      </ul>
      
      <p><strong>Importante:</strong> BDSM saudável aumenta confiança, comunicação e conexão. Se te sentes pior após sessões regularmente, algo está errado.</p>
      
      <h3>FAQ Rápido</h3>
      
      <p><strong>P: BDSM é sobre violência?</strong><br>
      R: Não. É sobre consenso e exploração. A "violência" está num contexto controlado e desejado por ambos.</p>
      
      <p><strong>P: Se gosto de ser submisso, significa que sou fraco?</strong><br>
      R: Absolutamente não. Muitos CEOs, líderes e pessoas de "poder" são submissos no quarto. É libertador ESCOLHER entregar controlo.</p>
      
      <p><strong>P: Tenho que escolher ser dom ou sub?</strong><br>
      R: Não! Switches existem, e muitas pessoas gostam de diferentes roles em diferentes contextos.</p>
      
      <p><strong>P: É normal sentir-me estranho depois?</strong><br>
      R: Sub/Dom drop é completamente normal. Cuida de ti, fala com o parceiro.</p>
      
      <p><strong>P: Preciso de equipamento caro?</strong><br>
      R: Não. Mãos, palavras e criatividade são grátis e eficazes.</p>
      
      <p><strong>Mensagem final:</strong> BDSM bem praticado é uma das formas mais profundas de intimidade e confiança que um casal pode experimentar. Requer vulnerabilidade total, comunicação impecável e respeito mútuo. Não é para todos, mas para quem ressoa, pode ser transformador. Comecem devagar, comuniquem constantemente e nunca comprometam a segurança. O objetivo é prazer e conexão - sempre.</p>
      </div>
    `
  },
  {
    id: "poliamor",
    title: "Poliamor Ético: Amar Mais do que Um",
    excerpt: "Entende o que é o poliamor, como funciona, as estruturas relacionais e se é para ti.",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    icon: "💕",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop&q=80",
    readTime: 18,
    content: `
      <div style="text-align: left;">
      <h3>O Que É Poliamor?</h3>
      <p>O poliamor (do grego "poli" = muitos + latim "amor") é a prática de ter múltiplas relações românticas e/ou sexuais simultâneas, com o conhecimento e consentimento explícito de todos os envolvidos. Ao contrário da infidelidade, o poliamor é baseado em honestidade, comunicação aberta e acordos claros entre todas as partes.</p>
      
      <p>É importante entender: poliamor não é sobre "ter carta branca para transar com quem quiser". É sobre construir relações autênticas, profundas e éticas com mais do que uma pessoa. Requer mais comunicação, não menos. Mais compromisso emocional, não menos. E definitivamente mais trabalho em si mesmo.</p>
      
      <h3>Poliamor vs. Outros Termos</h3>
      <p>Existem várias formas de não-monogamia, cada uma com características distintas:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">Termo</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Definição</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Foco</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Poliamor</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Múltiplas relações amorosas simultâneas</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Amor, emoção, relacionamento</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Relação Aberta</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Casal que permite sexo com terceiros</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Sexual, sem romance externo</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Swing</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Casais trocam parceiros para sexo</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Sexual, recreativo, juntos</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Monogamish</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Maioritariamente monógamo, com exceções acordadas</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Flexibilidade ocasional</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Anarquia Relacional</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Sem hierarquias ou rótulos pré-definidos</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Liberdade total de definição</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Poligamia</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">Múltiplos casamentos (geralmente religioso)</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Estrutura matrimonial formal</td>
        </tr>
      </table>
      
      <h3>Estruturas Poliamorosas Comuns</h3>
      
      <h4>📐 Vee (V)</h4>
      <p>Uma pessoa (o "pivot" ou "hinge") tem duas relações separadas com duas pessoas que não estão romanticamente envolvidas entre si.</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Exemplo: Ana namora com Bruno e Carlos. Bruno e Carlos conhecem-se e respeitam-se, mas não são parceiros um do outro.</li>
        <li>Desafios: O pivot pode sentir-se "esticado" entre dois; os outros podem sentir ciúme ou competição.</li>
        <li>Vantagem: Menos complexidade na gestão de dinâmicas de grupo.</li>
      </ul>
      
      <h4>🔺 Triad (Triângulo)</h4>
      <p>Três pessoas todas romanticamente/sexualmente envolvidas umas com as outras.</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Exemplo: Ana, Bruno e Carla são todos parceiros entre si.</li>
        <li>Pode viver junta ou separados.</li>
        <li>Desafios: Gerir três relações de cada vez (A-B, A-C, B-C) + a dinâmica de grupo.</li>
        <li>Nota: "Unicorn hunting" (casal que procura "mulher bissexual para ambos") é frequentemente criticado por tratar a terceira pessoa como acessório.</li>
      </ul>
      
      <h4>🔲 Quad</h4>
      <p>Quatro pessoas interligadas de várias formas - pode ser dois casais que se relacionam cruzadamente.</p>
      
      <h4>📊 Poliamor Hierárquico</h4>
      <p>Existem níveis de "importância" ou compromisso:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Parceiro Primário:</strong> Geralmente coabitação, finanças partilhadas, decisões de vida em conjunto</li>
        <li><strong>Parceiro Secundário:</strong> Relação significativa mas sem mesma integração prática</li>
        <li><strong>Parceiro Terciário:</strong> Relação mais casual ou pontual</li>
        <li><strong>Críticas:</strong> Alguns argumentam que hierarquias desvalorizam relações "secundárias"</li>
      </ul>
      
      <h4>🕸️ Polycule/Constelação</h4>
      <p>Rede mais ampla de relações interligadas - pode incluir dezenas de pessoas com vários graus de conexão.</p>
      
      <h4>🏴 Anarquia Relacional</h4>
      <p>Rejeita categorizações e hierarquias pré-definidas. Cada relação é única e definida pelos envolvidos, sem pressupor que romance é "superior" a amizade.</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Não há regras universais</li>
        <li>Compromissos são negociados individualmente</li>
        <li>Pode incluir ou não sexo, romance, coabitação</li>
      </ul>
      
      <h3>Conceitos-Chave no Poliamor</h3>
      
      <h4>💚 Compersion</h4>
      <p>O oposto de ciúme - sentir alegria ao ver o teu parceiro feliz com outra pessoa. Muitos poliamorosos descrevem compersion como o "Santo Graal" do poliamor. Não é obrigatório senti-lo, mas é aspiracional.</p>
      
      <h4>🗓️ Gestão de Tempo e Energia</h4>
      <p>Com múltiplas relações, calendar management torna-se skill essencial:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Quantas noites por semana com cada parceiro?</li>
        <li>Feriados e datas especiais - com quem?</li>
        <li>Tempo a sós para ti próprio?</li>
        <li>Energia emocional para estar presente com cada um?</li>
      </ul>
      
      <h4>🗣️ Metamour</h4>
      <p>O parceiro do teu parceiro (que não é teu parceiro). Exemplos:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Se namorarmos e tu namorares também com outra pessoa, ela é minha metamour.</li>
        <li>Relação com metamour pode ser inexistente, amigável ou muito próxima (depende de todos).</li>
        <li>"Kitchen table polyamory": Todos confortáveis a partilhar refeição juntos.</li>
        <li>"Parallel polyamory": Relações separadas que não se cruzam.</li>
      </ul>
      
      <h4>💬 Comunicação Constante</h4>
      <p>Poliamor requer comunicação a um nível que monogamia normalmente não exige:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Sobre sentimentos, medos, necessidades</li>
        <li>Sobre novos relacionamentos potenciais</li>
        <li>Sobre mudanças nos acordos</li>
        <li>Sobre ciúmes (que existem mesmo no poliamor!)</li>
      </ul>
      
      <h3>Poliamor É Para Mim?</h3>
      <p>Perguntas honestas a fazer a ti próprio:</p>
      
      <h4>✅ Sinais de que PODE ser para ti:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Sempre sentiste capacidade de amar mais do que uma pessoa</li>
        <li>Monogamia nunca pareceu "natural" (não por querer trair, mas por sentir amor por vários)</li>
        <li>Gostas de comunicação profunda e constante</li>
        <li>Consegues processar emoções intensas sem agir destrutivamente</li>
        <li>Tens capacidade de sentir felicidade pela felicidade do parceiro (compersion)</li>
        <li>Valorizas liberdade e autonomia nas relações</li>
        <li>Tens disponibilidade emocional e temporal para múltiplas relações</li>
      </ul>
      
      <h4>❌ Sinais de que PODE NÃO ser para ti:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Queres "salvar" uma relação monógama que está a falhar</li>
        <li>Parceiro está a pressionar e tu não queres realmente</li>
        <li>Pensas que vai resolver problemas de ciúme (frequentemente amplifica)</li>
        <li>Não tens tempo/energia sequer para uma relação saudável</li>
        <li>Estás a fugir de intimidade profunda através de múltiplas relações superficiais</li>
        <li>Não lidas bem com rejeição ou com ver parceiro com outras pessoas</li>
        <li>Queres os benefícios mas não estás disposto a fazer o trabalho emocional</li>
      </ul>
      
      <h3>Desafios Reais do Poliamor</h3>
      
      <h4>💔 Ciúme</h4>
      <p>Sim, pessoas poliamorosas sentem ciúme. A diferença é como o processam:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Reconhecer o ciúme sem julgamento</li>
        <li>Identificar o MEDO por baixo (medo de perder, de ser substituído, de não ser suficiente)</li>
        <li>Comunicar ao parceiro de forma não-acusatória</li>
        <li>Trabalhar juntos para reassegurar</li>
        <li>Ver ciúme como informação, não como verdade absoluta</li>
      </ul>
      
      <h4>⏰ Tempo e Logística</h4>
      <p>A matemática simples: 24h num dia, múltiplos parceiros, trabalho, família, amigos, hobbies, sono...</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Calendários partilhados</li>
        <li>Acordos claros sobre disponibilidade</li>
        <li>Aceitar que nem sempre haverá tempo suficiente</li>
        <li>Qualidade vs. quantidade de tempo</li>
      </ul>
      
      <h4>🤐 Estigma Social</h4>
      <p>Poliamor ainda não é aceite pela sociedade mainstream:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Família pode não entender</li>
        <li>Colegas de trabalho podem julgar</li>
        <li>Questões legais (custódia de filhos, heranças)</li>
        <li>Ter que manter "no armário" em certos contextos</li>
      </ul>
      
      <h4>💑 Impacto em Filhos</h4>
      <p>Se houver crianças envolvidas:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Quando e como explicar a estrutura familiar?</li>
        <li>Que relação têm parceiros com os filhos?</li>
        <li>E se uma relação terminar - impacto nas crianças?</li>
        <li>Escola, outros pais, julgamento</li>
      </ul>
      
      <h3>Como Começar?</h3>
      
      <h4>1️⃣ Educação</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Ler livros sobre poliamor (ver recursos abaixo)</li>
        <li>Ouvir podcasts de pessoas poliamorosas</li>
        <li>Entrar em comunidades online (Reddit r/polyamory, grupos Facebook)</li>
        <li>Falar com pessoas que praticam</li>
      </ul>
      
      <h4>2️⃣ Conversa com Parceiro Atual</h4>
      <p>Se estás numa relação monógama e queres abrir:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Escolher momento calmo e neutro</li>
        <li>Não apresentar como ultimato</li>
        <li>"Tenho lido/pensado sobre isto e gostava de explorar a ideia contigo"</li>
        <li>Dar tempo para processar - não esperar resposta imediata</li>
        <li>Estar preparado para "não" - e respeitar</li>
      </ul>
      
      <h4>3️⃣ Acordos e Limites</h4>
      <p>Se decidirem avançar, definir claramente:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Que tipo de estrutura (hierárquica, não-hierárquica)?</li>
        <li>Proteção sexual - que práticas requerem proteção?</li>
        <li>Conhecer parceiros uns dos outros ou não?</li>
        <li>Poder de veto sobre novos parceiros?</li>
        <li>Quanto tempo para novas relações vs. relação existente?</li>
        <li>Estes acordos podem evoluir com o tempo!</li>
      </ul>
      
      <h4>4️⃣ Ir Devagar</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Não correr para encontrar "mais alguém"</li>
        <li>Trabalhar a relação existente primeiro</li>
        <li>Explorar socialização em comunidades poli antes de namorar</li>
        <li>Check-ins frequentes com todos os envolvidos</li>
      </ul>
      
      <h3>Recursos Recomendados</h3>
      
      <h4>📚 Livros:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>"The Ethical Slut"</strong> - Dossie Easton & Janet Hardy (o clássico)</li>
        <li><strong>"More Than Two"</strong> - Franklin Veaux & Eve Rickert (guia prático)</li>
        <li><strong>"Polysecure"</strong> - Jessica Fern (poliamor + teoria de attachment)</li>
        <li><strong>"Opening Up"</strong> - Tristan Taormino (explorar não-monogamia)</li>
        <li><strong>"The Jealousy Workbook"</strong> - Kathy Labriola (exercícios práticos)</li>
      </ul>
      
      <h4>🎧 Podcasts:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Multiamory</li>
        <li>Polyamory Weekly</li>
        <li>Making Polyamory Work</li>
      </ul>
      
      <h4>🌐 Online:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Reddit: r/polyamory, r/nonmonogamy</li>
        <li>PolyamoryDate, OKCupid, Feeld (apps com opções poli)</li>
        <li>Grupos locais de não-monogamia ética</li>
      </ul>
      
      <h4>🇵🇹 Em Portugal:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Grupos Facebook: "Poliamor Portugal", "Não-Monogamia Ética Portugal"</li>
        <li>Meetups ocasionais em Lisboa e Porto</li>
        <li>Comunidade crescente mas ainda discreta</li>
      </ul>
      
      <p style="margin-top: 20px; font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d;"><strong>Testemunho anónimo:</strong> "Comecei a explorar poliamor há 3 anos após 10 anos de casamento. O meu maior medo era que isto significasse que a nossa relação não era suficiente. Hoje percebo que não é sobre insuficiência - é sobre expansão. Amo a minha esposa mais do que nunca, E tenho uma namorada que enriquece a minha vida de formas diferentes. Não é fácil - requer mais trabalho emocional do que alguma vez fiz. Mas para mim, vale a pena."</p>
      
      <p><strong>Mensagem final:</strong> Poliamor não é para todos - e está OK. Monogamia é igualmente válida. O importante é escolher conscientemente a estrutura relacional que funciona para TI e para os teus parceiros, baseada em honestidade, consentimento e respeito mútuo. Se decidires explorar, faz o trabalho: educa-te, comunica exaustivamente e prepara-te para crescimento pessoal intenso. É uma jornada, não um destino.</p>
      </div>
    `
  },
  {
    id: "swing-iniciantes",
    title: "Swing para Casais: O Primeiro Passo",
    excerpt: "Tudo o que precisas saber antes de entrar no mundo do swing - guia completo para iniciantes.",
    category: "dinamicas",
    categoryLabel: "Dinâmicas",
    icon: "🔄",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop&q=80",
    readTime: 18,
    content: `
      <div style="text-align: left;">
      <h3>O Que É o Swing?</h3>
      <p>O swing é uma prática em que casais, de comum acordo, têm experiências sexuais com outros casais ou pessoas. Ao contrário do que muitos pensam, não é sobre insatisfação na relação ou falta de amor - para a maioria dos praticantes, é uma forma de adicionar aventura, novidade e exploração sexual à vida de um casal que já é feliz junto.</p>
      
      <p>O swing moderno surgiu nos anos 50-60 nos EUA, entre pilotos militares e suas esposas. Hoje é uma comunidade global, discreta mas ativa, com milhões de praticantes em todo o mundo - incluindo Portugal.</p>
      
      <h3>Tipos de Swing</h3>
      <p>Existem várias "modalidades" - cada casal define o que funciona para si:</p>
      
      <h4>🔹 Soft Swap (Troca Suave)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Tudo MENOS penetração vaginal/anal com terceiros</li>
        <li>Pode incluir: beijos, carícias, sexo oral, masturbação mútua</li>
        <li>Ideal para casais iniciantes ou que preferem limites mais definidos</li>
        <li>Penetração apenas com o próprio parceiro</li>
      </ul>
      
      <h4>🔸 Full Swap (Troca Completa)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Sexo completo (incluindo penetração) com outros parceiros</li>
        <li>Geralmente requer mais experiência e confiança no casal</li>
        <li>Proteção (preservativo) é regra universal</li>
      </ul>
      
      <h4>🔶 Same Room (Mesma Sala)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Atividade sexual acontece com todos no mesmo espaço</li>
        <li>Permite manter contacto visual com o próprio parceiro</li>
        <li>Mais comum entre casais</li>
        <li>Pode ser voyeurístico para alguns (ver o parceiro com outro)</li>
      </ul>
      
      <h4>🔷 Separate Room (Quartos Separados)</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Cada "casal temporário" vai para um espaço privado</li>
        <li>Maior privacidade</li>
        <li>Requer mais confiança</li>
        <li>Menos comum para iniciantes</li>
      </ul>
      
      <h4>👀 Voyeurismo / Exibicionismo</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Apenas observar outros casais (voyeurismo)</li>
        <li>Ou ser observados enquanto fazem sexo entre si (exibicionismo)</li>
        <li>Sem toque com terceiros</li>
        <li>Excelente porta de entrada para o mundo swing</li>
      </ul>
      
      <h4>🦄 Unicorn / Unicórnio</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Adicionar uma terceira pessoa (geralmente mulher) ao casal</li>
        <li>Chamado "unicórnio" porque é raro encontrar mulheres bissexuais interessadas</li>
        <li>Atenção: Tratar sempre a terceira pessoa com respeito, não como "brinquedo"</li>
      </ul>
      
      <h3>Preparação do Casal (CRUCIAL)</h3>
      
      <h4>💬 1. A Conversa Inicial</h4>
      <p>Antes de QUALQUER ação prática, falem extensamente:</p>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Porquê querem isto?</strong> Motivações claras e honestas</li>
        <li><strong>Expectativas:</strong> O que esperam ganhar? Excitação? Variedade? Voyeurismo?</li>
        <li><strong>Medos:</strong> O que vos preocupa? Ciúme? Comparações? Perder a ligação?</li>
        <li><strong>Cenários hipotéticos:</strong> "E se eu ficar com ciúmes?" "E se um de nós quiser parar?" "E se houver atração por outra pessoa fora do contexto sexual?"</li>
      </ul>
      
      <h4>📝 2. Definir Regras Claras</h4>
      <p>Antes de ir a qualquer evento ou conhecer qualquer casal, acordar em:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; border: 1px solid #ddd;">Questão</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Opções a Discutir</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Nível de troca</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Soft swap, full swap, só voyeurismo?</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Beijos</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Permitidos? Só beijos rápidos? Beijos apaixonados?</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Sexo oral</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Dar? Receber? Ambos? Nenhum?</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Sala</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Mesmo espaço? Quartos separados?</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Proteção</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Preservativo sempre? Só para penetração?</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #ddd;">Contacto posterior</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Podem trocar contactos? Ver-se novamente?</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">Power de veto</td>
          <td style="padding: 10px; border: 1px solid #ddd;">Qualquer um pode dizer não a qualquer momento?</td>
        </tr>
      </table>
      
      <p style="margin-top: 15px;"><strong>Regra de ouro:</strong> Começar com menos liberdade do que acham que querem. É mais fácil expandir limites depois do que lidar com situações que ultrapassaram limites.</p>
      
      <h4>🚦 3. Safe Words e Sinais</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Verbal:</strong> Palavra código que significa "vamos sair AGORA" (ex: "Preciso de água fresca")</li>
        <li><strong>Não-verbal:</strong> Gesto discreto se não puderem falar (ex: coçar orelha direita)</li>
        <li><strong>Regra:</strong> Quando um diz, o outro segue sem questionar na hora. Discussão depois, em casa.</li>
      </ul>
      
      <h4>💑 4. Fortalecer a Relação Primeiro</h4>
      <p>Swing não resolve problemas de casal - amplifica-os. Só avançar se:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Comunicação do casal é excelente</li>
        <li>Não há ressentimentos por resolver</li>
        <li>Confiança mútua é sólida</li>
        <li>Vida sexual juntos já é satisfatória</li>
        <li>AMBOS querem genuinamente (não um a ceder ao outro)</li>
      </ul>
      
      <h3>Onde Encontrar? (Em Portugal)</h3>
      
      <h4>🏠 Clubes de Swing</h4>
      <p>Espaços físicos dedicados à prática:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Lisboa:</strong> Épices (atualmente encerrado para remodelação), eventos privados</li>
        <li><strong>Porto:</strong> Clubes privados com entrada por convite</li>
        <li><strong>Algarve:</strong> Festas de verão, especialmente agosto</li>
        <li><strong>Como funcionam:</strong> Geralmente têm bar social, zona de dança, quartos privados ou semi-privados</li>
        <li><strong>Preços:</strong> €30-80 por casal (geralmente inclui bebidas)</li>
        <li><strong>Dress code:</strong> Elegante/sexy na entrada; roupa vai saindo nos espaços apropriados</li>
      </ul>
      
      <h4>📱 Sites e Apps</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>SDC (Swingers Date Club):</strong> O maior mundialmente, comunidade portuguesa ativa</li>
        <li><strong>Feeld:</strong> App para relações alternativas, incluindo swing</li>
        <li><strong>Kasidie:</strong> Popular nos EUA, alguma presença europeia</li>
        <li><strong>FabSwingers:</strong> Mais popular no UK</li>
        <li><strong>Grupos Telegram/Signal:</strong> Comunidades privadas portuguesas (encontrar via SDC)</li>
      </ul>
      
      <h4>🎉 Festas Privadas</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Organizadas por casais experientes</li>
        <li>Entrada por convite/seleção</li>
        <li>Geralmente mais exclusivas</li>
        <li>Encontradas via sites/redes da comunidade</li>
      </ul>
      
      <h4>🏖️ Resorts e Viagens</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Cap d'Agde (França), Desire (México), Hedonism (Jamaica)</li>
        <li>Cruzeiros lifestyle</li>
        <li>Ver artigo de Turismo Adulto</li>
      </ul>
      
      <h3>A Primeira Vez: Passo a Passo</h3>
      
      <h4>1️⃣ Visita "só para ver"</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Primeira ida a um clube: NÃO fazer nada com outros</li>
        <li>Objetivo: Conhecer o ambiente, observar dinâmicas, sentir a vibe</li>
        <li>Conversar com outros casais (são geralmente muito acolhedores com iniciantes)</li>
        <li>Podem fazer sexo só entre vocês se quiserem</li>
        <li>Ir embora quando quiserem, sem pressão</li>
      </ul>
      
      <h4>2️⃣ Debriefing em Casa</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Como se sentiram?</li>
        <li>O que excitou? O que incomodou?</li>
        <li>Querem voltar? Querem experimentar mais?</li>
        <li>Ajustar regras baseado na experiência</li>
      </ul>
      
      <h4>3️⃣ Próximos Passos Graduais</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Segunda visita: Talvez voyeurismo/exibicionismo</li>
        <li>Terceira visita: Talvez soft swap suave</li>
        <li>Ir avançando ao ritmo de AMBOS</li>
        <li>Não há pressa - casais experientes preferem iniciantes que vão devagar</li>
      </ul>
      
      <h3>Etiqueta no Mundo Swing</h3>
      
      <h4>✅ O Que Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Higiene impecável:</strong> Banho, dentes lavados, unhas cortadas</li>
        <li><strong>Respeitar "não":</strong> Graciosamente, sem insistir ou fazer cara feia</li>
        <li><strong>Perguntar antes de tocar:</strong> Sempre, mesmo em ambiente liberal</li>
        <li><strong>Comunicar com o próprio parceiro:</strong> Check-ins durante o evento</li>
        <li><strong>Usar proteção:</strong> Preservativos sempre disponíveis e usados</li>
        <li><strong>Ser discretos fora do clube:</strong> Não cumprimentar pessoas em contexto público a menos que elas iniciem</li>
        <li><strong>Contribuir para boa vibe:</strong> Elogiar, ser simpático, não julgar</li>
      </ul>
      
      <h4>❌ O Que NÃO Fazer:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Fotografar ou filmar:</strong> Proibidíssimo (telefones muitas vezes deixados à entrada)</li>
        <li><strong>Insistir após recusa:</strong> Uma vez é informação, duas vezes é assédio</li>
        <li><strong>Embebedar-se:</strong> Perda de controlo = situações problemáticas</li>
        <li><strong>"Single males" agressivos:</strong> Homens solteiros só são bem-vindos em eventos específicos e com comportamento exemplar</li>
        <li><strong>Comparar parceiros:</strong> "A tua mulher é melhor que a minha" - desastre garantido</li>
        <li><strong>Partilhar segredos:</strong> O que acontece no clube, fica no clube</li>
        <li><strong>Formar expectativas:</strong> Não é garantido que encontrem casal compatível</li>
      </ul>
      
      <h3>Lidar com Ciúmes</h3>
      <p>Vão surgir, provavelmente. Como gerir:</p>
      
      <h4>Antes:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Reconhecer que ciúme é normal e não significa que swing não é para vocês</li>
        <li>Identificar triggers específicos (ver penetração? beijos? atenção prolongada?)</li>
        <li>Definir regras que minimizem esses triggers inicialmente</li>
      </ul>
      
      <h4>Durante:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Usar safe word se necessário - sair da situação</li>
        <li>Check-ins visuais com o parceiro (olhar nos olhos, sorrir)</li>
        <li>Lembrar: Vocês VÃO para casa juntos</li>
      </ul>
      
      <h4>Depois:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Falar honestamente sobre o que sentiram</li>
        <li>Sem acusações: "Senti ciúmes quando X" não "Tu fizeste-me sentir ciúmes"</li>
        <li>Reconectar sexualmente entre vocês (reclamar o parceiro)</li>
        <li>Reassegurar amor e compromisso</li>
        <li>Ajustar regras para próxima vez se necessário</li>
      </ul>
      
      <h3>Saúde e Segurança</h3>
      
      <h4>🏥 Proteção Sexual</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Preservativo:</strong> Para TODA penetração com terceiros (regra universal)</li>
        <li><strong>Oral:</strong> Risco existe; dental dams disponíveis mas pouco usados na prática</li>
        <li><strong>Testes regulares:</strong> A cada 3-6 meses se atividade regular</li>
        <li><strong>PrEP:</strong> Considerar para prevenção de HIV em situações de risco elevado</li>
        <li><strong>Comunicar status:</strong> Se houver qualquer IST, informar potenciais parceiros</li>
      </ul>
      
      <h4>🍷 Álcool e Substâncias</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Um ou dois drinks para descontrair - OK</li>
        <li>Embebedar-se - Péssima ideia (consentimento comprometido, performances afetadas, arrependimentos)</li>
        <li>Drogas - Ilegal e perigoso, maioria dos clubes não tolera</li>
      </ul>
      
      <h4>🔒 Privacidade</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Usar primeiros nomes ou pseudónimos</li>
        <li>Não partilhar locais de trabalho ou detalhes identificadores inicialmente</li>
        <li>Perfis em sites podem ser anónimos (sem fotos de rosto, ou fotos privadas)</li>
        <li>Ser discretos em público - nunca assumir que é OK cumprimentar fora do contexto</li>
      </ul>
      
      <h3>Quando NÃO Fazer Swing</h3>
      
      <ul style="text-align: left; padding-left: 20px;">
        <li>❌ Para "salvar" uma relação em crise</li>
        <li>❌ Porque o parceiro pressionou e tu não queres realmente</li>
        <li>❌ Para "testar" a fidelidade do parceiro</li>
        <li>❌ Por curiosidade mórbida sem comunicação prévia</li>
        <li>❌ Se há problemas de confiança por resolver</li>
        <li>❌ Se um dos dois tem tendência para ciúmes destrutivos</li>
        <li>❌ Sob influência de álcool/drogas na decisão</li>
      </ul>
      
      <h3>Histórias de Casais</h3>
      
      <p style="font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin-bottom: 15px;">
      <strong>Caso Positivo:</strong> "Começámos há 5 anos, depois de 8 anos de casamento. A nossa comunicação melhorou 1000%. Sabemos exatamente o que o outro pensa e sente porque TEMOS que falar sobre tudo. A nossa vida sexual entre nós está melhor do que nunca. Não vamos a todas as festas - talvez uma vez por mês - mas é algo que partilhamos só entre nós e que nos une."
      </p>
      
      <p style="font-style: italic; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff6b9d; margin-bottom: 15px;">
      <strong>Caso de Aprendizagem:</strong> "A nossa primeira experiência correu mal. Fomos cedo demais, não tínhamos falado o suficiente, e eu (ele) não esperava sentir o que senti ao vê-la com outro. Parámos durante um ano, fizemos terapia de casal, trabalhámos a nossa comunicação. Hoje praticamos novamente, mas muito diferente - com regras claras, safe words, e debriefing sempre. Aprendi que o erro não foi tentar swing - foi fazê-lo sem preparação."
      </p>
      
      <h3>Recursos Adicionais</h3>
      
      <h4>📚 Livros:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>"The Ethical Slut" - Dossie Easton (sobre não-monogamia em geral)</li>
        <li>"Swingland" - Daniel Stern (jornalista que explorou o mundo swing)</li>
      </ul>
      
      <h4>🎧 Podcasts:</h4>
      <ul style="text-align: left; padding-left: 20px;">
        <li>We Gotta Thing - Casal americano experiente</li>
        <li>Swinger Diaries</li>
      </ul>
      
      <p><strong>Mensagem final:</strong> O swing pode ser uma adição incrível à vida de um casal - MAS apenas se ambos o desejarem genuinamente, se fizerem o trabalho de preparação e comunicação, e se mantiverem a relação como prioridade número 1. Feito bem, fortalece laços. Feito mal, pode destruí-los. Façam a vossa pesquisa, falem honestamente e, acima de tudo, divirtam-se juntos!</p>
      </div>
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
