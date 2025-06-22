// CONFIG
import { SCALE, TICK_MS, WIDTH_SIZE, HEIGHT_SIZE, PREFIX } from './config/globals.js';
import { TILE_COLORS, BG_LIGHT_COLOR } from './config/theme.js';
import tiles from './config/tiles.js';

// SERVICES
import MusicService from './services/music.service.js';
import ViewService from './services/view.service.js';
import ControllerService from './services/controller.service.js';

// NODES
import Player from './nodes/Player.js';

// UTILITIES
import { getRandomItemFromArray, generateMatrix } from './../utilities/arrays.js';
import localSave from './../utilities/browser-storage.js';

const canvas = document.querySelector('[data-canvas]');
const previewNextCanvas = document.querySelector('[data-preview-next-canvas]');

const ctx = canvas.getContext('2d');
const previewCtx = previewNextCanvas.getContext('2d');

const musicService = new MusicService();
const viewService = new ViewService();
const controller = new ControllerService();

const player = new Player();

const state = {
    score: 0,
    level: 0,
    lines: 0,
    isDropping: false,
    difficulty: 1,
    currentState: 'menu', // menu, playing, paused, gameover
    nextTile: null,
};

let arena = null;
let lastTime = 0;
let gravityCounter = 0;

const actions = {
    play() {
        clearGame();
        player.tile = getNewTile();
        state.nextTile = getNewTile();
        arena = generateMatrix(canvas.width / SCALE, canvas.height / SCALE);
        state.currentState = 'playing';
        musicService.playMusic({ track: 'game' });
    },
    pause() {
        if(state.currentState === 'paused') {
            state.currentState = 'playing';
            viewService.showView('play');
        }else if(state.currentState === 'playing') {
            state.currentState = 'paused';
            viewService.showView('pause');
        }
    },
    resume() {
        state.currentState = 'playing';
    },
    restart() {
        viewService.showView('play');
        this.play();
    },
    menu () {
        clearGame();
        state.currentState = 'menu';
        viewService.showView('menu');
    },
    gameOver () {
        viewService.showView('gameover');
        state.currentState = 'gameover';
        state.nextTile = null;
        musicService.playMusic({ track: 'game', speed: 0.75 });
    },
    resetScore() {
        localSave.delete(`${PREFIX}highscore`);
        localSave.delete(`${PREFIX}latestScore`);
        state.score = 0;
        updateScore();
    }
};

function getNewTile() {
    return getRandomItemFromArray(tiles);
}

function resetPlayerPosition() {
    player.position = { x: (canvas.width / SCALE / 2) - (Math.floor(player.tile.length / 2)) , y: 0 };
}

function drawPreviewNextTile() {
    previewNextCanvas.width = state.nextTile[0].length * SCALE;
    previewNextCanvas.height = state.nextTile.length * SCALE;

    previewCtx.scale(SCALE, SCALE);
    previewCtx.clearRect(0, 0, previewNextCanvas.width, previewNextCanvas.height);

    state.nextTile?.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                previewCtx.fillStyle = TILE_COLORS[value - 1] || 'white';
                previewCtx.strokeStyle = BG_LIGHT_COLOR;
                previewCtx.lineWidth = 0.05;
                previewCtx.fillRect(x, y, 1, 1);
                previewCtx.strokeRect(x, y, 1, 1);
            }
        });
    });
}

function drawGrid({ grid, offset = { x: 0, y: 0 } }) {
    grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                ctx.fillStyle = TILE_COLORS[value - 1] || 'white';
                ctx.strokeStyle = BG_LIGHT_COLOR;
                ctx.lineWidth = 0.05;
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }

            ctx.strokeStyle = TILE_COLORS[value - 1];
            ctx.lineWidth = 0.001;
            ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
        });
    });
}

function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid({ grid: arena, offset: { x: 0, y: 0 } });
    drawGrid({ grid: player.tile, offset: player.position });

    previewCtx.clearRect(0, 0, previewNextCanvas.width, previewNextCanvas.height);
    drawPreviewNextTile();
}

function mergeMatrixToMatrix(matrixFrom, matrixTo) {
    matrixFrom.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) matrixTo[y + player.position.y][x + player.position.x] = value;
        });
    });
}

function checkForFullRows() {
    let rowCount = 1;
    for(let y = arena.length - 1; y > 0; y--) {
        if(arena[y].every(value => value !== 0)) {
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            y++;
            state.score += Math.pow(rowCount * 10, 2);
            state.lines += rowCount;
            rowCount *= 2;
            state.difficulty = Math.floor(state.lines / 10);
            musicService.playSFX({ track: 'collapse' });

            updateScore();
        }
    }
}

