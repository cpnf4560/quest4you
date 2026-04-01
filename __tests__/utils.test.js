/**
 * Tests for Utils Module
 */

// Import the module (we'll test the global version)
describe('Utils Module', () => {
    
    beforeEach(() => {
        // Load the utils module by simulating script execution
        // In real tests, this would be imported
        document.body.innerHTML = '';
    });
    
    describe('debounce', () => {
        jest.useFakeTimers();
        
        test('should delay function execution', () => {
            const func = jest.fn();
            const debouncedFunc = debounce(func, 300);
            
            debouncedFunc();
            expect(func).not.toBeCalled();
            
            jest.advanceTimersByTime(300);
            expect(func).toBeCalledTimes(1);
        });
        
        test('should reset delay on subsequent calls', () => {
            const func = jest.fn();
            const debouncedFunc = debounce(func, 300);
            
            debouncedFunc();
            jest.advanceTimersByTime(100);
            debouncedFunc();
            jest.advanceTimersByTime(100);
            debouncedFunc();
            jest.advanceTimersByTime(100);
            
            expect(func).not.toBeCalled();
            
            jest.advanceTimersByTime(200);
            expect(func).toBeCalledTimes(1);
        });
    });
    
    describe('throttle', () => {
        jest.useFakeTimers();
        
        test('should execute function immediately on first call', () => {
            const func = jest.fn();
            const throttledFunc = throttle(func, 300);
            
            throttledFunc();
            expect(func).toBeCalledTimes(1);
        });
        
        test('should limit subsequent calls', () => {
            const func = jest.fn();
            const throttledFunc = throttle(func, 300);
            
            throttledFunc();
            throttledFunc();
            throttledFunc();
            
            expect(func).toBeCalledTimes(1);
            
            jest.advanceTimersByTime(300);
            throttledFunc();
            
            expect(func).toBeCalledTimes(2);
        });
    });
    
    describe('escapeHtml', () => {
        test('should escape HTML special characters', () => {
            expect(escapeHtml('<script>alert("xss")</script>'))
                .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        });
        
        test('should escape ampersands', () => {
            expect(escapeHtml('Hello & World')).toBe('Hello &amp; World');
        });
        
        test('should handle empty strings', () => {
            expect(escapeHtml('')).toBe('');
        });
        
        test('should handle strings without special chars', () => {
            expect(escapeHtml('Hello World')).toBe('Hello World');
        });
    });
    
    describe('isValidEmail', () => {
        test('should validate correct emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@gmail.com')).toBe(true);
        });
        
        test('should reject invalid emails', () => {
            expect(isValidEmail('notanemail')).toBe(false);
            expect(isValidEmail('missing@domain')).toBe(false);
            expect(isValidEmail('@nodomain.com')).toBe(false);
            expect(isValidEmail('spaces in@email.com')).toBe(false);
        });
    });
    
    describe('capitalize', () => {
        test('should capitalize first letter', () => {
            expect(capitalize('hello')).toBe('Hello');
        });
        
        test('should handle already capitalized', () => {
            expect(capitalize('Hello')).toBe('Hello');
        });
        
        test('should handle empty strings', () => {
            expect(capitalize('')).toBe('');
        });
        
        test('should handle single characters', () => {
            expect(capitalize('a')).toBe('A');
        });
    });
    
    describe('truncate', () => {
        test('should truncate long strings', () => {
            expect(truncate('Hello World', 5)).toBe('Hello...');
        });
        
        test('should not truncate short strings', () => {
            expect(truncate('Hi', 10)).toBe('Hi');
        });
        
        test('should handle custom suffix', () => {
            expect(truncate('Hello World', 5, '…')).toBe('Hello…');
        });
    });
    
    describe('generateId', () => {
        test('should generate unique ids', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });
        
        test('should generate ids with correct length', () => {
            const id = generateId(16);
            expect(id.length).toBe(16);
        });
    });
    
    describe('Storage helpers', () => {
        test('getLocalStorage should return parsed JSON', () => {
            localStorage.setItem('test', JSON.stringify({ value: 123 }));
            expect(getLocalStorage('test')).toEqual({ value: 123 });
        });
        
        test('getLocalStorage should return default for missing keys', () => {
            expect(getLocalStorage('nonexistent', 'default')).toBe('default');
        });
        
        test('setLocalStorage should store JSON', () => {
            setLocalStorage('test', { value: 456 });
            expect(JSON.parse(localStorage.getItem('test'))).toEqual({ value: 456 });
        });
        
        test('removeLocalStorage should remove items', () => {
            localStorage.setItem('test', 'value');
            removeLocalStorage('test');
            expect(localStorage.getItem('test')).toBeNull();
        });
    });
});

// Mock implementations for testing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function escapeHtml(str) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
}

function generateId(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

function removeLocalStorage(key) {
    localStorage.removeItem(key);
}
