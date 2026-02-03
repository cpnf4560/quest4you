# 📋 REFORMULAÇÃO DOS QUESTIONÁRIOS QUEST4YOU
## Documento de Comparação ANTES/DEPOIS

**Data:** Junho 2025  
**Versão:** 1.0  
**Objetivo:** Tornar os questionários mais específicos, atrativos, variados e menos repetitivos

---

## 📊 RESUMO EXECUTIVO

### Problemas Identificados nos Questionários Atuais:
1. **Repetitividade extrema** - Todas as questões seguem o mesmo padrão: "A ideia de X excita-me/atrai-me"
2. **Falta de cenários concretos** - Questões muito genéricas e abstratas
3. **Monotonia de formato** - Sem variedade na forma como as perguntas são colocadas
4. **Alguns desequilíbrios temáticos** - Ex: orientation.json com 11+ questões focadas apenas em trans

### Inspiração do Quest4Couple:
- ✅ Questões específicas e concretas (cenários reais)
- ✅ Variedade de formatos (ações, situações, preferências)
- ✅ Progressão de intensidade clara
- ✅ Linguagem mais envolvente e menos clínica

---

## 🔄 COMPARAÇÃO DETALHADA POR QUESTIONÁRIO

---

# 1️⃣ VANILLA.JSON - "Vanilla ou Kink?"

**Ícone:** 🌱 | **Cor:** #4CAF50

**Objetivo:** Determinar se a pessoa tem tendências mais vanilla (tradicional) ou kink (alternativo)

## ANTES (50 questões repetitivas):

```
1. A intimidade tradicional (beijos, carícias, posições clássicas) satisfaz-me completamente
2. Gosto de explorar novas experiências na intimidade
3. Prefiro manter as coisas simples e previsíveis
4. A ideia de experimentar algo "diferente" excita-me
5. Sinto-me confortável com uma vida sexual "convencional"
6. Tenho curiosidade sobre práticas menos convencionais
7. A rotina na intimidade dá-me segurança
8. Gosto de surpreender e ser surpreendido/a
9. Prefiro focar-me na conexão emocional durante a intimidade
10. A ideia de usar acessórios ou brinquedos interessa-me
... (continua com o mesmo padrão genérico)
```

## DEPOIS (50 questões específicas e variadas):

```json
{
  "questions": [
    // BLOCO 1: PREFERÊNCIAS BÁSICAS (1-10)
    {"id": 1, "text": "Um beijo longo e apaixonado satisfaz-me mais do que qualquer técnica elaborada", "invert": true},
    {"id": 2, "text": "Prefiro fazer amor com as luzes apagadas e debaixo dos lençóis", "invert": true},
    {"id": 3, "text": "A posição missionário, com contacto visual, é das minhas favoritas", "invert": true},
    {"id": 4, "text": "Acho que brinquedos e acessórios só complicam as coisas", "invert": true},
    {"id": 5, "text": "O sexo mais simples e carinhoso é o melhor para mim", "invert": true},
    {"id": 6, "text": "Gosto de experimentar posições novas e desafiantes", "invert": false},
    {"id": 7, "text": "Uma noite de sexo selvagem atrai-me mais do que uma noite romântica", "invert": false},
    {"id": 8, "text": "Tenho uma caixa de brinquedos ou acessórios eróticos em casa", "invert": false},
    {"id": 9, "text": "Já pesquisei online sobre práticas sexuais alternativas", "invert": false},
    {"id": 10, "text": "Acho que 'sexo normal' é suficiente - não preciso de mais nada", "invert": true},

    // BLOCO 2: CENÁRIOS E SITUAÇÕES (11-20)
    {"id": 11, "text": "Fazer amor à luz de velas, com música suave, é o meu cenário ideal", "invert": true},
    {"id": 12, "text": "A ideia de sexo rápido e intenso contra uma parede excita-me", "invert": false},
    {"id": 13, "text": "Prefiro que a intimidade seja sempre no quarto", "invert": true},
    {"id": 14, "text": "Sexo na cozinha, sala ou casa de banho soa divertido", "invert": false},
    {"id": 15, "text": "Um fim de semana num hotel só para nós seria perfeito - sem extras", "invert": true},
    {"id": 16, "text": "Num hotel, gostaria de experimentar coisas que não faço em casa", "invert": false},
    {"id": 17, "text": "A ideia de um encontro às escuras com alguém excita-me", "invert": false},
    {"id": 18, "text": "Prefiro conhecer bem a pessoa antes de qualquer intimidade", "invert": true},
    {"id": 19, "text": "Uma sessão de massagem sensual com óleos interessa-me muito", "invert": false},
    {"id": 20, "text": "O sexo matinal, suave e preguiçoso, é dos meus favoritos", "invert": true},

    // BLOCO 3: INTENSIDADE E RITMO (21-30)
    {"id": 21, "text": "Gosto que a intimidade seja gentil e delicada do início ao fim", "invert": true},
    {"id": 22, "text": "Por vezes apetece-me algo mais intenso e até um pouco agressivo", "invert": false},
    {"id": 23, "text": "Puxar cabelo ou morder levemente não faz o meu estilo", "invert": true},
    {"id": 24, "text": "Uma palmada no rabo (dada ou recebida) pode ser excitante", "invert": false},
    {"id": 25, "text": "Marcas de chupões ou arranhadelas leves fazem parte da diversão", "invert": false},
    {"id": 26, "text": "Prefiro que não fique nenhuma marca física depois", "invert": true},
    {"id": 27, "text": "Sussurrar coisas obscenas ao ouvido excita-me muito", "invert": false},
    {"id": 28, "text": "Prefiro que a comunicação seja mais através de gestos e toques", "invert": true},
    {"id": 29, "text": "Dirty talk (falar sujo) é algo que me atrai", "invert": false},
    {"id": 30, "text": "Gemidos e sons naturais são suficientes - não preciso de palavras", "invert": true},

    // BLOCO 4: CONTROLO E PODER (31-40)
    {"id": 31, "text": "Gosto que a intimidade seja equilibrada, sem ninguém a mandar", "invert": true},
    {"id": 32, "text": "Por vezes apetece-me assumir completamente o controlo", "invert": false},
    {"id": 33, "text": "A ideia de receber ordens durante o sexo não me atrai", "invert": true},
    {"id": 34, "text": "Ser completamente dominado/a por alguém de confiança excita-me", "invert": false},
    {"id": 35, "text": "Algemas, cordas ou vendas são coisas que nunca experimentaria", "invert": true},
    {"id": 36, "text": "Já experimentei ou tenho curiosidade em ser amarrado/a", "invert": false},
    {"id": 37, "text": "A ideia de 'usar' ou 'ser usado/a' (consensualmente) atrai-me", "invert": false},
    {"id": 38, "text": "Prefiro que ambos tenham sempre igual participação", "invert": true},
    {"id": 39, "text": "Role-play onde um manda e outro obedece soa interessante", "invert": false},
    {"id": 40, "text": "Jogos de poder não combinam com intimidade, na minha opinião", "invert": true},

    // BLOCO 5: EXPLORAÇÃO E ABERTURA (41-50)
    {"id": 41, "text": "Se funciona, não preciso de mudar - estou satisfeito/a assim", "invert": true},
    {"id": 42, "text": "Tenho uma bucket list de coisas que quero experimentar", "invert": false},
    {"id": 43, "text": "Já vi pornografia de categorias mais 'alternativas' por curiosidade", "invert": false},
    {"id": 44, "text": "Acho que a maioria dos fetiches são estranhos demais para mim", "invert": true},
    {"id": 45, "text": "Tenho pelo menos um fetiche ou kink que gostaria de explorar", "invert": false},
    {"id": 46, "text": "O sexo convencional é tudo o que preciso para ser feliz", "invert": true},
    {"id": 47, "text": "Gostaria de experimentar algo que nunca fiz antes", "invert": false},
    {"id": 48, "text": "Já li erotica ou vi filmes sobre BDSM com curiosidade", "invert": false},
    {"id": 49, "text": "Considero a minha vida sexual bastante tradicional", "invert": true},
    {"id": 50, "text": "Há um lado mais selvagem em mim que gostaria de explorar", "invert": false}
  ]
}
```

---

# 2️⃣ ORIENTATION.JSON - "Orientação Sexual"

