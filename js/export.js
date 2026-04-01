/**
 * @fileoverview Sistema de exportação de resultados dos quizzes
 * Permite exportar em PDF e JSON
 * @version 1.0.0
 */

/**
 * @typedef {Object} ExportOptions
 * @property {'pdf'|'json'|'csv'} format - Formato de exportação
 * @property {boolean} includeAnswers - Incluir respostas detalhadas
 * @property {boolean} includeTimestamps - Incluir timestamps
 * @property {boolean} includeMetadata - Incluir metadados
 * @property {string} [filename] - Nome personalizado do ficheiro
 */

/**
 * Sistema de exportação de resultados
 */
const ExportManager = (function() {
    'use strict';

    /**
     * Opções padrão de exportação
     * @type {ExportOptions}
     */
    const defaultOptions = {
        format: 'json',
        includeAnswers: true,
        includeTimestamps: true,
        includeMetadata: true,
        filename: null
    };

    /**
     * Obtém os dados dos quizzes completados
     * @returns {Promise<Object[]>} Array de resultados
     */
    async function getQuizResults() {
        const results = [];
        
        // Tentar obter do Firebase primeiro
        if (window.firebaseAuth?.currentUser && window.firebaseDb) {
            try {
                const userId = window.firebaseAuth.currentUser.uid;
                const snapshot = await window.firebaseDb
                    .collection('users')
                    .doc(userId)
                    .collection('quizResults')
                    .orderBy('completedAt', 'desc')
                    .get();
                
                snapshot.forEach(doc => {
                    results.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                if (results.length > 0) {
                    return results;
                }
            } catch (error) {
                console.warn('Erro ao obter resultados do Firebase:', error);
            }
        }
        
        // Fallback para localStorage
        const localResults = localStorage.getItem('quizResults');
        if (localResults) {
            try {
                return JSON.parse(localResults);
            } catch (e) {
                console.warn('Erro ao parsear resultados locais:', e);
            }
        }
        
        // Tentar obter do objeto global
        if (window.quizResults && Array.isArray(window.quizResults)) {
            return window.quizResults;
        }
        
        return results;
    }

    /**
     * Obtém o perfil do utilizador
     * @returns {Promise<Object|null>} Perfil do utilizador
     */
    async function getUserProfile() {
        if (window.firebaseAuth?.currentUser && window.firebaseDb) {
            try {
                const userId = window.firebaseAuth.currentUser.uid;
                const doc = await window.firebaseDb
                    .collection('users')
                    .doc(userId)
                    .get();
                
                if (doc.exists) {
                    return doc.data();
                }
            } catch (error) {
                console.warn('Erro ao obter perfil:', error);
            }
        }
        
        // Fallback para localStorage
        const localProfile = localStorage.getItem('userProfile');
        if (localProfile) {
            try {
                return JSON.parse(localProfile);
            } catch (e) {
                console.warn('Erro ao parsear perfil local:', e);
            }
        }
        
        return null;
    }

    /**
     * Formata data para exibição
     * @param {Date|string|number} date - Data a formatar
     * @returns {string} Data formatada
     */
    function formatDate(date) {
        if (!date) return 'N/A';
        
        const d = date instanceof Date ? date : new Date(date);
        
        if (isNaN(d.getTime())) return 'N/A';
        
        return d.toLocaleDateString('pt-PT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Gera nome do ficheiro
     * @param {string} format - Formato do ficheiro
     * @param {string} [customName] - Nome personalizado
     * @returns {string} Nome do ficheiro
     */
    function generateFilename(format, customName = null) {
        if (customName) {
            return `${customName}.${format}`;
        }
        
        const date = new Date().toISOString().split('T')[0];
        return `quest4you_resultados_${date}.${format}`;
    }

    /**
     * Exporta dados em formato JSON
     * @param {Object} data - Dados a exportar
     * @param {ExportOptions} options - Opções de exportação
     */
    function exportJSON(data, options) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const filename = generateFilename('json', options.filename);
        
        downloadBlob(blob, filename);
        
        if (window.Toast) {
            Toast.success('Exportação JSON concluída!');
        }
    }

    /**
     * Exporta dados em formato CSV
     * @param {Object} data - Dados a exportar
     * @param {ExportOptions} options - Opções de exportação
     */
    function exportCSV(data, options) {
        const results = data.results || [];
        
        if (results.length === 0) {
            if (window.Toast) {
                Toast.warning('Não há resultados para exportar.');
            }
            return;
        }
        
        // Cabeçalhos CSV
        const headers = ['Quiz', 'Categoria', 'Pontuação', 'Data', 'Tags'];
        const rows = [headers.join(',')];
        
        // Dados
        results.forEach(result => {
            const row = [
                `"${result.quizId || 'N/A'}"`,
                `"${result.category || 'N/A'}"`,
                result.score || 0,
                `"${formatDate(result.completedAt)}"`,
                `"${(result.tags || []).join('; ')}"`
            ];
            rows.push(row.join(','));
        });
        
        const csvString = rows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8' });
        const filename = generateFilename('csv', options.filename);
        
        downloadBlob(blob, filename);
        
        if (window.Toast) {
            Toast.success('Exportação CSV concluída!');
        }
    }

    /**
     * Exporta dados em formato PDF
     * @param {Object} data - Dados a exportar
     * @param {ExportOptions} options - Opções de exportação
     */
    async function exportPDF(data, options) {
        // Verificar se jsPDF está disponível
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            // Carregar jsPDF dinamicamente
            try {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            } catch (error) {
                console.error('Erro ao carregar jsPDF:', error);
                // Fallback para HTML
                exportPDFasHTML(data, options);
                return;
            }
        }
        
        const { jsPDF } = window.jspdf || window;
        
        if (!jsPDF) {
            exportPDFasHTML(data, options);
            return;
        }
        
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;
        
        // Título
        doc.setFontSize(24);
        doc.setTextColor(139, 92, 246); // Roxo da marca
        doc.text('Quest4You', pageWidth / 2, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text('Relatório de Resultados', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Linha separadora
        doc.setDrawColor(139, 92, 246);
        doc.line(20, y, pageWidth - 20, y);
        y += 10;
        
        // Informações do utilizador
        if (data.profile && options.includeMetadata) {
            doc.setFontSize(12);
            doc.setTextColor(50);
            doc.text(`Utilizador: ${data.profile.displayName || 'Anónimo'}`, 20, y);
            y += 7;
            doc.text(`Data do relatório: ${formatDate(new Date())}`, 20, y);
            y += 15;
        }
        
        // Resumo
        doc.setFontSize(16);
        doc.setTextColor(139, 92, 246);
        doc.text('Resumo', 20, y);
        y += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(50);
        doc.text(`Total de quizzes completados: ${data.results?.length || 0}`, 25, y);
        y += 7;
        
        if (data.results && data.results.length > 0) {
            const avgScore = data.results.reduce((acc, r) => acc + (r.score || 0), 0) / data.results.length;
            doc.text(`Pontuação média: ${avgScore.toFixed(1)}%`, 25, y);
            y += 15;
        }
        
        // Resultados detalhados
        if (data.results && data.results.length > 0 && options.includeAnswers) {
            doc.setFontSize(16);
            doc.setTextColor(139, 92, 246);
            doc.text('Resultados por Quiz', 20, y);
            y += 10;
            
            data.results.forEach((result, index) => {
                // Verificar se precisa de nova página
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFontSize(12);
                doc.setTextColor(80);
                doc.text(`${index + 1}. ${result.quizId || 'Quiz'}`, 25, y);
                y += 6;
                
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`   Pontuação: ${result.score || 0}%`, 25, y);
                y += 5;
                
                if (result.category) {
                    doc.text(`   Categoria: ${result.category}`, 25, y);
                    y += 5;
                }
                
                if (options.includeTimestamps && result.completedAt) {
                    doc.text(`   Completado em: ${formatDate(result.completedAt)}`, 25, y);
                    y += 5;
                }
                
                y += 5;
            });
        }
        
        // Tags mais comuns
        if (data.stats?.topTags && data.stats.topTags.length > 0) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(16);
            doc.setTextColor(139, 92, 246);
            doc.text('Tags Mais Frequentes', 20, y);
            y += 10;
            
            doc.setFontSize(10);
            doc.setTextColor(80);
            data.stats.topTags.slice(0, 10).forEach(tag => {
                doc.text(`• ${tag.name}: ${tag.count}x`, 25, y);
                y += 5;
            });
        }
        
        // Rodapé
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Quest4You - Página ${i} de ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
        
        // Download
        const filename = generateFilename('pdf', options.filename);
        doc.save(filename);
        
        if (window.Toast) {
            Toast.success('Exportação PDF concluída!');
        }
    }

    /**
     * Exporta PDF como HTML (fallback)
     * @param {Object} data - Dados a exportar
     * @param {ExportOptions} options - Opções de exportação
     */
    function exportPDFasHTML(data, options) {
        const html = generateHTMLReport(data, options);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const filename = generateFilename('html', options.filename);
        
        downloadBlob(blob, filename);
        
        if (window.Toast) {
            Toast.info('PDF não disponível. Exportado como HTML.');
        }
    }

    /**
     * Gera relatório HTML
     * @param {Object} data - Dados a exportar
     * @param {ExportOptions} options - Opções de exportação
     * @returns {string} HTML do relatório
     */
    function generateHTMLReport(data, options) {
        const avgScore = data.results?.length > 0
            ? (data.results.reduce((acc, r) => acc + (r.score || 0), 0) / data.results.length).toFixed(1)
            : 0;

        return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quest4You - Relatório de Resultados</title>
    <style>
        :root {
            --primary: #8B5CF6;
            --primary-dark: #7C3AED;
            --text: #1F2937;
            --text-light: #6B7280;
            --bg: #F9FAFB;
            --card: #FFFFFF;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
            padding: 2rem;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 3px solid var(--primary);
        }
        
        h1 {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        h2 {
            color: var(--primary);
            font-size: 1.5rem;
            margin: 1.5rem 0 1rem;
        }
        
        .subtitle {
            color: var(--text-light);
            font-size: 1.1rem;
        }
        
        .card {
            background: var(--card);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            text-align: center;
            padding: 1rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        .stat-label {
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .result-item:last-child {
            border-bottom: none;
        }
        
        .result-name {
            font-weight: 500;
        }
        
        .result-score {
            background: var(--primary);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 500;
        }
        
        .result-date {
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .tag {
            background: #EDE9FE;
            color: var(--primary-dark);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
        }
        
        footer {
            text-align: center;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #E5E7EB;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        @media print {
            body {
                background: white;
                padding: 1rem;
            }
            
            .card {
                box-shadow: none;
                border: 1px solid #E5E7EB;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Quest4You</h1>
            <p class="subtitle">Relatório de Resultados</p>
            ${options.includeMetadata && data.profile ? `<p class="subtitle">${data.profile.displayName || 'Utilizador'}</p>` : ''}
        </header>
        
        <section class="stats-grid">
            <div class="card stat-card">
                <div class="stat-value">${data.results?.length || 0}</div>
                <div class="stat-label">Quizzes Completados</div>
            </div>
            <div class="card stat-card">
                <div class="stat-value">${avgScore}%</div>
                <div class="stat-label">Pontuação Média</div>
            </div>
            ${data.stats?.topTags ? `
            <div class="card stat-card">
                <div class="stat-value">${data.stats.topTags.length}</div>
                <div class="stat-label">Tags Únicas</div>
            </div>` : ''}
        </section>
        
        ${data.results && data.results.length > 0 && options.includeAnswers ? `
        <h2>Resultados Detalhados</h2>
        <div class="card">
            ${data.results.map(result => `
            <div class="result-item">
                <div>
                    <div class="result-name">${result.quizId || 'Quiz'}</div>
                    ${options.includeTimestamps && result.completedAt ? `
                    <div class="result-date">${formatDate(result.completedAt)}</div>` : ''}
                </div>
                <span class="result-score">${result.score || 0}%</span>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${data.stats?.topTags && data.stats.topTags.length > 0 ? `
        <h2>Tags Mais Frequentes</h2>
        <div class="card">
            <div class="tags-list">
                ${data.stats.topTags.slice(0, 15).map(tag => `
                <span class="tag">${tag.name} (${tag.count})</span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <footer>
            <p>Gerado em ${formatDate(new Date())}</p>
            <p>Quest4You - Descobre-te. Conecta-te.</p>
        </footer>
    </div>
</body>
</html>`;
    }

    /**
     * Carrega script externo
     * @param {string} src - URL do script
     * @returns {Promise<void>}
     */
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Faz download de um blob
     * @param {Blob} blob - Blob a fazer download
     * @param {string} filename - Nome do ficheiro
     */
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Calcula estatísticas dos resultados
     * @param {Object[]} results - Array de resultados
     * @returns {Object} Estatísticas calculadas
     */
    function calculateStats(results) {
        if (!results || results.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                topTags: [],
                categoryCounts: {}
            };
        }
        
        // Contagem de tags
        const tagCounts = {};
        const categoryCounts = {};
        
        results.forEach(result => {
            // Tags
            if (result.tags && Array.isArray(result.tags)) {
                result.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
            
            // Categorias
            if (result.category) {
                categoryCounts[result.category] = (categoryCounts[result.category] || 0) + 1;
            }
        });
        
        // Top tags ordenadas
        const topTags = Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        
        return {
            totalQuizzes: results.length,
            averageScore: results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length,
            topTags,
            categoryCounts
        };
    }

    /**
     * Exporta todos os dados
     * @param {ExportOptions} [options] - Opções de exportação
     */
    async function exportAll(options = {}) {
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            // Mostrar loading
            if (window.Toast) {
                Toast.info('A preparar exportação...');
            }
            
            // Obter dados
            const [results, profile] = await Promise.all([
                getQuizResults(),
                getUserProfile()
            ]);
            
            // Calcular estatísticas
            const stats = calculateStats(results);
            
            // Montar objeto de dados
            const exportData = {
                exportedAt: new Date().toISOString(),
                version: '2.1',
                profile: mergedOptions.includeMetadata ? profile : null,
                results: results,
                stats: stats
            };
            
            // Exportar no formato escolhido
            switch (mergedOptions.format) {
                case 'pdf':
                    await exportPDF(exportData, mergedOptions);
                    break;
                case 'csv':
                    exportCSV(exportData, mergedOptions);
                    break;
                case 'json':
                default:
                    exportJSON(exportData, mergedOptions);
                    break;
            }
            
        } catch (error) {
            console.error('Erro ao exportar:', error);
            if (window.Toast) {
                Toast.error('Erro ao exportar dados. Tenta novamente.');
            }
        }
    }

    /**
     * Mostra modal de exportação
     */
    function showExportModal() {
        // Remover modal existente
        const existingModal = document.getElementById('export-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'export-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content export-modal-content">
                <button class="modal-close" aria-label="Fechar">&times;</button>
                <h2>📤 Exportar Resultados</h2>
                <p class="modal-description">Escolhe o formato de exportação dos teus resultados.</p>
                
                <div class="export-options">
                    <div class="export-format-group">
                        <label class="export-format-option">
                            <input type="radio" name="export-format" value="pdf" checked>
                            <span class="format-icon">📄</span>
                            <span class="format-info">
                                <strong>PDF</strong>
                                <small>Relatório visual completo</small>
                            </span>
                        </label>
                        
                        <label class="export-format-option">
                            <input type="radio" name="export-format" value="json">
                            <span class="format-icon">📦</span>
                            <span class="format-info">
                                <strong>JSON</strong>
                                <small>Backup completo dos dados</small>
                            </span>
                        </label>
                        
                        <label class="export-format-option">
                            <input type="radio" name="export-format" value="csv">
                            <span class="format-icon">📊</span>
                            <span class="format-info">
                                <strong>CSV</strong>
                                <small>Para Excel/Google Sheets</small>
                            </span>
                        </label>
                    </div>
                    
                    <div class="export-checkboxes">
                        <label class="checkbox-option">
                            <input type="checkbox" id="export-answers" checked>
                            <span>Incluir respostas detalhadas</span>
                        </label>
                        
                        <label class="checkbox-option">
                            <input type="checkbox" id="export-timestamps" checked>
                            <span>Incluir datas</span>
                        </label>
                        
                        <label class="checkbox-option">
                            <input type="checkbox" id="export-metadata" checked>
                            <span>Incluir informações do perfil</span>
                        </label>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="export-cancel">Cancelar</button>
                    <button class="btn btn-primary" id="export-confirm">
                        <span class="btn-icon">📥</span>
                        Exportar
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.getElementById('export-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'export-modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 1rem;
                    animation: fadeIn 0.2s ease;
                }
                
                .export-modal-content {
                    background: var(--card-bg, #fff);
                    border-radius: 16px;
                    padding: 2rem;
                    max-width: 450px;
                    width: 100%;
                    position: relative;
                    animation: slideUp 0.3s ease;
                }
                
                .export-modal-content h2 {
                    margin: 0 0 0.5rem;
                    font-size: 1.5rem;
                }
                
                .modal-description {
                    color: var(--text-secondary, #6B7280);
                    margin-bottom: 1.5rem;
                }
                
                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-secondary, #6B7280);
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }
                
                .modal-close:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
                
                .export-format-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                
                .export-format-option {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    border: 2px solid var(--border-color, #E5E7EB);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .export-format-option:hover {
                    border-color: var(--primary, #8B5CF6);
                }
                
                .export-format-option:has(input:checked) {
                    border-color: var(--primary, #8B5CF6);
                    background: rgba(139, 92, 246, 0.1);
                }
                
                .export-format-option input[type="radio"] {
                    display: none;
                }
                
                .format-icon {
                    font-size: 1.5rem;
                }
                
                .format-info {
                    display: flex;
                    flex-direction: column;
                }
                
                .format-info small {
                    color: var(--text-secondary, #6B7280);
                    font-size: 0.85rem;
                }
                
                .export-checkboxes {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                
                .checkbox-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                }
                
                .checkbox-option input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--primary, #8B5CF6);
                }
                
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                }
                
                .modal-actions .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .btn-secondary {
                    background: var(--bg-secondary, #F3F4F6);
                    border: none;
                    color: var(--text, #1F2937);
                }
                
                .btn-primary {
                    background: var(--primary, #8B5CF6);
                    border: none;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: var(--primary-dark, #7C3AED);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeModal = () => modal.remove();
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('#export-cancel').addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        modal.querySelector('#export-confirm').addEventListener('click', () => {
            const format = modal.querySelector('input[name="export-format"]:checked').value;
            const includeAnswers = modal.querySelector('#export-answers').checked;
            const includeTimestamps = modal.querySelector('#export-timestamps').checked;
            const includeMetadata = modal.querySelector('#export-metadata').checked;
            
            closeModal();
            
            exportAll({
                format,
                includeAnswers,
                includeTimestamps,
                includeMetadata
            });
        });
        
        // Focar no modal
        modal.querySelector('.export-modal-content').focus();
    }

    // API pública
    return {
        exportAll,
        exportJSON: (options) => exportAll({ ...options, format: 'json' }),
        exportPDF: (options) => exportAll({ ...options, format: 'pdf' }),
        exportCSV: (options) => exportAll({ ...options, format: 'csv' }),
        showExportModal,
        getQuizResults,
        getUserProfile
    };

})();

// Expor globalmente
window.ExportManager = ExportManager;

// Atalho conveniente
window.exportResults = ExportManager.showExportModal;

console.log('📤 Export Manager loaded');
