// js/config.js

// Game board dimensions
export const BOARD_WIDTH = 12;  
export const BOARD_HEIGHT = 22; 
export const BLOCK_SIZE = 36;   
export const VISIBLE_HEIGHT = 20; // Only show 20 rows, hide top 2

// Canvas dimensions
export const CANVAS_WIDTH = BOARD_WIDTH * BLOCK_SIZE;  
export const CANVAS_HEIGHT = BOARD_HEIGHT * BLOCK_SIZE; 

// Game state enumeration
export const GameState = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER',
    HIGH_SCORES: 'HIGH_SCORES',
    SETTINGS: 'SETTINGS',
    ENTER_NAME: 'ENTER_NAME',
    MODE_SELECT: 'MODE_SELECT'
};

// Game modes
export const GameMode = {
    MARATHON: 'MARATHON',
    SPRINT: 'SPRINT',
    ULTRA: 'ULTRA',
    ZEN: 'ZEN',
    SURVIVAL: 'SURVIVAL'
};

// Local storage keys
export const STORAGE_KEYS = {
    HIGH_SCORE: 'tetress-highscore',
    SETTINGS: 'tetress-settings',
    STATISTICS: 'tetress-statistics'
};

// Tetris piece colors - Multiple color schemes
export const COLOR_SCHEMES = [
    // Classic scheme (levels 1-5)
    [
        '#000000', // Empty (0)
        '#f7d309', // T piece (1) - Yellow
        '#00a2f3', // O piece (2) - Blue  
        '#8a3ebf', // L piece (3) - Purple
        '#00a74a', // J piece (4) - Green
        '#e50000', // I piece (5) - Red
        '#0000e6', // S piece (6) - Dark Blue
        '#f78a09'  // Z piece (7) - Orange
    ],
    // Neon scheme (levels 6-10)
    [
        '#000000', // Empty (0)
        '#00ff00', // T piece (1) - Bright Green
        '#ff00ff', // O piece (2) - Magenta
        '#00ffff', // L piece (3) - Cyan
        '#ffff00', // J piece (4) - Yellow
        '#ff0080', // I piece (5) - Hot Pink
        '#80ff00', // S piece (6) - Lime
        '#ff8000'  // Z piece (7) - Orange
    ],
    // Ice scheme (levels 11-15)
    [
        '#000000', // Empty (0)
        '#87ceeb', // T piece (1) - Sky Blue
        '#b0e0e6', // O piece (2) - Powder Blue
        '#4682b4', // L piece (3) - Steel Blue
        '#5f9ea0', // J piece (4) - Cadet Blue
        '#00bfff', // I piece (5) - Deep Sky Blue
        '#1e90ff', // S piece (6) - Dodger Blue
        '#6495ed'  // Z piece (7) - Cornflower Blue
    ],
    // Fire scheme (levels 16+)
    [
        '#000000', // Empty (0)
        '#ff4500', // T piece (1) - Orange Red
        '#ff6347', // O piece (2) - Tomato
        '#dc143c', // L piece (3) - Crimson
        '#b22222', // J piece (4) - Fire Brick
        '#ff0000', // I piece (5) - Red
        '#ff1493', // S piece (6) - Deep Pink
        '#ff69b4'  // Z piece (7) - Hot Pink
    ]
];

// Current active colors (will be updated based on level)
export const COLORS = [...COLOR_SCHEMES[0]];

// Tetris pieces (7 standard pieces) with multiple rotations
export const PIECES = [
    // T piece (1) - 4 rotations
    [
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0]
        ],
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0]
        ]
    ],
    // O piece (2) - Same for all rotations
    [
        [
            [2, 2],
            [2, 2]
        ],
        [
            [2, 2],
            [2, 2]
        ],
        [
            [2, 2],
            [2, 2]
        ],
        [
            [2, 2],
            [2, 2]
        ]
    ],
    // L piece (3) - 4 rotations
    [
        [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ],
        [
            [0, 0, 0],
            [3, 3, 3],
            [3, 0, 0]
        ],
        [
            [3, 3, 0],
            [0, 3, 0],
            [0, 3, 0]
        ],
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ]
    ],
    // J piece (4) - 4 rotations
    [
        [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ],
        [
            [4, 0, 0],
            [4, 4, 4],
            [0, 0, 0]
        ],
        [
            [0, 4, 4],
            [0, 4, 0],
            [0, 4, 0]
        ],
        [
            [0, 0, 0],
            [4, 4, 4],
            [0, 0, 4]
        ]
    ],
    // I piece (5) - 2 unique rotations (repeated for 4)
    [
        [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [5, 5, 5, 5],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [5, 5, 5, 5],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
    ],
    // S piece (6) - 2 unique rotations (repeated for 4)
    [
        [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ],
        [
            [6, 0, 0],
            [6, 6, 0],
            [0, 6, 0]
        ],
        [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ],
        [
            [6, 0, 0],
            [6, 6, 0],
            [0, 6, 0]
        ]
    ],
    // Z piece (7) - 2 unique rotations (repeated for 4)
    [
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ],
        [
            [0, 7, 0],
            [7, 7, 0],
            [7, 0, 0]
        ],
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ],
        [
            [0, 7, 0],
            [7, 7, 0],
            [7, 0, 0]
        ]
    ]
];

