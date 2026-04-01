/**
 * Quest4You - Type Definitions
 * JSDoc type definitions for IDE intellisense and documentation
 * @fileoverview Definições de tipos para o projeto
 */

// ================================
// QUIZ TYPES
// ================================

/**
 * @typedef {Object} QuizData
 * @property {string} id - ID único do quiz
 * @property {string} name - Nome do quiz
 * @property {string} icon - Emoji do quiz
 * @property {string} color - Cor principal (hex)
 * @property {string} description - Descrição do quiz
 * @property {('spectrum'|'tags')} resultType - Tipo de resultado
 * @property {string} quizVersion - Versão do quiz
 * @property {number} minScore - Pontuação mínima
 * @property {number} maxScore - Pontuação máxima
 * @property {boolean} [requiresGender] - Se requer género
 * @property {QuizCategory[]} categories - Categorias de resultado
 * @property {QuizQuestion[]} questions - Perguntas do quiz
 */

/**
 * @typedef {Object} QuizCategory
 * @property {number} min - Pontuação mínima da categoria
 * @property {number} max - Pontuação máxima da categoria
 * @property {string} label - Nome da categoria
 * @property {string} emoji - Emoji da categoria
 * @property {string} description - Descrição da categoria
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {number} id - ID da pergunta
 * @property {string} text - Texto da pergunta
 * @property {string[]} [forGender] - Géneros para os quais a pergunta é mostrada
 * @property {QuizOption[]} options - Opções de resposta
 */

/**
 * @typedef {Object} QuizOption
 * @property {string} text - Texto da opção
 * @property {number} score - Pontuação da opção (0-100)
 * @property {string[]} tags - Tags associadas à opção
 */

/**
 * @typedef {Object} QuizAnswer
 * @property {number} optionIndex - Índice da opção selecionada
 * @property {number} score - Pontuação da resposta
 * @property {string[]} tags - Tags da resposta
 */

/**
 * @typedef {Object} QuizResult
 * @property {number} score - Pontuação média (0-100)
 * @property {number} totalPoints - Total de pontos
 * @property {number} maxPoints - Máximo de pontos possível
 * @property {number} answeredCount - Número de perguntas respondidas
 * @property {QuizCategory|null} category - Categoria do resultado
 * @property {number} categoryIndex - Índice da categoria
 * @property {string[]} tags - Todas as tags únicas
 * @property {string[]} topTags - Top tags por frequência
 * @property {Object.<string, number>} tagCounts - Contagem de cada tag
 */

/**
 * @typedef {Object} SavedQuizResult
 * @property {number} score - Pontuação
 * @property {string|null} category - Label da categoria
 * @property {string|null} categoryEmoji - Emoji da categoria
 * @property {string|null} categoryDescription - Descrição da categoria
 * @property {string[]} tags - Tags
 * @property {string[]} topTags - Top tags
 * @property {Object.<string, number>} tagCounts - Contagem de tags
 * @property {string} date - Data ISO
 * @property {Object.<string, QuizAnswer>} answers - Respostas
 * @property {string} quizVersion - Versão do quiz
 */

// ================================
// USER TYPES
// ================================

/**
 * @typedef {Object} UserProfile
 * @property {string} displayName - Nome de exibição
 * @property {number} [age] - Idade
 * @property {('masculino'|'feminino'|'nao-binario'|'outro')} [gender] - Género
 * @property {string} [location] - Localização
 * @property {string} [bio] - Biografia
 * @property {string} [avatar] - URL do avatar
 * @property {boolean} [publishProfile] - Se o perfil é público
 * @property {boolean} [verified] - Se está verificado
 * @property {string} [createdAt] - Data de criação
 * @property {string} [lastActivity] - Última atividade
 */

/**
 * @typedef {Object} FirebaseUser
 * @property {string} uid - ID único do Firebase
 * @property {string} email - Email
 * @property {string|null} displayName - Nome de exibição
 * @property {string|null} photoURL - URL da foto
 * @property {boolean} emailVerified - Se o email está verificado
 */

// ================================
// SMART MATCH TYPES
// ================================

/**
 * @typedef {Object} MatchProfile
 * @property {string} id - ID do utilizador
 * @property {string} displayName - Nome
 * @property {number} [age] - Idade
 * @property {string} [gender] - Género
 * @property {string} [location] - Localização
 * @property {string} [avatar] - Avatar
 * @property {number} compatibility - Compatibilidade (0-100)
 * @property {string[]} commonTags - Tags em comum
 * @property {Object.<string, number>} quizScores - Pontuações dos quizzes
 */

