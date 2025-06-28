/**
 * CONFIG MANAGER - Handles configuration loading and management
 */
class ConfigManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * Load games configuration
     */
    async loadConfiguration() {
        try {
            console.log('📁 Loading games configuration...');
            
            const response = await fetch(APP_CONSTANTS.CONFIG_URL);
            
            if (response.ok) {
                const configData = await response.json();
                this.processConfiguration(configData);
                
                console.log(`✅ Configuration loaded: ${Object.keys(this.app.state.gamesData).length} games`);
                
                this.app.uiManager.updateScanInfo();
            } else {
                console.warn('⚠️ Config file not found, using fallback detection');
                await this.performFallbackScan();
            }
        } catch (error) {
            console.error('❌ Error loading configuration:', error);
            await this.performFallbackScan();
        }
    }

    /**
     * Process loaded configuration data
     */
    processConfiguration(configData) {
        const { 
            games = {}, 
            categories = {}, 
            ui_settings = {}, 
            scan_metadata = null,
            user_preferences = {}
        } = configData;
        
        this.app.setState({
            configData: configData,
            gamesData: games,
            categoriesData: categories,
            uiSettings: this.mergeWithDefaults(ui_settings),
            scanMetadata: scan_metadata
        });

        this.applyUISettings();
    }

    /**
     * Merge UI settings with defaults
     */
    mergeWithDefaults(uiSettings) {
        return {
            show_difficulty: true,
            show_categories: true,
            show_controls: true,
            grid_columns: 3,
            card_animation: true,
            ultra_dark_theme: false,
            ...uiSettings
        };
    }

    /**
     * Apply UI settings to the interface
     */
    applyUISettings() {
        if (!this.app.state.uiSettings) return;
        
        const { grid_columns, card_animation, ultra_dark_theme } = this.app.state.uiSettings;
        
        // Apply grid columns
        if (this.app.elements.gamesGrid) {
            this.app.elements.gamesGrid.setAttribute('data-columns', grid_columns.toString());
        }
        
        // Apply animation settings
        const animationMode = card_animation ? 'enabled' : 'disabled';
        document.documentElement.setAttribute('data-animations', animationMode);
        
        console.log('🎨 UI settings applied:', this.app.state.uiSettings);
    }

    /**
     * Perform fallback game scanning
     */
    async performFallbackScan() {
        console.log('🔄 Performing fallback games scan...');
        
        try {
            const detectedGames = {};
            
            for (const gameName of APP_CONSTANTS.FALLBACK_GAMES) {
                if (await this.testGameExists(gameName)) {
                    console.log(`✅ Detected game: ${gameName}`);
                    detectedGames[gameName] = this.generateFallbackGameData(gameName);
                }
            }
            
            this.app.setState({
                gamesData: detectedGames,
                categoriesData: this.getFallbackCategories(),
                uiSettings: this.mergeWithDefaults({})
            });
            
            const gameCount = Object.keys(detectedGames).length;
            if (gameCount === 0) {
                this.app.uiManager.showNoGamesState();
            } else {
                console.log(`✅ Fallback scan found ${gameCount} games`);
                this.app.uiManager.renderGames();
                this.app.uiManager.updateCategoryFilters();
            }
            
            this.app.uiManager.updateScanInfo('Config file not found - using fallback detection');
            
        } catch (error) {
            console.error('❌ Error in fallback scan:', error);
            this.app.uiManager.showNoGamesState();
            this.app.uiManager.updateScanInfo('Error scanning games directory');
        }
    }

    /**
     * Test if a game exists
     */
    async testGameExists(gameName) {
        try {
            const gameUrl = `/cache/functions/games_hub/games/${gameName}/index.html`;
            const response = await fetch(gameUrl, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Generate fallback game metadata
     */
    generateFallbackGameData(gameName) {
        const gameMap = {
            'pong': { 
                name: '🏓 Pong', 
                description: 'Classic table tennis arcade game', 
                category: 'Sports', 
                icon: '🏓', 
                difficulty: 'Easy',
                window_size: { width: 800, height: 600 }
            },
            'snake': { 
                name: '🐍 Snake', 
                description: 'Nokia\'s legendary snake game', 
                category: 'Arcade', 
                icon: '🐍', 
                difficulty: 'Easy',
                window_size: { width: 600, height: 600 }
            },
            'tetris': { 
                name: '🧩 Tetris', 
                description: 'The ultimate tile-matching puzzle', 
                category: 'Puzzle', 
                icon: '🧩', 
                difficulty: 'Medium',
                window_size: { width: 500, height: 700 }
            },
            'space-invaders': { 
                name: '👾 Space Invaders', 
                description: 'Defend Earth from alien invasion', 
                category: 'Arcade', 
                icon: '👾', 
                difficulty: 'Medium',
                window_size: { width: 800, height: 700 }
            }
        };

        return {
            ...gameMap[gameName],
            file: `${gameName}/index.html`,
            controls: ['See game instructions'],
            features: ['Retro gameplay']
        } || {
            name: this.app.capitalizeWords(gameName),
            description: `Classic ${gameName} game`,
            category: 'Arcade',
            icon: '🎮',
            difficulty: 'Medium',
            file: `${gameName}/index.html`,
            window_size: { width: 800, height: 600 }
        };
    }

    /**
     * Get fallback category configuration
     */
    getFallbackCategories() {
        return {
            "Arcade": { "icon": "🕹️", "color": "#dc2626" },
            "Puzzle": { "icon": "🧩", "color": "#7c3aed" },
            "Sports": { "icon": "⚽", "color": "#059669" },
            "Platform": { "icon": "🦘", "color": "#ea580c" }
        };
    }

    /**
     * Reload configuration
     */
    async reloadConfiguration() {
        console.log('🔄 Reloading configuration...');
        
        this.app.uiManager.showLoadingState('🔄 Reloading Games...', 'Reading latest configuration...');
        await this.loadConfiguration();
        this.app.uiManager.renderGames();
        this.app.uiManager.updateCategoryFilters();
    }

    /**
     * Save configuration (placeholder for future server integration)
     */
    async saveConfiguration() {
        try {
            // In a real implementation, this would save to the server
            console.log('💾 Configuration save requested (not implemented)');
            
            // For now, just update local storage for user preferences
            if (this.app.state.configData?.user_preferences) {
                try {
                    localStorage.setItem('games-hub-preferences', 
                        JSON.stringify(this.app.state.configData.user_preferences));
                } catch (error) {
                    console.warn('⚠️ Could not save preferences to localStorage:', error);
                }
            }
            
        } catch (error) {
            console.error('❌ Error saving configuration:', error);
        }
    }
}