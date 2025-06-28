// js/settings.js

import { CONFIG, SETTINGS_CONFIG, DEFAULT_SETTINGS } from './config.js';
import { getSettings, saveSettings } from './storage.js';

export class Settings {
    constructor() {
        this.currentPage = 0;
        this.pages = Object.keys(SETTINGS_CONFIG);
        this.selectedIndex = 0;
        this.waitingForKey = false;
        this.keyToRemap = null;
        this.glowAnimation = 0;
        this.pageTransition = 0;
        this.showKeyHelp = false;
        this.changeEffect = { active: false, timer: 0 };
        
        this.loadSettings();
        console.log('Settings initialized with', this.pages.length, 'pages');
    }

    loadSettings() {
        const saved = getSettings();
        if (saved) {
            Object.assign(CONFIG, saved);
        }
        this.applySettings();
    }

    saveSettings() {
        saveSettings(CONFIG);
        this.applySettings();
        this.triggerChangeEffect();
    }

    applySettings() {
        // Apply visual settings immediately
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            if (CONFIG.screenShake) {
                gameContainer.classList.remove('no-shake');
            } else {
                gameContainer.classList.add('no-shake');
            }
        }
        
        // Apply performance settings
        if (CONFIG.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        if (CONFIG.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        if (CONFIG.largeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
        
        // Update timer display
        const timerDisplay = document.querySelector('[data-timer-display]');
        if (timerDisplay) {
            timerDisplay.style.display = CONFIG.showTimer ? 'block' : 'none';
        }
        
        // Update FPS display
        const debugElement = document.querySelector('[data-debug]');
        if (debugElement) {
            debugElement.style.display = CONFIG.showFPS ? 'block' : 'none';
        }
        
        console.log('Settings applied:', CONFIG);
    }

    triggerChangeEffect() {
        this.changeEffect.active = true;
        this.changeEffect.timer = 0;
    }

    handleInput(key) {
        if (this.waitingForKey) {
            return this.handleKeyRemap(key);
        }

        switch (key) {
            case 'up':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                break;
            case 'down':
                const maxIndex = SETTINGS_CONFIG[this.pages[this.currentPage]].settings.length - 1;
                this.selectedIndex = Math.min(maxIndex, this.selectedIndex + 1);
                break;
            case 'left':
                this.changeValue(-1);
                break;
            case 'right':
                this.changeValue(1);
                break;
            case 'pageUp':
            case 'PageUp':
                this.previousPage();
                break;
            case 'pageDown':
            case 'PageDown':
                this.nextPage();
                break;
            case 'select':
                return this.activateOption();
            case 'tab':
                this.showKeyHelp = !this.showKeyHelp;
                break;
            case 'back':
                return 'exit';
        }
        return null;
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.selectedIndex = 0;
            this.pageTransition = -1;
        }
    }

    nextPage() {
        if (this.currentPage < this.pages.length - 1) {
            this.currentPage++;
            this.selectedIndex = 0;
            this.pageTransition = 1;
        }
    }

    handleKeyRemap(key) {
        if (key === 'back' || key === 'Escape') {
            this.waitingForKey = false;
            this.keyToRemap = null;
            return null;
        }

        // Don't allow escape key to be remapped
        if (key !== 'Escape' && this.keyToRemap) {
            CONFIG[this.keyToRemap] = key;
            this.saveSettings();
            this.waitingForKey = false;
            this.keyToRemap = null;
        }
        return null;
    }

    changeValue(direction) {
        const currentPageConfig = SETTINGS_CONFIG[this.pages[this.currentPage]];
        const setting = currentPageConfig.settings[this.selectedIndex];
        const key = setting.key;

        if (setting.type === 'action') {
            return;
        }

        switch (setting.type) {
            case 'boolean':
                CONFIG[key] = !CONFIG[key];
                break;
            case 'range':
                const step = setting.step || 1;
                const newValue = CONFIG[key] + (direction * step);
                CONFIG[key] = Math.max(setting.min, Math.min(setting.max, newValue));
                break;
            case 'select':
                const currentIndex = setting.options.indexOf(CONFIG[key]);
                const newIndex = (currentIndex + direction + setting.options.length) % setting.options.length;
                CONFIG[key] = setting.options[newIndex];
                break;
        }
        this.saveSettings();
    }

    activateOption() {
        const currentPageConfig = SETTINGS_CONFIG[this.pages[this.currentPage]];
        const setting = currentPageConfig.settings[this.selectedIndex];

        switch (setting.type) {
            case 'boolean':
                CONFIG[setting.key] = !CONFIG[setting.key];
                this.saveSettings();
                break;
            case 'key':
                this.waitingForKey = true;
                this.keyToRemap = setting.key;
                break;
            case 'action':
                return this.handleAction(setting.key);
        }
        return null;
    }

    handleAction(actionKey) {
        switch (actionKey) {
            case 'clearScores':
                if (confirm('Clear all high scores? This cannot be undone.')) {
                    return 'clearScores';
                }
                break;
            case 'clearStats':
                if (confirm('Clear all statistics? This cannot be undone.')) {
                    return 'clearStats';
                }
                break;
            case 'resetSettings':
                if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                    Object.assign(CONFIG, DEFAULT_SETTINGS);
                    this.saveSettings();
                }
                break;
            case 'exportSettings':
                this.exportSettings();
                break;
            case 'importSettings':
                this.importSettings();
                break;
        }
        return null;
    }