**Ícone:** 🌈 | **Cor:** #9C27B0

**Objetivo:** Explorar o espectro de atração e orientação sexual

## ANTES (50 questões - demasiado focado em trans):

```
1. Sinto atração exclusivamente por pessoas do género oposto ao meu
2. Já senti atração por pessoas do mesmo género
3. Considero-me uma pessoa heterossexual
4. Considero-me uma pessoa homossexual
5. A ideia de estar com alguém do mesmo género não me repugna
6. Já tive fantasias com pessoas do mesmo género
... (11+ questões só sobre atração trans)
25. Sinto atração por pessoas transgénero
26. A ideia de intimidade com uma pessoa transgénero atrai-me
27. Não me importaria se descobrisse que alguém atraente é transgénero
...
```

## DEPOIS (50 questões - mais equilibrado e abrangente):

```json
{
  "questions": [
    // BLOCO 1: ATRAÇÃO PRIMÁRIA (1-10)
    {"id": 1, "text": "A minha atração é exclusivamente por pessoas do género oposto", "invert": true},
    {"id": 2, "text": "Já me senti atraído/a por alguém do mesmo género", "invert": false},
    {"id": 3, "text": "Se a pessoa certa aparecesse, o género não seria um obstáculo", "invert": false},
    {"id": 4, "text": "A minha orientação sexual tem sido sempre clara e definida", "invert": true},
    {"id": 5, "text": "Já questionei a minha orientação sexual em algum momento", "invert": false},
    {"id": 6, "text": "Sinto que a minha atração pode ser fluida dependendo da pessoa", "invert": false},
    {"id": 7, "text": "Só consigo imaginar-me numa relação com o género oposto", "invert": true},
    {"id": 8, "text": "A energia e personalidade atraem-me mais do que o género", "invert": false},
    {"id": 9, "text": "Defino-me claramente como heterossexual ou homossexual", "invert": true},
    {"id": 10, "text": "O espectro da bissexualidade faz sentido para mim", "invert": false},

    // BLOCO 2: FANTASIAS E CURIOSIDADE (11-20)
    {"id": 11, "text": "Nas minhas fantasias, as pessoas são sempre do género que me atrai habitualmente", "invert": true},
    {"id": 12, "text": "Já fantasiei com alguém de um género diferente do habitual", "invert": false},
    {"id": 13, "text": "Conteúdo erótico com pessoas do mesmo género desperta-me curiosidade", "invert": false},
    {"id": 14, "text": "A ideia de um encontro com alguém do mesmo género excita-me", "invert": false},
    {"id": 15, "text": "Nunca tive qualquer curiosidade sobre experiências homossexuais", "invert": true},
    {"id": 16, "text": "Um beijo com alguém do mesmo género seria uma experiência interessante", "invert": false},
    {"id": 17, "text": "A ideia de um threesome com pessoas de géneros diferentes atrai-me", "invert": false},
    {"id": 18, "text": "As minhas fantasias são sempre estritamente heterossexuais", "invert": true},
    {"id": 19, "text": "Sinto curiosidade sobre o corpo de pessoas do mesmo género", "invert": false},
    {"id": 20, "text": "Dar prazer a alguém do mesmo género seria uma experiência nova interessante", "invert": false},

    // BLOCO 3: EXPERIÊNCIAS E ABERTURA (21-30)
    {"id": 21, "text": "Já tive algum tipo de experiência íntima com o mesmo género", "invert": false},
    {"id": 22, "text": "Estaria aberto/a a experimentar algo com o mesmo género", "invert": false},
    {"id": 23, "text": "Numa festa, se alguém atraente do mesmo género se aproximasse, eu exploraria", "invert": false},
    {"id": 24, "text": "O meu círculo de possíveis parceiros está limitado a um género", "invert": true},
    {"id": 25, "text": "Se surgisse a oportunidade certa, experimentaria algo novo", "invert": false},
    {"id": 26, "text": "A minha orientação sexual é algo que ainda estou a descobrir", "invert": false},
    {"id": 27, "text": "Tenho amigos/as do mesmo género que já achei atraentes", "invert": false},
    {"id": 28, "text": "A ideia de namorar alguém do mesmo género não me passa pela cabeça", "invert": true},
    {"id": 29, "text": "Já senti uma ligação romântica ou sexual inesperada", "invert": false},
    {"id": 30, "text": "A minha atração raramente me surpreende - sei exatamente o que gosto", "invert": true},

    // BLOCO 4: EXPRESSÃO DE GÉNERO E APRESENTAÇÃO (31-40)
    {"id": 31, "text": "Atraem-me pessoas com apresentação mais andrógina", "invert": false},
    {"id": 32, "text": "A masculinidade tradicional é o que mais me atrai", "invert": true},
    {"id": 33, "text": "A feminilidade tradicional é o que mais me atrai", "invert": true},
    {"id": 34, "text": "Pessoas que quebram estereótipos de género atraem-me", "invert": false},
    {"id": 35, "text": "A forma como alguém se apresenta é mais importante que o seu género biológico", "invert": false},
    {"id": 36, "text": "Atraem-me mulheres masculinas ou homens femininos", "invert": false},
    {"id": 37, "text": "Só me sinto atraído/a por expressões de género tradicionais", "invert": true},
    {"id": 38, "text": "A confiança e atitude atraem-me independentemente do género", "invert": false},
    {"id": 39, "text": "Pessoas não-binárias ou de género fluido despertam-me curiosidade", "invert": false},
    {"id": 40, "text": "A diversidade de género e expressão é algo que aprecio", "invert": false},

    // BLOCO 5: IDENTIDADE E ACEITAÇÃO (41-50)
    {"id": 41, "text": "Sinto-me 100% confortável com a minha orientação sexual atual", "invert": true},
    {"id": 42, "text": "Há partes da minha sexualidade que ainda quero explorar", "invert": false},
    {"id": 43, "text": "Rótulos como 'hetero', 'gay' ou 'bi' são limitadores", "invert": false},
    {"id": 44, "text": "Sei exatamente onde me posiciono no espectro da sexualidade", "invert": true},
    {"id": 45, "text": "A minha atração já me levou a questionar os meus próprios limites", "invert": false},
    {"id": 46, "text": "Identifico-me com o termo 'queer' ou 'fluido'", "invert": false},
    {"id": 47, "text": "A minha orientação tem-se mantido sempre igual ao longo da vida", "invert": true},
    {"id": 48, "text": "Acredito que a sexualidade pode evoluir e mudar", "invert": false},
    {"id": 49, "text": "Já senti atração por alguém que me surpreendeu", "invert": false},
    {"id": 50, "text": "Considero-me uma pessoa sexualmente aberta a novas descobertas", "invert": false}
  ]
}
```

---

# 3️⃣ BDSM.JSON - "BDSM & Dinâmicas de Poder"

**Ícone:** 🎭 | **Cor:** #7B1FA2

**Objetivo:** Determinar posição no espectro Dominante/Submisso

## ANTES (50 questões):

```
1. Gosto de assumir o controlo durante encontros íntimos
2. Excita-me a ideia de seguir instruções de alguém
3. Tenho interesse em usar ou que usem vendas nos olhos
4. A ideia de imobilização consensual atrai-me
5. Prefiro decidir o ritmo e as posições
6. Gosto da sensação de me render a alguém de confiança
... (padrão repetitivo)
```

## DEPOIS (50 questões - cenários concretos):

