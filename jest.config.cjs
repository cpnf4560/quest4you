/**
 * Jest Configuration
 * @type {import('jest').Config}
 */
module.exports = {
    // Test environment
    testEnvironment: 'jsdom',
    
    // Setup files
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    
    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/*.spec.js'
    ],
    
    // Module file extensions
    moduleFileExtensions: ['js', 'json'],
    
    // Module name mapper for aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/js/$1',
        '^@css/(.*)$': '<rootDir>/css/$1',
        '^@data/(.*)$': '<rootDir>/data/$1',
        '^@i18n/(.*)$': '<rootDir>/i18n/$1',
        // Mock CSS imports
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    
    // Transform settings
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    
    // Coverage settings
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/firebase-config.js',
        '!js/types.js',
        '!**/node_modules/**',
    ],
    
    coverageDirectory: 'coverage',
    
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Verbose output
    verbose: true,
    
    // Test timeout
    testTimeout: 10000,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Restore mocks after each test
    restoreMocks: true,
    
    // Global variables
    globals: {
        '__APP_VERSION__': '2.1.0',
        '__BUILD_TIME__': new Date().toISOString(),
    },
    
    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],
      // Watch plugins (removidos - instalar jest-watch-typeahead se necessário)
    // watchPlugins: [
    //     'jest-watch-typeahead/filename',
    //     'jest-watch-typeahead/testname',
    // ],
    
    // Reporters (usando apenas default - instalar jest-html-reporter se necessário)
    reporters: ['default'],
};
