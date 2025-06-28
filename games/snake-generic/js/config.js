// js/config.js

// Game size and speed settings
export const GRID_SIZE = 24;
export const CANVAS_WIDTH = 840;
export const CANVAS_HEIGHT = 840;
export const GAME_SPEED_MS = 120;

// Game state enumeration
export const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    HIGH_SCORES: 'HIGH_SCORES',
    SETTINGS: 'SETTINGS',
    ENTER_NAME: 'ENTER_NAME'
};

// Local storage key for high score
export const HIGHSCORE_KEY = 'snake-highscore';

// Snake color configuration - more futuristic palette
export const COLOR_PALETTE = [
    '#00ffff', // Cyan
    '#0099ff', // Bright Blue  
    '#3366ff', // Electric Blue
    '#6633ff', // Purple
    '#9900ff', // Magenta
    '#ff0099', // Hot Pink
    '#ff3366', // Red-Pink
    '#ff6600'  // Orange
];

export const COLOR_TRANSITION_LENGTH = 6;

// Menu configuration
export const MENU_OPTIONS = [
    'PLAY',
    'HIGH SCORES', 
    'SETTINGS'
];

// Settings configuration
export const CONFIG = {
    SHOW_TIMER: true,
    SHOW_FPS: false,
    TRAIL_EFFECT: true,
    PARTICLE_EFFECTS: true,
    MAX_HIGH_SCORES: 5
};