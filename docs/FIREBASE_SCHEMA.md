# Quest4You - Firebase Schema

## Visão Geral

O Quest4You usa Firebase Firestore para armazenar dados de utilizadores, respostas aos questionários, resultados calculados e matches do Smart Match.

**Projeto Firebase:** Partilhado com Quest4Couple (mesmo projeto)
**Prefixo das Collections:** `quest4you_` para evitar conflitos

---

## Collections

### 1. `quest4you_users`

Perfil do utilizador no Quest4You.

```javascript
// Document ID: Firebase Auth UID
{
  // Informações Básicas
  uid: "abc123...",
  email: "user@example.com",
  displayName: "João Silva",
  nickname: "joao_kink",           // Nickname para Smart Match (privacidade)
  photoURL: "https://...",         // Avatar (pode ser gerado)
    // Dados Demográficos
  gender: "M",                     // M, F, NB, Other
  orientation: "hetero",           // hetero, homo, bi, pan, other
  birthYear: 1990,
  location: {
    city: "Lisboa",
    country: "PT"
  },
  
  // Verificação
  isVerified: false,               // Email verificado
  verificationDate: Timestamp,
  
  // Smart Match
  smartMatchEnabled: true,         // Ativo no Smart Match
  lookingFor: ["F", "M"],          // Géneros que procura
  ageRange: { min: 25, max: 45 },
  maxDistance: 50,                 // km (0 = sem limite)
  
  // Preferências de Privacidade
  privacy: {
    showProfile: true,             // Visível no Smart Match
    showResults: "matches",        // "all", "matches", "none"
    allowMessages: true
  },
  
  // Progresso nos Questionários
  quizProgress: {
    vanilla: 25,                   // Perguntas respondidas
    orientation: 50,               // Completo (50/50)
    cuckold: 0,
    swing: 10,
    kinks: 50                      // Completo
  },
  
  // Metadados
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp,
  source: "organic"                // organic, referral, ad
}
```

---

### 2. `quest4you_answers`

Respostas aos questionários (subcollection por utilizador).

```javascript
// Collection: quest4you_users/{uid}/answers
// Document ID: quizId (vanilla, orientation, cuckold, swing, kinks)

{
  quizId: "vanilla",
  userId: "abc123...",
  
  // Respostas individuais
  answers: {
    "q1": {
      value: 4,                    // 1-5 escala Likert
      timestamp: Timestamp
    },
    "q2": {
      value: 2,
      timestamp: Timestamp
    },
    // ... até q50
  },
  
  // Estado
  isComplete: false,
  answeredCount: 25,
  
  // Timestamps
  startedAt: Timestamp,
  updatedAt: Timestamp,
  completedAt: Timestamp | null
}
```

---

### 3. `quest4you_results`

Resultados calculados dos questionários (subcollection por utilizador).

```javascript
// Collection: quest4you_users/{uid}/results
// Document ID: quizId

{
  quizId: "vanilla",
  userId: "abc123...",
  
  // Resultado Principal (varia por tipo de quiz)
  resultType: "spectrum",          // spectrum, category, tags
  
  // Para tipo "spectrum" (vanilla, orientation, cuckold)
  spectrum: {
    score: 72,                     // 0-100
    label: "Kink-Curious",         // Label do resultado
    description: "Tens curiosidade..."
  },
  
  // Para tipo "category" (swing)
  category: {
    primary: "soft-swing",
    secondary: "poly-curious",
    scores: {
      "vanilla-mono": 20,
      "soft-swing": 45,
      "full-swap": 25,
      "polyamory": 10
    }
  },
  
  // Para tipo "tags" (kinks)
  tags: {
    primary: ["bondage", "roleplay", "exhibitionism"],
    secondary: ["voyeurism", "domination"],
    scores: {
      "bondage": 85,
      "roleplay": 78,
      "exhibitionism": 72,
      "voyeurism": 65,
      "domination": 60,
      // ... outros
    }
  },
  
  // Para Smart Match
  matchVector: [0.72, 0.45, 0.85, ...], // Vector normalizado para matching
  
  // Metadados
  calculatedAt: Timestamp,
  version: 1                       // Para recalcular se algoritmo mudar
}
```

