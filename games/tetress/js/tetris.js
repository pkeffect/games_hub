// js/tetris.js

import { 
    BOARD_WIDTH, 
    BOARD_HEIGHT, 
    BLOCK_SIZE, 
    COLORS, 
    COLOR_SCHEMES, 
    PIECES, 
    CONFIG,
    WALL_KICKS,
    SPEED_SETTINGS,
    AUTHENTIC_SPEED_TABLE,
    PARTICLE_SETTINGS,
    GameMode
} from './config.js';

export class TetrisGame {
    constructor(ctx, nextCtx, holdCtx, mode = GameMode.MARATHON) {
        this.ctx = ctx;
        this.nextCtx = nextCtx;
        this.holdCtx = holdCtx;
        this.mode = mode;
        
        // Game state
        this.arena = this.createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
        this.player = { 
            pos: { x: 0, y: 0 }, 
            matrix: null, 
            rotation: 0,
            lastMove: 0 
        };
        this.ghost = { pos: { x: 0, y: 0 }, matrix: null };
        
        // Piece management
        this.bag = [];
        this.nextPieces = [];
        this.holdPiece = null;
        this.canHold = true;
        this.pieceIndex = 0;
        
        // Game metrics
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = 0;
        this.totalPieces = 0;
        
        // Timing
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lockDelay = 0;
        this.lockDelayTimer = 0;
        this.lockDelayResets = 0;
        this.maxLockDelayResets = CONFIG.maxLockDelayResets;
        
        // Game state flags
        this.gameOver = false;
        this.isPaused = false;
        this.lastTSpinType = null;
        this.lastClearType = null;
        
        // Visual effects
        this.tetrisEffect = {
            active: false,
            rows: [],
            timer: 0,
            duration: 800
        };
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, decay: 0.9 };
        this.colorScheme = 0;
        
        // Statistics
        this.stats = {
            linesCleared: { single: 0, double: 0, triple: 0, tetris: 0 },
            tSpins: { mini: 0, single: 0, double: 0, triple: 0 },
            perfectClears: 0,
            maxCombo: 0,
            pps: 0, // pieces per second
            startTime: 0
        };
        
        // Mode-specific
        this.modeStartTime = 0;
        this.modeTimeLimit = 0;
        this.modeLineGoal = 0;
        
        // Enhanced initialization
        this.lastLinesClearedForLevel = 0; // Track for level up notifications
        
        // Visual enhancement settings
        this.backgroundColor = CONFIG.highContrast ? '#000000' : '#111111';
        
