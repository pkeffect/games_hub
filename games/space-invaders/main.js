// CONFIGURATIONS
import { SPEED, SPACING, TOTAL_PARTICLES } from './config/global.js';
import LEVELS from './config/levels.js';

// UTILITIES
import { collides } from './../utilities/collision.js';
import {focusNext, focusPrevious } from './../utilities/dom.js';
import { getRandomFromRange } from './../utilities/numbers.js';
import local from './../utilities/browser-storage.js';

// SERVICES
import MusicService from './services/MusicService.js';
import GUIService from './services/GUIService.js';

// NODES
import Player from './nodes/Player.js';
import Enemy from './nodes/Enemy.js';
import Particle from './nodes/Particle.js';
import Projectile from './nodes/Projectile.js';

const musicService = new MusicService();
const guiService = new GUIService();

const player = new Player();
const enemies = [];
const projectiles = [];
const enemyProjectiles = [];
const particles = [];

let ctx = null;

const els = {
    canvas: document.querySelector('[data-canvas]'),
    score: document.querySelector('[data-score]'),
    lives: document.querySelector('[data-lives]'),
    level: document.querySelector('[data-level]'),
    highscore: document.querySelector('[data-highscore]'),
    latestScore: document.querySelector('[data-latest-score]'),
    musicSlider: document.querySelector('[data-music-volume-slider]'),
    sfxSlider: document.querySelector('[data-sfx-volume-slider]'),
};

const times = {
    enemiesFire: 0,
};

const state = {
    score: 0,
    lives: 3,
    isFiring: false,
    currentLevel: 1,
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
    else console.warn('Unhandled button click:', e.target);
}

function updateScore(value) {
    state.score += value;

    const score = state.score;
    els.score.textContent = score;
    local.save('latest-score', score);
    const currentHighscore = local.get('highscore') || 0;
    if(score > currentHighscore) {
        local.save('highscore', score);
        els.highscore.textContent = score;
    }
    els.latestScore.textContent = score;
}

function clearScores() {
    local.delete('highscore');
    local.delete('latest-score');
    els.highscore.textContent = 0;
    els.latestScore.textContent = 0;
    musicService.play({ channelType: 'laser' });
}

function fire() {
    const position = { x: player.position.x + (player.width / 2), y: player.position.y };
    const velocity = { x: 0, y: -10 };
    projectiles.push(new Projectile({ position, velocity }));
    musicService.play({ channelType: 'laser' });
}

function enemyFire(enemy) {
    if(!enemy) return;
    const position = { x: enemy.position.x + (enemy.width / 2), y: enemy.position.y + enemy.height };
    const velocity = { x: 0, y: 10 };
    enemyProjectiles.push(new Projectile({ position, velocity, color: 'lightgreen' }));
    musicService.play({ channelType: 'laser' });
}

function animate(time) {
    // const deltaTime = (time - lastTime) / 1000;

    requestAnimationFrame(animate);

    const gradient = ctx.createLinearGradient(0, 0, els.canvas.width, els.canvas.height);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(0.5, '#12124d');
    gradient.addColorStop(1, '#251238');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
    // ctx.fillStyle = 'purple';
    // ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);

    particles.forEach((particle) => {
        if(particle.position.y < 0 || particle.position.y > els.canvas.height) particle.position.y = 0;

        particle.update(ctx);
    });

    if(state.currentState !== 'playing') return;

    player.update(ctx);

    if(player.top <= 0) {
        startLevel(state.currentLevel + 1);
    }

    if(time - times.enemiesFire >= getRandomFromRange(enemies[0]?.attackDelay * 0.75, enemies[0]?.attackDelay * 1.25)) {
        const randomIndex = Math.floor(Math.random() * enemies.length);
        enemyFire(enemies[randomIndex]);
        times.enemiesFire = time;
    }

    enemies.forEach(enemy => {
        enemy.update(ctx);
        let alreadyMoved = false;

        if(!alreadyMoved && (enemy.left <= 0 || enemy.right >= els.canvas.width)) {
            enemies.forEach(item => {
                item.velocity.x *= -1;
                item.position.y += 64;
            });
            alreadyMoved = true;
        }
    });

    projectiles.forEach((projectile, i) => {
        if(projectile.position.y < 0) return projectiles.splice(i, 1);
        projectile.update(ctx);
    });

    enemyProjectiles.forEach((projectile, i) => {
        if(projectile.position.y > els.canvas.height) return enemyProjectiles.splice(i, 1);
        projectile.update(ctx);
    });

    if(keys.fire.isPressed) {
        if(state.isFiring) return;
        fire();
        state.isFiring = true;
    }

    if (keys.left.isPressed && player.position.x >= 0) player.velocity.x = -SPEED;
    else if (keys.right.isPressed && player.right <= els.canvas.width) player.velocity.x = SPEED;
    else player.velocity.x = 0;

    enemies.forEach((enemy, i) => {
        projectiles.forEach((projectile, j) => {
            if(collides(enemy, projectile)) {
                enemies.splice(i, 1);
                musicService.play({ channelType: 'enemyDeath' });
                projectiles.splice(j, 1);
                updateScore(enemy.score);
                if(enemies.length === 0) {
                    player.velocity.y = -10;
                    musicService.play({ channelType: 'nextLevel', speed: 2 });
                }
            }
        });

        if(enemy.bottom >= player.top) gameOverHandler();
    });

    enemyProjectiles.forEach((projectile, i) => {
        if(collides(player, projectile)) {
            enemyProjectiles.splice(i, 1);
            state.lives -= 1;
            els.lives.textContent = state.lives;
            musicService.play({ channelType: 'playerHit' });
            if(state.lives <= 0) gameOverHandler();
        }
    });
}

