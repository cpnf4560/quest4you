# 🔐 Configuração do Firebase App Check - Quest4You

> **Data:** Abril 2026  
> **Projeto:** quest4couple

---

## 📋 Passos para Configurar

### 1️⃣ Aceder ao Firebase Console

1. Vai a: **https://console.firebase.google.com/**
2. Seleciona o projeto **quest4couple**

---

### 2️⃣ Ativar App Check

1. No menu lateral, clica em **App Check** (pode estar em "Build" ou "Protect")
2. Clica no separador **Apps**
3. Seleciona a tua app Web: `1:27375862534:web:40039fa60931212e701487`
4. Clica em **Get Started** ou **Register**

---

### 3️⃣ Configurar reCAPTCHA v3

1. Seleciona **reCAPTCHA v3** como provider
2. **Se ainda não tens uma chave reCAPTCHA:**
   - Vai a: **https://www.google.com/recaptcha/admin**
   - Clica em **+** (criar novo)
   - Preenche:
     - **Label:** Quest4You
     - **reCAPTCHA type:** reCAPTCHA v3
     - **Domains:** 
       - `quest4you.pt`
       - `www.quest4you.pt`
       - `quest4couple.web.app`
       - `quest4couple.firebaseapp.com`
       - `localhost` (para desenvolvimento)
   - Clica em **Submit**
   - **Copia a Site Key** (começa com `6L...`)

3. **De volta ao Firebase Console:**
   - Cola a **Site Key** do reCAPTCHA v3
   - Clica em **Save**

---

### 4️⃣ Atualizar o Código

Depois de obteres a **Site Key**, atualiza o ficheiro `js/firebase-appcheck.js`:

```javascript
// Linha ~41 - Substituir o placeholder pela chave real:
appCheck.activate(
  '6Lc_TUA_CHAVE_AQUI_', // ← Colar aqui a Site Key
  true
);
```

---

### 5️⃣ Testar

1. **Localmente:** 
   - Abre a consola do browser (F12)
   - Deves ver: `🔧 App Check em modo DEBUG (localhost)`
   - Copia o debug token que aparece
   - No Firebase Console > App Check > Debug tokens, adiciona esse token

2. **Em produção:**
   - Deves ver: `✅ Firebase App Check ativado`
   - Testa fazer login e operações no Firestore

---

### 6️⃣ Ativar Enforcement (Opcional - Depois de Testar!)

⚠️ **ATENÇÃO:** Só fazer isto depois de confirmar que tudo funciona!

1. No Firebase Console > App Check
2. Vai ao separador **APIs**
3. Para cada serviço (Firestore, Auth, etc.):
   - Clica no serviço
   - Clica em **Enforce**

Isto bloqueia todos os pedidos sem App Check válido.

---

## 🔑 Informações do Projeto

| Campo | Valor |
|-------|-------|
| Project ID | `quest4couple` |
| Web App ID | `1:27375862534:web:40039fa60931212e701487` |
| Auth Domain | `quest4couple.firebaseapp.com` |
| Domínio Produção | `quest4you.pt` |

---

## 📝 Checklist

- [x] Criar chave reCAPTCHA v3 em google.com/recaptcha/admin
- [x] Registar app no Firebase App Check
- [x] Atualizar `js/firebase-appcheck.js` com a Site Key (`6LdmnKEsAAAAAP-KXVbanvntl0zvQu0SnojeYnb_`)
- [x] Testar em localhost com debug token (`bfce3200-1820-47f1-8ba3-5b008cb5b904`)
- [x] Testar em produção ✅
- [ ] (Opcional) Ativar enforcement

---

## ❓ Problemas Comuns

### "App Check token is invalid"
- Verifica se a Site Key está correta
- Verifica se o domínio está registado no reCAPTCHA

### "reCAPTCHA not loaded"
- Verifica se não tens bloqueadores a bloquear google.com/recaptcha

### Debug token não funciona
- Certifica-te que adicionaste o token no Firebase Console > App Check > Debug tokens

---

## 🔗 Links Úteis

- [Firebase App Check Docs](https://firebase.google.com/docs/app-check)
- [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [Firebase Console](https://console.firebase.google.com/project/quest4couple)
