// js/storage.js

import { STORAGE_KEYS, DEFAULT_SETTINGS, SETTINGS_CONFIG } from './config.js';

// High score management
export function getHighScore() {
    try {
        return parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0', 10);
    } catch (e) {
        console.warn('Failed to load high score:', e);
        return 0;
    }
}

export function saveHighScore(score) {
    try {
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    } catch (e) {
        console.warn('Failed to save high score:', e);
    }
}

// Enhanced settings management
export function getSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to handle new settings and validate existing ones
            const validated = validateSettings(parsed);
            return validated;
        }
    } catch (e) {
        console.warn('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS }; // Return a copy of defaults
}

export function saveSettings(settings) {
    try {
        // Validate settings before saving
        const validatedSettings = validateSettings(settings);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(validatedSettings));
        console.log('Settings saved successfully');
    } catch (e) {
        console.warn('Failed to save settings:', e);
    }
}

// Statistics management
export function getStatistics() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STATISTICS);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Failed to load statistics:', e);
    }
    
    // Return default statistics
    return {
        gamesPlayed: 0,
        totalScore: 0,
        totalLines: 0,
        totalTime: 0,
        bestScores: {
            marathon: 0,
            sprint: 999999, // Best time in ms
            ultra: 0,
            zen: 0,
            survival: 0
        },
        achievements: [],
        firstPlayed: Date.now(),
        lastPlayed: Date.now()
    };
}

export function saveStatistics(stats) {
    try {
        stats.lastPlayed = Date.now();
        localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
    } catch (e) {
        console.warn('Failed to save statistics:', e);
    }
}

// Settings validation and migration
export function validateSettings(settings) {
    const validated = { ...DEFAULT_SETTINGS };
    
    // Get all valid setting definitions from SETTINGS_CONFIG
    const allSettings = {};
    Object.values(SETTINGS_CONFIG).forEach(page => {
        page.settings.forEach(setting => {
            allSettings[setting.key] = setting;
        });
    });
    
    // Validate each setting
    Object.keys(settings).forEach(key => {
        const value = settings[key];
        const defaultValue = DEFAULT_SETTINGS[key];
        const definition = allSettings[key];
        
        // Skip if setting doesn't exist in current config
        if (!definition) {
            console.warn(`Unknown setting: ${key}, removing`);
            return;
        }
        
        // Type checking and range validation
        try {
            switch (definition.type) {
                case 'boolean':
                    validated[key] = typeof value === 'boolean' ? value : defaultValue;
                    break;
                    
                case 'range':
                    if (typeof value === 'number' && 
                        value >= definition.min && 
                        value <= definition.max) {
                        validated[key] = value;
                    } else {
                        console.warn(`Invalid range for ${key}: ${value}, using default`);
                        validated[key] = defaultValue;
                    }
                    break;
                    
                case 'select':
                    if (definition.options.includes(value)) {
                        validated[key] = value;
                    } else {
                        console.warn(`Invalid option for ${key}: ${value}, using default`);
                        validated[key] = defaultValue;
                    }
                    break;
                    
                case 'key':
                    // Basic key validation - should be a string
                    if (typeof value === 'string' && value.length > 0) {
                        validated[key] = value;
                    } else {
                        console.warn(`Invalid key binding for ${key}: ${value}, using default`);
                        validated[key] = defaultValue;
                    }
                    break;
                    
                default:
                    // For unknown types, just check if it matches the default type
                    if (typeof value === typeof defaultValue) {
                        validated[key] = value;
                    } else {
                        console.warn(`Type mismatch for ${key}, using default`);
                        validated[key] = defaultValue;
                    }
            }
        } catch (e) {
            console.warn(`Error validating ${key}:`, e);
            validated[key] = defaultValue;
        }
    });
    
    return validated;
}

// Control mapping validation
export function validateControls(controls) {
    const validKeys = [
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Space', 'Enter', 'Escape', 'ShiftLeft', 'ShiftRight',
        'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight',
        'Tab', 'CapsLock', 'Backspace', 'Delete', 'Home', 'End',
        'PageUp', 'PageDown', 'Insert',
        'KeyA', 'KeyB', 'KeyC', 'KeyD', 'KeyE', 'KeyF', 'KeyG',
        'KeyH', 'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyM', 'KeyN',
        'KeyO', 'KeyP', 'KeyQ', 'KeyR', 'KeyS', 'KeyT', 'KeyU',
        'KeyV', 'KeyW', 'KeyX', 'KeyY', 'KeyZ',
        'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
        'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9',
        'Numpad0', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4',
        'Numpad5', 'Numpad6', 'Numpad7', 'Numpad8', 'Numpad9',
        'NumpadAdd', 'NumpadSubtract', 'NumpadMultiply', 'NumpadDivide',
        'NumpadDecimal', 'NumpadEnter',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];
    
    const validated = {};
    
    Object.keys(controls).forEach(action => {
        const key = controls[action];
        if (validKeys.includes(key)) {
            validated[action] = key;
        } else {
            console.warn(`Invalid key binding for ${action}: ${key}`);
            // Keep original if invalid for now
            validated[action] = controls[action];
        }
    });
    
    return validated;
}

