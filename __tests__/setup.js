/**
 * Jest Setup File
 * Configurações globais para testes
 */

// Polyfills for jsdom
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem: jest.fn((key) => localStorageMock.store[key] || null),
    setItem: jest.fn((key, value) => {
        localStorageMock.store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
        delete localStorageMock.store[key];
    }),
    clear: jest.fn(() => {
        localStorageMock.store = {};
    }),
    get length() {
        return Object.keys(localStorageMock.store).length;
    },
    key: jest.fn((index) => {
        const keys = Object.keys(localStorageMock.store);
        return keys[index] || null;
    }),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
});

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
    })
);

// Mock console methods (optional - uncomment to suppress console during tests)
// global.console = {
//     ...console,
//     log: jest.fn(),
//     debug: jest.fn(),
//     info: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn(),
// };

// Mock Firebase
const mockFirebase = {
    auth: {
        currentUser: null,
        onAuthStateChanged: jest.fn((callback) => {
            callback(null);
            return jest.fn(); // unsubscribe
        }),
        signInWithEmailAndPassword: jest.fn(),
        signInWithPopup: jest.fn(),
        signOut: jest.fn(),
        createUserWithEmailAndPassword: jest.fn(),
    },
    db: {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ exists: false, data: () => null })),
                set: jest.fn(() => Promise.resolve()),
                update: jest.fn(() => Promise.resolve()),
                delete: jest.fn(() => Promise.resolve()),
            })),
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({ docs: [], forEach: jest.fn() })),
            })),
            orderBy: jest.fn(() => ({
                limit: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({ docs: [] })),
                })),
            })),
        })),
    },
};

global.firebaseAuth = mockFirebase.auth;
global.firebaseDb = mockFirebase.db;

// Clean up after each test
afterEach(() => {
    // Clear localStorage
    localStorageMock.clear();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear fetch mock
    fetch.mockClear();
    
    // Reset DOM
    document.body.innerHTML = '';
    document.head.innerHTML = '<title>Test</title>';
});

// Global test utilities
global.createMockElement = (tag, attributes = {}) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent' || key === 'innerHTML') {
            element[key] = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    return element;
};

global.waitFor = (callback, timeout = 1000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const check = () => {
            try {
                const result = callback();
                if (result) {
                    resolve(result);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Timeout waiting for condition'));
                } else {
                    setTimeout(check, 50);
                }
            } catch (error) {
                if (Date.now() - startTime > timeout) {
                    reject(error);
                } else {
                    setTimeout(check, 50);
                }
            }
        };
        check();
    });
};

global.flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