function gameOverHandler() {
    state.currentState = 'gameover';
    guiService.selectGUIs('gameOver', { preventSave: true });
    musicService.play({ channelType: 'gameOver' });
}

function setCanvasSize() {
    els.canvas.width = window.innerWidth;
    els.canvas.height = window.innerHeight;
}

function startLevel(level = 1) {
    state.currentLevel = level;
    els.level.textContent = level;

    enemies.length = 0;
    projectiles.length = 0;
    enemyProjectiles.length = 0;

    player.reset();

    const cols = LEVELS[level]?.enemies?.columns;
    const rows = LEVELS[level]?.enemies?.rows;
    const speed = LEVELS[level]?.enemies?.speed;
    const attackDelay = LEVELS[level]?.enemies?.attackDelay;

    const enemySize = 64 + SPACING;

    for (let x = 1; x <= cols; x++) {
        for (let y = 1; y <= rows; y++) {
            enemies.push(new Enemy({
                position: { x: x * enemySize, y: y * enemySize },
                velocity: { x: speed, y: 0 },
                attackDelay,
            }));
        }
    }
}

function startGame() {
    state.score = 0;
    state.lives = 3;
    state.currentLevel = 1;
    els.score.textContent = state.score;
    els.lives.textContent = state.lives;
    startLevel(state.currentLevel);
}

function loadScores() {
    const highscore = local.get('highscore') || 0;
    const latestScore = local.get('latest-score') || 0;
    els.highscore.textContent = highscore;
    els.latestScore.textContent = latestScore;
}

function setupSound() {
    const musicVolume = local.get('invaders-music-volume') || 0.5;
    const sfxVolume = local.get('invaders-sfx-volume') || 0.5;
    musicService.setMusicVolume(musicVolume);
    musicService.setSFXVolume(sfxVolume);
    els.musicSlider.value = musicVolume;
    els.sfxSlider.value = sfxVolume;
}

function init() {
    if(!els.canvas) return console.error('Canvas element not found');
    ctx = els.canvas.getContext('2d');

    if(!musicService.isPlaying({ channelType: 'music' })) {
        musicService.play({ channelType: 'music', loop: true });
    }

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
        particles.push(new Particle());
    }

    guiService.selectGUIs('start');

    setCanvasSize();
    animate();
    loadScores();
    setupSound();

    addEventListener('resize', setCanvasSize);
    addEventListener('keydown', keyDownHandler);
    addEventListener('keyup', keyUpHandler);
    addEventListener('click', clickHandler);

    els.musicSlider.addEventListener('input', e => {
        musicService.setMusicVolume(e.target.value);
        local.save('invaders-music-volume', e.target.value);
    });

    els.sfxSlider.addEventListener('input', e => {
        musicService.setSFXVolume(e.target.value);
        musicService.play({ channelType: 'laser' });
        local.save('invaders-sfx-volume', e.target.value);
    });
}

addEventListener('DOMContentLoaded', init);