// Export/Import settings for backup
export function exportSettings() {
    const data = {
        settings: getSettings(),
        statistics: getStatistics(),
        highScore: getHighScore(),
        exportDate: new Date().toISOString(),
        version: '2.1'
    };
    
    return JSON.stringify(data, null, 2);
}

export function importSettings(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        if (data.settings) {
            const validated = validateSettings(data.settings);
            saveSettings(validated);
        }
        
        if (data.statistics) {
            saveStatistics(data.statistics);
        }
        
        if (data.highScore && typeof data.highScore === 'number') {
            saveHighScore(data.highScore);
        }
        
        return { success: true, message: 'Settings imported successfully' };
    } catch (e) {
        return { success: false, message: 'Failed to import settings: ' + e.message };
    }
}

// Clear all data
export function clearAllData() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (e) {
        console.warn('Failed to clear data:', e);
        return false;
    }
}

// Storage usage info
export function getStorageInfo() {
    try {
        const used = new Blob([JSON.stringify(localStorage)]).size;
        const quota = 5 * 1024 * 1024; // Assume 5MB quota
        
        return {
            used: used,
            quota: quota,
            percentage: (used / quota) * 100,
            remaining: quota - used
        };
    } catch (e) {
        return {
            used: 0,
            quota: 0,
            percentage: 0,
            remaining: 0
        };
    }
}

// Achievement system helpers
export function unlockAchievement(achievementId, stats) {
    if (!stats.achievements.includes(achievementId)) {
        stats.achievements.push(achievementId);
        saveStatistics(stats);
        return true; // New achievement unlocked
    }
    return false; // Already unlocked
}

export function checkAchievements(gameData, stats) {
    const newAchievements = [];
    
    // Define achievements
    const achievements = [
        { id: 'first_tetris', check: () => gameData.stats.linesCleared.tetris > 0 },
        { id: 'line_master', check: () => stats.totalLines >= 1000 },
        { id: 'score_master', check: () => gameData.score >= 100000 },
        { id: 'perfect_clear', check: () => gameData.stats.perfectClears > 0 },
        { id: 'combo_king', check: () => gameData.stats.maxCombo >= 10 },
        { id: 'speed_demon', check: () => gameData.stats.pps >= 2.0 },
        { id: 'tspin_master', check: () => Object.values(gameData.stats.tSpins).reduce((a, b) => a + b, 0) >= 10 },
        { id: 'marathon_survivor', check: () => gameData.level >= 20 },
        { id: 'dedicated_player', check: () => stats.gamesPlayed >= 100 }
    ];
    
    achievements.forEach(achievement => {
        if (achievement.check() && unlockAchievement(achievement.id, stats)) {
            newAchievements.push(achievement.id);
        }
    });
    
    return newAchievements;
}

// Profile management for multiple players
export function createProfile(name) {
    const profile = {
        name: name,
        id: Date.now().toString(),
        created: Date.now(),
        settings: { ...DEFAULT_SETTINGS },
        statistics: getStatistics(),
        highScores: []
    };
    
    try {
        const profiles = getProfiles();
        profiles.push(profile);
        localStorage.setItem('tetress-profiles', JSON.stringify(profiles));
        return profile;
    } catch (e) {
        console.warn('Failed to create profile:', e);
        return null;
    }
}

export function getProfiles() {
    try {
        const saved = localStorage.getItem('tetress-profiles');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('Failed to load profiles:', e);
        return [];
    }
}

export function switchProfile(profileId) {
    try {
        const profiles = getProfiles();
        const profile = profiles.find(p => p.id === profileId);
        
        if (profile) {
            // Save current profile's settings and stats
            const currentSettings = getSettings();
            const currentStats = getStatistics();
            
            // Load selected profile
            saveSettings(profile.settings);
            saveStatistics(profile.statistics);
            
            return true;
        }
        return false;
    } catch (e) {
        console.warn('Failed to switch profile:', e);
        return false;
    }
}

// Data integrity checks
export function validateDataIntegrity() {
    const issues = [];
    
    try {
        // Check settings
        const settings = getSettings();
        if (!settings || typeof settings !== 'object') {
            issues.push('Settings data corrupted');
        }
        
        // Check statistics
        const stats = getStatistics();
        if (!stats || typeof stats !== 'object') {
            issues.push('Statistics data corrupted');
        }
        
        // Check high score
        const highScore = getHighScore();
        if (isNaN(highScore)) {
            issues.push('High score data corrupted');
        }
        
    } catch (e) {
        issues.push(`Data validation error: ${e.message}`);
    }
    
    return {
        isValid: issues.length === 0,
        issues: issues
    };
}

// Repair corrupted data
export function repairData() {
    try {
        const integrity = validateDataIntegrity();
        
        if (!integrity.isValid) {
            console.warn('Repairing corrupted data...');
            
            // Reset to defaults if corrupted
            saveSettings(DEFAULT_SETTINGS);
            saveStatistics(getStatistics()); // This will create defaults if corrupted
            saveHighScore(0);
            
            console.log('Data repair completed');
            return true;
        }
        
        return false; // No repair needed
    } catch (e) {
        console.error('Failed to repair data:', e);
        return false;
    }
}