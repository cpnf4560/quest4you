# 🚀 Configurar Quest4You no Vercel (via GitHub)

## ✅ Passo 1: Importar Projeto do GitHub para Vercel

### 1. Aceder ao Vercel Dashboard
- Ir para: https://vercel.com/dashboard
- Deves estar logado com a tua conta GitHub

### 2. Importar Novo Projeto
1. Clicar em **"Add New..."** → **"Project"**
2. Selecionar **"Import Git Repository"**
3. Se não vês o repositório Quest4You_v1:
   - Clicar em **"Adjust GitHub App Permissions"**
   - Autorizar o Vercel a aceder aos teus repositórios
   - Voltar ao Vercel e dar refresh

### 3. Configurar o Projeto

Quando aparecer o teu repositório `Quest4You_v1`:
1. Clicar em **"Import"**
2. **Configure Project:**
   - **Project Name:** `quest4you`
   - **Framework Preset:** `Other` (deixar em branco)
   - **Root Directory:** `./` (deixar como está)
   - **Build Command:** deixar vazio
   - **Output Directory:** deixar vazio
   - **Install Command:** deixar vazio

3. Clicar em **"Deploy"**

### 4. Aguardar Deploy
- O Vercel vai fazer o deploy (1-2 minutos)
- Quando terminar, vai dar-te um URL tipo: `https://quest4you-xyz123.vercel.app`

---

## ✅ Passo 2: Adicionar Domínio quest4you.pt

### 1. No Projeto Vercel
1. Ir para o projeto que acabaste de criar
2. Clicar em **"Settings"** (tab superior)
3. Clicar em **"Domains"** (menu lateral)

### 2. Adicionar Domínio
1. Clicar em **"Add"**
2. Escrever: `quest4you.pt`
3. Clicar em **"Add"**

### 3. Adicionar www (opcional mas recomendado)
1. Clicar novamente em **"Add"**
2. Escrever: `www.quest4you.pt`
3. Clicar em **"Add"**
4. Quando perguntar "Redirect to...", escolher: `quest4you.pt`

---

## ✅ Passo 3: Verificar DNS (Amen)

O Vercel vai mostrar os registos DNS necessários. **Anota-os!**

### Configuração DNS Necessária:

#### Para quest4you.pt:
- **Tipo:** A Record
- **Nome:** @ (ou deixar vazio)
- **Valor:** `76.76.21.21`

#### Para www.quest4you.pt:
- **Tipo:** CNAME
- **Nome:** www
- **Valor:** `cname.vercel-dns.com`

### Como Configurar na Amen:

1. **Login Amen:** https://www.amen.pt
2. **Ir para:** Os Meus Domínios → quest4you.pt
3. **Clicar em:** Gestão DNS ou Zona DNS

#### Adicionar/Editar Registo A:
- **Tipo:** A
- **Host/Nome:** @ (ou deixar vazio, ou quest4you.pt)
- **Valor/Destino:** `76.76.21.21`
- **TTL:** 3600 (ou deixar padrão)

#### Adicionar Registo CNAME para www:
- **Tipo:** CNAME
- **Host/Nome:** www
- **Valor/Destino:** `cname.vercel-dns.com`
- **TTL:** 3600 (ou deixar padrão)

4. **Guardar alterações**

⚠️ **IMPORTANTE:** As alterações DNS podem demorar até 48 horas, mas normalmente levam 10-30 minutos.

---

## ✅ Passo 4: Verificar se Está a Funcionar

### Depois de configurar o DNS (aguardar 15-30 min):

1. **Testar domínio:**
   ```
   https://quest4you.pt
   ```

2. **Verificar SSL:**
   - O site deve abrir com **HTTPS** (cadeado verde)
   - O Vercel gera automaticamente o certificado SSL

3. **Testar funcionalidades:**
   - ✅ Página inicial carrega
   - ✅ Login funciona (Firebase)
   - ✅ Questionários funcionam
   - ✅ Smart Match funciona

---

## 🔧 Troubleshooting

### O site não abre em quest4you.pt:
1. Verificar se o DNS está correto na Amen
2. Aguardar mais tempo (até 48h para propagação)
3. Limpar cache do browser (Ctrl+Shift+Delete)
4. Testar em modo anónimo/privado

### Erro "DNS Configuration Invalid":
- Verificar que o IP é `76.76.21.21`
- Verificar que o CNAME é `cname.vercel-dns.com`
- Aguardar propagação DNS

### Site abre mas dá erro 404:
- Verificar que o `index.html` está na raiz do projeto
- Verificar que o deploy foi bem-sucedido no Vercel

### Firebase não funciona:
- Verificar que o domínio está autorizado no Firebase Console
- Ir para: https://console.firebase.google.com
- Projeto: quest4couple
- Authentication → Settings → Authorized domains
- Adicionar: `quest4you.pt` e `www.quest4you.pt`

---

## 📱 Comandos Úteis (Opcional - via CLI)

Se quiseres usar a CLI do Vercel:

```powershell
# Instalar Vercel CLI (se não tiveres)
npm install -g vercel

# Navegar para o projeto
cd "G:\O meu disco\Formação JAVA - Projetos\Quest4You_v1"

# Login (vai abrir browser)
vercel login

# Linkar ao projeto existente
vercel link

# Deploy produção
vercel --prod
```

---

## ✅ Checklist Final

- [ ] Projeto importado do GitHub para Vercel
- [ ] Deploy bem-sucedido
- [ ] Domínio quest4you.pt adicionado no Vercel
- [ ] DNS configurado na Amen (A record + CNAME)
- [ ] Aguardar propagação DNS (15-30 min)
- [ ] Site abre em https://quest4you.pt
- [ ] Certificado SSL ativo (HTTPS)
- [ ] Domínios autorizados no Firebase Console
- [ ] Login funciona
- [ ] Questionários funcionam
- [ ] Smart Match funciona

---

## 🎉 Sucesso!

Quando tudo estiver a funcionar:
- **Site principal:** https://quest4you.pt
- **Painel Vercel:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com

---

## 📞 Preciso de Informações

Para te ajudar melhor, preciso de saber:

1. **Qual é o teu username do GitHub?**
2. **O repositório está público ou privado?**
3. **Já conseguiste importar o projeto no Vercel?**
4. **Tens acesso ao painel da Amen para configurar DNS?**

Responde a estas perguntas e posso dar-te ajuda mais específica! 🚀
