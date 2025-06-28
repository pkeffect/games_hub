/**
 * THEME MANAGER - Handles theme switching and persistence
 */
class ThemeManager {
    constructor(app) {
        this.app = app;
        this.availableThemes = ['dark', 'light', 'ultra-dark'];
        this.defaultTheme = 'dark';
    }

    /**
     * Initialize theme system
     */
    initialize() {
        // Load theme from config, fallback to system preference
        this.loadThemeFromConfig();
        this.applyTheme(this.app.state.currentTheme);
        this.updateThemeIcon();
        this.bindThemeToggle();
        this.bindSystemThemeChanges();
        
        console.log(`🎨 Theme system initialized with ${this.app.state.currentTheme} theme`);
    }

    /**
     * Bind theme toggle button event
     */
    bindThemeToggle() {
        if (this.app.elements.themeToggle) {
            this.app.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
            console.log('🎨 Theme toggle button bound successfully');
        } else {
            console.warn('⚠️ Theme toggle button not found, retrying in 100ms...');
            setTimeout(() => {
                this.app.elements.themeToggle = document.getElementById('themeToggle');
                if (this.app.elements.themeToggle) {
                    this.app.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
                    console.log('🎨 Theme toggle button bound successfully (retry)');
                }
            }, 100);
        }
    }

    /**
     * Load theme preference from config
     */
    loadThemeFromConfig() {
        const configTheme = this.app.state.configData?.user_preferences?.theme;
        
        if (configTheme && this.availableThemes.includes(configTheme)) {
            this.app.setState({ currentTheme: configTheme });
            console.log(`🎨 Loaded theme from config: ${configTheme}`);
            return;
        }

        // Fallback to localStorage
        const localTheme = this.loadThemeFromLocalStorage();
        if (localTheme) {
            this.app.setState({ currentTheme: localTheme });
            console.log(`🎨 Loaded theme from localStorage: ${localTheme}`);
            return;
        }

        // Fallback to system preference
        const systemTheme = this.getSystemPreference();
        this.app.setState({ currentTheme: systemTheme });
        console.log(`🎨 Using system theme preference: ${systemTheme}`);
    }

    /**
     * Get system color scheme preference
     */
    getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return this.defaultTheme;
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        if (!this.availableThemes.includes(theme)) {
            console.warn(`⚠️ Unknown theme: ${theme}, falling back to ${this.defaultTheme}`);
            theme = this.defaultTheme;
        }

        document.documentElement.setAttribute('data-theme', theme);
        this.app.setState({ currentTheme: theme });
        console.log(`🎨 Applied theme: ${theme}`);
    }

    /**
     * Update theme toggle button icon
     */
    updateThemeIcon() {
        if (!this.app.elements.themeToggle) return;
        
        const icons = {
            'dark': '☀️',
            'light': '🌙', 
            'ultra-dark': '💡'
        };
        
        const tooltips = {
            'dark': 'Switch to light mode',
            'light': 'Switch to ultra-dark mode',
            'ultra-dark': 'Switch to dark mode'
        };
        
        this.app.elements.themeToggle.textContent = icons[this.app.state.currentTheme] || '🌙';
        this.app.elements.themeToggle.title = tooltips[this.app.state.currentTheme] || 'Toggle theme';
    }

    /**
     * Get next theme in rotation
     */
    getNextTheme(currentTheme) {
        const currentIndex = this.availableThemes.indexOf(currentTheme);
        return this.availableThemes[(currentIndex + 1) % this.availableThemes.length];
    }

    /**
     * Toggle to next theme
     */
    toggleTheme() {
        const nextTheme = this.getNextTheme(this.app.state.currentTheme);
        this.applyTheme(nextTheme);
        this.updateThemeIcon();
        this.saveThemeToConfig(nextTheme);
        
        const themeNames = {
            'dark': 'Dark',
            'light': 'Light',
            'ultra-dark': 'Ultra Dark'
        };
        
        this.app.uiManager.showNotification(
            '🌓 Theme Changed',
            `Switched to ${themeNames[nextTheme]} mode`,
            'info'
        );
    }

    /**
     * Save theme preference to config
     */
    async saveThemeToConfig(theme) {
        try {
            // Update local state
            if (!this.app.state.configData) {
                this.app.state.configData = {};
            }
            if (!this.app.state.configData.user_preferences) {
                this.app.state.configData.user_preferences = {};
            }
            this.app.state.configData.user_preferences.theme = theme;

            // Save to localStorage as fallback
            this.saveThemeToLocalStorage(theme);
            
            console.log(`💾 Theme preference saved: ${theme}`);
            
        } catch (error) {
            console.warn('⚠️ Could not save theme to config:', error);
            this.saveThemeToLocalStorage(theme);
        }
    }

    /**
     * Fallback: Save theme to localStorage
     */
    saveThemeToLocalStorage(theme) {
        try {
            localStorage.setItem('games-hub-theme', theme);
        } catch (error) {
            console.warn('⚠️ Could not save theme to localStorage:', error);
        }
    }

    /**
     * Load theme from localStorage (fallback)
     */
    loadThemeFromLocalStorage() {
        try {
            const stored = localStorage.getItem('games-hub-theme');
            if (stored && this.availableThemes.includes(stored)) {
                return stored;
            }
        } catch (error) {
            console.warn('⚠️ Could not load theme from localStorage:', error);
        }
        return null;
    }

    /**
     * Listen for system theme changes
     */
    bindSystemThemeChanges() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', this.handleSystemThemeChange.bind(this));
        }
    }

    /**
     * Handle system theme changes
     */
    handleSystemThemeChange(e) {
        // Only auto-switch if user hasn't set a custom preference
        const hasCustomTheme = this.app.state.configData?.user_preferences?.theme ||
                              this.loadThemeFromLocalStorage();
        
        if (!hasCustomTheme) {
            const newTheme = e.matches ? 'dark' : 'light';
            this.applyTheme(newTheme);
            this.updateThemeIcon();
            console.log(`🎨 Auto-switched to system theme: ${newTheme}`);
        }
    }

    /**
     * Apply ultra dark theme if enabled in UI settings
     */
    applyUltraDarkIfEnabled() {
        if (this.app.state.uiSettings?.ultra_dark_theme && 
            this.app.state.currentTheme === 'dark') {
            this.applyTheme('ultra-dark');
            this.updateThemeIcon();
        }
    }
}