// Wall kick tables for Super Rotation System (SRS)
export const WALL_KICKS = {
    // For J, L, T, S, Z pieces
    JLTSZ: {
        '0->R': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        'R->0': [[1, 0], [1, -1], [0, 2], [1, 2]],
        'R->2': [[1, 0], [1, -1], [0, 2], [1, 2]],
        '2->R': [[-1, 0], [-1, 1], [0, -2], [-1, -2]],
        '2->L': [[1, 0], [1, 1], [0, -2], [1, -2]],
        'L->2': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        'L->0': [[-1, 0], [-1, -1], [0, 2], [-1, 2]],
        '0->L': [[1, 0], [1, 1], [0, -2], [1, -2]]
    },
    // For I piece
    I: {
        '0->R': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
        'R->0': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
        'R->2': [[-1, 0], [2, 0], [-1, 2], [2, -1]],
        '2->R': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
        '2->L': [[2, 0], [-1, 0], [2, 1], [-1, -2]],
        'L->2': [[-2, 0], [1, 0], [-2, -1], [1, 2]],
        'L->0': [[1, 0], [-2, 0], [1, -2], [-2, 1]],
        '0->L': [[-1, 0], [2, 0], [-1, 2], [2, -1]]
    }
};

// Speed settings (1-10 scale)
export const SPEED_SETTINGS = [
    2000, // 1 - Very Slow
    1500, // 2 - Slow
    1200, // 3 - Relaxed
    1000, // 4 - Normal Slow
    800,  // 5 - Normal (default)
    600,  // 6 - Normal Fast
    450,  // 7 - Fast
    300,  // 8 - Very Fast
    200,  // 9 - Extreme
    100   // 10 - Maximum
];

// Authentic Tetris speed progression (for marathon mode)
export const AUTHENTIC_SPEED_TABLE = [
    1000, 793, 618, 473, 355, 262, 190, 135, 94, 64, 43, 28, 18, 11, 7, 4, 3, 2, 1
];

// Input key codes
export const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight', 
    DOWN: 'ArrowDown',
    UP: 'ArrowUp',
    SPACE: 'Space',
    ESC: 'Escape',
    ENTER: 'Enter',
    SHIFT: 'ShiftLeft',
    CTRL: 'ControlLeft',
    Z: 'KeyZ',
    X: 'KeyX',
    C: 'KeyC'
};

// Default controls
export const DEFAULT_CONTROLS = {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    softDrop: 'ArrowDown',
    hardDrop: 'Space',
    rotateLeft: 'KeyZ',
    rotateRight: 'ArrowUp',
    hold: 'KeyC',
    pause: 'Escape'
};

// Menu configuration
export const MENU_OPTIONS = [
    'MARATHON',
    'SPRINT',
    'ULTRA', 
    'ZEN',
    'SURVIVAL',
    'HIGH SCORES',
    'SETTINGS'
];

// Game mode configurations
export const MODE_CONFIGS = {
    MARATHON: {
        name: 'Marathon',
        description: 'Classic endless Tetris',
        goal: 'Survive as long as possible',
        hasLevels: true,
        hasTimer: true,
        hasLineGoal: false
    },
    SPRINT: {
        name: 'Sprint',
        description: 'Race to clear 40 lines',
        goal: 'Clear 40 lines as fast as possible',
        hasLevels: false,
        hasTimer: true,
        hasLineGoal: true,
        lineGoal: 40
    },
    ULTRA: {
        name: 'Ultra',
        description: '2-minute score attack',
        goal: 'Maximum score in 2 minutes',
        hasLevels: false,
        hasTimer: true,
        hasLineGoal: false,
        timeLimit: 120000 // 2 minutes in ms
    },
    ZEN: {
        name: 'Zen',
        description: 'Relaxed, no pressure',
        goal: 'Play at your own pace',
        hasLevels: false,
        hasTimer: false,
        hasLineGoal: false
    },
    SURVIVAL: {
        name: 'Survival',
        description: 'Speed increases every 30 seconds',
        goal: 'Survive increasing speed',
        hasLevels: false,
        hasTimer: true,
        hasLineGoal: false
    }
};

