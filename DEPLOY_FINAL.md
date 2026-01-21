#  Guia de Deploy Quest4You - quest4you.pt

##  Status Atual
-  Repositório GitHub criado e configurado
-  Código commitado e enviado (push)
-  Paths atualizados para domínio raiz
-  Pasta duplicada removida

##  Próximos Passos

### 1 Deploy no Vercel

#### Opção A: Via CLI (Recomendado)
`powershell
# No terminal PowerShell, na pasta do projeto:
npx vercel

# Responder às perguntas:
# ? Set up and deploy "Quest4You_v1"? [Y/n] Y
# ? Which scope? [Sua conta]
# ? Link to existing project? [N]
# ? What's your project's name? quest4you
# ? In which directory is your code located? ./
# ? Want to override the settings? [N]

# Após deploy de teste, fazer deploy de produção:
npx vercel --prod
`

#### Opção B: Via Dashboard Vercel
1. Aceder a https://vercel.com/new
2. Clicar em "Import Git Repository"
3. Selecionar o repositório: cpnf4560/quest4you
4. Configurações:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (deixar vazio)
   - **Output Directory**: (deixar vazio)
5. Clicar em "Deploy"

### 2 Configurar DNS no Amen

**IMPORTANTE**: Aguardar o deploy do Vercel terminar primeiro!

1. Aceder ao painel Amen: https://www.amen.pt
2. Login com as credenciais
3. Ir para: **Domínios**  **quest4you.pt**  **Zona DNS**

#### Registos DNS a Adicionar:
`
Tipo: A
Nome: @ (ou deixar vazio)
Valor: 76.76.21.21
TTL: 3600

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com.
TTL: 3600
`

#### Registos DNS a Remover (se existirem):
- Todos os registos MX (email)
- Registos TXT desnecessários
- CNAME antigos
- Manter apenas: A, CNAME (www), e SOA/NS (não mexer)

 **Tempo de propagação**: 5-60 minutos

### 3 Adicionar Domínio no Vercel

1. Após DNS configurado no Amen, ir ao Dashboard Vercel
2. Projeto quest4you  **Settings**  **Domains**
3. Clicar em "Add Domain"
4. Adicionar: quest4you.pt
5. Vercel vai verificar configuração DNS
6. Adicionar também: www.quest4you.pt (opcional)

 **Geração SSL**: 1-5 minutos após DNS propagado

### 4 Verificação e Testes

#### Verificar DNS:
`powershell
# Verificar se DNS propagou:
nslookup quest4you.pt
# Deve retornar: 76.76.21.21

# Verificar CNAME www:
nslookup www.quest4you.pt
# Deve retornar: cname.vercel-dns.com
`

#### Testes no Site:
1.  Abrir: https://quest4you.pt
2.  Verificar logo e tema (cores rainbow)
3.  Testar navegação entre páginas
4.  Testar cada um dos 5 quizzes:
   - Quiz Vanilla (50 perguntas)
   - Orientação Sexual (50 perguntas)
   - Cuckold (50 perguntas)
   - Swing (50 perguntas)
   - Kinks (50 perguntas)
5.  Testar Autenticação:
   - Registar nova conta
   - Login
   - Logout
6.  Testar Perfil:
   - Editar perfil
   - Guardar alterações
   - Sync com Firebase
7.  Testar Smart Match:
   - Ver perfis públicos
   - Filtros de compatibilidade
   - Detalhes de perfil
   - Cálculo de match

##  Firebase

### Status Firebase
 Firebase já configurado no projeto Quest4Couple
 Coleções Quest4You criadas:
- quest4you_users
- quest4you_results
- quest4you_public

 Firestore Rules já deployadas

**Não é necessário alterar nada no Firebase!**

##  Notas Importantes

### Paths Atualizados
Todos os paths foram convertidos de /quest4you/ para paths relativos:
- index.html: usa ./css/, ./js/, ./assets/
- pages/*.html: usa ../css/, ../js/, ../assets/
- js/app.js: usa ./pages/
- js/quiz.js: usa ../data/

### Estrutura do Projeto
`
Quest4You_v1/
 index.html           Página inicial
 pages/               Páginas da app
    quiz.html
    auth.html
    profile.html
    smart-match.html
 css/                 Estilos
 js/                  Scripts
 data/quizzes/        5 quizzes JSON
 assets/              Imagens/logos
 vercel.json          Config Vercel
 firebase.json        Config Firebase
`

##  Troubleshooting

### Problema: DNS não propaga
**Solução**: 
- Aguardar até 60 minutos
- Verificar se valores DNS estão corretos no Amen
- Usar: https://dnschecker.org/#A/quest4you.pt

### Problema: 404 nos assets
**Solução**: 
- Verificar se paths foram atualizados corretamente
- Ver console do browser (F12) para erros

### Problema: Firebase não funciona
**Solução**: 
- Verificar js/firebase-config.js
- Ver console do browser para erros de autenticação

### Problema: Smart Match sem resultados
**Solução**: 
- Criar perfis públicos primeiro
- Completar pelo menos 1 quiz
- Publicar perfil na página Profile

##  Suporte

- GitHub: https://github.com/cpnf4560/quest4you
- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Console: https://console.firebase.google.com

---
**Última atualização**: 21/01/2026 22:55