/**
 * @typedef {Object} MatchFilters
 * @property {number} [minAge] - Idade mínima
 * @property {number} [maxAge] - Idade máxima
 * @property {string[]} [genders] - Géneros aceites
 * @property {string} [location] - Localização
 * @property {number} [minCompatibility] - Compatibilidade mínima
 */

// ================================
// CHAT TYPES
// ================================

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - ID da mensagem
 * @property {string} senderId - ID do remetente
 * @property {string} senderName - Nome do remetente
 * @property {string} text - Texto da mensagem
 * @property {string} timestamp - Data/hora ISO
 * @property {boolean} [read] - Se foi lida
 * @property {('text'|'image'|'system')} [type] - Tipo de mensagem
 */

/**
 * @typedef {Object} Conversation
 * @property {string} id - ID da conversa
 * @property {string[]} participants - IDs dos participantes
 * @property {ChatMessage|null} lastMessage - Última mensagem
 * @property {number} unreadCount - Mensagens não lidas
 * @property {string} updatedAt - Última atualização
 */

// ================================
// BADGE TYPES
// ================================

/**
 * @typedef {Object} Badge
 * @property {string} id - ID do badge
 * @property {string} name - Nome do badge
 * @property {string} description - Descrição
 * @property {string} icon - Emoji ou URL do ícone
 * @property {('bronze'|'silver'|'gold'|'platinum')} tier - Nível do badge
 * @property {string} [unlockedAt] - Data de desbloqueio
 * @property {number} [progress] - Progresso (0-100)
 * @property {Object} [criteria] - Critérios para desbloquear
 */

/**
 * @typedef {Object} BadgeCriteria
 * @property {('quizzes_completed'|'score_reached'|'days_streak'|'matches_found'|'profile_complete')} type - Tipo de critério
 * @property {number} target - Valor alvo
 * @property {string} [quizId] - ID do quiz específico (se aplicável)
 */

// ================================
// NOTIFICATION TYPES
// ================================

/**
 * @typedef {Object} Notification
 * @property {string} id - ID da notificação
 * @property {('match'|'message'|'badge'|'system')} type - Tipo
 * @property {string} title - Título
 * @property {string} body - Corpo da mensagem
 * @property {string} [icon] - Ícone
 * @property {string} [link] - Link para abrir
 * @property {boolean} read - Se foi lida
 * @property {string} createdAt - Data de criação
 */

// ================================
// API RESPONSE TYPES
// ================================

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Se a operação foi bem sucedida
 * @property {*} [data] - Dados retornados
 * @property {string} [error] - Mensagem de erro
 * @property {string} [code] - Código de erro
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} items - Items da página
 * @property {number} total - Total de items
 * @property {number} page - Página atual
 * @property {number} pageSize - Tamanho da página
 * @property {boolean} hasMore - Se há mais páginas
 */

// ================================
// CONFIG TYPES
// ================================

/**
 * @typedef {Object} QuizConfig
 * @property {string} id - ID do quiz
 * @property {string} nameKey - Chave i18n do nome
 * @property {string} icon - Emoji
 * @property {string} color - Cor hex
 * @property {string} descKey - Chave i18n da descrição
 * @property {number} questions - Número de perguntas
 * @property {('spectrum'|'tags')} resultType - Tipo de resultado
 * @property {string} group - Grupo do quiz
 */

/**
 * @typedef {Object} FirebaseConfig
 * @property {string} apiKey
 * @property {string} authDomain
 * @property {string} projectId
 * @property {string} storageBucket
 * @property {string} messagingSenderId
 * @property {string} appId
 * @property {string} [measurementId]
 */

// ================================
// TOAST TYPES
// ================================

/**
 * @typedef {Object} ToastOptions
 * @property {string} message - Mensagem do toast
 * @property {('info'|'success'|'warning'|'error')} [type='info'] - Tipo do toast
 * @property {number} [duration=4000] - Duração em ms
 * @property {('top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right')} [position='bottom-center'] - Posição
 * @property {boolean} [dismissible=true] - Se pode ser fechado
 * @property {string} [icon] - Ícone personalizado
 * @property {Function} [onClick] - Callback ao clicar
 */

// ================================
// EXPORT TYPES
// ================================

/**
 * @typedef {Object} ExportData
 * @property {UserProfile} profile - Perfil do utilizador
 * @property {Object.<string, SavedQuizResult>} quizResults - Resultados dos quizzes
 * @property {Badge[]} badges - Badges conquistados
 * @property {string} exportedAt - Data de exportação
 * @property {string} version - Versão do export
 */

// Exportar para uso em outros ficheiros
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}

console.log('📝 Types loaded');
