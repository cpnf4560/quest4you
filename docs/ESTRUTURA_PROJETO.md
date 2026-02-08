# 📁 Estrutura do Projeto Quest4You - Organizada

> **Última atualização:** 2026-02-08  
> **Backup disponível em:** `Quest4You_BACKUP_20260208_011106`

---

## 📊 Estrutura de Diretórios

```
Quest4You_v1/
│
├── 📄 index.html                    # Homepage principal
├── 📄 README.md                     # Este ficheiro
├── 📄 favicon.ico                   # Ícone do site
├── 📄 firebase.json                 # Configuração Firebase Hosting
├── 📄 firestore.indexes.json        # Índices Firestore
├── 📄 firestore.rules               # Regras de segurança Firestore
├── 📄 vercel.json                   # Configuração Vercel (alternativa)
│
├── 📁 admin/                        # Painel administrativo
│   ├── index.html                   # Dashboard admin
│   ├── admin.js                     # Lógica do painel
│   ├── admin.css                    # Estilos do painel
│   └── scripts/                     # 🆕 Scripts de administração
│       ├── add-admin.js
│       ├── delete-conversation.js
│       └── update-user-public.js
│
├── 📁 assets/                       # Recursos estáticos
│   ├── logo.png
│   ├── quest4you_transp.png
│   ├── avatars/                     # Avatares de utilizadores
│   └── badges/                      # Badges de conquistas
│
├── 📁 css/                          # Estilos CSS
│   ├── main.css                     # Estilos principais
│   ├── dark-mode.css                # Tema escuro
│   ├── quiz.css                     # Estilos dos quizzes
│   ├── profile.css                  # Página de perfil
│   ├── chat.css                     # Sistema de chat
│   ├── smart-match.css              # Sistema de matching
│   ├── explorar.css                 # Página explorar
│   ├── notifications.css            # Notificações
│   ├── auth.css                     # Autenticação
│   ├── blocks.css                   # Sistema de bloqueios
│   ├── admin-dashboard.css          # Dashboard admin
│   ├── chat-groups.css              # Grupos de chat
│   ├── legal.css                    # Páginas legais
│   └── tutorial.css                 # Tutorial inicial
│
├── 📁 data/                         # Dados da aplicação
│   └── quizzes/                     # JSONs dos questionários
│       ├── index.json               # Índice de quizzes
│       ├── vanilla.json             # Quiz 1: Espectro Vanilla
│       ├── orientation.json         # Quiz 2: Orientação Sexual
│       ├── cuckold.json             # Quiz 3: Cuckold
│       ├── swing.json               # Quiz 4: Swing
│       ├── kinks.json               # Quiz 5: Kinks & Fetiches
│       ├── bdsm.json                # Quiz 6: BDSM
│       ├── adventure.json           # Quiz 7: Aventura
│       ├── fantasies.json           # Quiz 8: Fantasias
│       ├── exhibitionism.json       # Quiz 9: Exibicionismo
│       ├── communication.json       # Quiz 10: Comunicação
│       ├── intimacy.json            # Quiz 11: Intimidade
│       └── rhythm.json              # Quiz 12: Ritmo
│
├── 📁 docs/                         # 📚 Documentação
│   ├── FIREBASE_SCHEMA.md           # Esquema da base de dados
│   ├── USER_FLOW.md                 # Fluxo de utilizador
│   ├── setup-admin-uid.md           # 🆕 Setup de admin
│   ├── PERGUNTAS_ATUAIS_COMPLETAS.md       # 600 perguntas atuais
│   ├── NOVAS_PERGUNTAS_SUGESTOES.md        # 120 novas sugestões
│   ├── QUIZZES_REIMAGINADOS.md             # 🆕 Novos quizzes poéticos
│   ├── LIMPEZA_PROJETO.md                  # 🆕 Este documento
│   ├── REFORMULACAO_QUESTIONARIOS_ANTES_DEPOIS.md
│   ├── SUGESTOES_6_PACK.md
│   └── deploy/                      # 🆕 Documentação de deploy
│       ├── CONFIGURACAO_DNS_AMEN.md
│       ├── CONFIGURAR_VERCEL_GITHUB.md
│       ├── DEPLOY_FINAL.md
│       ├── FIREBASE_DOMINIOS.md
│       └── GUIA_DEPLOY_COMPLETO.md
│
├── 📁 js/                           # JavaScript
│   ├── app.js                       # Aplicação principal
│   ├── auth.js                      # Sistema de autenticação
│   ├── profile.js                   # Página de perfil
│   ├── quiz.js                      # Sistema de quizzes
│   ├── chat.js                      # Sistema de chat
│   ├── smart-match.js               # Algoritmo de matching
│   ├── explorar.js                  # Página explorar
│   ├── notifications.js             # Sistema de notificações
│   ├── blocks.js                    # Sistema de bloqueios
│   ├── dark-mode.js                 # Toggle dark mode
│   ├── cloud-sync.js                # Sincronização cloud
│   ├── match-history.js             # Histórico de matches
│   ├── verification.js              # Verificação de utilizadores
│   ├── chat-groups.js               # Grupos de chat
│   ├── admin-dashboard.js           # Dashboard admin
│   ├── config.js                    # Configurações gerais
│   ├── firebase-config.js           # Config Firebase
│   └── modules/                     # Módulos reutilizáveis
│
├── 📁 pages/                        # Páginas HTML
│   ├── auth.html                    # Login/Registo
│   ├── profile.html                 # Perfil de utilizador
│   ├── quiz.html                    # Página de quizzes
│   ├── chat.html                    # Chat
│   ├── smart-match.html             # Página de matching
│   ├── explorar.html                # Explorar utilizadores
│   ├── admin.html                   # Painel admin
│   ├── tutorial.html                # Tutorial inicial
│   ├── privacidade.html             # Política de privacidade
│   ├── termos.html                  # Termos de serviço
│   ├── contacto.html                # Página de contacto
│   └── quizzes/                     # Páginas individuais de quizzes
│
├── 📁 scripts/                      # 🆕 Scripts PowerShell
│   ├── deploy.ps1                   # Script de deploy
│   ├── update-colors.ps1            # Atualizar cores
│   ├── update-firebase.ps1          # Atualizar Firebase
│   ├── update-paths-fixed.ps1       # Corrigir caminhos
│   ├── update-paths.ps1             # Atualizar caminhos
│   └── verificar-config.ps1         # Verificar configuração
│
├── 📁 _ARCHIVE/                     # 🆕 Ficheiros arquivados
│   ├── js/                          # Backups JS
│   │   ├── articlesData_backup.js
│   │   ├── explorar_backup_with_articles.js
│   │   └── explorar_new.js
│   └── assets/                      # Backups de assets
│       └── quest4couple_questions_by_category.txt
│
├── 📁 i18n/                         # 🔮 Internacionalização (futuro)
│
└── 📁 PARA_QUEST4COUPLE/            # 🔀 Projeto separado
    ├── artigos.html
    ├── artigos.css
    ├── artigos.js
    └── README.md
```

