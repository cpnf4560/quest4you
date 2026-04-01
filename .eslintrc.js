/**
 * ESLint Configuration for Quest4You
 */
module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'jsdoc',
    ],
    globals: {
        // Firebase globals
        firebase: 'readonly',
        firebaseAuth: 'readonly',
        firebaseDb: 'readonly',
        
        // App globals
        Toast: 'readonly',
        BadgeManager: 'readonly',
        ExportManager: 'readonly',
        AccessibilityManager: 'readonly',
        ErrorHandler: 'readonly',
        
        // i18n
        t: 'readonly',
        getCurrentLanguage: 'readonly',
        setLanguage: 'readonly',
        
        // Utils
        debounce: 'readonly',
        throttle: 'readonly',
        generateId: 'readonly',
        escapeHtml: 'readonly',
        
        // Constants
        __APP_VERSION__: 'readonly',
        __BUILD_TIME__: 'readonly',
    },
    rules: {
        // Errors
        'no-console': 'off', // Allow console for debugging
        'no-debugger': 'warn',
        'no-unused-vars': ['warn', { 
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],
        
        // Best practices
        'eqeqeq': ['error', 'always', { null: 'ignore' }],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-return-await': 'warn',
        'require-await': 'warn',
        'no-throw-literal': 'error',
        'prefer-promise-reject-errors': 'error',
        
        // Style
        'semi': ['error', 'always'],
        'quotes': ['warn', 'single', { 
            avoidEscape: true,
            allowTemplateLiterals: true,
        }],
        'indent': ['warn', 4, { SwitchCase: 1 }],
        'comma-dangle': ['warn', 'only-multiline'],
        'no-trailing-spaces': 'warn',
        'no-multiple-empty-lines': ['warn', { max: 2 }],
        
        // ES6
        'prefer-const': 'warn',
        'prefer-arrow-callback': 'warn',
        'no-var': 'error',
        'object-shorthand': 'warn',
        'prefer-template': 'warn',
        'prefer-spread': 'warn',
        
        // JSDoc
        'jsdoc/check-alignment': 'warn',
        'jsdoc/check-param-names': 'warn',
        'jsdoc/check-tag-names': 'warn',
        'jsdoc/check-types': 'warn',
        'jsdoc/require-param': 'off', // Too strict for existing code
        'jsdoc/require-returns': 'off',
        'jsdoc/require-jsdoc': 'off',
    },
    ignorePatterns: [
        'dist/',
        'node_modules/',
        'coverage/',
        '*.min.js',
        'service-worker.js', // Has special globals
    ],
};
