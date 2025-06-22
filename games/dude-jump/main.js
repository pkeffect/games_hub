// CONFIGURATIONS
import { SPEED, GRAVITY_FORCE, GAME_WIDTH } from './config/global.js';
import { getRandomFromRange } from './../utilities/numbers.js';

// UTILITIES
import {focusNext, focusPrevious } from './../utilities/dom.js';
import local from './../utilities/browser-storage.js';

// SERVICES
import MusicService from './services/MusicService.js';
import GUIService from './services/GUIService.js';

// NODES
import Player from './nodes/Player.js';
import Platform from './nodes/Platform.js';

const musicService = new MusicService();
const guiService = new GUIService();

let ctx = null;
let player = null;

let platforms = [];

const els = {
    canvas: document.querySelector('[data-canvas]'),
    score: document.querySelector('[data-score]'),
    highscore: document.querySelector('[data-highscore]'),
    latestScore: document.querySelector('[data-latest-score]'),
    musicSlider: document.querySelector('[data-music-volume-slider]'),
    sfxSlider: document.querySelector('[data-sfx-volume-slider]'),
};

const state = {
    score: 0,
    isFiring: false,
    isJumping: false,
    currentState: 'start', // start, playing, paused, gameover
};

const keys = {
    left: {
        isPressed: false,
    },
    right: {
        isPressed: false,
    },
    fire: {
        isPressed: false,
    },
};

