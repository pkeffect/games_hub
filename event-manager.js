/**
 * EVENT MANAGER - Handles event binding and keyboard shortcuts
 */
class EventManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        this.bindSearchEvents();
        this.bindThemeEvents();
        this.bindKeyboardShortcuts();
        this.bindGlobalEvents();
        
        console.log('🎛️ Event handlers bound successfully');
    }

    /**
     * Bind search-related events
     */
    bindSearchEvents() {
        if (!this.app.elements.searchInput) return;

        // Search input with debouncing
        this.app.elements.searchInput.addEventListener('input', 
            this.app.debounce(this.handleSearch.bind(this), 300));
        
        // Search input keyboard handling
        this.app.elements.searchInput.addEventListener('keydown', 
            this.handleSearchKeydown.bind(this));
    }

    /**
     * Bind theme-related events
     */
    bindThemeEvents() {
        if (this.app.elements.themeToggle) {
            this.app.elements.themeToggle.addEventListener('click', 
                () => this.app.themeManager.toggleTheme());
        }
    }

    /**
     * Bind global keyboard shortcuts
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    }

    /**
     * Bind global events
     */
    bindGlobalEvents() {
        // Global error handling
        window.addEventListener('error', this.handleGlobalError.bind(this));
        
        // Window beforeunload (optional cleanup)
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }

    /**
     * Handle search input
     */
    handleSearch(event) {
        this.app.setState({ searchTerm: event.target.value.toLowerCase() });
        this.app.uiManager.filterGames();
    }

    /**
     * Handle search input keyboard events
     */
    handleSearchKeydown(event) {
        if (event.key === 'Escape') {
            event.target.value = '';
            this.app.setState({ searchTerm: '' });
            this.app.uiManager.filterGames();
        }
    }

    /**
     * Handle category filter selection
     */
    handleCategoryFilter(category, button) {
        this.app.setState({ currentFilter: category });
        this.app.uiManager.updateActiveFilter(button);
        this.app.uiManager.filterGames();
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(event) {
        // Don't interfere when typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const { key, ctrlKey, metaKey, shiftKey } = event;
        const modifier = ctrlKey || metaKey;

        switch (key) {
            case 'Escape':
                this.handleEscapeKey(event);
                break;
            case 'f':
                if (modifier) {
                    event.preventDefault();
                    this.app.uiManager.focusSearch();
                }
                break;
            case 'r':
                if (modifier) {
                    event.preventDefault();
                    this.handleReloadShortcut();
                }
                break;
            case 't':
                if (modifier) {
                    event.preventDefault();
                    this.app.themeManager.toggleTheme();
                }
                break;
            case '/':
                if (!modifier) {
                    event.preventDefault();
                    this.app.uiManager.focusSearch();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                if (modifier) {
                    event.preventDefault();
                    this.handleGridColumnShortcut(parseInt(key));
                }
                break;
            case 'h':
                if (modifier && shiftKey) {
                    event.preventDefault();
                    this.showKeyboardShortcuts();
                }
                break;
        }
    }

    /**
     * Handle escape key
     */
    handleEscapeKey(event) {
        // Close any open notifications first
        const notifications = document.querySelectorAll('.notification');
        if (notifications.length > 0) {
            notifications.forEach(n => n.remove());
            return;
        }
        
        // Clear search if focused
        if (this.app.elements.searchInput === document.activeElement) {
            this.app.elements.searchInput.value = '';
            this.app.setState({ searchTerm: '' });
            this.app.uiManager.filterGames();
            this.app.elements.searchInput.blur();
            return;
        }
        
        // Otherwise close window
        window.close();
    }

    /**
     * Handle reload shortcut
     */
    handleReloadShortcut() {
        this.app.configManager.reloadConfiguration();
        this.app.uiManager.showNotification(
            '🔄 Reloading',
            'Games configuration is being reloaded...',
            'info'
        );
    }

    /**
     * Handle grid column shortcuts (Ctrl+1-6)
     */
    handleGridColumnShortcut(columns) {
        if (columns >= 1 && columns <= 6) {
            if (this.app.elements.gamesGrid) {
                this.app.elements.gamesGrid.setAttribute('data-columns', columns.toString());
                
                // Update UI settings
                if (this.app.state.uiSettings) {
                    this.app.state.uiSettings.grid_columns = columns;
                }
                
                this.app.uiManager.showNotification(
                    '📐 Grid Updated',
                    `Changed to ${columns} column${columns !== 1 ? 's' : ''}`,
                    'info'
                );
            }
        }
    }

    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            'ESC - Close window or clear search',
            'Ctrl+F or / - Focus search',
            'Ctrl+R - Reload games',
            'Ctrl+T - Toggle theme',
            'Ctrl+1-6 - Change grid columns',
            'Ctrl+Shift+H - Show this help'
        ];
        
        this.app.uiManager.showNotification(
            '⌨️ Keyboard Shortcuts',
            shortcuts.join('<br>'),
            'info'
        );
    }

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        console.error('🚨 Global Error:', event.error);
        
        // Show user-friendly error notification
        this.app.uiManager.showNotification(
            '⚠️ Application Error',
            'An unexpected error occurred. Check console for details.',
            'error'
        );
    }

    /**
     * Handle before window unload
     */
    handleBeforeUnload(event) {
        // Save any pending configuration changes
        if (this.app.configManager && this.app.state.configData) {
            try {
                this.app.configManager.saveConfiguration();
            } catch (error) {
                console.warn('⚠️ Could not save configuration on exit:', error);
            }
        }
    }

    /**
     * Bind dynamic events for newly created elements
     */
    bindDynamicEvents() {
        // This method can be called when new elements are added to the DOM
        // Currently not needed as we use event delegation, but available for future use
    }

    /**
     * Unbind all events (cleanup)
     */
    unbindEvents() {
        // Remove global event listeners if needed
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        
        console.log('🔌 Event handlers unbound');
    }

    /**
     * Handle click outside elements (utility)
     */
    handleClickOutside(targetElement, callback) {
        const clickHandler = (event) => {
            if (!targetElement.contains(event.target)) {
                callback(event);
                document.removeEventListener('click', clickHandler);
            }
        };
        
        // Add slight delay to avoid immediate triggering
        setTimeout(() => {
            document.addEventListener('click', clickHandler);
        }, 10);
    }
}