```json
{
  "questions": [
    // BLOCO 1: CONTROLO E LIDERANÇA (1-10)
    {"id": 1, "text": "Quando estou na cama, gosto de ser eu a decidir o que acontece a seguir", "invert": true},
    {"id": 2, "text": "Dizer 'ajoelha-te' e ver alguém obedecer excita-me profundamente", "invert": true},
    {"id": 3, "text": "Prefiro que me digam exatamente o que fazer e como fazer", "invert": false},
    {"id": 4, "text": "Dar ordens diretas durante o sexo ('vira-te', 'mais devagar') é natural para mim", "invert": true},
    {"id": 5, "text": "Ouvir 'és meu/minha' de alguém dominante faz-me arrepiar", "invert": false},
    {"id": 6, "text": "Gosto de conduzir a cabeça de alguém durante o sexo oral", "invert": true},
    {"id": 7, "text": "A ideia de pedir permissão para ter um orgasmo excita-me", "invert": false},
    {"id": 8, "text": "Controlar quando e como o/a meu/minha parceiro/a pode gozar atrai-me", "invert": true},
    {"id": 9, "text": "Seguir um conjunto de regras sexuais definidas por outra pessoa seria excitante", "invert": false},
    {"id": 10, "text": "Estabelecer regras que o/a outro/a tem de seguir faz parte do meu prazer", "invert": true},

    // BLOCO 2: SUBMISSÃO E ENTREGA (11-20)
    {"id": 11, "text": "Ser empurrado/a contra a parede e beijado/a intensamente é um sonho", "invert": false},
    {"id": 12, "text": "A ideia de ser 'usado/a' para o prazer de alguém (consensualmente) excita-me", "invert": false},
    {"id": 13, "text": "Gostaria de me ajoelhar aos pés de alguém que admiro sexualmente", "invert": false},
    {"id": 14, "text": "Ser tratado/a como 'propriedade' de alguém durante o sexo atrai-me", "invert": false},
    {"id": 15, "text": "A ideia de servir sexualmente alguém (banho, massagem, oral) excita-me", "invert": false},
    {"id": 16, "text": "Gostaria de ter alguém a servir-me e a antecipar os meus desejos", "invert": true},
    {"id": 17, "text": "Chamar alguém de 'senhor/a', 'mestre/a' ou 'dono/a' seria excitante", "invert": false},
    {"id": 18, "text": "Ouvir alguém chamar-me assim dava-me uma sensação de poder", "invert": true},
    {"id": 19, "text": "Aguardar nu/a por instruções seria uma forma deliciosa de antecipação", "invert": false},
    {"id": 20, "text": "Ter alguém a aguardar nu/a pelas minhas instruções excita-me", "invert": true},

    // BLOCO 3: RESTRIÇÃO E BONDAGE (21-30)
    {"id": 21, "text": "Ter as mãos atadas acima da cabeça enquanto sou beijado/a intensamente", "invert": false},
    {"id": 22, "text": "Atar as mãos de alguém e tê-lo/a à minha mercê é uma fantasia", "invert": true},
    {"id": 23, "text": "A ideia de estar completamente imobilizado/a, vendado/a e à espera excita-me", "invert": false},
    {"id": 24, "text": "Ter alguém amarrado/a e completamente sob o meu controlo é excitante", "invert": true},
    {"id": 25, "text": "Uma coleira (mesmo que discreta) seria algo que usaria com prazer", "invert": false},
    {"id": 26, "text": "Colocar uma coleira em alguém de quem cuido seria um ato poderoso", "invert": true},
    {"id": 27, "text": "Cordas japonesas (shibari) à volta do meu corpo seriam uma forma de arte", "invert": false},
    {"id": 28, "text": "Aprender a atar alguém de forma estética e erótica interessa-me", "invert": true},
    {"id": 29, "text": "A vulnerabilidade de estar restringido/a é algo que me atrai", "invert": false},
    {"id": 30, "text": "Ter alguém vulnerável e a confiar em mim é uma responsabilidade excitante", "invert": true},

    // BLOCO 4: SENSAÇÕES E IMPACTO (31-40)
    {"id": 31, "text": "Levar uma palmada no rabo durante o sexo deixa-me mais excitado/a", "invert": false},
    {"id": 32, "text": "Dar palmadas e ver a marca da minha mão é algo que aprecio", "invert": true},
    {"id": 33, "text": "A ideia de ser chicoteado/a (levemente) faz parte das minhas fantasias", "invert": false},
    {"id": 34, "text": "Usar um chicote, flogger ou paddle em alguém interessa-me", "invert": true},
    {"id": 35, "text": "Mordidas e chupões que deixam marca excitam-me", "invert": false},
    {"id": 36, "text": "Gosto de marcar o corpo de alguém com a minha boca", "invert": true},
    {"id": 37, "text": "Gelo ou cera quente a percorrer o meu corpo seriam sensações intensas", "invert": false},
    {"id": 38, "text": "Provocar sensações intensas com temperatura no corpo de alguém atrai-me", "invert": true},
    {"id": 39, "text": "A dor controlada amplifica o meu prazer", "invert": false},
    {"id": 40, "text": "Saber exatamente quanta dor/prazer dar a alguém excita-me", "invert": true},

    // BLOCO 5: DINÂMICAS E AFTERCARE (41-50)
    {"id": 41, "text": "Após sessões intensas, preciso de muito carinho e cuidado", "invert": false},
    {"id": 42, "text": "Cuidar de alguém após uma sessão intensa é tão importante quanto a sessão", "invert": true},
    {"id": 43, "text": "Gosto de alternar entre dominar e submeter-me (sou switch)", "invert": false},
    {"id": 44, "text": "Tenho clareza sobre qual é o meu papel preferido (Dom ou Sub)", "invert": true},
    {"id": 45, "text": "A negociação prévia de limites faz-me sentir seguro/a", "invert": false},
    {"id": 46, "text": "Defino regras e limites claros antes de qualquer sessão", "invert": true},
    {"id": 47, "text": "Safe words são fundamentais - dão-me liberdade para explorar", "invert": false},
    {"id": 48, "text": "Respeitar safe words é a minha prioridade absoluta", "invert": true},
    {"id": 49, "text": "O poder que entrego a alguém é um presente que dou voluntariamente", "invert": false},
    {"id": 50, "text": "O poder que recebo de alguém é um presente que valorizo profundamente", "invert": true}
  ]
}
```

---

# 4️⃣ EXHIBITIONISM.JSON - "Exibicionismo & Admiração"

**Ícone:** 📸 | **Cor:** #FFC107

**Objetivo:** Medir tendência exibicionista vs. voyeurística

## ANTES (50 questões):

```
1. Gosto de me sentir desejado/a e admirado/a
2. Excita-me a ideia de me exibir para alguém
3. Gosto de apreciar e admirar o corpo de outra pessoa
4. A ideia de tirar fotos sensuais atrai-me
5. Sinto-me confortável com o meu corpo nu
... (padrão genérico continua)
```

## DEPOIS (50 questões - cenários específicos):

