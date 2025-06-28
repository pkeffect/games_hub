// js/main.js - Main Game Controller

import { CONFIG, GameState, GameMode, KEYS, DEFAULT_CONTROLS } from './config.js';
import { TetrisGame } from './tetris.js';
import { Menu } from './menu.js';
import { Settings } from './settings.js';
import { NameEntry } from './nameentry.js';
import { Scoreboard } from './scoreboard.js';
import { GameTimer } from './timer.js';
import { getSettings, saveSettings } from './storage.js';

class GameController {
    constructor() {
        this.canvas = document.querySelector('[data-canvas]');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.querySelector('[data-next-canvas]');
        this.nextCtx = this.nextCanvas?.getContext('2d');
        this.holdCanvas = null;
        this.holdCtx = null;
        
        // Game state
        this.state = GameState.MENU;
        this.currentMode = GameMode.MARATHON;
        this.game = null;
        this.menu = new Menu();
        this.settings = new Settings();
        this.nameEntry = null;
        this.timer = new GameTimer();
        
        // Input handling
        this.keys = {};
        this.lastTime = 0;
        this.dasTimer = 0;
        this.arrTimer = 0;
        this.isDasActive = false;
        this.lastDirection = null;
        
        // UI elements
        this.scoreElement = document.querySelector('[data-score]');
        this.linesElement = document.querySelector('[data-lines]');
        this.levelElement = document.querySelector('[data-level]');
        this.highScoreElement = document.querySelector('[data-highscore]');
        this.timerElement = document.querySelector('[data-timer]');
        this.timerDisplay = document.querySelector('[data-timer-display]');
        this.debugElement = document.querySelector('[data-debug]');
        
        this.loadSettings();
        this.initializeInput();
        this.createHoldPanel();
        this.initializeUI();
        
        // Start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
        
        console.log('Game Controller initialized');
    }
    
    loadSettings() {
        const saved = getSettings();
        if (saved) {
            Object.assign(CONFIG, saved);
        }
        console.log('Settings loaded:', CONFIG);
    }
    
    createHoldPanel() {
        // Create hold panel dynamically if enabled
        if (CONFIG.showHold) {
            const leftPanel = document.querySelector('.left-panel');
            let holdPanel = document.querySelector('.hold-panel');
            
            if (!holdPanel && leftPanel) {
                holdPanel = document.createElement('div');
                holdPanel.className = 'info-panel hold-panel';
                holdPanel.innerHTML = `
                    <h3>Hold</h3>
                    <canvas class="hold-piece-canvas" width="100" height="100"></canvas>
                `;
                
                // Insert after level panel
                const levelPanel = leftPanel.children[2];
                leftPanel.insertBefore(holdPanel, levelPanel.nextSibling);
                
                this.holdCanvas = holdPanel.querySelector('.hold-piece-canvas');
                this.holdCtx = this.holdCanvas.getContext('2d');
            }
        }
    }
    
    initializeUI() {
        // Show/hide timer based on settings
        if (this.timerDisplay) {
            this.timerDisplay.style.display = CONFIG.showTimer ? 'block' : 'none';
        }
        
        // Initialize high score display
        if (this.highScoreElement) {
            this.highScoreElement.textContent = Scoreboard.getHighScores()[0]?.score.toLocaleString() || '0';
        }
        
        // Debug info toggle
        if (this.debugElement && CONFIG.showFPS) {
            this.debugElement.style.display = 'block';
        }
    }
    
    initializeInput() {
        // Prevent default browser behaviors
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.handleKeyDown(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.handleKeyUp(e.code);
        });
        
        // Focus management
        window.addEventListener('blur', () => {
            if (this.state === GameState.PLAYING) {
                this.pauseGame();
            }
        });
        
