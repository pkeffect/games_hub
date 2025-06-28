// js/settings.js
import { CONFIG } from './config.js';

export class Settings {
    constructor() {
        this.settings = {
            showTimer: CONFIG.SHOW_TIMER,
            showFPS: CONFIG.SHOW_FPS,
            trailEffect: CONFIG.TRAIL_EFFECT,
            particleEffects: CONFIG.PARTICLE_EFFECTS,
            gameSpeed: 'normal', // slow, normal, fast
            maxHighScores: CONFIG.MAX_HIGH_SCORES
        };
        
        this.selectedIndex = 0;
        this.settingsOptions = [
            { key: 'showTimer', label: 'Show Timer', type: 'boolean' },
            { key: 'showFPS', label: 'Show FPS', type: 'boolean' },
            { key: 'trailEffect', label: 'Trail Effect', type: 'boolean' },
            { key: 'particleEffects', label: 'Particle Effects', type: 'boolean' },
            { key: 'gameSpeed', label: 'Game Speed', type: 'select', options: ['slow', 'normal', 'fast'] },
            { key: 'maxHighScores', label: 'Max High Scores', type: 'range', min: 3, max: 10, step: 1 },
            { key: 'clearScores', label: 'Clear High Scores', type: 'action' }
        ];
        
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('snake_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('snake_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        CONFIG.SHOW_TIMER = this.settings.showTimer;
        CONFIG.SHOW_FPS = this.settings.showFPS;
        CONFIG.TRAIL_EFFECT = this.settings.trailEffect;
        CONFIG.PARTICLE_EFFECTS = this.settings.particleEffects;
        CONFIG.MAX_HIGH_SCORES = this.settings.maxHighScores;
        
        // Apply game speed modifiers
        switch (this.settings.gameSpeed) {
            case 'slow':
                CONFIG.GAME_SPEED_MS = 180;
                break;
            case 'normal':
                CONFIG.GAME_SPEED_MS = 120;
                break;
            case 'fast':
                CONFIG.GAME_SPEED_MS = 80;
                break;
        }
    }

    getGameSpeed() {
        switch (this.settings.gameSpeed) {
            case 'slow': return 180;
            case 'normal': return 120;
            case 'fast': return 80;
            default: return 120;
        }
    }

    handleInput(key) {
        switch (key) {
            case 'ArrowUp':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                break;
            case 'ArrowDown':
                this.selectedIndex = Math.min(this.settingsOptions.length - 1, this.selectedIndex + 1);
                break;
            case 'ArrowLeft':
                this.changeValue(-1);
                break;
            case 'ArrowRight':
                this.changeValue(1);
                break;
            case 'Space':
            case 'Enter':
                this.toggleValue();
                break;
        }
    }

    changeValue(direction) {
        const option = this.settingsOptions[this.selectedIndex];
        const key = option.key;
        
        // Action items don't have values to change
        if (option.type === 'action') {
            return;
        }
        
        switch (option.type) {
            case 'boolean':
                this.settings[key] = !this.settings[key];
                break;
            case 'range':
                const newValue = this.settings[key] + (direction * option.step);
                this.settings[key] = Math.max(option.min, Math.min(option.max, newValue));
                break;
            case 'select':
                const currentIndex = option.options.indexOf(this.settings[key]);
                const newIndex = (currentIndex + direction + option.options.length) % option.options.length;
                this.settings[key] = option.options[newIndex];
                break;
        }
        this.saveSettings();
    }

    toggleValue() {
        const option = this.settingsOptions[this.selectedIndex];
        if (option.type === 'boolean') {
            this.settings[option.key] = !this.settings[option.key];
            this.saveSettings();
        } else if (option.type === 'action') {
            this.handleAction(option.key);
        }
    }

    handleAction(actionKey) {
        switch (actionKey) {
            case 'clearScores':
                // Return action to be handled by game
                return 'clearScores';
        }
        return null;
    }

    draw(ctx, width, height) {
        // Clear background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#00ff66';
        ctx.font = '32px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('SETTINGS', width / 2, 80);
        
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'left';
        
        const startY = 140;
        const lineHeight = 35;
        
        this.settingsOptions.forEach((option, index) => {
            const y = startY + (index * lineHeight);
            const isSelected = index === this.selectedIndex;
            
            // Highlight selected option
            if (isSelected) {
                ctx.fillStyle = '#00ff66';
                ctx.fillRect(100, y - 25, width - 200, 30);
                ctx.fillStyle = '#000000';
            } else {
                ctx.fillStyle = '#ffffff';
            }
            
            // Draw label
            ctx.fillText(option.label + ':', 120, y);
            
            // Draw value
            let valueText = '';
            const value = this.settings[option.key];
            
            switch (option.type) {
                case 'boolean':
                    valueText = value ? 'ON' : 'OFF';
                    break;
                case 'range':
                    valueText = value.toString();
                    break;
                case 'select':
                    valueText = value.toUpperCase();
                    break;
                case 'action':
                    valueText = '[ENTER]';
                    break;
            }
            
            ctx.textAlign = 'right';
            ctx.fillText(valueText, width - 120, y);
            ctx.textAlign = 'left';
        });
        
        // Instructions
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText('USE ARROW KEYS TO NAVIGATE AND CHANGE VALUES', width / 2, height - 60);
        ctx.fillText('PRESS ESC TO RETURN TO MENU', width / 2, height - 40);
    }
}