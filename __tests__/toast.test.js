/**
 * Tests for Toast Module
 */

describe('Toast Module', () => {
    
    beforeEach(() => {
        document.body.innerHTML = '';
        // Clear any existing toast containers
        const containers = document.querySelectorAll('.toast-container');
        containers.forEach(c => c.remove());
    });
    
    describe('Toast creation', () => {
        test('should create toast element with correct structure', () => {
            const toast = createToast({
                type: 'success',
                message: 'Test message',
                title: 'Test Title'
            });
            
            expect(toast.classList.contains('toast')).toBe(true);
            expect(toast.classList.contains('toast--success')).toBe(true);
            expect(toast.querySelector('.toast__title').textContent).toBe('Test Title');
            expect(toast.querySelector('.toast__message').textContent).toBe('Test message');
        });
        
        test('should apply correct type class', () => {
            const types = ['info', 'success', 'warning', 'error'];
            
            types.forEach(type => {
                const toast = createToast({ type, message: 'Test' });
                expect(toast.classList.contains(`toast--${type}`)).toBe(true);
            });
        });
        
        test('should include dismiss button when dismissible', () => {
            const toast = createToast({
                message: 'Test',
                dismissible: true
            });
            
            expect(toast.querySelector('.toast__dismiss')).not.toBeNull();
        });
        
        test('should not include dismiss button when not dismissible', () => {
            const toast = createToast({
                message: 'Test',
                dismissible: false
            });
            
            expect(toast.querySelector('.toast__dismiss')).toBeNull();
        });
        
        test('should include progress bar when showProgress is true', () => {
            const toast = createToast({
                message: 'Test',
                showProgress: true,
                duration: 3000
            });
            
            expect(toast.querySelector('.toast__progress')).not.toBeNull();
        });
    });
    
    describe('Toast positioning', () => {
        test('should create container with correct position class', () => {
            const positions = [
                'top-right',
                'top-left', 
                'top-center',
                'bottom-right',
                'bottom-left',
                'bottom-center'
            ];
            
            positions.forEach(position => {
                document.body.innerHTML = '';
                const container = getOrCreateContainer(position);
                expect(container.classList.contains(`toast-container--${position}`)).toBe(true);
            });
        });
    });
    
    describe('Toast icons', () => {
        test('should return correct icon for each type', () => {
            expect(getIcon('info')).toBe('ℹ️');
            expect(getIcon('success')).toBe('✅');
            expect(getIcon('warning')).toBe('⚠️');
            expect(getIcon('error')).toBe('❌');
        });
    });
    
    describe('Toast actions', () => {
        test('should create action button when provided', () => {
            const actionCallback = jest.fn();
            
            const toast = createToast({
                message: 'Test',
                action: {
                    text: 'Undo',
                    onClick: actionCallback
                }
            });
            
            const actionBtn = toast.querySelector('.toast__action');
            expect(actionBtn).not.toBeNull();
            expect(actionBtn.textContent).toBe('Undo');
        });
    });
});

// Mock implementations for testing
function createToast(options) {
    const {
        type = 'info',
        title = '',
        message = '',
        dismissible = true,
        showProgress = false,
        duration = 3000,
        action = null
    } = options;
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    let html = `
        <span class="toast__icon">${getIcon(type)}</span>
        <div class="toast__content">
            ${title ? `<div class="toast__title">${title}</div>` : ''}
            <div class="toast__message">${message}</div>
        </div>
    `;
    
    if (action) {
        html += `<button class="toast__action">${action.text}</button>`;
    }
    
    if (dismissible) {
        html += `<button class="toast__dismiss" aria-label="Dismiss">&times;</button>`;
    }
    
    if (showProgress && duration > 0) {
        html += `<div class="toast__progress" style="animation-duration: ${duration}ms"></div>`;
    }
    
    toast.innerHTML = html;
    
    return toast;
}

function getOrCreateContainer(position = 'top-right') {
    let container = document.querySelector(`.toast-container--${position}`);
    
    if (!container) {
        container = document.createElement('div');
        container.className = `toast-container toast-container--${position}`;
        document.body.appendChild(container);
    }
    
    return container;
}

function getIcon(type) {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    return icons[type] || icons.info;
}