        console.log('Input system initialized');
    }
    
    handleKeyDown(code) {
        // Prevent key repeat for non-movement keys
        if (this.keys[code]) return;
        this.keys[code] = true;
        
        // Global keys
        if (code === 'F1') {
            this.toggleDebug();
            return;
        }
        
        // State-specific input handling
        switch (this.state) {
            case GameState.MENU:
                this.handleMenuInput(code);
                break;
            case GameState.MODE_SELECT:
                this.handleModeSelectInput(code);
                break;
            case GameState.PLAYING:
                this.handleGameInput(code);
                break;
            case GameState.PAUSED:
                this.handlePauseInput(code);
                break;
            case GameState.GAME_OVER:
                this.handleGameOverInput(code);
                break;
            case GameState.ENTER_NAME:
                this.handleNameEntryInput(code);
                break;
            case GameState.HIGH_SCORES:
                this.handleHighScoresInput(code);
                break;
            case GameState.SETTINGS:
                this.handleSettingsInput(code);
                break;
        }
    }
    
    handleKeyUp(code) {
        this.keys[code] = false;
        
        // Reset DAS when direction keys are released
        if (code === CONFIG.moveLeft || code === CONFIG.moveRight) {
            this.dasTimer = 0;
            this.arrTimer = 0;
            this.isDasActive = false;
            this.lastDirection = null;
        }
    }
    
    handleMenuInput(code) {
        const result = this.menu.handleInput(this.getInputAction(code));
        if (result) {
            this.processMenuSelection(result);
        }
    }
    
    handleModeSelectInput(code) {
        // Handle mode selection (if we implement a separate mode select screen)
        const action = this.getInputAction(code);
        if (action === 'select') {
            this.startGame(this.currentMode);
        } else if (action === 'back') {
            this.state = GameState.MENU;
        }
    }
    
    handleGameInput(code) {
        if (code === CONFIG.pause) {
            this.pauseGame();
            return;
        }
        
        if (!this.game || this.game.gameOver) return;
        
        // Movement with DAS/ARR
        if (code === CONFIG.moveLeft || code === CONFIG.moveRight) {
            this.handleMovement(code);
        }
        // Rotation controls
        else if (code === CONFIG.rotateLeft) {
            this.game.playerRotate(-1);
        }
        else if (code === CONFIG.rotateRight) {
            this.game.playerRotate(1);
        }
        else if (code === CONFIG.rotate180) {
            this.game.playerRotate180();
        }
        // Drop controls
        else if (code === CONFIG.softDrop) {
            this.game.playerSoftDrop();
        }
        else if (code === CONFIG.hardDrop) {
            this.game.playerHardDrop();
        }
        // Other controls
        else if (code === CONFIG.hold) {
            this.game.playerHold();
        }
        else if (code === CONFIG.restart) {
            this.restartGame();
        }
    }
    
    handleMovement(code) {
        const direction = code === CONFIG.moveLeft ? -1 : 1;
        
        // Initial move
        if (!this.isDasActive) {
            this.game.playerMove(direction);
            this.lastDirection = direction;
            this.dasTimer = 0;
            this.isDasActive = true;
        }
    }
    
    handlePauseInput(code) {
        if (code === CONFIG.pause || code === 'Escape') {
            this.resumeGame();
        }
    }
    
    handleGameOverInput(code) {
        const action = this.getInputAction(code);
        if (action === 'select' || action === 'back') {
            this.state = GameState.MENU;
        }
    }
    
    handleNameEntryInput(code) {
        if (!this.nameEntry) return;
        
        let keyChar = code;
        
        // Convert key codes to characters
        if (code.startsWith('Key')) {
            keyChar = code.slice(3);
        } else if (code.startsWith('Digit')) {
            keyChar = code.slice(5);
        } else if (code === 'Space') {
            keyChar = ' ';
        } else if (code === 'Backspace') {
            keyChar = 'Backspace';
        } else if (code === 'Enter') {
            keyChar = 'Enter';
        } else if (code === 'Tab') {
            keyChar = 'Tab';
        }
        
        const result = this.nameEntry.handleInput(keyChar);
        if (result) {
            this.completeNameEntry(result);
        }
    }
    
    handleHighScoresInput(code) {
        if (code === 'Escape') {
            this.state = GameState.MENU;
        }
    }
    
    handleSettingsInput(code) {
        const result = this.settings.handleInput(this.getInputAction(code));
        if (result === 'clearScores') {
            Scoreboard.clearHighScores();
        } else if (result === 'clearStats') {
            // Clear statistics - could implement this functionality
            console.log('Clear statistics requested');
        } else if (code === 'Escape') {
            this.state = GameState.MENU;
        }
    }
    
    getInputAction(code) {
        const actionMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down', 
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Space': 'select',
            'Enter': 'select',
            'Escape': 'back',
            'PageUp': 'pageUp',
            'PageDown': 'pageDown',
            'Tab': 'tab'
        };
        return actionMap[code] || code;
    }
    
    processMenuSelection(option) {
        console.log('Menu selection:', option);
        
        switch (option) {
            case 'MARATHON':
                this.currentMode = GameMode.MARATHON;
                this.startGame(this.currentMode);
                break;
            case 'SPRINT':
                this.currentMode = GameMode.SPRINT;
                this.startGame(this.currentMode);
                break;
            case 'ULTRA':
                this.currentMode = GameMode.ULTRA;
                this.startGame(this.currentMode);
                break;
            case 'ZEN':
                this.currentMode = GameMode.ZEN;
                this.startGame(this.currentMode);
                break;
            case 'SURVIVAL':
                this.currentMode = GameMode.SURVIVAL;
                this.startGame(this.currentMode);
                break;
            case 'HIGH SCORES':
                this.state = GameState.HIGH_SCORES;
                break;
            case 'SETTINGS':
                this.state = GameState.SETTINGS;
                break;
        }
    }
    
    startGame(mode) {
        console.log('Starting game in mode:', mode);
        
        this.game = new TetrisGame(this.ctx, this.nextCtx, this.holdCtx, mode);
        this.game.keys = this.keys; // Pass keys state to game for soft drop detection
        this.state = GameState.PLAYING;
        this.timer.start();
        
        // Mode-specific initialization
        if (mode === GameMode.ULTRA) {
            this.timer.startCountdown(CONFIG.ultraTime * 1000, () => {
                this.game.gameOver = true;
            });
        }
        
        this.updateUI();
    }
    
    restartGame() {
        if (this.game) {
            this.game.reset();
            this.timer.reset();
            this.timer.start();
            this.state = GameState.PLAYING;
            this.updateUI();
        }
    }
    
    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            this.timer.pause();
        }
    }
    
    resumeGame() {
        if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            this.timer.resume();
        }
    }
    
    endGame() {
        this.timer.stop();
        
        const gameData = this.game.getGameData();
        const finalTime = this.timer.getFormattedTime();
        
        // Check for high score
        if (Scoreboard.isHighScore(gameData.score)) {
            this.nameEntry = new NameEntry(
                gameData.score,
                gameData.lines,
                gameData.level,
                finalTime,
                gameData
            );
            this.state = GameState.ENTER_NAME;
        } else {
            this.state = GameState.GAME_OVER;
        }
    }
    
    completeNameEntry(name) {
        if (this.game) {
            const gameData = this.game.getGameData();
            Scoreboard.addScore(
                name,
                gameData.score,
                gameData.lines,
                gameData.level,
                this.timer.getFormattedTime()
            );
        }
        this.state = GameState.HIGH_SCORES;
        this.nameEntry = null;
    }
    
    updateDAS(deltaTime) {
        if (!this.isDasActive || !this.lastDirection) return;
        
        this.dasTimer += deltaTime;
        
        if (this.dasTimer >= CONFIG.dasDelay) {
            this.arrTimer += deltaTime;
            
            if (this.arrTimer >= CONFIG.arrRate) {
                this.game.playerMove(this.lastDirection);
                this.arrTimer = 0;
            }
        }
    }
    
    updateUI() {
        if (!this.game) return;
        
        const gameData = this.game.getGameData();
        
        if (this.scoreElement) {
            this.scoreElement.textContent = gameData.score.toLocaleString();
            
            // Add highlight effect for score changes
            this.scoreElement.classList.add('highlight');
            setTimeout(() => this.scoreElement.classList.remove('highlight'), 500);
        }
        
        if (this.linesElement) {
            this.linesElement.textContent = gameData.lines;
        }
        
        if (this.levelElement) {
            this.levelElement.textContent = gameData.level;
        }
        
        if (this.timerElement && CONFIG.showTimer) {
            this.timerElement.textContent = this.timer.getFormattedTime();
        }
    }
    
    updateDebugInfo(deltaTime) {
        if (!this.debugElement || !CONFIG.showFPS) return;
        
        const fps = Math.round(1000 / deltaTime);
        const gameData = this.game ? this.game.getGameData() : null;
        
        this.debugElement.innerHTML = `
            FPS: ${fps}<br>
            State: ${this.state}<br>
            Mode: ${this.currentMode}<br>
            ${gameData ? `
                Score: ${gameData.score}<br>
                Lines: ${gameData.lines}<br>
                Level: ${gameData.level}<br>
                Combo: ${gameData.combo}<br>
                PPS: ${gameData.stats.pps}
            ` : ''}
        `;
    }
    
    toggleDebug() {
        CONFIG.showFPS = !CONFIG.showFPS;
        if (this.debugElement) {
            this.debugElement.style.display = CONFIG.showFPS ? 'block' : 'none';
        }
        saveSettings(CONFIG);
    }
    
    update(deltaTime) {
        switch (this.state) {
            case GameState.MENU:
                this.menu.update();
                break;
            case GameState.PLAYING:
                if (this.game) {
                    this.updateDAS(deltaTime);
                    this.game.update(deltaTime);
                    
                    if (this.game.gameOver) {
                        this.endGame();
                    } else {
                        this.updateUI();
                    }
                }
                break;
            case GameState.SETTINGS:
                this.settings.update();
                break;
            case GameState.ENTER_NAME:
                if (this.nameEntry) {
                    this.nameEntry.update();
                }
                break;
        }
    }
    
    draw() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        switch (this.state) {
            case GameState.MENU:
                this.menu.draw(this.ctx, canvasWidth, canvasHeight);
                break;
            case GameState.PLAYING:
                if (this.game) {
                    this.game.draw();
                }
                break;
            case GameState.PAUSED:
                if (this.game) {
                    this.game.draw();
                    
                    // Draw pause overlay
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.font = 'bold 32px Orbitron, monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2);
                    
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '16px Orbitron, monospace';
                    this.ctx.fillText('Press ESC to resume', canvasWidth / 2, canvasHeight / 2 + 40);
                }
                break;
            case GameState.GAME_OVER:
                if (this.game) {
                    this.game.draw();
                    
                    // Draw game over overlay
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.font = 'bold 36px Orbitron, monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2);
                    
                    const gameData = this.game.getGameData();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '18px Orbitron, monospace';
                    this.ctx.fillText(`Score: ${gameData.score.toLocaleString()}`, canvasWidth / 2, canvasHeight / 2 + 50);
                    this.ctx.fillText(`Lines: ${gameData.lines}`, canvasWidth / 2, canvasHeight / 2 + 75);
                    
                    this.ctx.font = '14px Orbitron, monospace';
                    this.ctx.fillText('Press any key to continue', canvasWidth / 2, canvasHeight / 2 + 110);
                }
                break;
            case GameState.ENTER_NAME:
                if (this.nameEntry) {
                    this.nameEntry.draw(this.ctx, canvasWidth, canvasHeight);
                }
                break;
            case GameState.HIGH_SCORES:
                Scoreboard.draw(this.ctx, canvasWidth, canvasHeight);
                break;
            case GameState.SETTINGS:
                this.settings.draw(this.ctx, canvasWidth, canvasHeight);
                break;
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        this.updateDebugInfo(deltaTime);
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Enhanced Tetress...');
    new GameController();
});