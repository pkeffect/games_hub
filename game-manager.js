/**
 * GAME MANAGER - Handles game launching and window management
 */
class GameManager {
    constructor(app) {
        this.app = app;
        this.windowSizeDefaults = {
            // Category defaults
            'Arcade': { width: 800, height: 600 },
            'Puzzle': { width: 600, height: 800 },
            'Sports': { width: 800, height: 600 },
            'Platform': { width: 1000, height: 700 },
            'Action': { width: 1200, height: 800 },
            'Strategy': { width: 1000, height: 800 },
            
            // Specific game overrides
            'pong': { width: 800, height: 600 },
            'snake': { width: 600, height: 600 },
            'tetris': { width: 500, height: 700 },
            'breakout': { width: 800, height: 600 },
            'space-invaders': { width: 800, height: 700 },
            'pacman': { width: 800, height: 900 },
            '2048': { width: 600, height: 700 },
            
            // Default fallback
            'default': { width: 1000, height: 800 }
        };
    }

    /**
     * Launch a game with optimal window size
     */
    launchGame(gameId, gameFile) {
        if (!gameFile) {
            this.app.uiManager.showNotification(
                '⚠️ Game file not found!', 
                'This game appears to be misconfigured.', 
                'warning'
            );
            return;
        }
        
        console.log(`🎮 Launching game: ${gameId} with custom window size`);
        
        const gameUrl = `/cache/functions/games_hub/games/${gameFile}`;
        const windowSize = this.getGameWindowSize(gameId);
        const gameWindow = this.openCustomWindow(gameUrl, `game_${gameId}`, windowSize);
        
        if (!gameWindow) {
            this.app.uiManager.showNotification(
                '🚫 Popup Blocked!', 
                'Please allow popups for this site to play games.',
                'error'
            );
        } else {
            this.handleSuccessfulGameLaunch(gameId, windowSize);
        }
    }

    /**
     * Determine optimal window size for a game
     */
    getGameWindowSize(gameId) {
        const gameData = this.app.state.gamesData[gameId];
        
        // 1. Check if game has custom window size in config
        if (gameData?.window_size) {
            console.log(`📏 Using config window size for ${gameId}:`, gameData.window_size);
            return gameData.window_size;
        }
        
        // 2. Check config-level window size defaults
        if (this.app.state.configData?.window_size_defaults) {
            const category = gameData?.category;
            if (category && this.app.state.configData.window_size_defaults[category]) {
                console.log(`📏 Using config category default for ${gameId} (${category}):`, 
                    this.app.state.configData.window_size_defaults[category]);
                return this.app.state.configData.window_size_defaults[category];
            }
        }
        
        // 3. Check specific game overrides in built-in defaults
        const normalizedGameId = gameId.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const [key, size] of Object.entries(this.windowSizeDefaults)) {
            if (normalizedGameId.includes(key.toLowerCase()) && key !== 'default') {
                console.log(`📏 Using built-in game override for ${gameId}:`, size);
                return size;
            }
        }
        
        // 4. Check category defaults in built-in defaults
        const category = gameData?.category;
        if (category && this.windowSizeDefaults[category]) {
            console.log(`📏 Using built-in category default for ${gameId} (${category}):`, 
                this.windowSizeDefaults[category]);
            return this.windowSizeDefaults[category];
        }
        
        // 5. Fallback to default
        console.log(`📏 Using default window size for ${gameId}:`, this.windowSizeDefaults.default);
        return this.windowSizeDefaults.default;
    }

    /**
     * Open game in custom-sized window
     */
    openCustomWindow(url, name, windowSize) {
        const { width, height } = windowSize;
        
        // Center the window on screen
        const screenWidth = window.screen.availWidth || 1920;
        const screenHeight = window.screen.availHeight || 1080;
        const left = Math.max(0, Math.floor((screenWidth - width) / 2));
        const top = Math.max(0, Math.floor((screenHeight - height) / 2));
        
        const windowFeatures = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'scrollbars=yes',
            'resizable=yes',
            'menubar=no',
            'toolbar=no',
            'status=no',
            'location=no'
        ].join(',');
        
        console.log(`🪟 Opening window: ${width}x${height} at ${left},${top}`);
        
        return window.open(url, name, windowFeatures);
    }

    /**
     * Open game in maximized window (fallback method)
     */
    openMaximizedWindow(url, name) {
        const screenWidth = window.screen.availWidth || 1920;
        const screenHeight = window.screen.availHeight || 1080;
        
        const windowFeatures = [
            `width=${screenWidth}`,
            `height=${screenHeight}`,
            'left=0',
            'top=0',
            'scrollbars=yes',
            'resizable=yes',
            'menubar=no',
            'toolbar=no',
            'status=no',
            'location=no'
        ].join(',');
        
        return window.open(url, name, windowFeatures);
    }

    /**
     * Handle successful game launch
     */
    handleSuccessfulGameLaunch(gameId, windowSize) {
        console.log(`✅ Game launched: ${gameId} (${windowSize.width}x${windowSize.height})`);
        this.addLaunchFeedback(gameId);
        this.app.uiManager.showNotification(
            '🎮 Game Launched!', 
            `${gameId} opened in ${windowSize.width}×${windowSize.height} window.`, 
            'success'
        );
    }

    /**
     * Add visual feedback to launched game card
     */
    addLaunchFeedback(gameId) {
        const gameCard = document.querySelector(`[data-game-id="${gameId}"]`);
        if (!gameCard) return;
        
        const originalStyle = {
            borderColor: gameCard.style.borderColor,
            transform: gameCard.style.transform
        };
        
        gameCard.style.borderColor = '#06b6d4';
        gameCard.style.transform = 'translateY(-4px) scale(1.02)';
        
        setTimeout(() => {
            gameCard.style.borderColor = originalStyle.borderColor;
            gameCard.style.transform = originalStyle.transform;
        }, 2000);
    }

    /**
     * Show game instructions
     */
    showInstructions() {
        this.app.uiManager.showNotification(
            '📁 Add Games',
            'Place HTML5 games in /cache/functions/games_hub/games/[game-name]/index.html then run "!games scan" to refresh.',
            'info'
        );
    }

    /**
     * Get recommended window size for a category
     */
    getRecommendedSizeForCategory(category) {
        return this.windowSizeDefaults[category] || this.windowSizeDefaults.default;
    }

    /**
     * Validate window size
     */
    validateWindowSize(size) {
        if (!size || typeof size !== 'object') return false;
        if (!size.width || !size.height) return false;
        if (size.width < 300 || size.height < 200) return false;
        if (size.width > 2560 || size.height > 1440) return false;
        return true;
    }

    /**
     * Get safe window size (ensures it fits on screen)
     */
    getSafeWindowSize(requestedSize) {
        const screenWidth = window.screen.availWidth || 1920;
        const screenHeight = window.screen.availHeight || 1080;
        
        return {
            width: Math.min(requestedSize.width, screenWidth - 100),
            height: Math.min(requestedSize.height, screenHeight - 100)
        };
    }
}