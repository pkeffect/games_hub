// js/main.js

import { CANVAS_WIDTH, CANVAS_HEIGHT, GameState, CONFIG } from './config.js';
import { getHighScore, saveHighScore } from './storage.js';
import Snake from './snake.js';
import Food from './food.js';
import { Menu } from './menu.js';
import { Scoreboard } from './scoreboard.js';
import { Settings } from './settings.js';
import { NameEntry } from './nameentry.js';
import { GameTimer } from './timer.js';

class Game {
    constructor() {
        this.canvas = document.querySelector('[data-canvas]');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.querySelector('[data-score]');
        this.highScoreElement = document.querySelector('[data-highscore]');
        this.timerElement = document.querySelector('[data-timer]');
        this.timerDisplay = document.querySelector('[data-timer-display]');
        
        this.snake = new Snake(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.food = new Food(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.menu = new Menu();
        this.settings = new Settings();
        this.timer = new GameTimer();
        this.nameEntry = null;
        
        this.score = 0;
        this.highScore = getHighScore();
        this.gameState = GameState.MENU;
        this.gameLoop = null;
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        this.updateHighScoreDisplay();
        this.updateTimerDisplay();
        this.food.generateNewPosition(this.snake.body);
        this.bindEvents();
        this.startRenderLoop();
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }
    
    handleKeyPress(e) {
        e.preventDefault();
        
        switch (this.gameState) {
            case GameState.MENU:
                const selectedOption = this.menu.handleInput(e.code);
                if (selectedOption) {
                    this.handleMenuSelection(selectedOption);
                }
                break;
                
            case GameState.PLAYING:
                if (e.code === 'Escape') {
                    this.pauseGame();
                } else {
                    this.handleGameInput(e.code);
                }
                break;
                
            case GameState.PAUSED:
                if (e.code === 'Escape') {
                    this.resumeGame();
                } else if (e.code === 'Space') {
                    this.resumeGame();
                }
                break;
                
            case GameState.GAME_OVER:
                if (e.code === 'Space' || e.code === 'Enter') {
                    this.gameState = GameState.MENU;
                }
                break;
                
            case GameState.HIGH_SCORES:
                if (e.code === 'Escape') {
                    this.gameState = GameState.MENU;
                }
                break;
                
            case GameState.SETTINGS:
                if (e.code === 'Escape') {
                    this.gameState = GameState.MENU;
                } else {
                    this.settings.handleInput(e.code);
                    const action = this.settings.handleAction(this.settings.settingsOptions[this.settings.selectedIndex]?.key);
                    if (action === 'clearScores') {
                        Scoreboard.clearHighScores();
                        Scoreboard.setDefaultScores();
                    }
                }
                break;
                
            case GameState.ENTER_NAME:
                if (this.nameEntry) {
                    const name = this.nameEntry.handleInput(e.key);
                    if (name) {
                        Scoreboard.addScore(name, this.nameEntry.score, this.nameEntry.time, CONFIG.MAX_HIGH_SCORES);
                        this.gameState = GameState.HIGH_SCORES;
                    }
                }
                break;
        }
    }
    
    handleMenuSelection(option) {
        switch (option) {
            case 'PLAY':
                this.startGame();
                break;
            case 'HIGH SCORES':
                this.gameState = GameState.HIGH_SCORES;
                break;
            case 'SETTINGS':
                this.gameState = GameState.SETTINGS;
                break;
        }
    }
    
    handleGameInput(code) {
        const directionMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right'
        };
        
        const direction = directionMap[code];
        if (direction) {
            this.snake.changeDirection(direction);
        }
    }
    
    startGame() {
        this.gameState = GameState.PLAYING;
        this.score = 0;
        this.finalTime = null; // Reset final time from previous game
        this.updateScoreDisplay();
        this.snake.reset();
        this.food.generateNewPosition(this.snake.body);
        this.timer.reset();
        this.timer.start();
        this.updateTimerDisplay();
        this.gameLoop = setInterval(() => this.update(), this.settings.getGameSpeed());
    }
    
    pauseGame() {
        this.gameState = GameState.PAUSED;
        this.timer.pause();
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    resumeGame() {
        this.gameState = GameState.PLAYING;
        this.timer.resume();
        this.gameLoop = setInterval(() => this.update(), this.settings.getGameSpeed());
    }
    
    update() {
        this.snake.move();
        
        // Check food collision
        const head = this.snake.body[0];
        if (head.x === this.food.position.x && head.y === this.food.position.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food.generateNewPosition(this.snake.body);
        } else {
            this.snake.shrink();
        }
        
        // Check collisions
        if (this.snake.checkCollision()) {
            this.gameOver();
            return;
        }
        
        this.updateTimerDisplay();
    }
    
    gameOver() {
        this.gameState = GameState.GAME_OVER;
        const finalTime = this.timer.getFormattedTime();
        this.timer.stop();
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            saveHighScore(this.highScore);
            this.updateHighScoreDisplay();
        }
        
        // Check if this is a new high score for the leaderboard
        if (Scoreboard.isHighScore(this.score, CONFIG.MAX_HIGH_SCORES)) {
            this.nameEntry = new NameEntry(this.score, finalTime);
            this.gameState = GameState.ENTER_NAME;
        } else {
            // Store the final time for display on game over screen
            this.finalTime = finalTime;
        }
    }
    
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    updateTimerDisplay() {
        if (CONFIG.SHOW_TIMER) {
            this.timerDisplay.style.display = 'block';
            this.timerElement.textContent = this.timer.getFormattedTime();
        } else {
            this.timerDisplay.style.display = 'none';
        }
    }
    
    calculateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    startRenderLoop() {
        const renderFrame = (currentTime) => {
            this.calculateFPS(currentTime);
            this.render();
            
            if (this.nameEntry && this.gameState === GameState.ENTER_NAME) {
                this.nameEntry.update();
            }
            
            requestAnimationFrame(renderFrame);
        };
        requestAnimationFrame(renderFrame);
    }
    
    render() {
        switch (this.gameState) {
            case GameState.MENU:
                this.menu.draw(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
                break;
                
            case GameState.PLAYING:
            case GameState.PAUSED:
                this.renderGame();
                if (this.gameState === GameState.PAUSED) {
                    this.drawPauseOverlay();
                }
                break;
                
            case GameState.GAME_OVER:
                this.renderGame();
                this.drawGameOverOverlay();
                break;
                
            case GameState.HIGH_SCORES:
                Scoreboard.draw(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
                break;
                
            case GameState.SETTINGS:
                this.settings.draw(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
                break;
                
            case GameState.ENTER_NAME:
                if (this.nameEntry) {
                    this.nameEntry.draw(this.ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
                }
                break;
        }
        
        // Draw FPS if enabled
        if (CONFIG.SHOW_FPS) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px "Press Start 2P"';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, 25);
        }
    }
    
    renderGame() {
        // Clear canvas
        if (CONFIG.TRAIL_EFFECT) {
            this.ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } else {
            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }
        
        // Draw game elements
        this.food.draw();
        this.snake.draw();
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#00ff66';
        this.ctx.font = '32px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText('PRESS ESC OR SPACE TO RESUME', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
    
    drawGameOverOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        this.ctx.fillStyle = '#ff4757';
        this.ctx.font = '32px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
        // Use stored final time or fallback to current timer
        const displayTime = this.finalTime || this.timer.getFormattedTime();
        this.ctx.fillText(`TIME: ${displayTime}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText('PRESS SPACE TO RETURN TO MENU', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    }
}

// Start the game when the page loads
new Game();