```json
{
  "questions": [
    // BLOCO 1: CONFORTO COM NUDEZ (1-10)
    {"id": 1, "text": "Ando nu/a em casa sempre que posso e sinto-me completamente à vontade", "invert": false},
    {"id": 2, "text": "Numa praia de nudismo, sentir-me-ia confortável a tirar tudo", "invert": false},
    {"id": 3, "text": "O meu corpo nu é algo que gosto de mostrar a quem me atrai", "invert": false},
    {"id": 4, "text": "Tenho um ou mais espelhos estrategicamente colocados para me ver durante o sexo", "invert": false},
    {"id": 5, "text": "Ver-me ao espelho durante a intimidade aumenta o meu prazer", "invert": false},
    {"id": 6, "text": "Gosto de fazer sexo com as luzes acesas para ver e ser visto/a", "invert": false},
    {"id": 7, "text": "Vestir roupa interior sexy, mesmo que ninguém veja, faz-me sentir poderoso/a", "invert": false},
    {"id": 8, "text": "Numa festa, gosto de usar roupa que mostre o meu corpo", "invert": false},
    {"id": 9, "text": "A sensação de estar quase nu/a em público (praia, piscina) excita-me", "invert": false},
    {"id": 10, "text": "Já tive vontade de me despir para alguém só pela reação que iria provocar", "invert": false},

    // BLOCO 2: FOTOS E VÍDEOS (11-20)
    {"id": 11, "text": "Já tirei ou gostaria de tirar fotos sensuais/nudes de mim", "invert": false},
    {"id": 12, "text": "Enviar nudes a alguém de confiança excita-me", "invert": false},
    {"id": 13, "text": "A ideia de fazer uma sessão fotográfica sensual profissional atrai-me", "invert": false},
    {"id": 14, "text": "Gravar-me durante o prazer pessoal é algo que já fiz ou faria", "invert": false},
    {"id": 15, "text": "Fazer um vídeo íntimo com alguém (só para nós) seria excitante", "invert": false},
    {"id": 16, "text": "Ver-me numa gravação durante o sexo seria estranho, não excitante", "invert": true},
    {"id": 17, "text": "A ideia de fazer videochamadas sensuais atrai-me muito", "invert": false},
    {"id": 18, "text": "Fazer strip-tease por videochamada seria divertido e excitante", "invert": false},
    {"id": 19, "text": "Gostaria de ter fotos artísticas do meu corpo nu", "invert": false},
    {"id": 20, "text": "Ser fotografado/a durante o ato sexual (faces escondidas) excita-me", "invert": false},

    // BLOCO 3: SER OBSERVADO/A (21-30)
    {"id": 21, "text": "A ideia de fazer sexo com alguém a ver (com consentimento) excita-me", "invert": false},
    {"id": 22, "text": "Num clube ou festa, não me importaria que vissem a minha intimidade", "invert": false},
    {"id": 23, "text": "Saber que alguém está a observar-me de longe com desejo excita-me", "invert": false},
    {"id": 24, "text": "A ideia de estar numa janela de hotel, à noite, visível para quem passe", "invert": false},
    {"id": 25, "text": "Fazer algo sensual num carro, onde alguém pudesse ver, é excitante", "invert": false},
    {"id": 26, "text": "Se alguém me apanhasse a mudar de roupa e ficasse a olhar, seria excitante", "invert": false},
    {"id": 27, "text": "A ideia de fazer sexo ao ar livre, com risco de ser visto/a, atrai-me", "invert": false},
    {"id": 28, "text": "Num vestiário ou balneário, não me importo que vejam o meu corpo", "invert": false},
    {"id": 29, "text": "Ser o centro das atenções sexuais de várias pessoas é uma fantasia", "invert": false},
    {"id": 30, "text": "A ideia de um gang bang (eu como foco) é algo que me atrai", "invert": false},

    // BLOCO 4: VOYEURISMO E OBSERVAR (31-40)
    {"id": 31, "text": "Ver outras pessoas em momentos íntimos (com consentimento) excita-me", "invert": false},
    {"id": 32, "text": "A ideia de observar um casal a fazer sexo atrai-me muito", "invert": false},
    {"id": 33, "text": "Num clube de swing, gostaria de observar antes de participar", "invert": false},
    {"id": 34, "text": "Ver alguém a masturbar-se (ao vivo ou em vídeo) é muito excitante", "invert": false},
    {"id": 35, "text": "Live cams de pessoas reais interessam-me mais do que pornografia produzida", "invert": false},
    {"id": 36, "text": "A ideia de ver o/a meu/minha parceiro/a com outra pessoa (ao vivo) excita-me", "invert": false},
    {"id": 37, "text": "Estar escondido/a a observar (com consentimento) seria uma experiência intensa", "invert": false},
    {"id": 38, "text": "Ver o prazer genuíno de alguém excita-me mais do que participar", "invert": false},
    {"id": 39, "text": "Gosto de ver pornografia amadora porque parece mais real", "invert": false},
    {"id": 40, "text": "A expressão facial de alguém no momento do orgasmo fascina-me", "invert": false},

    // BLOCO 5: ADMIRAÇÃO E SEDUÇÃO (41-50)
    {"id": 41, "text": "Fazer um strip-tease completo para alguém seria muito prazeroso", "invert": false},
    {"id": 42, "text": "Receber um strip-tease privado é uma das minhas fantasias", "invert": false},
    {"id": 43, "text": "Dançar sensualmente para alguém e ver a reação excita-me", "invert": false},
    {"id": 44, "text": "A ideia de pole dance como sedução atrai-me (fazer ou ver)", "invert": false},
    {"id": 45, "text": "Criar tensão sexual através de provocações visuais é uma arte que aprecio", "invert": false},
    {"id": 46, "text": "Gosto de me arranjar especialmente para seduzir visualmente", "invert": false},
    {"id": 47, "text": "A provocação visual (não tocar, só ver) pode ser mais excitante que o ato", "invert": false},
    {"id": 48, "text": "Ver alguém a despir-se lentamente é extremamente erótico para mim", "invert": false},
    {"id": 49, "text": "Prefiro ser quem observa do que ser observado/a", "invert": true},
    {"id": 50, "text": "O visual é o sentido mais importante na minha sexualidade", "invert": false}
  ]
}
```

---

# 5️⃣ FANTASIES.JSON - "Fantasias Secretas"

**Ícone:** 🔮 | **Cor:** #E91E63

**Objetivo:** Explorar o mundo das fantasias íntimas

## ANTES (50 questões - genéricas):

```
1. Tenho fantasias que nunca partilhei com ninguém
2. A ideia de encontros com desconhecidos (consensuais e seguros) excita-me
3. Fantasio com cenários de sedução ou conquista
4. Tenho curiosidade em explorar fantasias com mais de uma pessoa
... (padrão "A ideia de X" continua)
```

## DEPOIS (50 questões - fantasias específicas e concretas):

```json
{
  "questions": [
    // BLOCO 1: FANTASIAS ROMÂNTICAS E SENSUAIS (1-10)
    {"id": 1, "text": "Fantasio com uma noite de amor numa suite de hotel de luxo com champagne", "invert": false},
    {"id": 2, "text": "A ideia de ser seduzido/a lentamente durante um jantar a dois excita-me", "invert": false},
    {"id": 3, "text": "Fazer amor numa banheira de hidromassagem com pétalas de rosa", "invert": false},
    {"id": 4, "text": "Uma noite de massagem sensual completa, que acabe em mais, é uma fantasia", "invert": false},
    {"id": 5, "text": "Fantasio com um encontro em que tudo é perfeito: roupa, ambiente, música", "invert": false},
    {"id": 6, "text": "A ideia de dançar lentamente com alguém e acabar a fazer amor atrai-me", "invert": false},
    {"id": 7, "text": "Uma escapadinha surpresa a um destino romântico para dois", "invert": false},
    {"id": 8, "text": "Fantasio com acordar ao lado de alguém e ter sexo matinal preguiçoso", "invert": false},
    {"id": 9, "text": "Uma noite inteira de prazer sem pressas, explorando cada centímetro do corpo", "invert": false},
    {"id": 10, "text": "A ideia de um reencontro apaixonado com um antigo amor atrai-me", "invert": false},

    // BLOCO 2: FANTASIAS DE AVENTURA E RISCO (11-20)
    {"id": 11, "text": "Fantasio com sexo ao ar livre - praia deserta, floresta, montanha", "invert": false},
    {"id": 12, "text": "A ideia de fazer algo num avião (mile high club) é excitante", "invert": false},
    {"id": 13, "text": "Sexo num provador de roupa, com risco de ser apanhado/a, é uma fantasia", "invert": false},
    {"id": 14, "text": "Fazer amor durante uma tempestade, com trovões e relâmpagos lá fora", "invert": false},
    {"id": 15, "text": "A ideia de sexo num elevador (parado entre andares) excita-me", "invert": false},
    {"id": 16, "text": "Fantasio com um encontro secreto num local público (biblioteca, museu)", "invert": false},
    {"id": 17, "text": "Fazer algo intenso numa piscina ou jacuzzi, à noite, às escondidas", "invert": false},
    {"id": 18, "text": "A ideia de sexo num escritório depois de todos saírem atrai-me", "invert": false},
    {"id": 19, "text": "Fantasio com uma escapadinha a um motel temático/love hotel", "invert": false},
    {"id": 20, "text": "Fazer amor numa tenda de campismo, sob as estrelas, é uma fantasia", "invert": false},

    // BLOCO 3: FANTASIAS DE PODER E ROLE-PLAY (21-30)
    {"id": 21, "text": "Fantasio com um cenário de chefe/secretária ou professor/aluna", "invert": false},
    {"id": 22, "text": "A ideia de ser 'sequestrado/a' (consensualmente) para prazer excita-me", "invert": false},
    {"id": 23, "text": "Role-play de polícia/criminoso, com algemas de verdade, atrai-me", "invert": false},
    {"id": 24, "text": "Fantasio com ser um/a estranho/a seduzindo alguém num bar", "invert": false},
    {"id": 25, "text": "A ideia de stripper/cliente com lap dance privada é excitante", "invert": false},
    {"id": 26, "text": "Fantasio com cenários de serva/senhor medieval ou realeza", "invert": false},
    {"id": 27, "text": "Role-play de médico/paciente com 'exame' atrai-me", "invert": false},
    {"id": 28, "text": "A ideia de personal trainer que ultrapassa limites profissionais", "invert": false},
    {"id": 29, "text": "Fantasio com ser uma estrela porno por uma noite", "invert": false},
    {"id": 30, "text": "Role-play onde finjo ser outra pessoa completamente diferente atrai-me", "invert": false},

    // BLOCO 4: FANTASIAS COM MÚLTIPLAS PESSOAS (31-40)
    {"id": 31, "text": "A ideia de um threesome (eu e mais duas pessoas) excita-me", "invert": false},
    {"id": 32, "text": "Fantasio com ser o centro das atenções de várias pessoas ao mesmo tempo", "invert": false},
    {"id": 33, "text": "A ideia de uma orgia, onde toda a gente está com toda a gente, atrai-me", "invert": false},
    {"id": 34, "text": "Fantasio com ver o/a meu/minha parceiro/a com outra pessoa", "invert": false},
    {"id": 35, "text": "A ideia de partilhar o/a meu/minha parceiro/a com alguém excita-me", "invert": false},
    {"id": 36, "text": "Fantasio com trocar de parceiros com outro casal", "invert": false},
    {"id": 37, "text": "A ideia de estar com gémeos/gémeas é uma fantasia recorrente", "invert": false},
    {"id": 38, "text": "Fantasio com uma noite onde sou 'servido/a' por várias pessoas", "invert": false},
    {"id": 39, "text": "A ideia de uma festa privada onde o sexo é permitido atrai-me", "invert": false},
    {"id": 40, "text": "Fantasio com conhecer alguém online e ter um encontro só para sexo", "invert": false},

    // BLOCO 5: FANTASIAS INTENSAS E TABU (41-50)
    {"id": 41, "text": "Fantasio com algo que considero 'proibido' ou socialmente tabu", "invert": false},
    {"id": 42, "text": "A ideia de ser 'forçado/a' a ter prazer (CNC consensual) excita-me", "invert": false},
    {"id": 43, "text": "Fantasio com situações de humilhação consensual (dar ou receber)", "invert": false},
    {"id": 44, "text": "A ideia de ser tratado/a como objeto sexual (consensualmente) atrai-me", "invert": false},
    {"id": 45, "text": "Fantasio com sessões intensas de BDSM que me levem ao limite", "invert": false},
    {"id": 46, "text": "A ideia de ter alguém completamente sob o meu controlo excita-me", "invert": false},
    {"id": 47, "text": "Fantasio com prazer em locais/situações inapropriadas", "invert": false},
    {"id": 48, "text": "A ideia de ser pago/a ou pagar por sexo (fantasia, não realidade) excita-me", "invert": false},
    {"id": 49, "text": "Tenho fantasias que nunca contei a ninguém por serem demasiado intensas", "invert": false},
    {"id": 50, "text": "Há uma fantasia específica que gostaria muito de concretizar um dia", "invert": false}
  ]
}
```

