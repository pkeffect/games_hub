/**
 * GAMES HUB - MAIN APPLICATION ENTRY POINT
 * Version: 6.3.0 - Modular Architecture Edition
 */

// Application constants
const APP_CONSTANTS = {
    CONFIG_URL: '/cache/functions/games_hub/config/games_config.json',
    VERSION: '6.3.0',
    FALLBACK_GAMES: ['pong', 'snake', 'tetris', 'space-invaders']
};

/**
 * Main Application Class
 */
class GamesHubApp {
    constructor() {
        this.state = {
            currentFilter: 'all',
            searchTerm: '',
            currentTheme: 'dark', // Will be loaded from config
            configData: null,
            gamesData: null,
            categoriesData: null,
            scanMetadata: null,
            uiSettings: null
        };
        
        this.elements = {};
        this.initialized = false;
        
        // Initialize managers
        this.themeManager = new ThemeManager(this);
        this.configManager = new ConfigManager(this);
        this.gameManager = new GameManager(this);
        this.uiManager = new UIManager(this);
        this.eventManager = new EventManager(this);
        
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log(`🎮 Games Hub v${APP_CONSTANTS.VERSION} - Modular Architecture Edition initializing...`);
            
            this.cacheElements();
            await this.configManager.loadConfiguration();
            this.themeManager.initialize();
            this.eventManager.bindEvents();
            this.uiManager.renderGames();
            this.uiManager.updateCategoryFilters();
            
            this.initialized = true;
            console.log('✅ Games Hub initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Games Hub:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            gamesGrid: document.getElementById('gamesGrid'),
            searchInput: document.getElementById('searchInput'),
            categoryFilters: document.getElementById('categoryFilters'),
            subtitleBar: document.getElementById('subtitleBar'),
            subtitleText: document.getElementById('subtitleText'),
            scanInfo: document.getElementById('scanInfo'),
            themeToggle: document.getElementById('themeToggle')
        };
        
        // Validate critical elements
        const criticalElements = ['gamesGrid', 'searchInput', 'categoryFilters'];
        const missing = criticalElements.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            throw new Error(`Critical elements missing: ${missing.join(', ')}`);
        }
    }

    /**
     * Update application state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        if (this.uiManager) {
            this.uiManager.showNotification(
                '❌ Initialization Failed',
                'Games Hub failed to start properly. Please refresh the page.',
                'error'
            );
        }
    }

    /**
     * Utility method for capitalizing words
     */
    capitalizeWords(str) {
        return str.replace(/_/g, ' ')
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Debounce utility
     */
    debounce(func, wait) {
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
}

/**
 * Application Initialization
 */
class AppInitializer {
    constructor() {
        this.app = null;
        this.initializeWhenReady();
    }

    initializeWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        try {
            this.app = new GamesHubApp();
            
            // Expose for debugging (non-production)
            if (this.isDevelopment()) {
                window.gamesHub = this.app;
                console.log('🔧 Development mode: window.gamesHub available for debugging');
            }
            
        } catch (error) {
            console.error('❌ Failed to start Games Hub:', error);
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname.includes('127.0.0.1') ||
               window.location.protocol === 'file:';
    }
}

// Start the application
new AppInitializer();

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global Error:', event.error);
});

// Console branding
console.log(`
🎮 GAMES HUB - MODULAR ARCHITECTURE EDITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version: 6.3.0 - Modular Architecture Edition
Architecture: Multiple Module Files (main.js + modules)
Theme: Config-Based Storage with Fallback
Window Mode: Custom Sized Gaming Windows
Code Quality: Enterprise Standards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Module Structure:
• main.js - Application entry point and coordination
• theme-manager.js - Theme persistence and switching
• config-manager.js - Configuration loading and parsing
• game-manager.js - Game launching and window management
• ui-manager.js - DOM manipulation and rendering
• event-manager.js - Event handling and keyboard shortcuts
• utils.js - Shared utilities and helpers

Features:
• Modular architecture with separated concerns
• Theme storage in games_config.json
• Custom game window sizes by category/game
• Performance optimizations and error handling
• Clean separation of responsibilities

🚀 Ready for enterprise-grade modular retro gaming!
`);