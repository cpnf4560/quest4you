# 🔥 Configuração Firebase - Quest4You

## ⚠️ IMPORTANTE: Autorizar Domínios no Firebase

Para o login funcionar em **quest4you.pt**, TENS que autorizar o domínio no Firebase Console.

---

## 📝 Passos para Autorizar Domínio

### 1. Aceder ao Firebase Console
- **URL:** https://console.firebase.google.com
- **Projeto:** quest4couple

### 2. Ir para Authentication
1. No menu lateral, clicar em **"Authentication"**
2. Clicar no tab **"Settings"** (no topo)
3. Scroll down até **"Authorized domains"**

### 3. Adicionar Domínios
Clicar em **"Add domain"** e adicionar:

1. **quest4you.pt**
2. **www.quest4you.pt**
3. Se estiveres a testar, adiciona também:
   - **quest4you.vercel.app** (URL do Vercel)
   - **localhost** (para desenvolvimento local)

### 4. Salvar
Clicar em **"Add"** para cada domínio.

---

## 🔐 Configuração Atual do Firebase

```javascript
Project ID: quest4couple
Auth Domain: quest4couple.firebaseapp.com
```

### Serviços Ativos:
- ✅ Authentication (Email/Password + Google)
- ✅ Firestore Database
- ✅ Storage (para avatares)

---

## 🌐 Domínios Autorizados Necessários

Adicionar estes domínios ao Firebase:

| Domínio | Tipo | Necessário |
|---------|------|-----------|
| `quest4you.pt` | Produção | ✅ **SIM** |
| `www.quest4you.pt` | Produção | ✅ **SIM** |
| `quest4you.vercel.app` | Vercel | ⚠️ Recomendado |
| `localhost` | Desenvolvimento | 🔧 Opcional |

---

## 🚨 Sintomas de Domínio Não Autorizado

Se o domínio NÃO estiver autorizado, vais ver erros tipo:

```
Firebase: This domain is not authorized for OAuth operations.
auth/unauthorized-domain
```

Ou na consola do browser:
```
Error: auth/unauthorized-domain: This domain (quest4you.pt) is not authorized 
to run this operation. Add it to the OAuth redirect domains list in the 
Firebase console -> Auth section -> Sign in method tab.
```

---

## ✅ Como Verificar se Está Configurado

1. Abrir o site: https://quest4you.pt
2. Tentar fazer login
3. Se aparecer o popup de login do Google → **✅ Está OK!**
4. Se der erro de "unauthorized domain" → **❌ Adicionar domínio!**

---

## 🔧 Troubleshooting

### Login não funciona:
1. Verificar que o domínio está na lista de "Authorized domains"
2. Aguardar 1-2 minutos após adicionar (Firebase precisa propagar)
3. Limpar cache do browser (Ctrl+Shift+Delete)
4. Testar em modo anónimo/privado

### Popup de login não abre:
1. Verificar se os popups estão bloqueados no browser
2. Desativar extensões de bloqueio (AdBlock, etc.)
3. Permitir popups para quest4you.pt

### Erro CORS:
- Verificar que o domínio está exatamente igual (com/sem www)
- Adicionar AMBOS: `quest4you.pt` E `www.quest4you.pt`

---

## 📞 Acesso ao Firebase Console

**Quem tem acesso?**
- A pessoa que criou o projeto "quest4couple"
- Contas adicionadas como colaboradores

**Como adicionar colaboradores:**
1. Firebase Console → Project Settings (engrenagem)
2. Tab "Users and permissions"
3. Clicar "Add member"
4. Introduzir email
5. Escolher role (Editor ou Owner)

---

## 🔑 Informação Sensível

⚠️ **Nunca partilhar em repositórios públicos:**
- API Keys (já está no código, mas OK para Firebase Web)
- Service Account Keys (JSON)
- Credenciais de administrador

ℹ️ **É seguro no repositório público:**
- Firebase Config (apiKey, authDomain, etc.) - estes são para cliente
- Estrutura do projeto
- Código JavaScript

---

## 📱 URLs Úteis

- **Firebase Console:** https://console.firebase.google.com
- **Projeto Quest4Couple:** https://console.firebase.google.com/project/quest4couple
- **Authentication Settings:** https://console.firebase.google.com/project/quest4couple/authentication/settings
- **Firestore Database:** https://console.firebase.google.com/project/quest4couple/firestore

---

## ✅ Checklist Firebase

- [ ] Acesso ao Firebase Console
- [ ] Projeto "quest4couple" visível
- [ ] Authentication ativado
- [ ] Domínio quest4you.pt adicionado em "Authorized domains"
- [ ] Domínio www.quest4you.pt adicionado
- [ ] Login funciona no site
- [ ] Dados salvam no Firestore

---

## 🎉 Quando Tudo Estiver OK

Testa estas funcionalidades:

1. **Login com Email:**
   - Registar nova conta
   - Fazer login
   - Fazer logout

2. **Login com Google:**
   - Clicar "Entrar com Google"
   - Selecionar conta
   - Autorizar
   - Login bem-sucedido

3. **Perfil:**
   - Editar perfil
   - Upload de avatar
   - Dados salvam

4. **Questionários:**
   - Responder questionário
   - Ver resultados
   - Resultados salvam

5. **Smart Match:**
   - Ver matches
   - Calcular compatibilidade

Se tudo isto funcionar → **🎉 Firebase OK!**

---

## 📞 Preciso de Ajuda?

Se não tens acesso ao Firebase Console:
- Contactar quem criou o projeto "quest4couple"
- OU criar novo projeto Firebase e atualizar configuração

Para criar novo projeto Firebase:
1. https://console.firebase.google.com
2. "Add project"
3. Nome: Quest4You
4. Ativar Analytics (opcional)
5. Ativar Authentication (Email + Google)
6. Ativar Firestore
7. Copiar configuração para `js/firebase-config.js`
