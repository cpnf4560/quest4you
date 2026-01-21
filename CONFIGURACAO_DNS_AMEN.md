# 🌐 Configuração DNS - quest4you.pt na Amen

## 📋 Passo a Passo Completo

### 1️⃣ Deploy no Vercel (Fazer Primeiro)

Abrir PowerShell e executar:

```powershell
cd "G:\O meu disco\Formação JAVA - Projetos\Quest4You_v1"

# Deploy para Vercel
npx vercel
```

**Responder às perguntas:**
- `Set up and deploy`? → **Y** (Yes)
- `Which scope do you want to deploy to?` → Escolhe a tua conta
- `Link to existing project?` → **N** (No)
- `What's your project's name?` → **quest4you**
- `In which directory is your code located?` → **./** (Enter para confirmar)

Depois fazer deploy de produção:
```powershell
npx vercel --prod
```

**Copia o URL que aparece** (algo como: `quest4you-xxxxx.vercel.app`)

---

## 2️⃣ Configurar DNS na Amen

### Aceder à Gestão de DNS

1. Fazer login em: https://www.amen.pt
2. Ir para **Os Meus Domínios** ou **Gestão de Domínios**
3. Selecionar **quest4you.pt**
4. Clicar em **Gestão DNS** ou **DNS/Redirecionamento**

---

### Opção A: Configuração Simples (CNAME - Recomendado)

#### ✅ Adicionar Registos DNS:

**1. Registo A (Raiz do domínio):**
```
Tipo:     A
Nome:     @ (ou deixar vazio)
Valor:    76.76.21.21
TTL:      3600 (ou automático)
```

**2. Registo CNAME (Subdomínio www):**
```
Tipo:     CNAME
Nome:     www
Valor:    cname.vercel-dns.com
TTL:      3600 (ou automático)
```

---

### Opção B: Nameservers Vercel (Mais Avançado)

Se preferires usar os nameservers do Vercel:

1. **No painel Vercel:**
   - Ir para **Settings** → **Domains**
   - Adicionar `quest4you.pt`
   - Copiar os nameservers que aparecem

2. **Na Amen:**
   - Mudar nameservers para:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```

---

## 3️⃣ Configurar Domínio no Vercel

1. Ir para: https://vercel.com/dashboard
2. Selecionar projeto **quest4you**
3. Ir para **Settings** → **Domains**
4. Clicar em **Add Domain**
5. Introduzir: `quest4you.pt`
6. Introduzir também: `www.quest4you.pt`
7. Clicar em **Add**

O Vercel irá:
- ✅ Verificar a configuração DNS
- ✅ Gerar certificado SSL automático (HTTPS)
- ✅ Redirecionar www → quest4you.pt

---

## 4️⃣ Verificação

### Testar Propagação DNS (5-60 minutos):

```powershell
# Testar registo A
nslookup quest4you.pt

# Testar registo CNAME
nslookup www.quest4you.pt
```

### Aceder ao Site:

- 🌐 https://quest4you.pt
- 🌐 https://www.quest4you.pt (redirecionado)

---

## 📝 Notas Importantes

### ⏰ Tempo de Propagação
- **DNS Amen**: 5-60 minutos normalmente
- **Global**: Até 24-48h (raro)

### 🔒 SSL/HTTPS
- Vercel gera automaticamente certificado Let's Encrypt
- Ativa em 2-5 minutos após DNS configurado
- Renovação automática a cada 90 dias

### 🔄 Redirecionamentos Automáticos
- `http://` → `https://` (automático)
- `www.quest4you.pt` → `quest4you.pt` (configurável no Vercel)

---

## 🛠️ Resolução de Problemas

### DNS não propaga?
1. Verifica se os registos DNS estão corretos na Amen
2. Limpa cache DNS local:
   ```powershell
   ipconfig /flushdns
   ```
3. Testa com: https://dnschecker.org

### Certificado SSL não ativa?
1. Aguarda 5-10 minutos
2. Verifica se DNS está correto
3. No Vercel: **Domains** → **Renew Certificate**

### Site não carrega?
1. Verifica se o deploy foi bem sucedido no Vercel
2. Testa o URL temporário do Vercel (quest4you-xxxxx.vercel.app)
3. Se funcionar no temporário, problema é DNS

---

## 📊 Configuração Recomendada Final

| Tipo   | Nome | Valor                 | TTL  |
|--------|------|-----------------------|------|
| A      | @    | 76.76.21.21          | 3600 |
| CNAME  | www  | cname.vercel-dns.com | 3600 |

---

## ✅ Checklist Final

- [ ] Projeto Quest4You criado em: `G:\O meu disco\Formação JAVA - Projetos\Quest4You_v1`
- [ ] Deploy feito no Vercel com `npx vercel --prod`
- [ ] Domínio `quest4you.pt` adicionado no painel Vercel
- [ ] Registos DNS configurados na Amen
- [ ] DNS a propagar (verificar com `nslookup`)
- [ ] SSL/HTTPS ativo no Vercel
- [ ] Site acessível em https://quest4you.pt ✨

---

## 🎯 Resultado Final

**Quest4You** será acessível em:
- ✅ https://quest4you.pt (domínio principal)
- ✅ https://www.quest4you.pt (redirecionado)
- 🔒 HTTPS automático
- ⚡ CDN global do Vercel
- 🌈 Tema rainbow próprio
- 🎨 5 questionários completos

**Quest4Couple** continua em:
- ✅ https://quest4couple.pt
- 📦 Projetos completamente separados
- 🔥 Firebase partilhado (coleções diferentes)

---

## 📞 Suporte

**Amen**: https://www.amen.pt/suporte  
**Vercel**: https://vercel.com/support  
**DNS Checker**: https://dnschecker.org
