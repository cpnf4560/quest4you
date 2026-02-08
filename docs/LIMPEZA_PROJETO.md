# 🧹 Limpeza e Organização do Projeto Quest4You

> **Backup criado:** `Quest4You_BACKUP_20260208_011106`

---

## 📊 Análise da Estrutura Atual

### ✅ Ficheiros Bem Organizados
- `css/` - Todos os estilos organizados
- `js/` - Scripts principais organizados
- `data/quizzes/` - JSONs dos quizzes
- `docs/` - Documentação recente
- `pages/` - Páginas HTML
- `assets/` - Imagens e recursos

### ⚠️ Ficheiros Soltos na Raiz (A Reorganizar)

#### Scripts de Administração/Setup
- `add-admin.js` → mover para `admin/scripts/`
- `delete-conversation.js` → mover para `admin/scripts/`
- `setup-admin-uid.md` → mover para `docs/`
- `update-user-public.js` → mover para `admin/scripts/`

#### Scripts PowerShell de Deploy/Config
- `deploy.ps1` → mover para `scripts/`
- `update-colors.ps1` → mover para `scripts/`
- `update-firebase.ps1` → mover para `scripts/`
- `update-paths-fixed.ps1` → mover para `scripts/`
- `update-paths.ps1` → mover para `scripts/`
- `verificar-config.ps1` → mover para `scripts/`

#### Documentação de Deploy/Config
- `CONFIGURACAO_DNS_AMEN.md` → mover para `docs/deploy/`
- `CONFIGURAR_VERCEL_GITHUB.md` → mover para `docs/deploy/`
- `DEPLOY_FINAL.md` → mover para `docs/deploy/`
- `FIREBASE_DOMINIOS.md` → mover para `docs/deploy/`
- `GUIA_DEPLOY_COMPLETO.md` → mover para `docs/deploy/`

#### Ficheiros de Configuração Firebase (OK na raiz)
- `firebase.json` ✅
- `firestore.indexes.json` ✅
- `firestore.rules` ✅
- `vercel.json` ✅

#### Ficheiros Importantes (OK na raiz)
- `index.html` ✅
- `README.md` ✅
- `favicon.ico` ✅

### 🗑️ Ficheiros Backup/Obsoletos (A Mover ou Deletar)

#### Backups em JS
- `js/articlesData_backup.js` → mover para `_ARCHIVE/js/`
- `js/explorar_backup_with_articles.js` → mover para `_ARCHIVE/js/`

#### Ficheiros com sufixo _new ou duplicados
- `js/explorar_new.js` → **ANALISAR:** é o atual ou backup?

#### Assets Obsoletos
- `assets/quest4couple_questions_by_category.txt` → mover para `_ARCHIVE/assets/`

### 📁 Pasta Especial
- `PARA_QUEST4COUPLE/` → **DECISÃO:** É outro projeto? Mover para fora ou manter?

### 📂 Pasta i18n/ Vazia?
- Verificar se tem conteúdo ou se é para futuro

---

## 🎯 Plano de Reorganização

### Fase 1: Criar Estrutura Nova
```
Quest4You_v1/
├── admin/
│   ├── scripts/          (NOVO)
│   └── (ficheiros existentes)
├── scripts/              (NOVO)
├── docs/
│   ├── deploy/           (NOVO)
│   └── (ficheiros existentes)
├── _ARCHIVE/             (NOVO)
│   ├── js/
│   └── assets/
└── (resto mantém-se igual)
```

### Fase 2: Mover Ficheiros
1. Criar pastas novas
2. Mover scripts admin
3. Mover scripts PowerShell
4. Mover documentação de deploy
5. Mover backups para _ARCHIVE

### Fase 3: Verificações
- [ ] Verificar se há imports/caminhos quebrados
- [ ] Testar se admin ainda funciona
- [ ] Verificar scripts PowerShell
- [ ] Atualizar README se necessário

### Fase 4: Limpeza Final
- [ ] Analisar `js/explorar_new.js` vs `js/explorar.js`
- [ ] Decidir sobre `PARA_QUEST4COUPLE/`
- [ ] Verificar pasta `i18n/`
- [ ] Commit das alterações

---

## ⚙️ Comandos a Executar

```powershell
# Criar estrutura nova
New-Item -ItemType Directory -Path "admin\scripts" -Force
New-Item -ItemType Directory -Path "scripts" -Force
New-Item -ItemType Directory -Path "docs\deploy" -Force
New-Item -ItemType Directory -Path "_ARCHIVE\js" -Force
New-Item -ItemType Directory -Path "_ARCHIVE\assets" -Force

# Mover ficheiros
Move-Item "add-admin.js" "admin\scripts\"
Move-Item "delete-conversation.js" "admin\scripts\"
Move-Item "update-user-public.js" "admin\scripts\"
Move-Item "setup-admin-uid.md" "docs\"

Move-Item "deploy.ps1" "scripts\"
Move-Item "update-colors.ps1" "scripts\"
Move-Item "update-firebase.ps1" "scripts\"
Move-Item "update-paths-fixed.ps1" "scripts\"
Move-Item "update-paths.ps1" "scripts\"
Move-Item "verificar-config.ps1" "scripts\"

Move-Item "CONFIGURACAO_DNS_AMEN.md" "docs\deploy\"
Move-Item "CONFIGURAR_VERCEL_GITHUB.md" "docs\deploy\"
Move-Item "DEPLOY_FINAL.md" "docs\deploy\"
Move-Item "FIREBASE_DOMINIOS.md" "docs\deploy\"
Move-Item "GUIA_DEPLOY_COMPLETO.md" "docs\deploy\"

Move-Item "js\articlesData_backup.js" "_ARCHIVE\js\"
Move-Item "js\explorar_backup_with_articles.js" "_ARCHIVE\js\"
Move-Item "assets\quest4couple_questions_by_category.txt" "_ARCHIVE\assets\"
```

---

## 📋 Decisões Pendentes

1. **js/explorar_new.js:**
   - É o ficheiro atual em uso?
   - Ou é um backup do `explorar.js`?
   - Comparar conteúdos antes de arquivar

2. **PARA_QUEST4COUPLE/:**
   - É parte do Quest4You?
   - É um projeto separado?
   - Se separado, mover para pasta acima

3. **i18n/:**
   - Pasta vazia?
   - É para internacionalização futura?
   - Manter ou remover?

---

## 📝 Notas Importantes

- ✅ **Backup criado em:** `Quest4You_BACKUP_20260208_011106`
- ⚠️ **Antes de deletar qualquer ficheiro:** Verificar se não é referenciado noutro lugar
- 🔍 **Após reorganização:** Testar toda a aplicação
- 📌 **Git:** Fazer commit após confirmar que tudo funciona

---

## 🎯 Resultado Final Esperado

### Raiz Limpa
```
Quest4You_v1/
├── index.html
├── README.md
├── favicon.ico
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── vercel.json
├── admin/
├── assets/
├── css/
├── data/
├── docs/
├── i18n/
├── js/
├── pages/
├── scripts/           (NOVO - PowerShell)
└── _ARCHIVE/          (NOVO - Backups)
```

### Benefícios
- ✅ Raiz mais limpa e profissional
- ✅ Scripts organizados por tipo
- ✅ Documentação categorizada
- ✅ Backups separados mas acessíveis
- ✅ Mais fácil para novos developers

---

*Documento criado: 2026-02-08 01:11*