---

## 🎯 Mudanças na Reorganização (2026-02-08)

### ✅ Criadas
- `admin/scripts/` - Scripts de administração centralizados
- `scripts/` - Scripts PowerShell de deploy/config
- `docs/deploy/` - Documentação de deployment
- `_ARCHIVE/` - Ficheiros backup organizados

### 📦 Movidas
- Scripts admin → `admin/scripts/`
- Scripts PowerShell → `scripts/`
- Docs de deploy → `docs/deploy/`
- Backups JS → `_ARCHIVE/js/`
- Backups assets → `_ARCHIVE/assets/`

### 🗑️ Arquivadas
- `explorar_new.js` (mais antigo que `explorar.js`)
- `articlesData_backup.js`
- `explorar_backup_with_articles.js`
- `quest4couple_questions_by_category.txt`

---

## 🚀 Quick Start

### Desenvolvimento Local
```bash
# Instalar dependências (se necessário)
npm install

# Servir localmente
firebase serve
# ou
vercel dev
```

### Deploy
```powershell
# Deploy para Firebase
.\scripts\deploy.ps1

# Deploy para Vercel
vercel --prod
```

---

## 📚 Documentação Importante

### Para Developers
- [FIREBASE_SCHEMA.md](docs/FIREBASE_SCHEMA.md) - Estrutura da BD
- [USER_FLOW.md](docs/USER_FLOW.md) - Fluxo da aplicação
- [QUIZZES_REIMAGINADOS.md](docs/QUIZZES_REIMAGINADOS.md) - 🆕 Nova experiência de quizzes

### Para Conteúdo
- [PERGUNTAS_ATUAIS_COMPLETAS.md](docs/PERGUNTAS_ATUAIS_COMPLETAS.md) - 600 perguntas existentes
- [NOVAS_PERGUNTAS_SUGESTOES.md](docs/NOVAS_PERGUNTAS_SUGESTOES.md) - 120 novas sugestões

### Para Deploy
- [GUIA_DEPLOY_COMPLETO.md](docs/deploy/GUIA_DEPLOY_COMPLETO.md) - Guia completo
- [setup-admin-uid.md](docs/setup-admin-uid.md) - Configurar admin

---

## 🔧 Tecnologias

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Firebase (Firestore, Authentication, Hosting, Storage)
- **Deploy:** Firebase Hosting / Vercel
- **Version Control:** Git + GitHub

---

## 📝 Notas

- **Backup:** Sempre disponível em `Quest4You_BACKUP_YYYYMMDD_HHMMSS`
- **i18n:** Pasta preparada para futura internacionalização
- **PARA_QUEST4COUPLE:** Projeto relacionado mas separado

---

## 🎨 Estado do Projeto

- ✅ **12 Quizzes** completos com 600 perguntas
- ✅ **Sistema de matching** inteligente
- ✅ **Chat** 1-1 e grupos
- ✅ **Dark Mode** completo
- ✅ **Dashboard Admin** funcional
- 🚧 **Quizzes Reimaginados** - Em desenvolvimento
- 🔮 **Internacionalização** - Planeada

---

*Para sugestões ou problemas, consultar a documentação em `docs/`*
