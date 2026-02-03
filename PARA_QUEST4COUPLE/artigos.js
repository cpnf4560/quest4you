/**
 * Quest4Couple - Artigos Page
 * Artigos educativos sobre intimidade e relacionamentos
 */

// ================================
// STATE
// ================================
let currentArticleCategory = 'all';
let currentArticleId = null;

// ================================
// INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  loadArticles();
});

function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterArticles(category);
    });
  });
}

function loadArticles() {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  
  const filtered = currentArticleCategory === 'all' 
    ? articlesData 
    : articlesData.filter(a => a.category === currentArticleCategory);
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-articles">
        <p>Nenhum artigo encontrado nesta categoria.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map(article => {
    const hasImage = article.image && article.image.length > 0;
    const imageStyle = hasImage ? `background-image: url('${article.image}')` : '';
    const imageClass = hasImage ? 'article-image has-image' : 'article-image';
    
    return `
    <div class="article-card" onclick="openArticle('${article.id}')">
      <div class="${imageClass}" style="${imageStyle}">
        ${hasImage ? `<span class="article-icon">${article.icon}</span>` : article.icon}
      </div>
      <div class="article-body">
        <span class="article-category">${article.categoryLabel}</span>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt}</p>
        <div class="article-meta">
          <span>📖 ${article.readTime} min</span>
        </div>
      </div>
    </div>
  `}).join('');
}

function filterArticles(category) {
  currentArticleCategory = category;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  
  loadArticles();
}

function openArticle(articleId) {
  const article = articlesData.find(a => a.id === articleId);
  if (!article) return;
  
  currentArticleId = articleId;
  
  document.getElementById('articleModalTitle').textContent = article.title;
  document.getElementById('articleModalBody').innerHTML = article.content;
  document.getElementById('articleModal').classList.add('active');
}

function closeArticleModal() {
  document.getElementById('articleModal').classList.remove('active');
  currentArticleId = null;
}

// ================================
// MODAL CLOSE ON CLICK OUTSIDE
// ================================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});