// Particle system settings
export const PARTICLE_SETTINGS = {
    maxParticles: 500,
    lineClears: {
        single: { count: 20, colors: ['#ffff00', '#ffffff'] },
        double: { count: 40, colors: ['#00ff00', '#ffffff'] },
        triple: { count: 60, colors: ['#ff8000', '#ffffff'] },
        tetris: { count: 100, colors: ['#ff0000', '#ffff00', '#ffffff'] }
    },
    tSpin: { count: 80, colors: ['#ff00ff', '#00ffff', '#ffffff'] },
    perfectClear: { count: 150, colors: ['#00ffff', '#ff00ff', '#ffff00'] }
};

// Settings configuration with categories
export const SETTINGS_CONFIG = {
    // Page 1: Core Gameplay
    gameplay: {
        title: 'GAMEPLAY',
        settings: [
            { key: 'gameSpeed', label: 'Game Speed', type: 'range', min: 1, max: 10, step: 1, default: 5 },
            { key: 'lockDelay', label: 'Lock Delay (ms)', type: 'range', min: 0, max: 1000, step: 50, default: 500 },
            { key: 'maxLockDelayResets', label: 'Max Lock Resets', type: 'range', min: 5, max: 25, step: 1, default: 15 },
            { key: 'use7Bag', label: '7-Bag Randomizer', type: 'boolean', default: true },
            { key: 'enableTSpin', label: 'T-Spin Detection', type: 'boolean', default: true },
            { key: 'wallKicks', label: 'Wall Kicks (SRS)', type: 'boolean', default: true },
            { key: 'infiniteMovement', label: 'Infinite Movement', type: 'boolean', default: false },
            { key: 'hardDropLock', label: 'Hard Drop Auto-Lock', type: 'boolean', default: true },
            { key: 'softDropMultiplier', label: 'Soft Drop Speed', type: 'range', min: 1, max: 20, step: 1, default: 10 },
            { key: 'levelProgression', label: 'Level Progression', type: 'select', options: ['Classic', 'Modern', 'Exponential'], default: 'Classic' }
        ]
    },
    // Page 2: Visual Effects
    visual: {
        title: 'VISUAL',
        settings: [
            { key: 'showGrid', label: 'Show Grid Lines', type: 'boolean', default: true },
            { key: 'gridOpacity', label: 'Grid Opacity', type: 'range', min: 0.1, max: 1.0, step: 0.1, default: 0.3 },
            { key: 'showGhost', label: 'Ghost Piece', type: 'boolean', default: true },
            { key: 'ghostOpacity', label: 'Ghost Opacity', type: 'range', min: 0.1, max: 1.0, step: 0.1, default: 0.5 },
            { key: 'particleEffects', label: 'Particle Effects', type: 'boolean', default: true },
            { key: 'particleAmount', label: 'Particle Density', type: 'range', min: 0.1, max: 3.0, step: 0.1, default: 1.0 },
            { key: 'screenShake', label: 'Screen Shake', type: 'boolean', default: true },
            { key: 'shakeIntensity', label: 'Shake Intensity', type: 'range', min: 0.1, max: 2.0, step: 0.1, default: 1.0 },
            { key: 'colorSchemeChange', label: 'Dynamic Colors', type: 'boolean', default: true },
            { key: 'backgroundEffects', label: 'Background FX', type: 'boolean', default: true },
            { key: 'tetrisFlash', label: 'Tetris Flash Effect', type: 'boolean', default: true },
            { key: 'lineBlinkSpeed', label: 'Line Clear Speed', type: 'range', min: 0.5, max: 3.0, step: 0.1, default: 1.0 }
        ]
    },
    // Page 3: UI & Information
    interface: {
        title: 'INTERFACE',
        settings: [
            { key: 'showHold', label: 'Hold Piece Display', type: 'boolean', default: true },
            { key: 'nextPieces', label: 'Next Pieces Shown', type: 'range', min: 1, max: 6, step: 1, default: 3 },
            { key: 'showTimer', label: 'Show Timer', type: 'boolean', default: true },
            { key: 'timerFormat', label: 'Timer Format', type: 'select', options: ['MM:SS.cc', 'MM:SS', 'SSS.cc'], default: 'MM:SS.cc' },
            { key: 'showFPS', label: 'Show FPS Counter', type: 'boolean', default: false },
            { key: 'showDebugInfo', label: 'Debug Information', type: 'boolean', default: false },
            { key: 'scoreAnimation', label: 'Score Animations', type: 'boolean', default: true },
            { key: 'comboCounter', label: 'Show Combo Count', type: 'boolean', default: true },
            { key: 'levelUpNotification', label: 'Level Up Alerts', type: 'boolean', default: true },
            { key: 'piecePlacementHints', label: 'Placement Hints', type: 'boolean', default: false },
            { key: 'statisticsOverlay', label: 'Live Statistics', type: 'boolean', default: false }
        ]
    },
    // Page 4: Controls & Input
    controls: {
        title: 'CONTROLS',
        settings: [
            { key: 'moveLeft', label: 'Move Left', type: 'key', default: 'ArrowLeft' },
            { key: 'moveRight', label: 'Move Right', type: 'key', default: 'ArrowRight' },
            { key: 'softDrop', label: 'Soft Drop', type: 'key', default: 'ArrowDown' },
            { key: 'hardDrop', label: 'Hard Drop', type: 'key', default: 'Space' },
            { key: 'rotateLeft', label: 'Rotate Left', type: 'key', default: 'KeyZ' },
            { key: 'rotateRight', label: 'Rotate Right', type: 'key', default: 'ArrowUp' },
            { key: 'rotate180', label: 'Rotate 180°', type: 'key', default: 'KeyX' },
            { key: 'hold', label: 'Hold Piece', type: 'key', default: 'KeyC' },
            { key: 'pause', label: 'Pause Game', type: 'key', default: 'Escape' },
            { key: 'restart', label: 'Quick Restart', type: 'key', default: 'KeyR' }
        ]
    },
    // Page 5: Timing & Feel
    timing: {
        title: 'TIMING',
        settings: [
            { key: 'dasDelay', label: 'DAS Delay (ms)', type: 'range', min: 50, max: 300, step: 10, default: 167 },
            { key: 'arrRate', label: 'ARR Rate (ms)', type: 'range', min: 0, max: 100, step: 5, default: 33 },
            { key: 'sdfFactor', label: 'Soft Drop Factor', type: 'range', min: 1, max: 30, step: 1, default: 20 },
            { key: 'dasOnSoftDrop', label: 'DAS Cut on Soft Drop', type: 'boolean', default: true },
            { key: 'finesse', label: 'Finesse Optimization', type: 'boolean', default: false },
            { key: 'inputBuffer', label: 'Input Buffer (ms)', type: 'range', min: 0, max: 200, step: 10, default: 50 },
            { key: 'rotationPriority', label: 'Rotation Priority', type: 'select', options: ['Standard', 'Aggressive'], default: 'Standard' },
            { key: 'entryDelay', label: 'Entry Delay (ms)', type: 'range', min: 0, max: 500, step: 25, default: 0 },
            { key: 'lineClearDelay', label: 'Line Clear Delay', type: 'range', min: 0, max: 1000, step: 50, default: 400 }
        ]
    },
    // Page 6: Performance & Accessibility  
    system: {
        title: 'SYSTEM',
        settings: [
            { key: 'targetFPS', label: 'Target Frame Rate', type: 'select', options: [30, 60, 120, 144], default: 60 },
            { key: 'vsync', label: 'V-Sync', type: 'boolean', default: true },
            { key: 'renderOptimization', label: 'Render Optimization', type: 'boolean', default: true },
            { key: 'reducedMotion', label: 'Reduced Motion', type: 'boolean', default: false },
            { key: 'highContrast', label: 'High Contrast Mode', type: 'boolean', default: false },
            { key: 'largeText', label: 'Large Text Mode', type: 'boolean', default: false },
            { key: 'colorBlindMode', label: 'Colorblind Support', type: 'select', options: ['None', 'Protanopia', 'Deuteranopia', 'Tritanopia'], default: 'None' },
            { key: 'screenReader', label: 'Screen Reader Mode', type: 'boolean', default: false },
            { key: 'memoryOptimization', label: 'Memory Optimization', type: 'boolean', default: true },
            { key: 'maxParticles', label: 'Max Particles', type: 'range', min: 100, max: 2000, step: 100, default: 500 }
        ]
    },
    // Page 7: Game Modes & Scoring
    modes: {
        title: 'MODES',
        settings: [
            { key: 'marathonGoal', label: 'Marathon Line Goal', type: 'range', min: 150, max: 999, step: 25, default: 300 },
            { key: 'sprintLines', label: 'Sprint Line Count', type: 'select', options: [20, 40, 100], default: 40 },
            { key: 'ultraTime', label: 'Ultra Time (sec)', type: 'select', options: [60, 120, 180, 300], default: 120 },
            { key: 'zenMode', label: 'Zen Mode Style', type: 'select', options: ['Infinite', 'Guided', 'Meditative'], default: 'Infinite' },
            { key: 'survivalAcceleration', label: 'Survival Speed Up', type: 'range', min: 10, max: 60, step: 5, default: 30 },
            { key: 'scoringSystem', label: 'Scoring System', type: 'select', options: ['Classic', 'Modern', 'T-Spin Focused'], default: 'Modern' },
            { key: 'comboBonuses', label: 'Combo Bonuses', type: 'boolean', default: true },
            { key: 'tSpinRewards', label: 'T-Spin Rewards', type: 'range', min: 0.5, max: 3.0, step: 0.1, default: 1.0 },
            { key: 'perfectClearBonus', label: 'Perfect Clear Bonus', type: 'boolean', default: true }
        ]
    },
    // Page 8: Data & Storage
    data: {
        title: 'DATA',
        settings: [
            { key: 'maxHighScores', label: 'Max High Scores', type: 'range', min: 3, max: 20, step: 1, default: 10 },
            { key: 'saveStatistics', label: 'Save Statistics', type: 'boolean', default: true },
            { key: 'trackPersonalBests', label: 'Track Personal Bests', type: 'boolean', default: true },
            { key: 'sessionHistory', label: 'Session History', type: 'range', min: 10, max: 100, step: 10, default: 50 },
            { key: 'replayRecording', label: 'Replay Recording', type: 'boolean', default: false },
            { key: 'replayLength', label: 'Replay Length (min)', type: 'range', min: 1, max: 30, step: 1, default: 10 },
            { key: 'autoBackup', label: 'Auto Data Backup', type: 'boolean', default: true },
            { key: 'exportSettings', label: 'Export Settings', type: 'action' },
            { key: 'importSettings', label: 'Import Settings', type: 'action' },
            { key: 'clearScores', label: 'Clear High Scores', type: 'action' },
            { key: 'clearStats', label: 'Clear Statistics', type: 'action' },
            { key: 'resetSettings', label: 'Reset All Settings', type: 'action' }
        ]
    }
};