---

### 4. `quest4you_matches`

Matches do Smart Match.

```javascript
// Document ID: gerado automaticamente
{
  // Utilizadores
  user1: "uid_abc",
  user2: "uid_xyz",
  
  // Compatibilidade
  compatibility: {
    overall: 78,                   // 0-100
    vanilla: 85,
    orientation: 90,
    cuckold: 45,
    swing: 72,
    kinks: 88,
    
    // Detalhes
    commonInterests: ["bondage", "roleplay", "soft-swing"],
    complementary: ["dom-sub"]     // Um é dom, outro é sub
  },
  
  // Estado do Match
  status: "pending",               // pending, matched, rejected, expired
  
  // Swipes
  user1Action: "like",             // like, superlike, pass, null
  user1ActionAt: Timestamp,
  user2Action: null,
  user2ActionAt: null,
  
  // Chat (se matched)
  chatEnabled: false,
  lastMessage: Timestamp | null,
  
  // Metadados
  createdAt: Timestamp,
  matchedAt: Timestamp | null,
  expiresAt: Timestamp             // Matches pendentes expiram em 7 dias
}
```

---

### 5. `quest4you_messages`

Mensagens de chat entre matches.

```javascript
// Collection: quest4you_matches/{matchId}/messages
// Document ID: gerado automaticamente

{
  matchId: "match_abc123",
  senderId: "uid_abc",
  receiverId: "uid_xyz",
  
  content: "Olá! Vi que também gostas de...",
  type: "text",                    // text, image, icebreaker
  
  // Estado
  isRead: false,
  readAt: Timestamp | null,
  
  // Metadados
  createdAt: Timestamp
}
```

---

### 6. `quest4you_quizzes` (Read-only, configuração)

Configuração dos questionários (gerida por admin).

```javascript
// Document ID: quizId
{
  id: "vanilla",
  name: "Vanilla ou Kink",
  description: "Descobre onde te posicionas...",
  icon: "heart",
  color: "#e91e63",
  
  // Perguntas
  questions: [
    {
      id: "q1",
      text: "Gosto de experimentar coisas novas na intimidade",
      category: "openness",
      weight: 1,
      invertScore: false
    },
    // ... 50 perguntas
  ],
  
  // Configuração de Resultados
  resultConfig: {
    type: "spectrum",
    labels: [
      { min: 0, max: 20, label: "Vanilla", description: "..." },
      { min: 21, max: 40, label: "Vanilla-Curious", description: "..." },
      { min: 41, max: 60, label: "Balanced", description: "..." },
      { min: 61, max: 80, label: "Kink-Curious", description: "..." },
      { min: 81, max: 100, label: "Kinky", description: "..." }
    ]
  },
  
  // Metadados
    isActive: true,
  version: 1,
  updatedAt: Timestamp
}
```

---

### 7. `quest4you_reports`

Denúncias de utilizadores.

```javascript
// Document ID: gerado automaticamente
{
  reporterId: "uid_abc",
  reportedId: "uid_xyz",
  matchId: "match_123" | null,
  
  reason: "inappropriate",         // inappropriate, fake, harassment, spam, other
  details: "Comportamento inadequado...",
  
  // Estado
  status: "pending",               // pending, reviewed, resolved, dismissed
  reviewedBy: "admin_uid" | null,
  resolution: "warning" | null,
  
  // Metadados
  createdAt: Timestamp,
  reviewedAt: Timestamp | null
}
```

---

## Índices Firestore