function keyDownHandler({ key }) {
    if(!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    switch (key) {
    case 'ArrowLeft':
        keys.left.isPressed = true;
        break;
    case 'ArrowRight':
        keys.right.isPressed = true;
        break;
    case ' ':
        keys.fire.isPressed = true;
        break;
    }
}

function keyUpHandler(event) {
    switch (event.key) {
    case 'ArrowLeft':
        keys.left.isPressed = false;
        break;
    case 'ArrowRight':
        keys.right.isPressed = false;
        break;
    case 'ArrowUp':
        if(state.currentState !== 'playing') {
            event.preventDefault();
            focusPrevious(event);
        }
        break;
    case 'ArrowDown':
        if(state.currentState !== 'playing') {
            event.preventDefault();
            focusNext(event);
        }
        break;
    case ' ':
        keys.fire.isPressed = false;
        state.isFiring = false;
        break;
    case 'Escape':
        if(state.currentState === 'playing') {
            state.currentState = 'paused';
            guiService.selectGUIs('pause', { preventSave: true });
        }
        else if(state.currentState === 'paused') {
            state.currentState = 'playing';
            guiService.selectGUIs('game');
        }
        else guiService.goBack();
        break;
    }
}

function startHandler() {
    guiService.selectGUIs('game');
    state.currentState = 'playing';
    startGame();
}

function resumeHandler() {
    guiService.selectGUIs('game');
    state.currentState = 'playing';
}

function exitHandler() {
    guiService.selectGUIs('start');
    state.currentState = 'start';
}

function backHandler() {
    guiService.goBack();
    if(state.currentState === 'start') state.currentState = 'paused';
    else if(state.currentState === 'paused') state.currentState = 'start';
}

function optionsHandler() {
    guiService.selectGUIs('options');
}

function creditsHandler() {
    guiService.selectGUIs('credits');
}

function highscoreHandler() {
    guiService.selectGUIs('highscore');
}

function clickHandler(e) {
    if (!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    const buttonHandlers = {
        'data-start-button': startHandler,
        'data-resume-button': resumeHandler,
        'data-exit-button': exitHandler,
        'data-back-button': backHandler,
        'data-options-button': optionsHandler,
        'data-play-again-button': startHandler,
        'data-credits-button': creditsHandler,
        'data-highscore-button': highscoreHandler,
        'data-clear-score-button': clearScores,
    };

    const handler = Object.entries(buttonHandlers)
        .find(([attr]) => e.target.hasAttribute(attr))?.[1];

    if (handler) handler();
}

function updateScore(value) {
    state.score += value;

    const score = state.score;
    els.score.textContent = score;
    local.save('dude-latest-score', score);
    const currentHighscore = local.get('dude-highscore') || 0;
    if(score > currentHighscore) {
        local.save('dude-highscore', score);
        els.highscore.textContent = score;
    }
    els.latestScore.textContent = score;
}

function clearScores() {
    local.delete('dude-highscore');
    local.delete('dude-latest-score');
    els.highscore.textContent = 0;
    els.latestScore.textContent = 0;
    musicService.play({ channelType: 'jump' });
}

function generateType() {
    const random = Math.random() * 100;
    return random < 90 ? 'NORMAL' : random < 97 ? 'MOVING' : 'FRAGILE';
}

function generateNewPlatform() {
    const lastPlatform = platforms[platforms.length - 1];
    const y = lastPlatform.top - getRandomFromRange(100, 150);
    const x = Math.random() * (els.canvas.width - 100);
    const width = els.canvas.width * 0.15;
    const height = 20;
    const type = generateType();

    platforms.push(
        new Platform({ position: { x, y }, width, height, type })
    );
}

function animate() {

    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);

    if(state.currentState !== 'playing') return;

    if (keys.left.isPressed) player.velocity.x = -SPEED;
    else if (keys.right.isPressed) player.velocity.x = SPEED;
    else player.velocity.x = 0;

    if(player.position.x > els.canvas.width) player.position.x = 1;
    else if(player.position.x + player.width < 0) player.position.x = els.canvas.width -1;

    player.velocity.y += GRAVITY_FORCE;

    if(player.bottom >= els.canvas.height) {
        gameOverHandler();
    }

    platforms.forEach((platform, i) => {
        if(player.velocity.y < 0 && player.position.y < els.canvas.height * 3 / 4) {
            const percentage =  100 - ((player.position.y / els.canvas.height) * 100);
            platform.position.y += (SPEED + SPEED * (percentage / 100) + Math.abs(player.velocity.y * 1.5));
        }
        if(
            player.velocity.y >= 0 &&
            player.bottom >= platform.top &&
            player.bottom <= platform.bottom &&
            player.right >= platform.left &&
            player.left <= platform.right
        ) {
            if(platform.type === 'FRAGILE') {
                platform.velocity.y = 1;
                player.velocity.y = 2;
                generateNewPlatform();
                updateScore(30);
                return;
            }
            player.jump();
            musicService.play({ channelType: 'jump' });
        }

        if(platform.top > els.canvas.height) {
            setTimeout(() => { platforms.splice(i, 1); }, 0);
            generateNewPlatform();
            updateScore(10);
        }
    });

    platforms.forEach((platform) => {
        platform.update(ctx);
    });

    player.update(ctx);
}

function gameOverHandler() {
    state.currentState = 'gameover';
    guiService.selectGUIs('gameOver', { preventSave: true });
    musicService.play({ channelType: 'gameOver' });
}

function setCanvasSize() {
    els.canvas.width = Math.min(GAME_WIDTH, window.innerWidth);
    els.canvas.height = Math.min(els.canvas.width * 1.5, window.innerHeight);
}

function startGame() {
    initPlatforms();
    player.reset();
    state.score = 0;
    els.score.textContent = state.score;
}

function loadScores() {
    const highscore = local.get('dude-highscore') || 0;
    const latestScore = local.get('dude-latest-score') || 0;
    els.highscore.textContent = highscore;
    els.latestScore.textContent = latestScore;
}

function setupSound() {
    const musicVolume = local.get('dude-music-volume') || 0.5;
    const sfxVolume = local.get('dude-sfx-volume') || 0.5;
    musicService.setMusicVolume(musicVolume);
    musicService.setSFXVolume(sfxVolume);
    els.musicSlider.value = musicVolume;
    els.sfxSlider.value = sfxVolume;
}

function initPlatforms() {
    platforms = [];

    platforms.push(
        new Platform({
            position: { x: els.canvas.width / 2, y: els.canvas.height - 20 },
            width: els.canvas.width * 0.25,
            height: 20
        })
    );

    while(platforms[platforms.length - 1].top > 0) {
        generateNewPlatform();
    }
}

function handlePageVisibilityChange() {
    if(document.hidden) {
        if(state.currentState === 'playing') {
            state.currentState = 'paused';
            guiService.selectGUIs('pause', { preventSave: true });
        }
        musicService.pause({ channelType: 'music' });
    }
    else {
        if(state.currentState === 'paused') {
            musicService.play({ channelType: 'music', loop: true });
        }
    }
}

function init() {
    if(!els.canvas) return console.error('Canvas element not found');

    ctx = els.canvas.getContext('2d');
    player = new Player({ ctx });

    setCanvasSize();

    if(!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    guiService.selectGUIs('start');

    initPlatforms();

    animate();
    loadScores();
    setupSound();

    addEventListener('keydown', keyDownHandler);
    addEventListener('keyup', keyUpHandler);
    addEventListener('click', clickHandler);
    addEventListener('visibilitychange', handlePageVisibilityChange);

    addEventListener('touchstart', (e) => {
        if(e.touches[0].clientX < window.innerWidth / 2) {
            keys.left.isPressed = true;
        } else {
            keys.right.isPressed = true;
        }
    });

    addEventListener('touchend', () => {
        keys.left.isPressed = false;
        keys.right.isPressed = false;
    });

    addEventListener('touchmove', (e) => {
        e.preventDefault();
        if(e.touches[0].clientX < window.innerWidth / 2) {
            keys.left.isPressed = true;
            keys.right.isPressed = false;
        } else {
            keys.right.isPressed = true;
            keys.left.isPressed = false;
        }
    });


    els.musicSlider.addEventListener('input', e => {
        musicService.setMusicVolume(e.target.value);
        local.save('dude-music-volume', e.target.value);
    });

    els.sfxSlider.addEventListener('input', e => {
        musicService.setSFXVolume(e.target.value);
        musicService.play({ channelType: 'jump' });
        local.save('dude-sfx-volume', e.target.value);
    });
}

addEventListener('DOMContentLoaded', init);
