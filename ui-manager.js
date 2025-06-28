/**
 * UI MANAGER - Handles DOM manipulation and rendering
 */
class UIManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * Render all games in the grid
     */
    renderGames() {
        if (!this.app.elements.gamesGrid) return;

        this.app.elements.gamesGrid.innerHTML = '';

        if (!this.app.state.gamesData || Object.keys(this.app.state.gamesData).length === 0) {
            this.renderNoGamesState();
            return;
        }

        const fragment = document.createDocumentFragment();
        
        for (const [gameId, gameData] of Object.entries(this.app.state.gamesData)) {
            const gameCard = this.createGameCard(gameId, gameData);
            fragment.appendChild(gameCard);
        }
        
        this.app.elements.gamesGrid.appendChild(fragment);
        console.log(`🎮 Rendered ${Object.keys(this.app.state.gamesData).length} game cards`);
    }

    /**
     * Create a single game card element
     */
    createGameCard(gameId, gameData) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-category', gameData.category || 'Other');
        card.setAttribute('data-game-id', gameId);
        
        const category = gameData.category || 'Other';
        const categoryInfo = this.app.state.categoriesData?.[category] || { icon: '🎮', color: '#6b7280' };
        
        const isDisabled = !gameData.file || gameId === 'demo_instructions';
        if (isDisabled) {
            card.classList.add('disabled');
            card.onclick = () => this.app.gameManager.showInstructions();
        } else {
            card.onclick = () => this.app.gameManager.launchGame(gameId, gameData.file);
        }
        
        card.innerHTML = this.generateGameCardHTML(gameData, categoryInfo, gameId);
        
        return card;
    }

    /**
     * Generate HTML content for game card
     */
    generateGameCardHTML(gameData, categoryInfo, gameId) {
        const { show_difficulty, show_categories } = this.app.state.uiSettings || {};
        
        return `
            <div class="game-icon">${gameData.icon || '🎮'}</div>
            <div class="game-info">
                <h3>${gameData.name || this.app.capitalizeWords(gameId)}</h3>
                <p>${gameData.description || 'Classic retro game'}</p>
                <div class="game-meta">
                    <span class="game-category" 
                          data-show="${show_categories !== false}"
                          style="background-color: ${categoryInfo.color}20; color: ${categoryInfo.color};">
                        ${categoryInfo.icon} ${gameData.category || 'Other'}
                    </span>
                    <span class="game-difficulty difficulty-${(gameData.difficulty || 'medium').toLowerCase()}"
                          data-show="${show_difficulty !== false}">
                        ${gameData.difficulty || 'Medium'}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Render no games found state
     */
    renderNoGamesState() {
        this.app.elements.gamesGrid.innerHTML = `
            <div class="no-games-state">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎮</div>
                <h3>No Games Found</h3>
                <p>No games were detected in your /games/ directory.</p>
                <p style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.7;">
                    Add games to <code>/cache/functions/games_hub/games/[game-name]/index.html</code>
                </p>
                <p style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.7;">
                    Run <code>!games scan</code> to refresh the games list
                </p>
            </div>
        `;
    }

    /**
     * Show no games state
     */
    showNoGamesState() {
        this.app.setState({
            gamesData: {
                "demo_instructions": {
                    "name": "🎮 Add Games Here",
                    "description": "Drop HTML5 games into the games/ directory. Each game needs an index.html file.",
                    "category": "Instructions",
                    "icon": "📁",
                    "difficulty": "Info",
                    "file": "",
                    "controls": ["See individual game instructions"],
                    "features": ["Plug-and-play system", "Auto-detection", "Retro theme"]
                }
            },
            categoriesData: {
                "Instructions": {"icon": "📚", "color": "#6b7280"}
            }
        });
        this.renderGames();
        this.updateCategoryFilters();
    }

    /**
     * Update category filter buttons
     */
    updateCategoryFilters() {
        if (!this.app.elements.categoryFilters || !this.app.state.categoriesData) return;

        // Clear existing filters and start with "All" button
        this.app.elements.categoryFilters.innerHTML = 
            '<button class="category-btn active" data-category="all">All</button>';

        const fragment = document.createDocumentFragment();
        
        for (const [category, info] of Object.entries(this.app.state.categoriesData)) {
            const button = this.createCategoryButton(category, info);
            fragment.appendChild(button);
        }
        
        this.app.elements.categoryFilters.appendChild(fragment);
        
        // Bind "All" button event
        const allButton = this.app.elements.categoryFilters.querySelector('[data-category="all"]');
        if (allButton) {
            allButton.addEventListener('click', () => 
                this.app.eventManager.handleCategoryFilter('all', allButton));
        }
        
        console.log(`🏷️ Updated category filters: ${Object.keys(this.app.state.categoriesData).length} categories`);
    }

    /**
     * Create category filter button
     */
    createCategoryButton(category, info) {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', category);
        button.textContent = `${info.icon} ${category}`;
        button.addEventListener('click', () => 
            this.app.eventManager.handleCategoryFilter(category, button));
        return button;
    }

    /**
     * Update scan information in controls section
     */
    updateScanInfo(customMessage = null) {
        const scanInfoElement = document.getElementById('scanInfoText');
        if (!scanInfoElement) return;
        
        if (customMessage) {
            scanInfoElement.textContent = customMessage;
            return;
        }
        
        if (this.app.state.scanMetadata) {
            const { scan_timestamp, games_found } = this.app.state.scanMetadata;
            scanInfoElement.textContent = `Last scan: ${scan_timestamp} - Found ${games_found} games`;
        } else {
            scanInfoElement.textContent = '';
        }
    }

    /**
     * Update active category filter
     */
    updateActiveFilter(activeButton) {
        const buttons = this.app.elements.categoryFilters.querySelectorAll('.category-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    /**
     * Filter games based on search and category
     */
    filterGames() {
        const gameCards = document.querySelectorAll('.game-card');
        let visibleCount = 0;
        
        gameCards.forEach(card => {
            const isVisible = this.shouldShowCard(card);
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });

        console.log(`🔍 Filtered games: ${visibleCount} visible`);
    }

    /**
     * Determine if a card should be visible based on filters
     */
    shouldShowCard(card) {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const category = card.getAttribute('data-category');
        
        const matchesSearch = !this.app.state.searchTerm || 
            name.includes(this.app.state.searchTerm) || 
            description.includes(this.app.state.searchTerm) ||
            category.toLowerCase().includes(this.app.state.searchTerm);
            
        const matchesCategory = this.app.state.currentFilter === 'all' || 
            category === this.app.state.currentFilter;
        
        return matchesSearch && matchesCategory;
    }

    /**
     * Show loading state
     */
    showLoadingState(title, message) {
        if (!this.app.elements.gamesGrid) return;
        
        this.app.elements.gamesGrid.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Focus search input
     */
    focusSearch() {
        if (this.app.elements.searchInput) {
            this.app.elements.searchInput.focus();
            this.app.elements.searchInput.select();
        }
    }

    /**
     * Show notification to user
     */
    showNotification(title, message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());

        const notification = this.createNotification(title, message, type);
        document.body.appendChild(notification);
        
        this.scheduleNotificationRemoval(notification);
    }

    /**
     * Create notification element
     */
    createNotification(title, message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: var(--app-surface);
            border: 1px solid ${colors[type]};
            border-left: 4px solid ${colors[type]};
            border-radius: 0.5rem;
            padding: 1rem;
            max-width: 360px;
            z-index: 10000;
            color: var(--app-text-primary);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.05);
            backdrop-filter: blur(10px);
            animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.875rem;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 0.25rem; color: ${colors[type]};">${title}</div>
                    <div style="color: var(--app-text-secondary); line-height: 1.4;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: var(--app-text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    transition: all 0.2s;
                    font-size: 1rem;
                    line-height: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " onmouseover="this.style.background='var(--app-surface-hover)'; this.style.color='var(--app-text-primary)'" 
                   onmouseout="this.style.background='none'; this.style.color='var(--app-text-muted)'">✕</button>
            </div>
        `;
        
        return notification;
    }

    /**
     * Schedule notification removal
     */
    scheduleNotificationRemoval(notification) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutToRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}