---

# 6️⃣ ADVENTURE.JSON - "Aventura Sexual"

**Ícone:** 🎲 | **Cor:** #FF5722

**Objetivo:** Medir abertura a novas experiências

## ANTES (50 questões):

```
1. Gosto de experimentar coisas novas na intimidade
2. Prefiro o que já sei que funciona bem
3. Estou aberto/a a sugestões para experimentar algo diferente
4. A ideia de usar brinquedos ou acessórios interessa-me
5. Gosto de variar posições e locais
... (padrão genérico)
```

## DEPOIS (50 questões - experiências concretas):

```json
{
  "questions": [
    // BLOCO 1: LOCAIS E CENÁRIOS (1-10)
    {"id": 1, "text": "Já fiz ou gostaria de fazer sexo num carro", "invert": false},
    {"id": 2, "text": "A ideia de sexo numa praia ou local natural atrai-me", "invert": false},
    {"id": 3, "text": "Fazer algo no sofá, cozinha ou casa de banho soa mais excitante que na cama", "invert": false},
    {"id": 4, "text": "Gostaria de experimentar sexo durante uma viagem (comboio, avião, barco)", "invert": false},
    {"id": 5, "text": "A ideia de alugar um quarto de hotel só para ter sexo noutro ambiente", "invert": false},
    {"id": 6, "text": "Sexo ao ar livre (jardim privado, varanda, terraço) é algo que me atrai", "invert": false},
    {"id": 7, "text": "Já experimentei ou queria experimentar numa piscina ou jacuzzi", "invert": false},
    {"id": 8, "text": "A ideia de fazer algo durante uma festa (num quarto vazio) excita-me", "invert": false},
    {"id": 9, "text": "Gostaria de ter sexo num local com vista panorâmica espetacular", "invert": false},
    {"id": 10, "text": "Experimentar num local onde haja risco (mínimo) de ser apanhado/a", "invert": false},

    // BLOCO 2: BRINQUEDOS E ACESSÓRIOS (11-20)
    {"id": 11, "text": "Já usei ou queria usar vibradores durante o sexo com alguém", "invert": false},
    {"id": 12, "text": "A ideia de um vibrador controlado por app em público intriga-me", "invert": false},
    {"id": 13, "text": "Gostaria de experimentar anéis vibratórios ou outros acessórios para casais", "invert": false},
    {"id": 14, "text": "Dildos e outros brinquedos de penetração são algo que me interessa", "invert": false},
    {"id": 15, "text": "A ideia de usar plugs anais (para mim ou parceiro/a) atrai-me", "invert": false},
    {"id": 16, "text": "Gostaria de experimentar brinquedos que nunca usei antes", "invert": false},
    {"id": 17, "text": "Lubrificantes com sabores, aquecimento ou formigueiro interessam-me", "invert": false},
    {"id": 18, "text": "A ideia de usar uma máquina de sexo (sex machine) intriga-me", "invert": false},
    {"id": 19, "text": "Gostaria de visitar uma sex shop (física ou online) para explorar novidades", "invert": false},
    {"id": 20, "text": "Tenho curiosidade sobre brinquedos que estimulam múltiplas zonas", "invert": false},

    // BLOCO 3: TÉCNICAS E PRÁTICAS (21-30)
    {"id": 21, "text": "Gostaria de experimentar novas posições que vi ou li sobre", "invert": false},
    {"id": 22, "text": "A ideia de tantric sex (sexo tântrico) com foco em prolongar o prazer atrai-me", "invert": false},
    {"id": 23, "text": "Edging (chegar perto do orgasmo e parar várias vezes) interessa-me", "invert": false},
    {"id": 24, "text": "A ideia de orgasmo arruinado ou negado (dado ou recebido) intriga-me", "invert": false},
    {"id": 25, "text": "Experimentar o ponto G ou próstata de forma mais intencional", "invert": false},
    {"id": 26, "text": "A ideia de 69 ou outras posições de prazer mútuo simultâneo", "invert": false},
    {"id": 27, "text": "Gostaria de aprender e praticar técnicas de massagem erótica", "invert": false},
    {"id": 28, "text": "A ideia de sexo completamente silencioso (só gestos e toques)", "invert": false},
    {"id": 29, "text": "Experimentar sensory deprivation (privar sentidos para intensificar outros)", "invert": false},
    {"id": 30, "text": "A ideia de maratona de sexo (várias horas ou todo o dia) atrai-me", "invert": false},

    // BLOCO 4: JOGOS E DESAFIOS (31-40)
    {"id": 31, "text": "Strip poker ou outros jogos que acabam com alguém nu atraem-me", "invert": false},
    {"id": 32, "text": "A ideia de usar dados eróticos ou cartas de desafios", "invert": false},
    {"id": 33, "text": "Jogos de 'verdade ou desafio' versão adulta são algo que me interessa", "invert": false},
    {"id": 34, "text": "A ideia de uma 'bucket list' sexual a cumprir com alguém", "invert": false},
    {"id": 35, "text": "Desafios como 'não podes gozar até eu dizer' excitam-me", "invert": false},
    {"id": 36, "text": "A ideia de sexo cronometrado (quanto tempo aguentas?) é divertida", "invert": false},
    {"id": 37, "text": "Gostaria de fazer um desafio de 30 dias de intimidade diária", "invert": false},
    {"id": 38, "text": "A ideia de surpreender alguém com algo novo, sem aviso, atrai-me", "invert": false},
    {"id": 39, "text": "Manter um 'diário de experiências' e ir marcando o que já fizemos", "invert": false},
    {"id": 40, "text": "A ideia de 'noite de fantasia' onde tudo vale (dentro dos limites) excita-me", "invert": false},

    // BLOCO 5: NOVIDADES E ABERTURA (41-50)
    {"id": 41, "text": "Se o/a meu/minha parceiro/a sugerisse algo novo, eu tentaria pelo menos uma vez", "invert": false},
    {"id": 42, "text": "Leio ou vejo conteúdo sobre sexualidade para aprender coisas novas", "invert": false},
    {"id": 43, "text": "A ideia de um workshop ou curso sobre técnicas sexuais interessa-me", "invert": false},
    {"id": 44, "text": "Gostaria de experimentar algo que nunca fiz antes nos próximos 6 meses", "invert": false},
    {"id": 45, "text": "A rotina sexual não é necessariamente má, mas gosto de a quebrar regularmente", "invert": false},
    {"id": 46, "text": "Tenho uma lista mental de coisas que ainda quero experimentar", "invert": false},
    {"id": 47, "text": "A ideia de experimentar práticas de outras culturas (kama sutra, etc.) atrai-me", "invert": false},
    {"id": 48, "text": "Estou aberto/a a experimentar quase tudo pelo menos uma vez", "invert": false},
    {"id": 49, "text": "Prefiro uma vida sexual variada a uma vida sexual previsível", "invert": false},
    {"id": 50, "text": "A curiosidade sexual é uma característica minha que valorizo", "invert": false}
  ]
}
```

