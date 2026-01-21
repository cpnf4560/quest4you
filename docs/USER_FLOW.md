# Quest4You - Fluxo do Utilizador

## Visão Geral

Este documento descreve a jornada do utilizador desde a landing page até ao Smart Match, incluindo wireframes em ASCII e estados da UI.

---

## 1. Landing Page (index.html)

### Wireframe
```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Quest4You                    Questionários | Smart Match | Entrar │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ✨ Descobre-te a ti mesmo ✨                   │
│         Questionários de autoconhecimento sobre sexualidade      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🎉 100% Grátis! Todos os questionários disponíveis          │ │
│  │    Descobre quem és e encontra pessoas compatíveis ❤️        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│     O Seu Nome: [________________________]                       │
│                                                                  │
│           [ ❤️ Smart Match ] [ 💾 Guardar Progresso ]            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│         📋 Escolhe o teu Questionário • Todos 100% grátis!       │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │   💕     │ │   🌈     │ │   👀     │ │   💜     │ │   🔥     ││
│  │ Vanilla  │ │Orientação│ │  Stag/   │ │  Swing/  │ │ Fetiches ││
│  │ ou Kink  │ │  Sexual  │ │ Cuckold  │ │ Poliamor │ │ & Kinks  ││
│  │──────────│ │──────────│ │──────────│ │──────────│ │──────────││
│  │ 50 perg. │ │ 50 perg. │ │ 50 perg. │ │ 50 perg. │ │ 50 perg. ││
│  │ ✨ Grátis│ │ ✨ Grátis│ │ ✨ Grátis│ │ ✨ Grátis│ │ ✨ Grátis││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Estados

| Estado | Descrição | UI |
|--------|-----------|-----|
| **Visitante** | Não autenticado | Mostrar "Entrar", cards básicos |
| **Autenticado** | Com conta | Mostrar progresso no header |

---

## 2. Fluxo de Autenticação

### 2.1 Página de Login/Registo (pages/auth.html)

```
┌─────────────────────────────────────────────────────────────────┐
│                       🎯 Quest4You                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │                     │                       │
│                    │    [ Entrar ]       │                       │
│                    │    [ Registar ]     │                       │
│                    │                     │                       │
│                    └─────────────────────┘                       │
│                                                                  │
│   ─────────────── TAB: ENTRAR ───────────────                   │
│                                                                  │
│     Email:    [_________________________]                        │
│     Password: [_________________________]                        │
│                                                                  │
│              [ 🔐 Entrar com Email ]                             │
│                                                                  │
│     ────────────── ou ──────────────                            │
│                                                                  │
│              [ 🔵 Continuar com Google ]                         │
│                                                                  │
│     Esqueceste a password? [Recuperar]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Registo - Passo 1 (Dados Básicos)

```
┌─────────────────────────────────────────────────────────────────┐
│   ← Voltar            Criar Conta (1/3)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Email:      [_________________________]                      │
│     Password:   [_________________________]                      │
│     Confirmar:  [_________________________]                      │
│                                                                  │
│     ☐ Aceito os Termos de Utilização                            │
│     ☐ Aceito a Política de Privacidade                          │
│                                                                  │
│                    [ Continuar → ]                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Registo - Passo 2 (Perfil)

```
┌─────────────────────────────────────────────────────────────────┐
│   ← Voltar            Criar Conta (2/3)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Nickname:   [_________________________]                      │
│     (Este será o teu nome no Smart Match)                       │
│                                                                  │
│     Género:     ○ Masculino  ○ Feminino  ○ Não-binário  ○ Outro │
│                                                                  │
│     Ano Nasc.:  [ 1990 ▼ ]                                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 👩 És mulher? Verifica o teu género e tem acesso GRÁTIS!   │ │
│  │    [ Verificar Agora ]                                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                    [ Continuar → ]                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Registo - Passo 3 (Preferências Smart Match)