        this.initializeMode();
        this.reset();
    }
    
    initializeMode() {
        switch (this.mode) {
            case GameMode.SPRINT:
                this.modeLineGoal = CONFIG.sprintLines;
                break;
            case GameMode.ULTRA:
                this.modeTimeLimit = CONFIG.ultraTime * 1000; // Convert to ms
                break;
            case GameMode.SURVIVAL:
                this.modeStartTime = Date.now();
                break;
        }
    }

    createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    // 7-bag randomizer system
    generateBag() {
        const bag = [0, 1, 2, 3, 4, 5, 6]; // All 7 pieces
        // Fisher-Yates shuffle
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        return bag;
    }

    getNextPiece() {
        if (CONFIG.use7Bag) {
            if (this.bag.length === 0) {
                this.bag = this.generateBag();
            }
            return this.bag.shift();
        } else {
            // Pure random (classic mode)
            return Math.floor(Math.random() * 7);
        }
    }

    fillNextQueue() {
        while (this.nextPieces.length < CONFIG.nextPieces) {
            this.nextPieces.push(this.getNextPiece());
        }
    }

    getCurrentPieceMatrix() {
        if (this.player.matrix === null) return null;
        return PIECES[this.player.matrix][this.player.rotation];
    }

    getGhostPosition() {
        if (!this.player.matrix) return { x: 0, y: 0 };
        
        let ghostY = this.player.pos.y;
        const testPlayer = {
            pos: { x: this.player.pos.x, y: ghostY },
            matrix: this.getCurrentPieceMatrix()
        };
        
        while (!this.collide(this.arena, testPlayer)) {
            ghostY++;
            testPlayer.pos.y = ghostY;
        }
        
        return { x: this.player.pos.x, y: ghostY - 1 };
    }

    updateGhost() {
        if (CONFIG.showGhost && this.player.matrix !== null) {
            const ghostPos = this.getGhostPosition();
            this.ghost.pos = ghostPos;
            this.ghost.matrix = this.getCurrentPieceMatrix();
        }
    }

    drawBlock(x, y, color, context = this.ctx, alpha = 1) {
        if (y < 0 || y >= BOARD_HEIGHT || x < 0 || x >= BOARD_WIDTH) return;
        
        context.save();
        context.globalAlpha = alpha;
        
        // High contrast mode adjustments
        if (CONFIG.highContrast) {
            context.fillStyle = color === '#000000' ? '#000000' : '#ffffff';
            context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            context.strokeStyle = '#000000';
            context.lineWidth = 2;
            context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        } else {
            // Normal rendering with enhanced visual effects
            context.fillStyle = COLORS[color];
            context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            
            // Enhanced block styling
            if (CONFIG.renderOptimization) {
                // Simplified rendering for performance
                context.strokeStyle = '#333';
                context.lineWidth = 1;
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            } else {
                // Full visual effects
                context.strokeStyle = '#333';
                context.lineWidth = 1;
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                
                // Inner highlight
                context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                context.lineWidth = 1;
                context.strokeRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                
                // Subtle gradient effect
                const gradient = context.createLinearGradient(
                    x * BLOCK_SIZE, y * BLOCK_SIZE,
                    x * BLOCK_SIZE + BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                context.fillStyle = gradient;
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
        
        context.restore();
    }

    drawMatrix(matrix, offset, context = this.ctx, alpha = 1) {
        if (!matrix) return;
        
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.drawBlock(x + offset.x, y + offset.y, value, context, alpha);
                }
            });
        });
    }

    drawGhost() {
        if (!CONFIG.showGhost || !this.ghost.matrix || this.tetrisEffect.active) return;
        
        // Don't draw ghost if it overlaps with player piece
        if (this.ghost.pos.y <= this.player.pos.y + this.getCurrentPieceMatrix().length) return;
        
        this.ghost.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const blockX = (this.ghost.pos.x + x) * BLOCK_SIZE;
                    const blockY = (this.ghost.pos.y + y) * BLOCK_SIZE;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = CONFIG.ghostOpacity;
                    this.ctx.strokeStyle = COLORS[value];
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                    this.ctx.restore();
                }
            });
        });
    }

    // Enhanced collision detection with bounds checking
    collide(arena, player) {
        if (!player.matrix) return false;
        
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0) {
                    const newY = y + o.y;
                    const newX = x + o.x;
                    
                    // Check bounds
                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                        return true;
                    }
                    
                    // Check existing blocks (but allow above visible area)
                    if (newY >= 0 && arena[newY][newX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 180-degree rotation
    playerRotate180() {
        if (!CONFIG.wallKicks) return;
        
        const oldRotation = this.player.rotation;
        this.player.rotation = (this.player.rotation + 2) % 4;
        
        const testPlayer = {
            ...this.player,
            matrix: PIECES[this.player.matrix][this.player.rotation]
        };
        
        if (!this.collide(this.arena, testPlayer)) {
            this.resetLockDelay();
            this.updateGhost();
        } else {
            // Try wall kicks for 180 rotation
            const kicks = [[0, 0], [1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1]];
            let kickSuccessful = false;
            
            for (const [deltaX, deltaY] of kicks) {
                const kickTestPlayer = {
                    pos: { 
                        x: this.player.pos.x + deltaX, 
                        y: this.player.pos.y + deltaY 
                    },
                    matrix: PIECES[this.player.matrix][this.player.rotation]
                };
                
                if (!this.collide(this.arena, kickTestPlayer)) {
                    this.player.pos.x = kickTestPlayer.pos.x;
                    this.player.pos.y = kickTestPlayer.pos.y;
                    kickSuccessful = true;
                    break;
                }
            }
            
            if (!kickSuccessful) {
                this.player.rotation = oldRotation;
            } else {
                this.resetLockDelay();
                this.updateGhost();
            }
        }
    }

    // Wall kick system (Super Rotation System)
    tryWallKicks(oldRotation, newRotation) {
        const piece = this.player.matrix;
        const isIPiece = piece === 4; // I piece
        const kickTable = isIPiece ? WALL_KICKS.I : WALL_KICKS.JLTSZ;
        
        // Create rotation key
        const rotMap = { 0: '0', 1: 'R', 2: '2', 3: 'L' };
        const kickKey = `${rotMap[oldRotation]}->${rotMap[newRotation]}`;
        
        const kicks = kickTable[kickKey] || [[0, 0]];
        
        // Test each kick
        for (const [deltaX, deltaY] of kicks) {
            const testPlayer = {
                pos: { 
                    x: this.player.pos.x + deltaX, 
                    y: this.player.pos.y + deltaY 
                },
                matrix: PIECES[piece][newRotation]
            };
            
            if (!this.collide(this.arena, testPlayer)) {
                this.player.pos.x = testPlayer.pos.x;
                this.player.pos.y = testPlayer.pos.y;
                return true;
            }
        }
        
        return false;
    }

    // T-spin detection
    isTSpin(wasKick = false) {
        if (this.player.matrix !== 0) return null; // Must be T piece
        
        const matrix = this.getCurrentPieceMatrix();
        const corners = [
            { x: 0, y: 0 }, { x: 2, y: 0 }, // Top corners
            { x: 0, y: 2 }, { x: 2, y: 2 }  // Bottom corners
        ];
        
        let filledCorners = 0;
        corners.forEach(corner => {
            const x = this.player.pos.x + corner.x;
            const y = this.player.pos.y + corner.y;
            
            if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || 
                (y >= 0 && this.arena[y][x] !== 0)) {
                filledCorners++;
            }
        });
        
        if (filledCorners >= 3) {
            // Check if it's a mini T-spin
            const frontCorners = this.player.rotation % 2 === 0 ? 
                [corners[0], corners[1]] : [corners[2], corners[3]];
            
            let frontFilled = 0;
            frontCorners.forEach(corner => {
                const x = this.player.pos.x + corner.x;
                const y = this.player.pos.y + corner.y;
                
                if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || 
                    (y >= 0 && this.arena[y][x] !== 0)) {
                    frontFilled++;
                }
            });
            
            return frontFilled >= 2 ? 'full' : 'mini';
        }
        
        return null;
    }

    // Line clearing with T-spin and combo detection
    arenaSweep() {
        let rowsToRemove = [];
        
        // Find complete rows
        for (let y = this.arena.length - 1; y >= 0; --y) {
            let isComplete = true;
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                rowsToRemove.push(y);
            }
        }
        
        const linesCleared = rowsToRemove.length;
        
        if (linesCleared > 0) {
            // Check for perfect clear
            let isPerfectClear = false;
            if (linesCleared === 4 && this.isArenaEmpty(rowsToRemove)) {
                isPerfectClear = true;
                this.stats.perfectClears++;
            }
            
            // Handle Tetris effect for 4-line clears
            if (linesCleared === 4 && CONFIG.particleEffects && CONFIG.tetrisFlash) {
                this.tetrisEffect.active = true;
                this.tetrisEffect.rows = [...rowsToRemove];
                this.tetrisEffect.timer = 0;
                
                // Add score but don't remove lines yet
                this.processLineScore(linesCleared, isPerfectClear);
                return;
            }
            
            // Regular line clear
            this.removeRows(rowsToRemove);
            this.processLineScore(linesCleared, isPerfectClear);
            
            // Update combo
            this.combo++;
            if (this.combo > this.stats.maxCombo) {
                this.stats.maxCombo = this.combo;
            }
            
            // Particle effects
            if (CONFIG.particleEffects) {
                this.createLineParticles(rowsToRemove, linesCleared, isPerfectClear);
            }
            
            // Screen shake
            if (CONFIG.screenShake) {
                this.screenShake.intensity = Math.min(linesCleared * 2, 8) * CONFIG.shakeIntensity;
            }
        } else {
            // Reset combo
            this.combo = 0;
        }
    }

    isArenaEmpty(excludeRows = []) {
        for (let y = 0; y < this.arena.length; y++) {
            if (excludeRows.includes(y)) continue;
            for (let x = 0; x < this.arena[y].length; x++) {
                if (this.arena[y][x] !== 0) return false;
            }
        }
        return true;
    }

    removeRows(rowsToRemove) {
        rowsToRemove.forEach(y => {
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
        });
    }

    processLineScore(linesCleared, isPerfectClear = false) {
        // Base score values based on scoring system
        let baseScores;
        switch (CONFIG.scoringSystem) {
            case 'Classic':
                baseScores = [0, 40, 100, 300, 1200];
                break;
            case 'Modern':
                baseScores = [0, 100, 300, 500, 800];
                break;
            case 'T-Spin Focused':
                baseScores = [0, 80, 200, 400, 600]; // Lower base, higher T-spin rewards
                break;
            default:
                baseScores = [0, 100, 300, 500, 800];
        }
        
        let score = baseScores[linesCleared] * this.level;
        
        // T-spin bonuses with configuration multiplier
        if (this.lastTSpinType === 'full') {
            const tSpinScores = [0, 800, 1200, 1600];
            score = Math.floor(tSpinScores[linesCleared] * this.level * CONFIG.tSpinRewards);
            this.stats.tSpins[['', 'single', 'double', 'triple'][linesCleared]]++;
        } else if (this.lastTSpinType === 'mini') {
            const miniScore = (linesCleared === 1 ? 200 : 400) * this.level;
            score = Math.floor(miniScore * CONFIG.tSpinRewards);
            this.stats.tSpins.mini++;
        }
        
        // Perfect clear bonus
        if (isPerfectClear && CONFIG.perfectClearBonus) {
            score += Math.floor(1000 * this.level * CONFIG.tSpinRewards);
        }
        
        // Combo bonus
        if (this.combo > 1 && CONFIG.comboBonuses) {
            const comboBonus = Math.min((this.combo - 1) * 50 * this.level, score);
            score += comboBonus;
        }
        
        // Difficulty bonus for higher levels
        if (this.level > 10) {
            score += Math.floor(score * ((this.level - 10) * 0.1));
        }
        
        this.score += score;
        this.lines += linesCleared;
        
        // Update statistics
        const clearTypes = ['', 'single', 'double', 'triple', 'tetris'];
        if (linesCleared <= 4) {
            this.stats.linesCleared[clearTypes[linesCleared]]++;
        }
        
        this.lastClearType = clearTypes[linesCleared];
        this.lastTSpinType = null;
        
        // Level up notification
        if (CONFIG.levelUpNotification && this.shouldLevelUp()) {
            this.triggerLevelUpEffect();
        }
    }
    
    shouldLevelUp() {
        const oldLevel = Math.floor((this.lines - this.lastLinesClearedForLevel) / 10) + 1;
        const newLevel = Math.floor(this.lines / 10) + 1;
        
        if (newLevel > oldLevel) {
            this.lastLinesClearedForLevel = this.lines;
            return true;
        }
        return false;
    }
    
    triggerLevelUpEffect() {
        // Create level up particles
        if (CONFIG.particleEffects) {
            for (let i = 0; i < 50; i++) {
                this.particles.push({
                    x: Math.random() * BOARD_WIDTH * BLOCK_SIZE,
                    y: Math.random() * BOARD_HEIGHT * BLOCK_SIZE,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -Math.random() * 8 - 2,
                    color: '#ffff00',
                    life: 1.5,
                    decay: 0.015,
                    size: Math.random() * 3 + 2,
                    type: 'star'
                });
            }
        }
        
        // Screen shake for level up
        if (CONFIG.screenShake) {
            this.screenShake.intensity = 5 * CONFIG.shakeIntensity;
        }
    }

    // Particle system with enhanced configuration
    createLineParticles(rows, lineCount, isPerfectClear) {
        if (!CONFIG.particleEffects) return;
        
        const config = isPerfectClear ? 
            PARTICLE_SETTINGS.perfectClear :
            PARTICLE_SETTINGS.lineClears[['', 'single', 'double', 'triple', 'tetris'][lineCount]];
        
        if (!config) return;
        
        const particleCount = Math.floor(config.count * CONFIG.particleAmount);
        
        rows.forEach(row => {
            for (let i = 0; i < particleCount / rows.length; i++) {
                this.particles.push({
                    x: Math.random() * BOARD_WIDTH * BLOCK_SIZE,
                    y: row * BLOCK_SIZE + Math.random() * BLOCK_SIZE,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    color: config.colors[Math.floor(Math.random() * config.colors.length)],
                    life: 1.0,
                    decay: 0.02 / CONFIG.lineBlinkSpeed,
                    size: Math.random() * 4 + 2,
                    type: isPerfectClear ? 'star' : 'square'
                });
            }
        });
        
        // Limit total particles for performance
        if (this.particles.length > CONFIG.maxParticles) {
            this.particles.splice(0, this.particles.length - CONFIG.maxParticles);
        }
    }

    updateParticles(deltaTime) {
        if (!CONFIG.particleEffects) {
            this.particles = [];
            return;
        }
        
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life -= particle.decay;
            return particle.life > 0;
        });
        
        // Update screen shake with intensity setting
        if (this.screenShake.intensity > 0) {
            const intensity = this.screenShake.intensity * CONFIG.shakeIntensity;
            this.screenShake.x = (Math.random() - 0.5) * intensity;
            this.screenShake.y = (Math.random() - 0.5) * intensity;
            this.screenShake.intensity *= this.screenShake.decay;
        }
    }

    drawParticles() {
        if (!CONFIG.particleEffects || this.particles.length === 0) return;
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            
            if (particle.type === 'star') {
                // Draw star shape for special effects
                this.ctx.translate(particle.x + particle.size/2, particle.y + particle.size/2);
                this.ctx.rotate(particle.life * Math.PI);
                this.drawStar(this.ctx, 0, 0, particle.size);
            } else {
                // Regular square particle
                this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
            this.ctx.restore();
        });
    }
    
    drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const xPos = Math.cos(angle) * size;
            const yPos = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
            
            const innerAngle = ((i + 0.5) * Math.PI * 2) / 5;
            const innerX = Math.cos(innerAngle) * size * 0.5;
            const innerY = Math.sin(innerAngle) * size * 0.5;
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
    }

    // Player actions
    playerMove(offset) {
        this.player.pos.x += offset;
        if (this.collide(this.arena, { ...this.player, matrix: this.getCurrentPieceMatrix() })) {
            this.player.pos.x -= offset;
        } else {
            this.resetLockDelay();
            this.updateGhost();
        }
    }

    playerRotate(direction) {
        if (!CONFIG.wallKicks && !this.canRotate()) return;
        
        const oldRotation = this.player.rotation;
        this.player.rotation = (this.player.rotation + direction + 4) % 4;
        
        // Try rotation without wall kicks first
        const testPlayer = {
            ...this.player,
            matrix: PIECES[this.player.matrix][this.player.rotation]
        };
        
        if (!this.collide(this.arena, testPlayer)) {
            // Rotation successful
            this.checkTSpin(false);
        } else if (CONFIG.wallKicks && this.tryWallKicks(oldRotation, this.player.rotation)) {
            // Wall kick successful
            this.checkTSpin(true);
        } else {
            // Rotation failed
            this.player.rotation = oldRotation;
            return;
        }
        
        this.resetLockDelay();
        this.updateGhost();
    }

    checkTSpin(wasKick) {
        if (CONFIG.enableTSpin && this.player.matrix === 0) { // T piece
            this.lastTSpinType = this.isTSpin(wasKick);
        }
    }

    canRotate() {
        // Basic rotation check for non-wall-kick mode
        const newRotation = (this.player.rotation + 1) % 4;
        const testPlayer = {
            ...this.player,
            matrix: PIECES[this.player.matrix][newRotation]
        };
        return !this.collide(this.arena, testPlayer);
    }

    playerSoftDrop() {
        this.player.pos.y++;
        if (this.collide(this.arena, { ...this.player, matrix: this.getCurrentPieceMatrix() })) {
            this.player.pos.y--;
            if (CONFIG.hardDropLock) {
                this.lockPiece();
            }
        } else {
            this.score += 1; // Soft drop bonus
            this.dropCounter = 0;
            
            // Reset DAS on soft drop if enabled
            if (CONFIG.dasOnSoftDrop) {
                this.resetLockDelay();
            }
        }
    }

    playerHardDrop() {
        let dropDistance = 0;
        while (!this.collide(this.arena, { ...this.player, matrix: this.getCurrentPieceMatrix() })) {
            this.player.pos.y++;
            dropDistance++;
        }
        this.player.pos.y--;
        this.score += dropDistance * 2; // Hard drop bonus
        
        if (CONFIG.hardDropLock) {
            this.lockPiece();
        }
    }

    playerHold() {
        if (!CONFIG.showHold || !this.canHold) return;
        
        const currentPiece = this.player.matrix;
        
        if (this.holdPiece !== null) {
            // Swap with held piece
            this.player.matrix = this.holdPiece;
        } else {
            // Take next piece
            this.player.matrix = this.nextPieces.shift();
            this.fillNextQueue();
        }
        
        this.holdPiece = currentPiece;
        this.player.rotation = 0;
        this.resetPlayerPosition();
        this.canHold = false;
        this.updateGhost();
    }

    resetPlayerPosition() {
        this.player.pos = {
            y: 0,
            x: Math.floor((BOARD_WIDTH - PIECES[this.player.matrix][0][0].length) / 2)
        };
    }

    resetLockDelay() {
        if (this.lockDelayResets < this.maxLockDelayResets) {
            this.lockDelayTimer = 0;
            this.lockDelayResets++;
        }
    }

    lockPiece() {
        this.merge(this.arena, { ...this.player, matrix: this.getCurrentPieceMatrix() });
        this.arenaSweep();
        this.playerReset();
        this.updateScore();
    }

    merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const arenaY = y + player.pos.y;
                    const arenaX = x + player.pos.x;
                    if (arenaY >= 0 && arenaY < BOARD_HEIGHT && 
                        arenaX >= 0 && arenaX < BOARD_WIDTH) {
                        arena[arenaY][arenaX] = value;
                    }
                }
            });
        });
    }

    playerReset() {
        // Get next piece
        this.player.matrix = this.nextPieces.shift();
        this.player.rotation = 0;
        this.fillNextQueue();
        
        this.resetPlayerPosition();
        this.canHold = true;
        this.lockDelayTimer = 0;
        this.lockDelayResets = 0;
        this.totalPieces++;
        
        // Check for game over
        if (this.collide(this.arena, { ...this.player, matrix: this.getCurrentPieceMatrix() })) {
            this.gameOver = true;
            return;
        }
        
        this.updateGhost();
    }

    updateScore() {
        if (this.mode === GameMode.MARATHON) {
            // Traditional level progression
            this.level = Math.floor(this.lines / 10) + 1;
            
            // Speed progression
            if (CONFIG.gameSpeed === 5) { // Default speed
                this.dropInterval = AUTHENTIC_SPEED_TABLE[Math.min(this.level - 1, AUTHENTIC_SPEED_TABLE.length - 1)] || 1;
            } else {
                this.dropInterval = SPEED_SETTINGS[CONFIG.gameSpeed - 1];
            }
            
            // Color scheme changes
            if (CONFIG.colorSchemeChange) {
                const newColorScheme = Math.min(Math.floor((this.level - 1) / 5), COLOR_SCHEMES.length - 1);
                if (newColorScheme !== this.colorScheme) {
                    this.colorScheme = newColorScheme;
                    for (let i = 0; i < COLORS.length; i++) {
                        COLORS[i] = COLOR_SCHEMES[this.colorScheme][i];
                    }
                }
            }
        } else {
            // Other modes use fixed speed
            this.dropInterval = SPEED_SETTINGS[CONFIG.gameSpeed - 1];
        }
        
        // Check mode-specific win conditions
        this.checkModeCompletion();
    }

    checkModeCompletion() {
        switch (this.mode) {
            case GameMode.SPRINT:
                if (this.lines >= this.modeLineGoal) {
                    this.gameOver = true;
                }
                break;
            case GameMode.SURVIVAL:
                // Increase speed every 30 seconds
                const elapsed = Date.now() - this.modeStartTime;
                const newSpeed = Math.max(1, 10 - Math.floor(elapsed / (CONFIG.survivalAcceleration * 1000)));
                this.dropInterval = SPEED_SETTINGS[newSpeed - 1];
                break;
        }
    }

    // Enhanced drawing methods with configuration support
    drawGrid() {
        if (!CONFIG.showGrid) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = CONFIG.gridOpacity;
        this.ctx.strokeStyle = CONFIG.highContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = CONFIG.highContrast ? 2 : 1;
        
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    drawTetrisEffect() {
        if (!CONFIG.tetrisFlash) {
            // Skip flash effect, just do normal line clear
            this.removeRows(this.tetrisEffect.rows);
            this.tetrisEffect.active = false;
            this.tetrisEffect.rows = [];
            return;
        }
        
        const progress = this.tetrisEffect.timer / this.tetrisEffect.duration;
        const flashSpeed = CONFIG.lineBlinkSpeed * 6;
        const intensity = Math.sin(progress * Math.PI * flashSpeed) * 0.5 + 0.5;
        
        this.tetrisEffect.rows.forEach(rowY => {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const blockX = x * BLOCK_SIZE;
                const blockY = rowY * BLOCK_SIZE;
                
                const cellValue = this.arena[rowY][x];
                if (cellValue !== 0) {
                    // Original block color
                    this.ctx.fillStyle = COLORS[cellValue];
                    this.ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
                }
                
                // Flash overlay
                this.ctx.save();
                this.ctx.globalAlpha = intensity * 0.8;
                
                // Different flash colors based on line clear type
                let flashColor = '#ffffff';
                if (this.tetrisEffect.rows.length === 4) flashColor = '#ff0000'; // Tetris - red
                else if (this.lastTSpinType) flashColor = '#ff00ff'; // T-spin - magenta
                else if (this.combo > 3) flashColor = '#00ff00'; // High combo - green
                
                this.ctx.fillStyle = flashColor;
                this.ctx.fillRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                
                // Enhanced border effect
                this.ctx.globalAlpha = intensity * 0.6;
                this.ctx.shadowColor = flashColor;
                this.ctx.shadowBlur = 15 * CONFIG.shakeIntensity;
                this.ctx.strokeStyle = flashColor;
                this.ctx.lineWidth = 3;
                this.ctx.strokeRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
                this.ctx.restore();
            }
        });
    }

    drawNextPieces() {
        if (!this.nextCtx) return;
        
        // Clear with theme-appropriate background
        this.nextCtx.fillStyle = CONFIG.highContrast ? '#000000' : '#0a0a0a';
        this.nextCtx.fillRect(0, 0, 200, 400);
        
        const visibleNext = Math.min(CONFIG.nextPieces, this.nextPieces.length);
        
        for (let i = 0; i < visibleNext; i++) {
            const piece = this.nextPieces[i];
            const matrix = PIECES[piece][0]; // Always show in default rotation
            const blockSize = i === 0 ? 20 : 15; // First piece bigger
            const yOffset = i * 70;
            
            const offsetX = (100 - matrix[0].length * blockSize) / 2;
            const offsetY = yOffset + (60 - matrix.length * blockSize) / 2;
            
            // Enhanced preview with better styling
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        const alpha = i === 0 ? 1.0 : 0.8 - (i * 0.1);
                        
                        this.nextCtx.save();
                        this.nextCtx.globalAlpha = alpha;
                        
                        if (CONFIG.highContrast) {
                            this.nextCtx.fillStyle = '#ffffff';
                        } else {
                            this.nextCtx.fillStyle = COLORS[value];
                        }
                        
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                        
                        // Enhanced border
                        this.nextCtx.strokeStyle = CONFIG.highContrast ? '#000000' : '#333';
                        this.nextCtx.lineWidth = 1;
                        this.nextCtx.strokeRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize,
                            blockSize
                        );
                        
                        this.nextCtx.restore();
                    }
                });
            });
        }
        
        // Draw queue labels for larger next piece counts
        if (CONFIG.nextPieces > 3) {
            this.nextCtx.fillStyle = '#666';
            this.nextCtx.font = '8px Orbitron, monospace';
            this.nextCtx.textAlign = 'center';
            
            for (let i = 1; i < Math.min(CONFIG.nextPieces, 6); i++) {
                this.nextCtx.fillText(`${i + 1}`, 100, i * 70 + 5);
            }
        }
    }

    drawHoldPiece() {
        if (!CONFIG.showHold || !this.holdCtx || this.holdPiece === null) return;
        
        // Clear with theme-appropriate background
        this.holdCtx.fillStyle = CONFIG.highContrast ? '#000000' : '#0a0a0a';
        this.holdCtx.fillRect(0, 0, 100, 100);
        
        const matrix = PIECES[this.holdPiece][0];
        const blockSize = 18;
        const offsetX = (100 - matrix[0].length * blockSize) / 2;
        const offsetY = (100 - matrix.length * blockSize) / 2;
        
        const alpha = this.canHold ? 1.0 : 0.3;
        
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.holdCtx.save();
                    this.holdCtx.globalAlpha = alpha;
                    
                    if (CONFIG.highContrast) {
                        this.holdCtx.fillStyle = this.canHold ? '#ffffff' : '#666666';
                    } else {
                        this.holdCtx.fillStyle = COLORS[value];
                    }
                    
                    this.holdCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    
                    this.holdCtx.strokeStyle = CONFIG.highContrast ? '#000000' : '#333';
                    this.holdCtx.lineWidth = 1;
                    this.holdCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    this.holdCtx.restore();
                }
            });
        });
        
        // Draw "LOCKED" text when hold is unavailable
        if (!this.canHold) {
            this.holdCtx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            this.holdCtx.font = 'bold 8px Orbitron, monospace';
            this.holdCtx.textAlign = 'center';
            this.holdCtx.fillText('LOCKED', 50, 85);
        }
    }

    update(deltaTime) {
        // Handle Tetris effect with configuration
        if (this.tetrisEffect.active) {
            this.tetrisEffect.timer += deltaTime * CONFIG.lineBlinkSpeed;
            if (this.tetrisEffect.timer >= this.tetrisEffect.duration) {
                this.removeRows(this.tetrisEffect.rows);
                this.tetrisEffect.active = false;
                this.tetrisEffect.rows = [];
                this.updateScore();
            }
            this.updateParticles(deltaTime);
            return;
        }
        
        // Check mode-specific time limits
        if (this.mode === GameMode.ULTRA && this.modeTimeLimit > 0) {
            if (Date.now() - this.modeStartTime >= this.modeTimeLimit) {
                this.gameOver = true;
                return;
            }
        }
        
        // Update particles and effects
        this.updateParticles(deltaTime);
        
        // Handle lock delay with configuration
        if (this.isOnGround()) {
            this.lockDelayTimer += deltaTime;
            if (this.lockDelayTimer >= CONFIG.lockDelay) {
                this.lockPiece();
                return;
            }
        } else {
            this.lockDelayTimer = 0;
            this.lockDelayResets = 0;
        }
        
        // Handle gravity with enhanced timing
        this.dropCounter += deltaTime;
        
        // Apply soft drop multiplier if soft drop is active
        let currentDropInterval = this.dropInterval;
        if (this.keys && this.keys[CONFIG.softDrop]) {
            currentDropInterval = Math.max(this.dropInterval / CONFIG.sdfFactor, 16); // Minimum 16ms
        }
        
        if (this.dropCounter > currentDropInterval) {
            this.playerSoftDrop();
        }
        
        // Update statistics
        this.updateGameStats();
    }
    
    updateGameStats() {
        // Calculate pieces per second
        const elapsed = Date.now() - this.stats.startTime;
        if (elapsed > 0) {
            this.stats.pps = Math.round((this.totalPieces / (elapsed / 1000)) * 100) / 100;
        }
        
        // Update max combo
        if (this.combo > this.stats.maxCombo) {
            this.stats.maxCombo = this.combo;
        }
    }

    isOnGround() {
        const testPlayer = {
            ...this.player,
            pos: { ...this.player.pos, y: this.player.pos.y + 1 },
            matrix: this.getCurrentPieceMatrix()
        };
        return this.collide(this.arena, testPlayer);
    }

    draw() {
        // Apply screen shake with configuration
        this.ctx.save();
        if (CONFIG.screenShake && this.screenShake.intensity > 0) {
            this.ctx.translate(this.screenShake.x, this.screenShake.y);
        }
        
        // Clear canvas with configurable background
        this.ctx.fillStyle = CONFIG.highContrast ? '#000000' : this.backgroundColor;
        this.ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);

        // Background effects
        if (CONFIG.backgroundEffects && !CONFIG.reducedMotion) {
            this.drawBackgroundEffects();
        }
        
        this.drawGrid();
        this.drawMatrix(this.arena, { x: 0, y: 0 });
        this.drawGhost();
        
        // Draw Tetris effect if active
        if (this.tetrisEffect.active) {
            this.drawTetrisEffect();
        }
        
        // Draw player piece (if not in Tetris effect)
        if (!this.tetrisEffect.active && this.player.matrix !== null) {
            this.drawMatrix(this.getCurrentPieceMatrix(), this.player.pos);
        }
        
        this.drawParticles();
        
        // Draw UI overlays
        if (CONFIG.comboCounter && this.combo > 1) {
            this.drawComboCounter();
        }
        
        if (CONFIG.statisticsOverlay) {
            this.drawLiveStats();
        }
        
        this.ctx.restore();
        
        // Draw UI elements (not affected by screen shake)
        this.drawNextPieces();
        this.drawHoldPiece();
    }
    
    drawBackgroundEffects() {
        // Subtle background pattern that changes with level
        const time = Date.now() * 0.001;
        const alpha = 0.02 + (this.level * 0.002);
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = COLORS[1 + ((this.level - 1) % 6)];
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < 10; i++) {
            const x = Math.sin(time + i) * 50 + BOARD_WIDTH * BLOCK_SIZE / 2;
            const y = Math.cos(time * 0.7 + i) * 100 + BOARD_HEIGHT * BLOCK_SIZE / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20 + i * 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }
    
    drawComboCounter() {
        const x = BOARD_WIDTH * BLOCK_SIZE - 80;
        const y = 50;
        
        this.ctx.save();
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 16px Orbitron, monospace';
        this.ctx.textAlign = 'right';
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 5;
        this.ctx.fillText(`COMBO`, x, y);
        this.ctx.fillText(`${this.combo}`, x, y + 20);
        this.ctx.restore();
    }
    
    drawLiveStats() {
        const stats = [
            `PPS: ${this.stats.pps}`,
            `T-Spins: ${Object.values(this.stats.tSpins).reduce((a, b) => a + b, 0)}`,
            `Perfect: ${this.stats.perfectClears}`
        ];
        
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '10px Orbitron, monospace';
        this.ctx.textAlign = 'left';
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, 5, 20 + (index * 15));
        });
        this.ctx.restore();
    }

    reset() {
        this.arena = this.createMatrix(BOARD_WIDTH, BOARD_HEIGHT);
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.combo = 0;
        this.totalPieces = 0;
        
        this.dropCounter = 0;
        this.dropInterval = SPEED_SETTINGS[CONFIG.gameSpeed - 1];
        this.lockDelayTimer = 0;
        this.lockDelayResets = 0;
        this.maxLockDelayResets = CONFIG.maxLockDelayResets;
        
        this.gameOver = false;
        this.tetrisEffect = { active: false, rows: [], timer: 0, duration: 800 };
        this.particles = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, decay: 0.9 };
        this.colorScheme = 0;
        this.lastLinesClearedForLevel = 0;
        
        // Reset pieces
        this.bag = [];
        this.nextPieces = [];
        this.holdPiece = null;
        this.canHold = true;
        
        // Reset colors to default scheme
        for (let i = 0; i < COLORS.length; i++) {
            COLORS[i] = COLOR_SCHEMES[0][i];
        }
        
        // Initialize pieces
        this.fillNextQueue();
        this.playerReset();
        
        // Reset mode-specific timers
        this.modeStartTime = Date.now();
        
        // Reset statistics
        this.stats = {
            linesCleared: { single: 0, double: 0, triple: 0, tetris: 0 },
            tSpins: { mini: 0, single: 0, double: 0, triple: 0 },
            perfectClears: 0,
            maxCombo: 0,
            pps: 0,
            startTime: Date.now()
        };
    }

    getGameData() {
        const elapsed = Date.now() - this.stats.startTime;
        const pps = this.totalPieces / (elapsed / 1000);
        
        return {
            score: this.score,
            lines: this.lines,
            level: this.level,
            combo: this.combo,
            totalPieces: this.totalPieces,
            stats: {
                ...this.stats,
                pps: Math.round(pps * 100) / 100
            },
            mode: this.mode
        };
    }
}