---

# 7️⃣ SWING.JSON - "Swing & Poliamor"

**Ícone:** 👥 | **Cor:** #FF9800

**Objetivo:** Explorar interesse em não-monogamia consensual

## ANTES (50 questões):

```
1. A ideia de explorar a sexualidade com mais pessoas além do meu parceiro/a atrai-me
2. Sinto ciúmes facilmente quando penso no/a meu/minha parceiro/a com outra pessoa
3. A comunicação aberta sobre desejos é fundamental numa relação
4. Considero-me uma pessoa de mente aberta sexualmente
... (padrão continua)
```

## DEPOIS (50 questões - situações concretas):

```json
{
  "questions": [
    // BLOCO 1: ABERTURA INICIAL (1-10)
    {"id": 1, "text": "Se o/a meu/minha parceiro/a me dissesse que fantasia com outra pessoa, eu reagiria bem", "invert": false},
    {"id": 2, "text": "A ideia de o/a meu/minha parceiro/a ter prazer com outra pessoa excita-me", "invert": false},
    {"id": 3, "text": "Ciúmes sexuais são algo que sinto intensamente", "invert": true},
    {"id": 4, "text": "Consigo separar sexo de amor - são coisas diferentes para mim", "invert": false},
    {"id": 5, "text": "Uma relação monogâmica exclusiva é a única que me faria feliz", "invert": true},
    {"id": 6, "text": "A ideia de 'exclusividade para sempre' parece-me limitadora", "invert": false},
    {"id": 7, "text": "Se pudesse, teria uma relação aberta com regras claras", "invert": false},
    {"id": 8, "text": "Considero-me possessivo/a em relações - não gosto de partilhar", "invert": true},
    {"id": 9, "text": "A ideia de compersão (alegria pelo prazer do/a parceiro/a com outros) faz sentido para mim", "invert": false},
    {"id": 10, "text": "Fidelidade sexual é um dos meus valores mais importantes", "invert": true},

    // BLOCO 2: EXPERIÊNCIAS A DOIS COM OUTROS (11-20)
    {"id": 11, "text": "A ideia de um threesome com o/a meu/minha parceiro/a e mais uma pessoa", "invert": false},
    {"id": 12, "text": "Gostaria de ver o/a meu/minha parceiro/a com outra pessoa enquanto observo", "invert": false},
    {"id": 13, "text": "A ideia de ser observado/a pelo/a meu/minha parceiro/a enquanto estou com alguém", "invert": false},
    {"id": 14, "text": "Trocar de parceiros com outro casal amigo seria uma experiência interessante", "invert": false},
    {"id": 15, "text": "A ideia de ir a uma festa/clube onde o sexo entre casais é permitido", "invert": false},
    {"id": 16, "text": "Gostaria de experimentar 'soft swing' (beijos, toques) sem sexo completo com outros", "invert": false},
    {"id": 17, "text": "A ideia de 'full swap' (troca completa de parceiros) excita-me", "invert": false},
    {"id": 18, "text": "Fazer sexo ao lado de outro casal (sem trocar) seria uma experiência interessante", "invert": false},
    {"id": 19, "text": "A ideia de estar todos juntos numa cama grande, a explorar-nos mutuamente", "invert": false},
    {"id": 20, "text": "Participar numa festa privada com 2-3 casais selecionados atrai-me", "invert": false},

    // BLOCO 3: EXPERIÊNCIAS INDIVIDUAIS (21-30)
    {"id": 21, "text": "A ideia de o/a meu/minha parceiro/a ter um encontro a sós com alguém", "invert": false},
    {"id": 22, "text": "Gostaria de ter liberdade para ter encontros individuais (com conhecimento do/a parceiro/a)", "invert": false},
    {"id": 23, "text": "'Don't ask, don't tell' (não perguntes, não contes) seria uma boa regra para mim", "invert": false},
    {"id": 24, "text": "Prefiro saber todos os detalhes do que o/a meu/minha parceiro/a faz com outros", "invert": false},
    {"id": 25, "text": "A ideia de 'hall pass' (um passe livre ocasional) faria sentido para mim", "invert": false},
    {"id": 26, "text": "Relações paralelas (tipo V) com transparência total seriam possíveis", "invert": false},
    {"id": 27, "text": "A ideia de o/a meu/minha parceiro/a ter um/a namorado/a secundário/a", "invert": false},
    {"id": 28, "text": "Gostaria de poder ter conexões emocionais e sexuais com várias pessoas", "invert": false},
    {"id": 29, "text": "Uma relação com um terceiro fixo (throuple) seria uma possibilidade", "invert": false},
    {"id": 30, "text": "A ideia de anarquia relacional (sem hierarquias) atrai-me", "invert": false},

    // BLOCO 4: CLUBES E EVENTOS (31-40)
    {"id": 31, "text": "Tenho curiosidade sobre clubes de swing e gostaria de visitar um", "invert": false},
    {"id": 32, "text": "A ideia de ir a uma festa fetish/BDSM com a possibilidade de interagir", "invert": false},
    {"id": 33, "text": "Participar num gangbang (como participante ou recetor/a) é uma fantasia", "invert": false},
    {"id": 34, "text": "A ideia de uma 'playroom' privada em casa para encontros soa interessante", "invert": false},
    {"id": 35, "text": "Férias num resort 'lifestyle friendly' ou de nudismo seriam perfeitas", "invert": false},
    {"id": 36, "text": "Conhecer outros casais através de apps específicos (SDC, Feeld) interessa-me", "invert": false},
    {"id": 37, "text": "A ideia de um cruzeiro ou evento para casais liberais atrai-me", "invert": false},
    {"id": 38, "text": "Participar na comunidade swingers/poliamorosa localmente seria interessante", "invert": false},
    {"id": 39, "text": "A ideia de fazer parte de um 'polycule' (rede poliamorosa) faz sentido", "invert": false},
    {"id": 40, "text": "Gostaria de conhecer pessoas que pensam de forma semelhante sobre relações", "invert": false},

    // BLOCO 5: LIMITES E REGRAS (41-50)
    {"id": 41, "text": "Conseguiria ter regras claras e respeitá-las numa relação aberta", "invert": false},
    {"id": 42, "text": "A comunicação honesta sobre outras pessoas é algo que consigo fazer", "invert": false},
    {"id": 43, "text": "Proteção (preservativos) com outras pessoas seria uma regra inegociável", "invert": false},
    {"id": 44, "text": "Veto power (poder de veto sobre parceiros do/a outro/a) seria importante para mim", "invert": false},
    {"id": 45, "text": "Regra 'same room' (tudo acontece no mesmo espaço) dava-me mais conforto", "invert": false},
    {"id": 46, "text": "A ideia de check-ins regulares sobre como nos sentimos é fundamental", "invert": false},
    {"id": 47, "text": "Conseguiria lidar com o facto de não ser o/a único/a na vida sexual do/a parceiro/a", "invert": false},
    {"id": 48, "text": "A segurança emocional do casal principal seria sempre a prioridade", "invert": false},
    {"id": 49, "text": "Hierarquias (parceiro/a primário/a vs secundário/a) fazem sentido para mim", "invert": false},
    {"id": 50, "text": "O estilo de vida não-monogâmico é algo que considero seriamente", "invert": false}
  ]
}
```