// Default settings (combines all defaults from SETTINGS_CONFIG)
export const DEFAULT_SETTINGS = {
    // Gameplay
    gameSpeed: 5,
    lockDelay: 500,
    maxLockDelayResets: 15,
    use7Bag: true,
    enableTSpin: true,
    wallKicks: true,
    infiniteMovement: false,
    hardDropLock: true,
    softDropMultiplier: 10,
    levelProgression: 'Classic',
    
    // Visual
    showGrid: true,
    gridOpacity: 0.3,
    showGhost: true,
    ghostOpacity: 0.5,
    particleEffects: true,
    particleAmount: 1.0,
    screenShake: true,
    shakeIntensity: 1.0,
    colorSchemeChange: true,
    backgroundEffects: true,
    tetrisFlash: true,
    lineBlinkSpeed: 1.0,
    
    // Interface
    showHold: true,
    nextPieces: 3,
    showTimer: true,
    timerFormat: 'MM:SS.cc',
    showFPS: false,
    showDebugInfo: false,
    scoreAnimation: true,
    comboCounter: true,
    levelUpNotification: true,
    piecePlacementHints: false,
    statisticsOverlay: false,
    
    // Controls
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    softDrop: 'ArrowDown',
    hardDrop: 'Space',
    rotateLeft: 'KeyZ',
    rotateRight: 'ArrowUp',
    rotate180: 'KeyX',
    hold: 'KeyC',
    pause: 'Escape',
    restart: 'KeyR',
    
    // Timing
    dasDelay: 167,
    arrRate: 33,
    sdfFactor: 20,
    dasOnSoftDrop: true,
    finesse: false,
    inputBuffer: 50,
    rotationPriority: 'Standard',
    entryDelay: 0,
    lineClearDelay: 400,
    
    // System
    targetFPS: 60,
    vsync: true,
    renderOptimization: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    colorBlindMode: 'None',
    screenReader: false,
    memoryOptimization: true,
    maxParticles: 500,
    
    // Modes
    marathonGoal: 300,
    sprintLines: 40,
    ultraTime: 120,
    zenMode: 'Infinite',
    survivalAcceleration: 30,
    scoringSystem: 'Modern',
    comboBonuses: true,
    tSpinRewards: 1.0,
    perfectClearBonus: true,
    
    // Data
    maxHighScores: 10,
    saveStatistics: true,
    trackPersonalBests: true,
    sessionHistory: 50,
    replayRecording: false,
    replayLength: 10,
    autoBackup: true
};

// Current active settings (will be loaded from storage)
export const CONFIG = { ...DEFAULT_SETTINGS };