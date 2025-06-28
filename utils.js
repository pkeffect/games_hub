/**
 * UTILITIES - Shared utility functions and helpers
 */

/**
 * String utilities
 */
const StringUtils = {
    /**
     * Capitalize words in a string
     */
    capitalizeWords(str) {
        if (!str) return '';
        return str.replace(/_/g, ' ')
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());
    },

    /**
     * Truncate string with ellipsis
     */
    truncate(str, maxLength) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },

    /**
     * Slugify string for use in URLs or IDs
     */
    slugify(str) {
        if (!str) return '';
        return str.toLowerCase()
                  .replace(/[^a-z0-9 -]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim('-');
    },

    /**
     * Generate random string
     */
    randomString(length = 8) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};

/**
 * DOM utilities
 */
const DOMUtils = {
    /**
     * Create element with attributes and content
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }
        
        return element;
    },

    /**
     * Query selector with error handling
     */
    safeQuery(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    },

    /**
     * Query all with error handling
     */
    safeQueryAll(selector, parent = document) {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    },

    /**
     * Add event listener with cleanup tracking
     */
    addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => element.removeEventListener(event, handler, options);
    },

    /**
     * Check if element is visible
     */
    isVisible(element) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    },

    /**
     * Smoothly scroll to element
     */
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
};

/**
 * Performance utilities
 */
const PerformanceUtils = {
    /**
     * Debounce function calls
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Request animation frame with fallback
     */
    requestAnimationFrame(callback) {
        return (window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function(callback) { return setTimeout(callback, 1000 / 60); })(callback);
    },

    /**
     * Cancel animation frame with fallback
     */
    cancelAnimationFrame(id) {
        return (window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame ||
                clearTimeout)(id);
    },

    /**
     * Measure function execution time
     */
    measureTime(func, label = 'Function') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        console.log(`⏱️ ${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

/**
 * Validation utilities
 */
const ValidationUtils = {
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate URL format
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Validate window size object
     */
    isValidWindowSize(size) {
        return size &&
               typeof size === 'object' &&
               typeof size.width === 'number' &&
               typeof size.height === 'number' &&
               size.width > 0 &&
               size.height > 0 &&
               size.width <= 3840 &&
               size.height <= 2160;
    },

    /**
     * Validate game configuration object
     */
    isValidGameConfig(config) {
        return config &&
               typeof config === 'object' &&
               typeof config.name === 'string' &&
               typeof config.file === 'string' &&
               config.name.length > 0 &&
               config.file.length > 0;
    }
};

/**
 * Storage utilities
 */
const StorageUtils = {
    /**
     * Safe localStorage operations
     */
    localStorage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn(`Could not read from localStorage: ${key}`, error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn(`Could not write to localStorage: ${key}`, error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn(`Could not remove from localStorage: ${key}`, error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Could not clear localStorage', error);
                return false;
            }
        }
    },

    /**
     * Safe sessionStorage operations
     */
    sessionStorage: {
        get(key, defaultValue = null) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn(`Could not read from sessionStorage: ${key}`, error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn(`Could not write to sessionStorage: ${key}`, error);
                return false;
            }
        }
    }
};

/**
 * Date utilities
 */
const DateUtils = {
    /**
     * Format date to readable string
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * Get relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return this.formatDate(date, 'YYYY-MM-DD');
    }
};

/**
 * Browser utilities
 */
const BrowserUtils = {
    /**
     * Detect browser features
     */
    features: {
        localStorage: (() => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch {
                return false;
            }
        })(),
        
        matchMedia: typeof window.matchMedia === 'function',
        
        requestAnimationFrame: typeof window.requestAnimationFrame === 'function',
        
        fetch: typeof window.fetch === 'function'
    },

    /**
     * Get browser info
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            isChrome: /Chrome/.test(ua),
            isFirefox: /Firefox/.test(ua),
            isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
            isEdge: /Edge/.test(ua),
            isMobile: /Mobi|Android/i.test(ua),
            isTablet: /Tablet|iPad/i.test(ua)
        };
    },

    /**
     * Check if popup blockers might interfere
     */
    canOpenPopup() {
        try {
            const popup = window.open('', '_blank', 'width=1,height=1');
            if (popup) {
                popup.close();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }
};

// Export utilities for module systems (if applicable)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StringUtils,
        DOMUtils,
        PerformanceUtils,
        ValidationUtils,
        StorageUtils,
        DateUtils,
        BrowserUtils
    };
}

// Console utility functions info
console.log(`
🛠️ UTILITIES LOADED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Available Utilities:
• StringUtils - String manipulation and formatting
• DOMUtils - DOM operations and element creation
• PerformanceUtils - Debouncing, throttling, and timing
• ValidationUtils - Input validation and type checking
• StorageUtils - Safe localStorage/sessionStorage operations
• DateUtils - Date formatting and relative time
• BrowserUtils - Browser feature detection and info

Usage: Call utilities like StringUtils.capitalizeWords(str)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);