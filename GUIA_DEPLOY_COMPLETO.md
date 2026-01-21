# 🚀 Guia Completo - Deploy Quest4You

## 📋 Passo a Passo COMPLETO

---

## 1️⃣ **Aceder ao Vercel (Primeiro)**

### Descobrir/Criar Conta Vercel:

1. **Ir para**: https://vercel.com/login

2. **Tentar fazer login com:**
   - 📧 **Email** (o teu email principal)
   - 🐙 **GitHub** (se tiveres conta GitHub)
   - 🔵 **GitLab** (se tiveres conta GitLab)
   - 🔴 **Google** (se usares Gmail)

3. **Se não conseguires aceder:**
   - Ir para: https://vercel.com/signup
   - Registar com email ou GitHub
   - Verificar email
   - ✅ Conta criada!

---

## 2️⃣ **Fazer Deploy via CLI**

### Abrir PowerShell e executar:

```powershell
cd "G:\O meu disco\Formação JAVA - Projetos\Quest4You_v1"
npx vercel
```

### O que vai acontecer:

1. **Browser abre automaticamente** 🌐
2. **Faz login no Vercel** (usar o método escolhido acima)
3. **Volta ao PowerShell** e responde:

```
? Set up and deploy? › Y

? Which scope do you want to deploy to? › 
  (escolhe a tua conta)

? Link to existing project? › N

? What's your project's name? › quest4you

? In which directory is your code located? › ./
  (carregar ENTER)
```

4. **Aguarda o deploy** (2-3 minutos)

5. **Copia o URL** que aparece (ex: `https://quest4you-abc123.vercel.app`)

---

## 3️⃣ **Deploy Produção**

Depois do primeiro deploy, fazer deploy de produção:

```powershell
npx vercel --prod
```

Aguarda 2-3 minutos e copia o URL final.

---

## 4️⃣ **Adicionar Domínio no Vercel**

### No Painel Vercel:

1. Ir para: https://vercel.com/dashboard
2. Clicar no projeto **quest4you**
3. Ir para **Settings** → **Domains**
4. Clicar em **Add Domain**
5. Introduzir: `quest4you.pt`
6. Clicar **Add**

O Vercel vai:
- Verificar se o DNS está configurado
- Gerar certificado SSL
- Ativar HTTPS

---

## 5️⃣ **Configurar DNS na Amen**

### Aceder à Amen:

1. Login: https://www.amen.pt
2. **Os Meus Domínios** → `quest4you.pt`
3. **Gestão DNS**

### Adicionar Registo A:

| Campo | Valor |
|-------|-------|
| **Nome** | `quest4you.pt` ou `@` |
| **Tipo** | `A` |
| **Valor** | `76.76.21.21` |
| **TTL** | `900` |

### ⚠️ Importante:
- **Apagar** todos os outros registos (MX, CNAME, TXT, etc.)
- Deixar **apenas o registo A**

---

## 6️⃣ **Verificar Propagação DNS**

### No PowerShell:

```powershell
nslookup quest4you.pt
```

**Deve retornar**: `76.76.21.21`

Se ainda não aparecer, aguarda 5-30 minutos e tenta novamente.

---

## 7️⃣ **Testar Site**

### Abrir no browser:

- 🌐 https://quest4you.pt

**Espera ver:**
- ✅ Certificado SSL válido (cadeado verde)
- ✅ Homepage do Quest4You carregada
- ✅ Logo e cores rainbow
- ✅ 5 questionários disponíveis

---

## 🔧 **Resolução de Problemas**

### Problema 1: "Browser não abre ao correr npx vercel"

**Solução:**
```powershell
# Copiar o link que aparece no terminal
# Abrir manualmente no browser
# Fazer login
# Voltar ao terminal
```

### Problema 2: "DNS não propaga"

**Verificar:**
1. Registo A está correto na Amen? (`76.76.21.21`)
2. Apagaste os outros registos?
3. Aguardaste pelo menos 30 minutos?

**Limpar cache DNS:**
```powershell
ipconfig /flushdns
```

### Problema 3: "SSL não ativa no Vercel"

**Verificar:**
1. DNS está correto?
2. Domínio foi adicionado no Vercel?
3. Aguardou 5-10 minutos?

**Forçar renovação:**
- Vercel Dashboard → Domains → Renew Certificate

### Problema 4: "Site não carrega"

**Testar URL temporário:**
- Se `quest4you-abc123.vercel.app` funciona → problema é DNS
- Se não funciona → problema é código/deploy

---

## 📊 **Checklist Final**

- [ ] Conta Vercel criada/acedida
- [ ] Deploy feito com `npx vercel`
- [ ] Deploy produção com `npx vercel --prod`
- [ ] Domínio `quest4you.pt` adicionado no Vercel
- [ ] Registo A configurado na Amen (`76.76.21.21`)
- [ ] Outros registos DNS apagados
- [ ] DNS propagado (verificado com `nslookup`)
- [ ] SSL ativo no Vercel
- [ ] Site acessível em https://quest4you.pt ✨

---

## 🎯 **Resultado Final Esperado**

```
✅ quest4you.pt → Quest4You (domínio próprio)
✅ quest4couple.pt → Quest4Couple (domínio existente)

🔥 Firebase partilhado (coleções separadas)
🌐 Ambos no Vercel
🔒 SSL/HTTPS em ambos
```

---

## 📞 **Suporte**

- **Vercel**: https://vercel.com/support
- **Amen**: https://www.amen.pt/suporte
- **DNS Checker**: https://dnschecker.org

---

## 💡 **Dicas Finais**

1. **Guardar credenciais** Vercel num local seguro
2. **URL temporário** do Vercel sempre funciona (mesmo com DNS errado)
3. **DNS demora** - ter paciência
4. **SSL é automático** - não precisa configurar nada
5. **Logs no Vercel** → Dashboard → Deployments → Ver logs

---

**Boa sorte! 🚀**