---

# 8️⃣ CUCKOLD.JSON - "Voyeurismo & Partilha"

**Ícone:** 👀 | **Cor:** #673ab7

**Objetivo:** Avaliar interesse em dinâmicas de voyeurismo, partilha e cuckolding consensual, determinando qual papel (role) se adequa melhor à pessoa.

**⚠️ NOTA ESPECIAL:** Este questionário tem estrutura especial com `resultType: "role"` e `rolePoints` por questão para determinar o papel do utilizador (Cuckold, Stag, Hotwife, Bull, etc.)

## ANTES (50 questões genéricas):

```
1. A ideia do/a meu/minha parceiro/a com outra pessoa excita-me.
2. Sinto ciúme intenso quando penso no/a meu/minha parceiro/a com outros.
3. Gostaria de ver o/a meu/minha parceiro/a a ter prazer com outra pessoa.
4. A humilhação consensual num contexto sexual excita-me.
5. Gostaria de ser o/a terceiro/a numa relação de casal.
...
```

## DEPOIS (50 questões específicas e envolventes):

### Bloco A: Voyeurismo e Observação (q1-q10)
```
1. Ver o/a meu/minha parceiro/a a beijar outra pessoa num bar excitaria-me.
2. Ficaria devastado/a se descobrisse que o/a meu/minha parceiro/a flirtou com alguém. [invert]
3. Gostaria de assistir ao/à meu/minha parceiro/a a receber prazer sexual de outra pessoa.
4. Se o/a meu/minha parceiro/a me dissesse "ele/ela fez-me sentir coisas que tu não consegues", isso excitaria-me.
5. Excita-me a ideia de ser convidado por um casal para satisfazer um/a deles enquanto o/a outro/a observa.
6. A exclusividade sexual é inegociável para mim - partilha não é uma opção. [invert]
7. Quando alguém olha desejosamente para o/a meu/minha parceiro/a num restaurante, sinto orgulho.
8. Fantasio com ser o homem/mulher que satisfaz pessoas que estão em relacionamentos.
9. Se o/a meu/minha parceiro/a comparasse o meu desempenho sexual com o de um/a amante (desfavoravelmente), isso excitaria-me.
10. A ideia de o/a meu/minha parceiro/a me "emprestar" a outra pessoa para uma noite excita-me.
```

### Bloco B: Preparação e Antecipação (q11-q20)
```
11. Escolher a roupa sexy que o/a meu/minha parceiro/a vai usar para um encontro com outro/a excitaria-me.
12. Se soubesse que o/a meu/minha parceiro/a teve sexo com outra pessoa, sentiria-me traído/a. [invert]
13. Ficar de joelhos enquanto o/a meu/minha parceiro/a está com outro/a excitaria-me profundamente.
14. Sinto atração por pessoas comprometidas e fantasio em ser o/a amante.
15. Se o/a meu/minha parceiro/a tivesse um/a amante regular que encontrasse todas as sextas-feiras, isso excitaria-me.
16. Prefiro que a partilha seja sobre orgulho mútuo, não humilhação - quero celebrar a sexualidade do/a meu/minha parceiro/a.
17. A ideia de o/a meu/minha parceiro/a me negar sexo porque "já foi satisfeito/a" por outro/a excita-me.
18. Já me imaginei a receber uma mensagem de um casal a perguntar se quero juntar-me a eles no quarto.
19. Gostaria de selecionar pessoalmente quem o/a meu/minha parceiro/a vai encontrar - aprovar ou recusar candidatos.
20. A monogamia é o único modelo de relacionamento que me faz sentir seguro/a e realizado/a. [invert]
```

### Bloco C: Dinâmicas de Papel (q21-q30)
```
21. Fantasio em ser "a pessoa quente" que o/a meu/minha parceiro/a apresenta com orgulho aos seus amigos sabendo que tenho amantes.
22. Se o/a meu/minha parceiro/a me colocasse um cinto de castidade e guardasse a chave, isso excitaria-me.
23. Navegar em apps de encontros à procura de casais que queiram um terceiro elemento excita-me.
24. Acredito que partilhar o/a meu/minha parceiro/a com outros poderia fortalecer a nossa intimidade.
25. Ler as mensagens picantes do/a meu/minha parceiro/a com um/a amante excitaria-me muito.
26. Prefiro participar ativamente no ato sexual do que ficar apenas a observar.
27. A antecipação de saber que o/a meu/minha parceiro/a vai sair com outro/a esta noite excita-me mais do que o próprio ato.
28. Imagino-me a dominar sexualmente alguém enquanto o/a parceiro/a dessa pessoa observa.
29. A ideia de "servir" o/a meu/minha parceiro/a e o/a amante dele/a - trazer bebidas, preparar a cama - excita-me.
30. Qualquer forma de não-monogamia causa-me desconforto e ansiedade. [invert]
```

### Bloco D: Interação com Terceiros (q31-q40)
```
31. Saber que sou desejado/a por pessoas comprometidas porque sou "o/a proibido/a" excita-me.
32. Sentir alegria genuína ao ver o/a meu/minha parceiro/a a ter prazer intenso com outro/a - compersão - parece-me natural.
33. Antes de qualquer experiência com terceiros, gostaria de estabelecer regras claras e limites bem definidos.
34. Depois de o/a meu/minha parceiro/a voltar de um encontro, quero "reconquistá-lo/a" sexualmente - reclamar o que é meu.
35. Fantasio em mostrar a um casal que posso satisfazer o/a parceiro/a deles de formas que eles não conseguem.
36. Um encontro com máscaras, sem nomes, totalmente anónimo, excita-me.
37. Quero a liberdade de explorar com outros/as, com a bênção e encorajamento do/a meu/minha parceiro/a.
38. A fantasia de ser "obrigado/a" a ficar no canto do quarto enquanto o/a meu/minha parceiro/a está com outro/a excita-me.
39. Sinto-me à vontade para discutir fantasias de partilha com o/a meu/minha parceiro/a sem medo de julgamento.
40. Imagino-me a dizer ao/à meu/minha parceiro/a "vai lá, diverte-te" enquanto o/a vejo sair para um date.
```

### Bloco E: Preferências e Conexão (q41-q50)
```
41. Prefiro que o/a terceiro/a seja um/a desconhecido/a, não alguém do nosso círculo social.
42. Ficaria satisfeito/a em encenar fantasias de cuckolding com roleplay, sem envolver terceiros reais.
43. Consigo transformar sentimentos de ciúme em excitação sexual intensa.
44. Fantasio em receber uma mensagem de um casal desconhecido que me viu e quer conhecer-me melhor.
45. A ideia de humilhação física comparativa (SPH para homens, body shaming consensual para mulheres) excita-me.
46. Para mim, partilhar o/a meu/minha parceiro/a é uma demonstração de confiança profunda e segurança na relação.
47. Quero ser eu a decidir quando, onde e com quem o/a meu/minha parceiro/a pode ter experiências fora da relação.
48. Gostaria de começar com fantasias verbais partilhadas antes de qualquer experiência real com terceiros.
49. A dinâmica Stag/Hotwife (partilha com orgulho) atrai-me mais do que Cuckold (com humilhação).
50. Vejo estas dinâmicas de partilha como uma forma de exploração sexual avançada que pode criar uma conexão única com o/a meu/minha parceiro/a.
```

---

# 9️⃣ KINKS.JSON - "Fetiches e Kinks"

**Ícone:** 🔥 | **Cor:** #f44336

**Objetivo:** Descobrir interesses em práticas alternativas e fetiches específicos, com sistema de tags por categoria de kink.

**⚠️ NOTA ESPECIAL:** Este questionário tem estrutura especial com `resultType: "tags"` e campos `kink` e `subtype` por questão para categorização detalhada.

## ANTES (50 questões genéricas):

```
1. A ideia de ser amarrado/a durante o sexo excita-me.
2. Gosto de ter controlo total durante o sexo.
3. Sentir dor leve durante o sexo (palmadas, mordidas) excita-me.
4. A ideia de usar vendas nos olhos atrai-me.
5. Gostaria de encenar fantasias ou cenários específicos.
...
```

