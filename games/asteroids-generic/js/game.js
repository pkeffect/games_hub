// js/game.js
import { CONFIG } from './config.js';
import { Scoreboard } from './scoreboard.js';
import { Player } from './player.js';
import { Asteroid } from './asteroid.js';
import { Bullet } from './bullet.js';
import { UFO } from './ufo.js';
import { GameTimer } from './timer.js';
import { Settings } from './settings.js';
import { handleAsteroidCollisions } from './physics.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Game {
    constructor() {
        this.width = CONFIG.CANVAS_WIDTH; 
        this.height = CONFIG.CANVAS_HEIGHT;
        canvas.width = this.width; 
        canvas.height = this.height;
        
        this.gameState = 'MENU'; // MENU, SETTINGS, HELP, PLAYING, PAUSED, GAME_OVER
        this.timer = new GameTimer();
        this.settings = new Settings();
        
        // Button configurations
        const btnWidth = 200, btnHeight = 50;
        this.startButtonBounds = { x: this.width / 2 - btnWidth / 2, y: 220, width: btnWidth, height: btnHeight };
        this.settingsButtonBounds = { x: this.width / 2 - btnWidth / 2, y: 290, width: btnWidth, height: btnHeight };
        this.helpButtonBounds = { x: this.width / 2 - btnWidth / 2, y: 360, width: btnWidth, height: btnHeight };
        this.backButtonBounds = { x: this.width / 2 - btnWidth / 2, y: 520, width: btnWidth, height: btnHeight };
        
        // Game objects
        this.player = null; 
        this.bullets = []; 
        this.asteroids = []; 
        this.particles = []; 
        this.ufo = null;
        
        // Game state
        this.score = 0; 
        this.level = 0; 
        this.lives = 0;
        this.extraLifeAwarded = false; 
        this.ufoSpawnTimer = CONFIG.UFO_SPAWN_TIME;
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
        this.finalTime = "00:00.00"; // Store final time for game over screen
        
        // Screen shake system
        this.screenShake = {
            intensity: 0,
            duration: 0,
            x: 0,
            y: 0
        };
        
        this.setup();
    }

    // Screen shake system
    addScreenShake(intensity, duration) {
        if (!CONFIG.SCREEN_SHAKE) return;
        
        // Add to existing shake instead of replacing
        this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
        this.screenShake.duration = Math.max(this.screenShake.duration, duration);
    }

    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration--;
            
            // Generate random shake offset
            const shakeAmount = this.screenShake.intensity * (this.screenShake.duration / 30);
            this.screenShake.x = (Math.random() - 0.5) * shakeAmount;
            this.screenShake.y = (Math.random() - 0.5) * shakeAmount;
            
            // Decay intensity
            this.screenShake.intensity *= 0.9;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
            this.screenShake.intensity = 0;
        }
    }

    setup() { 
        this.setupInput(); 
        this.gameLoop(); 
    }
    
    resetGame() {
        this.level = 0; 
        this.score = 0; 
        this.lives = 3; 
        this.gameState = 'PLAYING';
        this.player = new Player(this.width / 2, this.height / 2); 
        this.ufo = null;
        this.extraLifeAwarded = false; 
        this.ufoSpawnTimer = CONFIG.UFO_SPAWN_TIME;
        this.frameCount = 0;
        this.finalTime = "00:00.00";
        this.timer.reset();
        this.timer.start();
        
        this.spawnLevel();
    }
    
    spawnLevel() {
        this.level++;
        this.bullets = [];
        this.asteroids = [];
        this.ufoSpawnTimer = CONFIG.UFO_SPAWN_TIME;
        
        // Spawn asteroids using the safe spawning method
        const numAsteroids = CONFIG.ASTEROID_NUM_START + Math.floor((this.level - 1) / 2);
        
        for (let i = 0; i < numAsteroids; i++) {
            const asteroid = Asteroid.createSafeAsteroid(
                this.width / 2, 
                this.height / 2, 
                this.width, 
                this.height, 
                'large', 
                this.level,
                this.asteroids
            );
            this.asteroids.push(asteroid);
        }
    }

    isPointInRect(x, y, rect) { 
        return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height; 
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Global controls
            if (e.code === 'Escape') {
                e.preventDefault();
                if (this.gameState === 'PLAYING') {
                    this.gameState = 'PAUSED';
                    this.timer.pause();
                } else if (this.gameState === 'PAUSED') {
                    this.gameState = 'PLAYING';
                    this.timer.resume();
                } else if (this.gameState === 'SETTINGS' || this.gameState === 'HELP') {
                    this.gameState = 'MENU';
                }
                return;
            }
            
            // Settings menu controls
            if (this.gameState === 'SETTINGS') {
                this.settings.handleInput(e.code);
                return;
            }
            
            // Game over screen
            if (this.gameState === 'GAME_OVER' && e.code === "Space") { 
                e.preventDefault(); 
                this.gameState = 'MENU'; 
                return;
            }
            
            // Pause screen
            if (this.gameState === 'PAUSED') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.gameState = 'PLAYING';
                    this.timer.resume();
                }
                return;
            }
            
            // Gameplay controls
            if (this.gameState !== 'PLAYING' || !this.player || this.player.isDestroyed) return;
            
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': 
                    this.player.isThrusting = true; 
                    break;
                case 'KeyA': case 'ArrowLeft': 
                    this.player.rotation = -CONFIG.PLAYER_TURN_SPEED; 
                    break;
                case 'KeyD': case 'ArrowRight': 
                    this.player.rotation = CONFIG.PLAYER_TURN_SPEED; 
                    break;
                case 'Space': 
                    e.preventDefault(); 
                    this.shoot(); 
                    break;
                case 'KeyH': case 'ShiftLeft': case 'ShiftRight': 
                    e.preventDefault(); 
                    this.player.hyperspace(); 
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.gameState !== 'PLAYING' || !this.player) return;
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': 
                    this.player.isThrusting = false; 
                    break;
                case 'KeyA': case 'ArrowLeft': case 'KeyD': case 'ArrowRight': 
                    this.player.rotation = 0; 
                    break;
            }
        });
        
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left; 
            const mouseY = e.clientY - rect.top;
            
            switch (this.gameState) {
                case 'MENU':
                    if (this.isPointInRect(mouseX, mouseY, this.startButtonBounds)) this.resetGame();
                    if (this.isPointInRect(mouseX, mouseY, this.settingsButtonBounds)) this.gameState = 'SETTINGS';
                    if (this.isPointInRect(mouseX, mouseY, this.helpButtonBounds)) this.gameState = 'HELP';
                    break;
                case 'HELP':
                    if (this.isPointInRect(mouseX, mouseY, this.backButtonBounds)) this.gameState = 'MENU';
                    break;
                case 'PAUSED':
                    this.gameState = 'PLAYING';
                    this.timer.resume();
                    break;
            }
        });
    }

    shoot() {
        if (this.bullets.filter(b => b.owner === 'PLAYER').length < CONFIG.BULLET_MAX) {
            const bulletX = this.player.x + CONFIG.PLAYER_SIZE / 2 * Math.cos(this.player.angle);
            const bulletY = this.player.y - CONFIG.PLAYER_SIZE / 2 * Math.sin(this.player.angle);
            this.bullets.push(new Bullet(bulletX, bulletY, this.player.angle, CONFIG.BULLET_SPEED));
        }
    }

    checkCollisions() {
        if (this.player && !this.player.isDestroyed) {
            // Player vs Asteroids
            for (let ast of this.asteroids) {
                if (Math.hypot(this.player.x - ast.x, this.player.y - ast.y) < this.player.radius + ast.radius) { 
                    this.destroyPlayer(); 
                    break; 
                }
            }
            // Player vs UFO
            if (this.ufo && Math.hypot(this.player.x - this.ufo.x, this.player.y - this.ufo.y) < this.player.radius + this.ufo.radius) {
                this.destroyPlayer();
            }
        }
        
        // Bullet collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            if (bullet.owner === 'PLAYER') {
                // Player bullets vs Asteroids
                for (let j = this.asteroids.length - 1; j >= 0; j--) {
                    const ast = this.asteroids[j];
                    if (Math.hypot(bullet.x - ast.x, bullet.y - ast.y) < ast.radius) { 
                        this.splitAsteroid(j); 
                        this.bullets.splice(i, 1); 
                        break; 
                    }
                }
                // Player bullets vs UFO
                if (this.ufo && Math.hypot(bullet.x - this.ufo.x, bullet.y - this.ufo.y) < this.ufo.radius) {
                    this.score += this.ufo.isSmall ? CONFIG.UFO_SMALL_POINTS : CONFIG.UFO_LARGE_POINTS;
                    
                    // Add screen shake for UFO destruction
                    this.addScreenShake(10, 20);
                    
                    this.ufo = null; 
                    this.bullets.splice(i, 1);
                }
            } else if (bullet.owner === 'UFO' && this.player && !this.player.isDestroyed) {
                // UFO bullets vs Player
                if (Math.hypot(bullet.x - this.player.x, bullet.y - this.player.y) < this.player.radius) { 
                    this.destroyPlayer(); 
                    this.bullets.splice(i, 1); 
                }
            }
        }
    }

    splitAsteroid(index) {
        const ast = this.asteroids[index];
        this.score += ast.points;
        
        // Create fragments
        const fragments = ast.split();
        this.asteroids.splice(index, 1);
        
        // Add fragments to asteroid array
        this.asteroids.push(...fragments);
        
        // Create particles for explosion effect
        this.createAsteroidExplosion(ast.x, ast.y, ast.radius);
        
        // Add screen shake based on asteroid size
        const shakeIntensity = ast.size === 'large' ? 8 : ast.size === 'medium' ? 5 : 3;
        this.addScreenShake(shakeIntensity, 15);
    }
    
    createAsteroidExplosion(x, y, radius) {
        const numParticles = Math.min(CONFIG.PARTICLE_COUNT, Math.floor(radius / 5));
        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.PI * 2 / numParticles) * i + Math.random() * 0.5;
            const speed = Math.random() * 2 + 1;
            const vel = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            this.particles.push({
                x: x,
                y: y,
                vel: vel,
                lifespan: 30 + Math.random() * 30,
                radius: Math.random() * 2 + 1,
                update() {
                    this.x += this.vel.x;
                    this.y += this.vel.y;
                    this.lifespan--;
                    this.vel.x *= 0.98;
                    this.vel.y *= 0.98;
                },
                draw(ctx) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.lifespan / 60})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }
    
    handleGameOver() {
        // Capture final time before stopping timer
        this.finalTime = this.timer.getFormattedTime();
        this.gameState = 'GAME_OVER';
        this.timer.stop();
        
        if (Scoreboard.isHighScore(this.score, CONFIG.HIGHSCORE_LIST_MAX)) {
            const name = prompt("High score! Enter name (3 chars):", "ACE");
            if (name) {
                Scoreboard.addScore(
                    name.substring(0, 3).toUpperCase(), 
                    this.score, 
                    this.finalTime, 
                    CONFIG.HIGHSCORE_LIST_MAX
                );
            }
        }
    }

    destroyPlayer() {
        if (this.player.isDestroyed) return;
        this.player.isDestroyed = true;
        this.particles.push(...this.player.createExplosion());
        
        // Add intense screen shake for player death
        this.addScreenShake(15, 25);
        
        this.lives--;
        if (this.lives < 0) {
            this.handleGameOver();
        } else {
            setTimeout(() => { 
                this.player = new Player(this.width / 2, this.height / 2); 
            }, 2000);
        }
    }

    updateUFO() {
        // UFO spawning logic - improved from original
        if (this.asteroids.length > 0 && !this.ufo && this.score >= CONFIG.UFO_MIN_SCORE) {
            if (this.ufoSpawnTimer > 0) {
                this.ufoSpawnTimer--;
            } else {
                // Chance-based spawning instead of guaranteed
                if (Math.random() < CONFIG.UFO_SPAWN_CHANCE) {
                    // Small UFO is more likely when fewer asteroids remain or at higher levels
                    const isSmall = this.asteroids.length <= 3 || this.level >= 3;
                    this.ufo = new UFO(isSmall);
                }
                this.ufoSpawnTimer = CONFIG.UFO_SPAWN_TIME + Math.random() * CONFIG.UFO_SPAWN_TIME * 0.5;
            }
        }
        
        // Update UFO if it exists
        if (this.ufo) {
            this.ufo.update((this.player && !this.player.isDestroyed) ? this.player : null, this.bullets);
            // Remove UFO if it goes off screen
            if (this.ufo.x < -50 || this.ufo.x > this.width + 50) {
                this.ufo = null;
            }
        }
    }

    update() {
        this.frameCount++;
        
        // FPS calculation
        if (this.frameCount % 60 === 0) {
            const now = performance.now();
            if (this.lastFpsUpdate > 0) {
                this.fps = Math.round(60000 / (now - this.lastFpsUpdate));
            }
            this.lastFpsUpdate = now;
        }
        
        if (this.gameState === 'PLAYING') {
            // Update player
            if (this.player && !this.player.isDestroyed) {
                this.player.update();
            }
            
            // Extra life check
            if (!this.extraLifeAwarded && this.score >= CONFIG.EXTRA_LIFE_SCORE) { 
                this.lives++; 
                this.extraLifeAwarded = true;
            }

            // Update asteroids
            this.asteroids.forEach(a => a.update());
            
            // Update bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                bullet.update();
                
                // Remove bullets that are off screen or expired
                if (bullet.lifespan <= 0 || 
                    bullet.x < -10 || bullet.x > this.width + 10 ||
                    bullet.y < -10 || bullet.y > this.height + 10) {
                    this.bullets.splice(i, 1);
                }
            }

            // Update UFO
            this.updateUFO();

            // Check collisions
            this.checkCollisions();
            
            // Handle asteroid collisions (now does nothing in classic mode)
            handleAsteroidCollisions(this.asteroids);
            
            // Check for level clear condition
            if (this.asteroids.length === 0 && !this.ufo) {
                setTimeout(() => this.spawnLevel(), 1000);
            }
        }
        
        // Update screen shake regardless of game state
        this.updateScreenShake();
        
        // Update particles regardless of game state
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            if (particle.lifespan <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear screen
        ctx.fillStyle = "#000"; 
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Apply screen shake
        ctx.save();
        if (CONFIG.SCREEN_SHAKE && this.screenShake.duration > 0) {
            ctx.translate(this.screenShake.x, this.screenShake.y);
        }
        
        // Apply glow effect if enabled
        if (CONFIG.GLOW_EFFECT) { 
            ctx.shadowBlur = CONFIG.GLOW_BLUR; 
            ctx.shadowColor = "white"; 
        }
        
        switch (this.gameState) {
            case 'MENU': 
                this.drawMenu(); 
                break;
            case 'SETTINGS':
                this.settings.draw(ctx, this.width, this.height);
                break;
            case 'HELP': 
                this.drawHelp(); 
                break;
            case 'PLAYING':
            case 'PAUSED':
                // Draw game objects
                if (this.player && !this.player.isDestroyed) this.player.draw(ctx);
                this.bullets.forEach(b => b.draw(ctx)); 
                this.asteroids.forEach(a => a.draw(ctx));
                if (this.ufo) this.ufo.draw(ctx);
                this.drawUI();
                
                // Draw pause overlay
                if (this.gameState === 'PAUSED') {
                    this.drawPauseOverlay();
                }
                break;
            case 'GAME_OVER': 
                this.drawGameOver(); 
                break;
        }
        
        // Draw particles
        this.particles.forEach(p => p.draw(ctx));
        
        // Reset glow effect
        if (CONFIG.GLOW_EFFECT) ctx.shadowBlur = 0;
        
        // Restore canvas state (removes screen shake translation)
        ctx.restore();
    }
    
    drawUI() {
        ctx.fillStyle = "white"; 
        ctx.font = "24px 'Courier New', Courier, monospace"; 
        ctx.textAlign = "left";
        
        // Score (top left)
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        
        // Timer (bottom left)
        if (CONFIG.SHOW_TIMER) {
            this.timer.draw(ctx, 20, this.height - 20);
        }
        
        // FPS (top right)
        if (CONFIG.SHOW_FPS) {
            ctx.textAlign = "right";
            ctx.fillText(`FPS: ${this.fps}`, this.width - 20, 40);
            ctx.textAlign = "left";
        }
        
        // Lives (top right)
        if (this.lives >= 0) {
            for (let i = 0; i < this.lives; i++) {
                const x = this.width - 60 - (i * 25), y = 40, r = CONFIG.PLAYER_SIZE / 2;
                ctx.strokeStyle = 'white'; 
                ctx.lineWidth = 2; 
                ctx.beginPath();
                ctx.moveTo(x, y - r); 
                ctx.lineTo(x - r * 0.5, y + r * 0.5); 
                ctx.lineTo(x + r * 0.5, y + r * 0.5);
                ctx.closePath(); 
                ctx.stroke();
            }
        }
        
        // Level indicator
        ctx.textAlign = "center";
        ctx.font = "20px 'Courier New', Courier, monospace";
        ctx.fillText(`Level ${this.level}`, this.width / 2, 40);
    }
    
    drawMenu() {
        ctx.fillStyle = "white"; 
        ctx.textAlign = "center"; 
        ctx.font = "70px 'Courier New', Courier, monospace";
        ctx.fillText("ASTEROIDS", this.width / 2, 120);
        
        ctx.font = "16px 'Courier New', Courier, monospace";
        ctx.fillText("A Classic Arcade Experience", this.width / 2, 160);
        
        // Draw buttons
        ctx.strokeStyle = "white"; 
        ctx.lineWidth = 3;
        ctx.font = "30px 'Courier New', Courier, monospace";
        
        // Start button
        ctx.strokeRect(this.startButtonBounds.x, this.startButtonBounds.y, this.startButtonBounds.width, this.startButtonBounds.height);
        ctx.fillText("START", this.width / 2, this.startButtonBounds.y + 35);
        
        // Settings button
        ctx.strokeRect(this.settingsButtonBounds.x, this.settingsButtonBounds.y, this.settingsButtonBounds.width, this.settingsButtonBounds.height);
        ctx.fillText("SETTINGS", this.width / 2, this.settingsButtonBounds.y + 35);
        
        // Help button
        ctx.strokeRect(this.helpButtonBounds.x, this.helpButtonBounds.y, this.helpButtonBounds.width, this.helpButtonBounds.height);
        ctx.fillText("HELP", this.width / 2, this.helpButtonBounds.y + 35);
    }
    
    drawHelp() {
        ctx.fillStyle = "white"; 
        ctx.textAlign = "center"; 
        ctx.font = "50px 'Courier New', Courier, monospace";
        ctx.fillText("HOW TO PLAY", this.width / 2, 80); 
        
        ctx.textAlign = "left";
        ctx.font = "18px 'Courier New', Courier, monospace";
        const helpText = [
            "MOVEMENT:",
            "  [W] or [UP] - Thrust Forward",
            "  [A/D] or [LEFT/RIGHT] - Rotate Ship",
            "  [SPACE] - Fire Weapon",
            "  [H] or [SHIFT] - Hyperspace (Emergency Teleport)",
            "",
            "GAMEPLAY:",
            "  • Destroy asteroids to score points",
            "  • Large asteroids split into smaller pieces",
            "  • Watch out for UFOs - they shoot back!",
            "  • Earn an extra life at 10,000 points",
            "",
            "CONTROLS:",
            "  [ESC] - Pause Game / Settings Navigation",
            "  [SPACE] - Resume from Pause"
        ];
        
        for (let i = 0; i < helpText.length; i++) { 
            ctx.fillText(helpText[i], 80, 130 + i * 24); 
        }
        
        ctx.textAlign = "center"; 
        ctx.strokeStyle = "white"; 
        ctx.lineWidth = 3;
        ctx.strokeRect(this.backButtonBounds.x, this.backButtonBounds.y, this.backButtonBounds.width, this.backButtonBounds.height);
        ctx.font = "30px 'Courier New', Courier, monospace"; 
        ctx.fillText("BACK", this.width / 2, this.backButtonBounds.y + 35);
    }
    
    drawPauseOverlay() {
        // Semi-transparent overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "50px 'Courier New', Courier, monospace";
        ctx.fillText("PAUSED", this.width / 2, this.height / 2 - 50);
        
        ctx.font = "24px 'Courier New', Courier, monospace";
        ctx.fillText("Press SPACE or click to resume", this.width / 2, this.height / 2 + 20);
        ctx.fillText("Press ESC to return to menu", this.width / 2, this.height / 2 + 60);
    }
    
    drawGameOver() {
        ctx.fillStyle = "white"; 
        ctx.textAlign = "center"; 
        ctx.font = "50px 'Courier New', Courier, monospace";
        ctx.fillText("GAME OVER", this.width / 2, this.height / 2 - 150);
        
        ctx.font = "24px 'Courier New', Courier, monospace"; 
        ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 - 110);
        ctx.fillText(`Time Played: ${this.finalTime}`, this.width / 2, this.height / 2 - 80);
        ctx.fillText(`Level Reached: ${this.level}`, this.width / 2, this.height / 2 - 50);
        
        ctx.font = "28px 'Courier New', Courier, monospace"; 
        ctx.fillText("HIGH SCORES", this.width / 2, this.height / 2 - 10);
        
        const highScores = Scoreboard.getHighScores();
        if (highScores.length === 0) {
            ctx.font = "16px 'Courier New', Courier, monospace"; 
            ctx.fillText("No scores yet!", this.width / 2, this.height / 2 + 30);
        } else {
            // Draw column headers
            ctx.font = "16px 'Courier New', Courier, monospace";
            ctx.textAlign = "left";
            ctx.fillText("NAME", this.width / 2 - 150, this.height / 2 + 15);
            ctx.textAlign = "center";
            ctx.fillText("SCORE", this.width / 2, this.height / 2 + 15);
            ctx.textAlign = "right";
            ctx.fillText("TIME", this.width / 2 + 150, this.height / 2 + 15);
            
            // Draw scores
            ctx.font = "18px 'Courier New', Courier, monospace";
            ctx.textAlign = "left";
            highScores.forEach((entry, index) => { 
                const y = this.height / 2 + 40 + (index * 22);
                ctx.fillText(`${entry.name}`, this.width / 2 - 150, y);
                ctx.textAlign = "center";
                ctx.fillText(`${entry.score}`, this.width / 2, y);
                ctx.textAlign = "right";
                ctx.fillText(`${entry.time}`, this.width / 2 + 150, y);
                ctx.textAlign = "left";
            });
        }
        
        ctx.textAlign = "center";
        ctx.font = "20px 'Courier New', Courier, monospace"; 
        ctx.fillText("Press SPACE to return to Menu", this.width / 2, this.height - 40);
    }
    
    gameLoop = () => { 
        this.update(); 
        this.draw(); 
        requestAnimationFrame(this.gameLoop); 
    }
}

// Create game instance and make it globally available for settings
const game = new Game();
window.game = game;