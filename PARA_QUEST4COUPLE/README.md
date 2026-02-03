# Ficheiros de Artigos para Quest4Couple

Este directório contém os ficheiros necessários para adicionar a secção de Artigos ao Quest4Couple.

## Ficheiros

1. **`artigos.html`** → Copiar para `pages/artigos.html`
2. **`artigos.js`** → Copiar para `js/artigos.js`
3. **`articlesData.js`** → Copiar para `js/articlesData.js`
4. **`artigos.css`** → Copiar para `css/artigos.css`

## Instruções de Instalação

### 1. Copiar ficheiros
```bash
# Copiar para o Quest4Couple_v2_free
cp artigos.html  G:\O meu disco\Formação JAVA - Projetos\Quest4Couple_v2_free\pages\
cp artigos.js    G:\O meu disco\Formação JAVA - Projetos\Quest4Couple_v2_free\js\
cp articlesData.js G:\O meu disco\Formação JAVA - Projetos\Quest4Couple_v2_free\js\
cp artigos.css   G:\O meu disco\Formação JAVA - Projetos\Quest4Couple_v2_free\css\
```

### 2. Actualizar navegação
Adicionar link para artigos no menu principal do Quest4Couple (header de cada página):
```html
<a href="artigos.html" class="nav-link">📚 Artigos</a>
```

### 3. Ajustar paths de assets
Se os paths dos assets (logo, favicon) forem diferentes no Quest4Couple, ajustar em `artigos.html`:
- `../assets/quest4couple_logo.png`
- `../favicon.ico`
- `../css/main.css`

## Conteúdo dos Artigos

- **Dinâmicas Cuckold/Cuckquean** - Guia completo sobre diferentes dinâmicas
- **Brinquedos Sexuais para Casais** - Guia de iniciante
- **Tasklists Sexuais** - Aventuras planeadas
- **Turismo Adulto** - Destinos para casais liberais
- **Praias Nudistas em Portugal** - Guia completo
- **Massagem Tântrica** - Yoni e Lingam
- **Anorgasmia** - Quando o orgasmo não vem
- **E muitos mais...**

## Notas

- O Quest4You agora **não tem mais artigos** (foram removidos)
- O Quest4You mantém apenas: **Fórum**, **Chat** e **Mensagens**
- Os artigos são completamente estáticos (não precisam de Firebase)