    exportSettings() {
        const data = {
            settings: CONFIG,
            exportDate: new Date().toISOString(),
            version: '2.1'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tetress-settings.json';
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('Settings exported');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.settings) {
                            Object.assign(CONFIG, data.settings);
                            this.saveSettings();
                            console.log('Settings imported successfully');
                        }
                    } catch (error) {
                        console.error('Failed to import settings:', error);
                        alert('Invalid settings file');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    update() {
        this.glowAnimation += 0.05;
        
        if (this.pageTransition !== 0) {
            this.pageTransition *= 0.8;
            if (Math.abs(this.pageTransition) < 0.01) {
                this.pageTransition = 0;
            }
        }
        
        if (this.changeEffect.active) {
            this.changeEffect.timer += 0.1;
            if (this.changeEffect.timer >= 1) {
                this.changeEffect.active = false;
            }
        }
    }

    getKeyDisplayName(key) {
        const keyNames = {
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'Space': 'SPACE',
            'Escape': 'ESC',
            'Enter': 'ENTER',
            'ShiftLeft': 'L.SHIFT',
            'ShiftRight': 'R.SHIFT',
            'ControlLeft': 'L.CTRL',
            'ControlRight': 'R.CTRL',
            'AltLeft': 'L.ALT',
            'AltRight': 'R.ALT',
            'Tab': 'TAB',
            'CapsLock': 'CAPS',
            'Backspace': 'BACK',
            'Delete': 'DEL',
            'Home': 'HOME',
            'End': 'END',
            'PageUp': 'PG UP',
            'PageDown': 'PG DN'
        };
        
        if (keyNames[key]) return keyNames[key];
        if (key.startsWith('Key')) return key.slice(3);
        if (key.startsWith('Digit')) return key.slice(5);
        if (key.startsWith('Numpad')) return 'NUM ' + key.slice(6);
        if (key.startsWith('F') && key.length <= 3) return key;
        
        return key;
    }

    draw(ctx, width, height) {
        // Clear background with animated gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Title with enhanced effects
        ctx.save();
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 15 + Math.sin(this.glowAnimation * 2) * 5;
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 24px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SETTINGS', width / 2, 50);
        ctx.restore();

        // Page tabs with enhanced styling
        this.drawPageTabs(ctx, width);

        // Current page title
        const currentPageConfig = SETTINGS_CONFIG[this.pages[this.currentPage]];
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 16px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(currentPageConfig.title, width / 2, 110);

        // Key waiting prompt overlay
        if (this.waitingForKey) {
            this.drawKeyWaitingPrompt(ctx, width, height);
            return;
        }

        // Help overlay
        if (this.showKeyHelp) {
            this.drawHelpOverlay(ctx, width, height);
            return;
        }

        // Settings list with page transition effect
        ctx.save();
        if (this.pageTransition !== 0) {
            ctx.translate(this.pageTransition * 50, 0);
            ctx.globalAlpha = 1 - Math.abs(this.pageTransition);
        }
        this.drawSettingsList(ctx, width, currentPageConfig);
        ctx.restore();

        // Change effect
        if (this.changeEffect.active) {
            this.drawChangeEffect(ctx, width, height);
        }

        // Page navigation and instructions
        this.drawNavigationHints(ctx, width, height);
    }

    drawPageTabs(ctx, width) {
        const tabWidth = Math.min(120, (width - 40) / this.pages.length);
        const totalWidth = tabWidth * this.pages.length;
        const startX = (width - totalWidth) / 2;
        
        this.pages.forEach((page, index) => {
            const x = startX + (index * tabWidth);
            const isActive = index === this.currentPage;
            
            // Tab background with enhanced styling
            if (isActive) {
                const gradient = ctx.createLinearGradient(x, 65, x, 90);
                gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(0, 255, 255, 0.1)');
                ctx.fillStyle = gradient;
                ctx.fillRect(x, 65, tabWidth, 25);
                
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, 65, tabWidth, 25);
                
                // Active tab glow
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fillRect(x, 65, tabWidth, 25);
                
                ctx.strokeStyle = '#444';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, 65, tabWidth, 25);
                ctx.shadowBlur = 0;
            }
            
            // Tab text
            ctx.fillStyle = isActive ? '#00ffff' : '#888';
            ctx.font = '10px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(page.substring(0, 8), x + tabWidth / 2, 82);
        });
        
