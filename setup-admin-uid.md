# 🔧 Configuração do Admin UID

## Como obter o UID do Admin

Para o sistema de "Admin como amigo de todos" funcionar corretamente, precisas de configurar o UID real do admin no ficheiro `js/config.js`.

### Passos:

1. **Acede à Firebase Console:**
   - https://console.firebase.google.com/project/quest4couple

2. **Vai a Authentication > Users:**
   - Procura pelo email: `info@quest4couple.pt`
   - Copia o **User UID** (coluna à esquerda)

3. **Atualiza o ficheiro `js/config.js`:**
   - Abre o ficheiro `js/config.js`
   - Substitui `'ADMIN_UID_HERE'` pelo UID real

```javascript
const ADMIN_CONFIG = {
  uid: 'AQUI_O_UID_REAL', // Ex: 'a1b2c3d4e5f6g7h8i9j0...'
  email: 'info@quest4couple.pt',
  // ... resto da configuração
};
```

4. **Faz commit e deploy:**
```bash
git add js/config.js
git commit -m "Configurar UID real do admin"
git push
```

## ⚠️ Nota Importante

Se a conta `info@quest4couple.pt` ainda não existe no Firebase Auth:
1. Cria a conta primeiro (via sign up normal ou Firebase Console)
2. Anota o UID gerado
3. Configura o UID no `config.js`

## 🔒 Segurança

O UID do admin é público e pode estar no código - não é um segredo de segurança.
A segurança é garantida pelas regras do Firestore que verificam a autenticação.

---

**Depois de configurar o UID, o admin aparecerá automaticamente:**
- Na lista de amigos de todos os utilizadores
- Com um card especial (badge "🎯 Equipa")
- Com perfil personalizado (feedback, sugestões, bugs, denúncias)
- Mensagem de boas-vindas automática no chat