## DEPOIS (50 questões específicas e envolventes):

### Bloco A: Bondage e Dominação (q1-q10)
```
1. Fantasio em estar completamente imobilizado/a com cordas enquanto o/a meu/minha parceiro/a explora o meu corpo. [bondage/rope]
2. Dizer "de joelhos, agora" ao/à meu/minha parceiro/a e ver obedecer excita-me muito. [dominance/control]
3. O som de uma palmada no rabo e o calor que se segue excitam-me. [impact/light]
4. Ter os olhos vendados, não saber de onde vem o próximo toque, deixa-me mais excitado/a. [sensory/blindfold]
5. Interpretar um/a desconhecido/a que seduz o/a meu/minha parceiro/a num bar de hotel excita-me. [roleplay/scenarios]
6. A ideia de ter sexo com a janela aberta, sabendo que alguém pode ver, excita-me. [exhibitionism/watched]
7. Quando me dizem "faz o que te mando", sinto uma onda de excitação. [submission/yielding]
8. O cheiro e textura de couro ou latex durante o sexo excitam-me muito. [fetish/materials]
9. Adoro ser levado/a ao limite do orgasmo várias vezes antes de finalmente ter permissão para gozar. [edging/prolonging]
10. Ver o/a meu/minha parceiro/a a masturbar-se sem saber que estou a observar excita-me. [voyeurism/partner]
```

### Bloco B: Intensidade Sensorial (q11-q20)
```
11. O clique das algemas a fechar nos meus pulsos faz-me arrepiar de antecipação. [bondage/cuffs]
12. Decidir exatamente como, quando e onde o/a meu/minha parceiro/a vai ter prazer dá-me imenso prazer. [dominance/orders]
13. A ideia de o/a meu/minha parceiro/a usar um paddle ou flogger no meu corpo excita-me. [impact/implements]
14. Sentir gotas de cera quente a cair no meu peito/barriga durante o sexo seria intenso. [sensory/temperature]
15. A fantasia de professor/a e aluno/a com castigos "educativos" excita-me. [roleplay/authority]
16. Fazer sexo rápido num provador de roupa, com medo de ser apanhado/a, excita-me imenso. [exhibitionism/public]
17. Usar uma coleira quando estou a sós com o/a meu/minha parceiro/a faria-me sentir submisso/a e excitado/a. [submission/collar]
18. Tenho uma atração inexplicável por pés bem cuidados - cheirá-los, beijá-los, massajá-los. [fetish/body_parts]
19. A ideia de o/a meu/minha parceiro/a me dizer "ainda não podes gozar" repetidamente até eu implorar excita-me. [edging/denial]
20. Assistir a um casal real a ter sexo ao vivo numa festa privada excitaria-me muito. [voyeurism/performance]
```

### Bloco C: Práticas Elaboradas (q21-q30)
```
21. A arte do shibari (bondage japonês com cordas) fascina-me e gostaria de experimentar. [bondage/shibari]
22. Fazer o/a meu/minha parceiro/a implorar por cada toque, cada beijo, cada permissão, excita-me imenso. [dominance/begging]
23. Mordidas firmes no pescoço ou ombros durante o sexo intensificam o meu prazer. [impact/moderate]
24. Usar tampões de ouvidos durante o sexo, focando-me apenas nas sensações táteis, seria intenso. [sensory/deprivation]
25. A fantasia de médico/paciente com "exames íntimos" excita-me. [roleplay/medical]
26. Já fantasiei em criar conteúdo erótico amador (fotos/vídeos) para partilhar online. [exhibitionism/sharing]
27. Receber tarefas diárias do/a meu/minha parceiro/a (fotos, exercícios, proibições) excita-me. [submission/protocol]
28. Ver o/a meu/minha parceiro/a em lingerie específica (meias de rede, ligas, espartilho) excita-me muito mais do que nu/a. [fetish/clothing]
29. A ideia de "orgasmo arruinado" - parar a estimulação no momento exato - intriga-me. [edging/ruined]
30. Usar espelhos estratégicos para observar-me a ter sexo de múltiplos ângulos excita-me. [voyeurism/mirrors]
```

### Bloco D: Fetiches Específicos (q31-q40)
```
31. Ser amarrado/a com fitas de cetim ou lenços suaves parece-me sensual e excitante. [bondage/soft]
32. Estabelecer "punições" consensuais para "transgressões" do/a meu/minha parceiro/a excita-me. [dominance/punishment]
33. A ideia de deixar marcas visíveis (chupões, arranhões) como "propriedade" excita-me. [impact/marking]
34. Ser acariciado/a com penas por todo o corpo enquanto estou imobilizado/a seria delicioso. [sensory/texture]
35. A fantasia de "ladrão/a" que entra em casa e "captura" consensualmente o/a parceiro/a excita-me. [roleplay/capture]
36. Fazer um striptease lento e sensual para o/a meu/minha parceiro/a sentindo-me desejado/a excita-me. [exhibitionism/striptease]
37. A ideia de ter um/a "dono/a" sexual que define regras para o meu prazer excita-me. [submission/master]
38. Cheirar a roupa interior usada do/a meu/minha parceiro/a excita-me. [fetish/smell]
39. A ideia de forçar orgasmos múltiplos no/a meu/minha parceiro/a até à exaustão excita-me. [edging/forced]
40. Ver pornografia juntos como preliminar ao sexo excita-me. [voyeurism/media]
```

### Bloco E: Práticas Avançadas (q41-q50)
```
41. A ideia de bondage aéreo (suspensão parcial com cordas/arnês) fascina-me. [bondage/suspension]
42. Ser chamado/a de "Senhor/Senhora" ou "Mestre/Mestra" durante o sexo excita-me. [dominance/titles]
43. A sensação de pinças nos mamilos - a dor inicial e o prazer que se segue - atrai-me. [impact/clamps]
44. Experimentar brinquedos de eletroestimulação (TENS/e-stim) para sensações únicas intriga-me. [sensory/electro]
45. A fantasia de CNC (consensual non-consent) com safewords claras excita-me. [roleplay/cnc]
46. A ideia de ter sexo por videochamada com um/a terceiro/a a observar excita-me. [exhibitionism/virtual]
47. A ideia de pet play (agir como gatinho/a ou cachorrinho/a) parece-me eroticamente interessante. [submission/petplay]
48. Uniformes específicos (enfermeiro/a, polícia, militar) excitam-me muito. [fetish/uniforms]
49. A ideia de usar um cinto de castidade e entregar o controlo do meu prazer a outro/a excita-me. [edging/chastity]
50. Explorar kinks e fetiches é uma forma saudável de autoconhecimento e conexão íntima. [general/acceptance]
```

---

## Principais Melhorias Aplicadas:

1. ✅ **Questões Específicas** - De "A ideia de X" para cenários concretos
2. ✅ **Variedade de Formato** - Diferentes formas de formular perguntas
3. ✅ **Organização em Blocos** - 5 blocos temáticos por questionário
4. ✅ **Equilíbrio Temático** - Distribuição equilibrada de tópicos
5. ✅ **Inspiração Quest4Couple** - Adaptação de questões para individual
6. ✅ **Linguagem Envolvente** - Menos clínica, mais natural
7. ✅ **Preservação de Estruturas Especiais** - cuckold.json com rolePoints, kinks.json com tags

---

## ✅ IMPLEMENTAÇÃO COMPLETA

Todos os 9 questionários foram reformulados e implementados:

| Questionário | Questões | Estrutura | Status |
|-------------|----------|-----------|--------|
| vanilla.json | 50 | Standard | ✅ Implementado |
| orientation.json | 50 | Standard | ✅ Implementado |
| bdsm.json | 50 | inverseMatching | ✅ Implementado |
| exhibitionism.json | 50 | Standard | ✅ Implementado |
| fantasies.json | 50 | Standard | ✅ Implementado |
| adventure.json | 50 | Standard | ✅ Implementado |
| swing.json | 50 | Standard | ✅ Implementado |
| cuckold.json | 50 | rolePoints | ✅ Implementado |
| kinks.json | 50 | tags | ✅ Implementado |

---

*Documento atualizado após implementação completa de todos os questionários*