```
┌─────────────────────────────────────────────────────────────────┐
│   ← Voltar            Criar Conta (3/3)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Quem procuras?                                               │
│     ☐ Homens  ☐ Mulheres  ☐ Não-binários  ☐ Todos               │
│                                                                  │
│     Faixa etária:                                                │
│     [ 25 ]  ────●────────────●────  [ 45 ]                       │
│                                                                  │
│     Localização:                                                 │
│     País:   [ Portugal ▼ ]                                       │
│     Cidade: [_____________]                                      │
│                                                                  │
│     ☐ Ativar Smart Match (podes desativar depois)               │
│                                                                  │
│                    [ ✅ Criar Conta ]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Fluxo do Questionário

### 3.1 Introdução do Quiz

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Início                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         💕                                       │
│                    Vanilla ou Kink                               │
│                                                                  │
│     Descobre onde te posicionas no espectro entre romance       │
│     suave e práticas mais intensas.                             │
│                                                                  │
│     ┌──────────────────────────────────────────────────────┐    │
│     │ 📊 50 perguntas                                      │    │
│     │ ⏱️ ~10 minutos                                        │    │
│     │ ✨ 100% Grátis                                        │    │
│     │ 📈 Resultado: Espectro (0-100)                       │    │
│     └──────────────────────────────────────────────────────┘    │
│                                                                  │
│     ⚠️ Responde honestamente para resultados precisos          │
│                                                                  │
│     ┌──────────────────────────────────────────────────────┐    │
│     │ 💡 Podes pausar e continuar mais tarde               │    │
│     │    O teu progresso é guardado automaticamente        │    │
│     └──────────────────────────────────────────────────────┘    │
│                                                                  │
│                    [ ▶️ Começar Quiz ]                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Pergunta do Quiz

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Pausar        Vanilla ou Kink                    12/50       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  24%           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │   Gosto de experimentar coisas novas                       │ │
│  │   na intimidade, mesmo que me deixem                       │ │
│  │   um pouco desconfortável inicialmente.                    │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                                                  │
│     ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│     │    1    │ │    2    │ │    3    │ │    4    │ │    5    │ │
│     │         │ │         │ │         │ │         │ │         │ │
│     │ Discordo│ │ Discordo│ │ Neutro  │ │ Concordo│ │ Concordo│ │
│     │ Totalmente│ │       │ │         │ │         │ │Totalmente│ │
│     └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                                  │
│                                                                  │
│     [ ← Anterior ]                          [ Próxima → ]       │
│                                                                  │
│     💾 Progresso guardado automaticamente                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Resultados do Quiz

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎉 Quiz Concluído!                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         💕                                       │
│                    Vanilla ou Kink                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │   O teu resultado:                                          │ │
│  │                                                             │ │
│  │          ╭──────────────────────────────────╮               │ │
│  │          │                                  │               │ │
│  │          │       🌶️ KINK-CURIOUS           │               │ │
│  │          │          Pontuação: 72/100      │               │ │
│  │          │                                  │               │ │
│  │          ╰──────────────────────────────────╯               │ │
│  │                                                             │ │
│  │   Vanilla ═══════════════════════●═══════ Kinky            │ │
│  │                                 72                          │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📝 Descrição:                                               │ │
│  │                                                             │ │
│  │ Tens uma mente aberta e curiosidade natural por explorar   │ │
│  │ além do convencional. Valorizas tanto a intimidade suave   │ │
│  │ como experiências mais intensas, dependendo do momento     │ │
│  │ e do/a parceiro/a.                                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│     [ 📤 Partilhar ] [ 💾 Guardar PDF ] [ ❤️ Smart Match ]       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🔮 Próximo quiz recomendado: Fetiches & Kinks              │ │
│  │    Descobre quais práticas específicas te atraem           │ │
│  │                                    [ Começar → ]            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Smart Match

### 4.1 Requisitos para Aceder

```
Para aceder ao Smart Match, o utilizador deve:
1. Ter conta criada e verificada
2. Completar pelo menos 2 questionários (mínimo 100 respostas)
3. Ter perfil Smart Match configurado (preferências)
```

### 4.2 Dashboard Smart Match

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Início          Smart Match                     💳 3 | 🔔 2  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📊 O teu perfil de compatibilidade                         │ │
│  │                                                             │ │
│  │   Vanilla: ████████████████░░░░ 72%                        │ │
│  │   Kinks:   ███████████████████░ 85%                        │ │
│  │   Swing:   ██████████░░░░░░░░░░ 45%                        │ │
│  │                                                             │ │
│  │   [ Ver Perfil Completo ]                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│     ┌─────────┐     ┌─────────┐     ┌─────────┐                 │
│     │  ❤️     │     │  👀     │     │  💬     │                 │
│     │ Descobrir│     │ Quem    │     │  Chat   │                 │
│     │         │     │ Gostou  │     │         │                 │
│     │  (12)   │     │  (2)    │     │  (1)    │                 │
│     └─────────┘     └─────────┘     └─────────┘                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🔥 Matches Recentes                                         │ │
│  │                                                             │ │
│  │   ┌────┐ Luna_23        87% compatível      [ 💬 Mensagem ] │ │
│  │   │ 👤 │ Lisboa • 28 anos                                   │ │
│  │   └────┘ Match há 2 horas                                   │ │
│  │                                                             │ │
│  │   ┌────┐ Carlos_K       79% compatível      [ 💬 Mensagem ] │ │
│  │   │ 👤 │ Porto • 34 anos                                    │ │
│  │   └────┘ Match há 1 dia                                     │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Descobrir (Tinder-like)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Smart Match       Descobrir                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │                     ┌──────────────┐                        │ │
│  │                     │              │                        │ │
│  │                     │    Avatar    │                        │ │
│  │                     │   (gerado)   │                        │ │
│  │                     │              │                        │ │
│  │                     └──────────────┘                        │ │
│  │                                                             │ │
│  │              Luna_23  •  28 anos  •  Lisboa                 │ │
│  │                                                             │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │  ❤️ 87% Compatível                                     │ │ │
│  │  │                                                        │ │ │
│  │  │  🔥 Interesses em comum:                               │ │ │
│  │  │     bondage • roleplay • exhibitionism                │ │ │
│  │  │                                                        │ │ │
│  │  │  💜 Complementares:                                    │ │ │
│  │  │     Tu: Dominante → Ela: Submissa                     │ │ │
│  │  │                                                        │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  "Curiosa e sem preconceitos. Procuro alguém               │ │
│  │   para explorar juntos..."                                  │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│        ┌───────┐              ┌───────┐              ┌───────┐  │
│        │   ❌   │              │  ⭐   │              │   💚   │  │
│        │ Pass  │              │ Super │              │  Like  │  │
│        └───────┘              └───────┘              └───────┘  │
│                                                                  │
│     Swipe ← para passar │ Swipe → para gostar                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 É um Match! (Modal)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│         ┌────────┐         💕         ┌────────┐                │
│         │   Tu   │    É UM MATCH!    │  Luna  │                │
│         │  👤    │                    │   👤   │                │
│         └────────┘                    └────────┘                │
│                                                                  │
│                    87% Compatíveis!                              │
│                                                                  │
│         ┌─────────────────────────────────────────┐             │
│         │  🔥 O que têm em comum:                 │             │
│         │                                         │             │
│         │  • Ambos "Kink-Curious" (72% vs 78%)   │             │
│         │  • Interesse em bondage (85% vs 90%)   │             │
│         │  • Curiosidade swing (45% vs 52%)      │             │
│         │                                         │             │
│         │  💡 Dica: Começa por perguntar sobre   │             │
│         │     as fantasias que têm em comum!     │             │
│         │                                         │             │
│         └─────────────────────────────────────────┘             │
│                                                                  │
│           [ 💬 Enviar Mensagem ]  [ Continuar a Descobrir ]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Chat

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Matches          Luna_23          87% 💕       ⋮             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 💡 Quebra-gelos sugeridos:                                  │ │
│  │                                                             │ │
│  │ "Vi que também tens interesse em roleplay! Que tipo de     │ │
│  │  cenários mais te atraem?"                                  │ │
│  │                                              [ Usar ]       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │                                                             │ │
│  │                    [ Sem mensagens ainda ]                  │ │
│  │                                                             │ │
│  │                    Sê o primeiro a dizer olá!               │ │
│  │                                                             │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Escreve uma mensagem...                          [ ➤ ]      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Perfil do Utilizador

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Início            Meu Perfil                    ⚙️           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ┌──────────────┐                                             │
│     │              │     João_K                                  │
│     │   Avatar     │     joao@example.com                       │
│     │              │     ✅ Verificado                           │
│     └──────────────┘                                             │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  📊 Meus Questionários                                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 💕 Vanilla ou Kink           ████████████████████  100%  │   │
│  │    Resultado: Kink-Curious (72/100)        [ Ver ]       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🔥 Fetiches & Kinks          ████████████████████  100%  │   │
│  │    Resultado: 5 kinks principais           [ Ver ]       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 💜 Swing/Poliamor            ██████████░░░░░░░░░░   45%  │   │
│  │    Em progresso...                      [ Continuar ]    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🌈 Orientação Sexual         ░░░░░░░░░░░░░░░░░░░░    0%  │   │
│  │    Não começado                           [ Começar ]    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  ❤️ Smart Match                                                  │
│  Status: Ativo • 3 matches • 12 perfis vistos                   │
│                            [ Configurações Smart Match ]         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Estados e Transições

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Visitante  │────▶│   Registado  │────▶│   Verificado │
│              │     │   (0 quiz)   │     │   (email)    │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Explorador  │────▶│   Matcher    │
                     │  (1+ quiz)   │     │  (2+ quiz)   │
                     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │    Active    │
                                          │   Matcher    │
                                          │  (matches)   │
                                          └──────────────┘
```

---

## 8. Responsividade

### Mobile (< 768px)

- Cards de quiz em coluna única
- Swipe nativo para Smart Match
- Bottom navigation bar
- Modais full-screen

### Tablet (768px - 1024px)

- Cards de quiz 2x2
- Smart Match centrado
- Sidebar colapsável

### Desktop (> 1024px)

- Cards de quiz 5 em linha
- Smart Match com detalhes lado a lado
- Sidebar fixa

---

## Notas de Implementação

1. **Lazy Loading**: Carregar questionários on-demand
2. **Offline Support**: Guardar progresso em localStorage
3. **PWA**: Adicionar service worker para uso offline
4. **Animações**: Usar Framer Motion ou CSS transitions suaves
5. **Acessibilidade**: Labels ARIA, navegação por teclado