```javascript
// firestore.indexes.json
{
  "indexes": [
    // Smart Match - buscar utilizadores compatíveis
    {
      "collectionGroup": "quest4you_users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "smartMatchEnabled", "order": "ASCENDING" },
        { "fieldPath": "gender", "order": "ASCENDING" },
        { "fieldPath": "location.country", "order": "ASCENDING" }
      ]
    },
    
    // Matches por utilizador
    {
      "collectionGroup": "quest4you_matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user1", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    
    // Mensagens por match
    {
      "collectionGroup": "quest4you_messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "matchId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    
    // Transações por utilizador
    {
      "collectionGroup": "quest4you_transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## Regras de Segurança

```javascript
// firestore.rules (adicionar ao existente)

match /quest4you_users/{userId} {
  // Leitura do próprio perfil
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Leitura pública para Smart Match (apenas campos públicos)
  allow read: if request.auth != null 
    && resource.data.smartMatchEnabled == true
    && resource.data.privacy.showProfile == true;
  
  // Escrita apenas próprio
  allow write: if request.auth != null && request.auth.uid == userId;
  
  // Subcollections (answers, results)
  match /answers/{quizId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  
  match /results/{quizId} {
    allow read: if request.auth != null && request.auth.uid == userId;
    // Results são escritos por Cloud Function
    allow write: if false;
  }
}

match /quest4you_matches/{matchId} {
  // Ler apenas matches onde o utilizador participa
  allow read: if request.auth != null 
    && (resource.data.user1 == request.auth.uid 
        || resource.data.user2 == request.auth.uid);
  
  // Criar match (swipe)
  allow create: if request.auth != null 
    && request.resource.data.user1 == request.auth.uid;
  
  // Atualizar apenas a própria ação
  allow update: if request.auth != null
    && (resource.data.user1 == request.auth.uid 
        || resource.data.user2 == request.auth.uid);
  
  // Mensagens
  match /messages/{messageId} {
    allow read: if request.auth != null 
      && (get(/databases/$(database)/documents/quest4you_matches/$(matchId)).data.user1 == request.auth.uid 
          || get(/databases/$(database)/documents/quest4you_matches/$(matchId)).data.user2 == request.auth.uid);
    
    allow create: if request.auth != null
      && request.resource.data.senderId == request.auth.uid;
  }
}

match /quest4you_quizzes/{quizId} {
  // Leitura pública (questionários)
  allow read: if true;
  // Escrita apenas admin
  allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}

match /quest4you_transactions/{transactionId} {
  // Ler apenas próprias transações
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  // Escrita por Cloud Function
  allow write: if false;
}

match /quest4you_reports/{reportId} {
  // Criar denúncia
  allow create: if request.auth != null 
    && request.resource.data.reporterId == request.auth.uid;
  // Ler/atualizar apenas admin
  allow read, update: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

---

## Diagrama de Relações

```
quest4you_users
    │
    ├── /answers/{quizId}        (subcollection)
    │       └── respostas individuais
    │
    └── /results/{quizId}        (subcollection)
            └── resultados calculados
            
quest4you_matches
    │
    └── /messages/{messageId}    (subcollection)
            └── chat entre matches

quest4you_quizzes               (configuração, read-only)
quest4you_reports               (denúncias)
```

---

## Notas de Implementação

### 1. Cálculo de Resultados
- Usar **Cloud Functions** para calcular resultados quando quiz é completado
- Guardar `matchVector` normalizado para algoritmo de matching

### 2. Smart Match Algorithm
- Calcular compatibilidade usando **cosine similarity** nos vectors
- Filtrar por preferências (género, idade, distância)
- Ordenar por compatibilidade

### 3. Modelo Gratuito (Fase Inicial)
- Todos os questionários são 100% gratuitos
- Smart Match gratuito para todos
- Sem sistema de créditos nesta fase

### 4. Privacidade
- Nunca expor emails no Smart Match
- Usar nicknames
- Revelar mais info após match

### 5. Migração de Dados
- Utilizadores Quest4Couple podem usar mesmo UID
- Dados separados entre plataformas
