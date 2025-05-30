// Utility Functions and Helpers

// DOM Helper Functions
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

// Show/Hide Elements
function show(elementId) {
    const element = $(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hide(elementId) {
    const element = $(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function toggle(elementId) {
    const element = $(elementId);
    if (element) {
        element.classList.toggle('hidden');
    }
}

// Form Validation
function validateGameCode(code) {
    return /^[A-Z]{4}$/.test(code);
}

function validatePlayerName(name) {
    return name && name.trim().length >= 1 && name.trim().length <= 50;
}

function validateEmoji(emoji) {
    return GAME_CONFIG.availableEmojis.includes(emoji);
}

// Game Code Formatting
function formatGameCode(code) {
    return code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
}

// Prevent Default Helper
function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Random Selection Helper
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Shuffle Array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Format Time
function formatTime(seconds) {
    return seconds.toString().padStart(2, '0');
}

// Sleep/Delay Function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Error Handling
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly error message
    showNotification('Something went wrong. Please try again.', 'error');
}

// Show Notification
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? 'var(--color-danger)' : 
                   type === 'success' ? 'var(--color-primary)' : 
                   'var(--color-secondary)'};
        color: var(--color-background);
        padding: 1rem 2rem;
        border-radius: var(--border-radius);
        font-weight: bold;
        z-index: 10000;
        animation: slideDown 0.3s ease-out;
        box-shadow: var(--shadow-large) rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    return notification;
}

// Loading State Management
function setLoadingState(buttonId, loading = true) {
    const button = $(buttonId);
    if (!button) return;
    
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="loading-spinner"></span> LOADING...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || button.textContent;
    }
}

// Modal Management
function showModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        modal.classList.add('show');
        // Focus trap for accessibility
        const firstFocusable = modal.querySelector('button, input, select, textarea');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

function hideModal(modalId) {
    const modal = $(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Escape key handler for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            openModal.classList.remove('show');
        }
    }
});

// Click outside to close modal
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Keyboard Navigation Helpers
function handleArrowNavigation(e, items, currentIndex) {
    let newIndex = currentIndex;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            newIndex = Math.max(0, currentIndex - 1);
            break;
        case 'ArrowDown':
        case 'ArrowRight':
            newIndex = Math.min(items.length - 1, currentIndex + 1);
            break;
        case 'Home':
            newIndex = 0;
            break;
        case 'End':
            newIndex = items.length - 1;
            break;
        default:
            return currentIndex;
    }
    
    if (items[newIndex]) {
        items[newIndex].focus();
    }
    
    return newIndex;
}

// Device Detection
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
};

const isTablet = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
};

const isDesktop = () => {
    return window.innerWidth > 1024;
};

// Orientation Detection
const isLandscape = () => {
    return window.innerWidth > window.innerHeight;
};

const isPortrait = () => {
    return window.innerHeight > window.innerWidth;
};

// Local Storage Helpers
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn('Failed to set localStorage:', error);
        return false;
    }
}

function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn('Failed to get localStorage:', error);
        return defaultValue;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn('Failed to remove localStorage:', error);
        return false;
    }
}

// URL Parameter Helpers
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function setUrlParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState(null, '', url);
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success', 2000);
        return true;
    } catch (error) {
        console.warn('Failed to copy to clipboard:', error);
        showNotification('Failed to copy to clipboard', 'error', 2000);
        return false;
    }
}

// Animation Helpers
function animateElement(element, animationClass, duration = 1000) {
    return new Promise((resolve) => {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
            resolve();
        }, duration);
    });
}

// Initialize utility event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for notifications if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});