function detectCollisions() {
    player.tile.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value) {
                // checks if the player tile hits the walls
                if(player.position.x + x < 0 || player.position.x + x >= arena[0].length) {
                    player.position.x -= player.position.x + x < 0 ? -1 : 1;
                }

                // checks if the player tile hits the ceiling
                if(player.position.y + y < 0) {
                    player.position.y += 1;
                    actions.gameOver();
                }

                // checks if the player tile hits the floor
                if(
                    (player.position.y + y >= arena.length) ||
                        (arena[y + player.position.y] && arena[y + player.position.y][x + player.position.x])
                ) {
                    player.position.y -= 1;
                    mergeMatrixToMatrix(player.tile, arena);
                    player.tile = JSON.parse(JSON.stringify(state.nextTile));
                    state.nextTile = getNewTile();
                    resetPlayerPosition();
                    checkForFullRows();
                    state.isDropping = false;
                    musicService.playSFX({ track: 'ground' });
                }
            }

        });
    });
}

function animate(time = 0) {
    requestAnimationFrame(animate);

    if(state.currentState !== 'playing') return;

    const deltaTime = time - lastTime;
    lastTime = time;
    gravityCounter += deltaTime;

    const DIFFICULTY = 1 + state.lines / 50;

    musicService.setMusicSpeed(1 + state.difficulty / 50);

    if(gravityCounter > (TICK_MS / DIFFICULTY) || state.isDropping) {
        player.moveDown();
        gravityCounter = 0;
    }

    detectCollisions();
    draw();
}

function clickHandler({ target }) {
    const view = target.dataset.button ? target.dataset.button : '';
    if(view) viewService.showView(view);

    const action = target.dataset.action ? target.dataset.action : '';
    if(!action) return;
    if(!actions[action]) throw new Error(`Action does not exist: ${action}`);
    actions[action]();
}

function handleControls(e) {

    controller.handleKeyDownUp(e);

    if (controller.down.isActive) player.moveDown();
    else if (controller.left.isActive) player.moveLeft();
    else if (controller.right.isActive) player.moveRight();
    // else if (controller.debug.isActive) player.moveUp(); // debug
    else if (controller.rotate.isActive) player.rotate();
    else if (controller.space.isActive) state.isDropping = true;
    else if (controller.pause.isActive) actions.pause();
}

function clearGame() {
    player.reset();
    state.score = 0;
    state.level = 0;
    state.lines = 0;
    state.isDropping = false;
    state.difficulty = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    previewCtx.clearRect(0, 0, previewNextCanvas.width, previewNextCanvas.height);
    musicService.stopMusic();
    musicService.setMusicSpeed(1);
}

function setMusicVolume(e) {
    musicService.setMusicVolume(e.target.value);
    musicService.playSFX({ track: 'rotate', volume: e.target.value });
}

function setSFXVolume(e) {
    musicService.setSFXVolume(e.target.value);
    musicService.playSFX({ track: 'rotate', volume: e.target.value });
}

function updateScore() {
    const current = state.score;
    const latest = current || localSave.get(`${PREFIX}latestScore`) || 0;
    let highest = localSave.get(`${PREFIX}highscore`) || 0;

    if(current > highest) {
        localSave.save(`${PREFIX}highscore`, current);
        highest = current;
    }

    localSave.save(`${PREFIX}latestScore`, current);

    document.querySelectorAll('[data-text-current-score]').forEach(el => el.textContent = current);
    document.querySelectorAll('[data-text-highscore]').forEach(el => el.textContent = highest);
    document.querySelectorAll('[data-text-latest-score]').forEach(el => el.textContent = latest);
}

function init () {
    canvas.width = SCALE * WIDTH_SIZE;
    canvas.height = SCALE * HEIGHT_SIZE;

    previewNextCanvas.width = SCALE * 4;
    previewNextCanvas.height = SCALE * 4;

    ctx.scale(SCALE, SCALE);
    previewCtx.scale(SCALE, SCALE);

    viewService.showView('menu');

    updateScore();

    state.nextTile = getNewTile();
    player.tile = getNewTile();

    resetPlayerPosition();
    arena = generateMatrix(canvas.width / SCALE, canvas.height / SCALE);

    animate();

    window.addEventListener('keydown', handleControls);
    window.addEventListener('keyup', handleControls);
    window.addEventListener('click', clickHandler);
    document.querySelector('[data-input-music-volume]').addEventListener('input', setMusicVolume);
    document.querySelector('[data-input-sfx-volume]').addEventListener('input', setSFXVolume);
}

addEventListener('DOMContentLoaded', init);