        ctx.shadowBlur = 0;
    }

    drawKeyWaitingPrompt(ctx, width, height) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, width, height);
        
        // Prompt box with enhanced styling
        const boxWidth = 350;
        const boxHeight = 180;
        const boxX = (width - boxWidth) / 2;
        const boxY = (height - boxHeight) / 2;
        
        // Box background gradient
        const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Box border with glow
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        ctx.shadowBlur = 0;
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KEY REMAPPING', width / 2, boxY + 40);
        
        // Current setting being remapped
        const currentPageConfig = SETTINGS_CONFIG[this.pages[this.currentPage]];
        const setting = currentPageConfig.settings[this.selectedIndex];
        
        ctx.fillStyle = '#00ffff';
        ctx.font = '14px Orbitron, monospace';
        ctx.fillText(`Setting: ${setting.label}`, width / 2, boxY + 70);
        
        // Instructions
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 16px Orbitron, monospace';
        ctx.fillText('PRESS NEW KEY', width / 2, boxY + 100);
        
        ctx.fillStyle = '#999';
        ctx.font = '12px Orbitron, monospace';
        ctx.fillText('ESC TO CANCEL', width / 2, boxY + 130);
        
        // Animated cursor
        const pulse = Math.sin(this.glowAnimation * 4);
        if (pulse > 0) {
            ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
            ctx.fillRect(width / 2 - 2, boxY + 145, 4, 20);
        }
    }

    drawHelpOverlay(ctx, width, height) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // Help content
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SETTINGS HELP', width / 2, 80);
        
        const helpText = [
            '↑↓ Navigate settings',
            '←→ Change values',
            'ENTER Activate/Toggle',
            'PAGE UP/DOWN Switch pages',
            'TAB Toggle this help',
            'ESC Return to menu',
            '',
            'PAGES:',
            '• GAMEPLAY - Core game mechanics',
            '• VISUAL - Graphics and effects',
            '• CONTROLS - Key bindings and timing',
            '• SYSTEM - Performance and accessibility',
            '',
            'Tips:',
            '• All settings auto-save',
            '• Reset options available in SYSTEM',
            '• Export/import your settings'
        ];
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Orbitron, monospace';
        
        helpText.forEach((line, index) => {
            const y = 120 + (index * 18);
            if (line === '') return;
            
            if (line.startsWith('•')) {
                ctx.fillStyle = '#00ff66';
            } else if (line.includes(':')) {
                ctx.fillStyle = '#ffff00';
            } else {
                ctx.fillStyle = '#ffffff';
            }
            
            ctx.fillText(line, width / 2, y);
        });
        
        // Close instruction
        ctx.fillStyle = '#ff6666';
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.fillText('PRESS TAB TO CLOSE', width / 2, height - 40);
    }

    drawSettingsList(ctx, width, pageConfig) {
        const startY = 140;
        const lineHeight = 32;
        const maxVisibleSettings = 14;
        
        // Calculate scroll offset
        let startIndex = 0;
        if (pageConfig.settings.length > maxVisibleSettings) {
            if (this.selectedIndex >= maxVisibleSettings - 2) {
                startIndex = Math.max(0, this.selectedIndex - maxVisibleSettings + 3);
            }
        }
        
        const endIndex = Math.min(pageConfig.settings.length, startIndex + maxVisibleSettings);
        
        for (let i = startIndex; i < endIndex; i++) {
            const setting = pageConfig.settings[i];
            const y = startY + ((i - startIndex) * lineHeight);
            const isSelected = i === this.selectedIndex;
            
            // Enhanced selection highlight
            if (isSelected) {
                const pulse = Math.sin(this.glowAnimation * 2) * 0.1 + 0.9;
                const selectionWidth = width - 60;
                const selectionHeight = 28;
                
                // Gradient background
                const gradient = ctx.createLinearGradient(
                    30, y - selectionHeight / 2,
                    30 + selectionWidth, y + selectionHeight / 2
                );
                gradient.addColorStop(0, `rgba(0, 255, 255, ${0.15 * pulse})`);
                gradient.addColorStop(0.5, `rgba(0, 255, 255, ${0.25 * pulse})`);
                gradient.addColorStop(1, `rgba(0, 255, 255, ${0.15 * pulse})`);
                ctx.fillStyle = gradient;
                ctx.fillRect(30, y - selectionHeight / 2, selectionWidth, selectionHeight);
                
                // Border with glow
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 1;
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 5;
                ctx.strokeRect(30, y - selectionHeight / 2, selectionWidth, selectionHeight);
                ctx.shadowBlur = 0;
                
                ctx.fillStyle = '#00ffff';
            } else {
                ctx.fillStyle = '#ffffff';
            }
            
            // Setting label with better formatting
            ctx.font = `${isSelected ? 'bold ' : ''}13px Orbitron, monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(setting.label + ':', 50, y + 4);
            
            // Setting value with type-specific styling
            let valueText = this.getValueText(setting);
            
            // Color code different value types
            if (setting.type === 'boolean') {
                ctx.fillStyle = CONFIG[setting.key] ? '#00ff00' : '#ff6666';
            } else if (setting.type === 'action') {
                ctx.fillStyle = isSelected ? '#ffff00' : '#888';
                valueText = `[${valueText}]`;
            } else if (setting.type === 'key') {
                ctx.fillStyle = isSelected ? '#ff8800' : '#ffaa44';
            } else {
                ctx.fillStyle = isSelected ? '#00ffff' : '#cccccc';
            }
            
            ctx.textAlign = 'right';
            ctx.font = `${isSelected ? 'bold ' : ''}13px Orbitron, monospace`;
            ctx.fillText(valueText, width - 50, y + 4);
            
            // Show range info for selected range settings
            if (isSelected && setting.type === 'range') {
                ctx.fillStyle = '#666';
                ctx.font = '9px Orbitron, monospace';
                ctx.textAlign = 'right';
                ctx.fillText(`(${setting.min}-${setting.max})`, width - 50, y + 18);
            }
        }
        
        // Enhanced scroll indicators
        if (pageConfig.settings.length > maxVisibleSettings) {
            ctx.fillStyle = '#00ffff';
            ctx.font = '10px Orbitron, monospace';
            ctx.textAlign = 'center';
            
            if (startIndex > 0) {
                const pulse = Math.sin(this.glowAnimation * 4) * 0.3 + 0.7;
                ctx.globalAlpha = pulse;
                ctx.fillText('▲ MORE ABOVE ▲', width / 2, startY - 15);
                ctx.globalAlpha = 1;
            }
            if (endIndex < pageConfig.settings.length) {
                const pulse = Math.sin(this.glowAnimation * 4 + Math.PI) * 0.3 + 0.7;
                ctx.globalAlpha = pulse;
                ctx.fillText('▼ MORE BELOW ▼', width / 2, startY + (maxVisibleSettings * lineHeight) + 20);
                ctx.globalAlpha = 1;
            }
        }
    }

    drawChangeEffect(ctx, width, height) {
        const progress = this.changeEffect.timer;
        const alpha = Math.sin(progress * Math.PI * 2) * 0.3;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    getValueText(setting) {
        const value = CONFIG[setting.key];
        
        switch (setting.type) {
            case 'boolean':
                return value ? 'ON' : 'OFF';
            case 'range':
                if (setting.step && setting.step < 1) {
                    return value.toFixed(1);
                }
                return value.toString();
            case 'select':
                return value.toString();
            case 'key':
                return this.getKeyDisplayName(value);
            case 'action':
                return 'ACTIVATE';
            default:
                return value.toString();
        }
    }

    drawNavigationHints(ctx, width, height) {
        ctx.fillStyle = '#555';
        ctx.font = '9px Orbitron, monospace';
        ctx.textAlign = 'center';
        
        const hints = [
            `PAGE ${this.currentPage + 1}/${this.pages.length}  ↑↓ NAVIGATE  ←→ CHANGE  ENTER SELECT`,
            'PG UP/DN SWITCH PAGES  TAB HELP  ESC EXIT'
        ];
        
        hints.forEach((hint, index) => {
            ctx.fillText(hint, width / 2, height - 35 + (index * 12));
        });
        
        // Page indicator dots
        const dotSpacing = 15;
        const dotsWidth = this.pages.length * dotSpacing;
        const dotsStartX = (width - dotsWidth) / 2;
        
        this.pages.forEach((_, index) => {
            const x = dotsStartX + (index * dotSpacing);
            const y = height - 15;
            const isActive = index === this.currentPage;
            
            ctx.fillStyle = isActive ? '#00ffff' : '#333';
            ctx.beginPath();
            ctx.arc(x, y, isActive ? 4 : 2, 0, Math.PI * 2);
            ctx.fill();
            
            if (isActive) {
                ctx.strokeStyle = '#00ffff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }
}