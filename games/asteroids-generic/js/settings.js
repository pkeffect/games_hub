// js/settings.js
import { CONFIG } from './config.js';

export class Settings {
    constructor() {
        this.settings = {
            glowEffect: CONFIG.GLOW_EFFECT,
            showTimer: CONFIG.SHOW_TIMER,
            showFPS: CONFIG.SHOW_FPS,
            screenShake: CONFIG.SCREEN_SHAKE,
            particleCount: CONFIG.PARTICLE_COUNT,
            difficulty: 'normal', // easy, normal, hard
        };
        
        this.selectedIndex = 0;
        this.settingsOptions = [
            { key: 'glowEffect', label: 'Glow Effects', type: 'boolean' },
            { key: 'showTimer', label: 'Show Timer', type: 'boolean' },
            { key: 'showFPS', label: 'Show FPS', type: 'boolean' },
            { key: 'screenShake', label: 'Screen Shake', type: 'boolean' },
            { key: 'particleCount', label: 'Particles', type: 'range', min: 4, max: 16, step: 2 },
            { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'normal', 'hard'] },
            { key: 'clearScores', label: 'Clear High Scores', type: 'action' }
        ];
        
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('asteroids_settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('asteroids_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        CONFIG.GLOW_EFFECT = this.settings.glowEffect;
        CONFIG.SHOW_TIMER = this.settings.showTimer;
        CONFIG.SHOW_FPS = this.settings.showFPS;
        CONFIG.SCREEN_SHAKE = this.settings.screenShake;
        CONFIG.PARTICLE_COUNT = this.settings.particleCount;
        
        // Apply difficulty modifiers
        switch (this.settings.difficulty) {
            case 'easy':
                CONFIG.ASTEROID_BASE_SPEED = 0.6;
                CONFIG.UFO_SPAWN_CHANCE = 0.15;
                CONFIG.PLAYER_THRUST = 0.06;
                break;
            case 'normal':
                CONFIG.ASTEROID_BASE_SPEED = 0.8;
                CONFIG.UFO_SPAWN_CHANCE = 0.25;
                CONFIG.PLAYER_THRUST = 0.05;
                break;
            case 'hard':
                CONFIG.ASTEROID_BASE_SPEED = 1.0;
                CONFIG.UFO_SPAWN_CHANCE = 0.35;
                CONFIG.PLAYER_THRUST = 0.04;
                break;
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
                if (confirm('Are you sure you want to clear all high scores? This cannot be undone.')) {
                    // Import Scoreboard here to avoid circular dependency
                    import('./scoreboard.js').then(({ Scoreboard }) => {
                        Scoreboard.clearHighScores();
                        alert('High scores cleared!');
                    });
                }
                break;
        }
    }

    draw(ctx, width, height) {
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "50px 'Courier New', Courier, monospace";
        ctx.fillText("SETTINGS", width / 2, 100);
        
        ctx.font = "20px 'Courier New', Courier, monospace";
        ctx.textAlign = "left";
        
        const startY = 160;
        const lineHeight = 35;
        
        this.settingsOptions.forEach((option, index) => {
            const y = startY + (index * lineHeight);
            const isSelected = index === this.selectedIndex;
            
            // Highlight selected option
            if (isSelected) {
                ctx.fillStyle = "yellow";
                ctx.fillRect(120, y - 25, width - 240, 30);
                ctx.fillStyle = "black";
            } else {
                ctx.fillStyle = "white";
            }
            
            // Draw label
            ctx.fillText(option.label + ":", 140, y);
            
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
            
            ctx.textAlign = "right";
            ctx.fillText(valueText, width - 140, y);
            ctx.textAlign = "left";
        });
        
        // Instructions
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "16px 'Courier New', Courier, monospace";
        ctx.fillText("Use ARROW KEYS to navigate and change values", width / 2, height - 120);
        ctx.fillText("Press ESCAPE to return to menu", width / 2, height - 90);
    }
}