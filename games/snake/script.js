import Snake from './nodes/Snake.js';
import Fruit from './nodes/Fruit.js';
import localSave from './../utilities/browser-storage.js';
import { SCALE, GAME_SIZE } from './config/global.js';
import { scoreType, stateType } from './config/enums.js';

const root = document.documentElement;
// const color = getComputedStyle(root).getPropertyValue('--color-primary');
const colorDark = getComputedStyle(root).getPropertyValue('--color-dark');

const canvas = document.querySelector('[data-canvas]');
const scoreEl = document.querySelector('[data-score]');
const highscoreEl = document.querySelector('[data-highscore]');

const ctx = canvas.getContext('2d');

const snake = new Snake({ scale: SCALE, ctx, canvas });
const fruit = new Fruit({ scale: SCALE, ctx, canvas });

let score = 0;
let gameLoop;
let state = stateType.START;

function handleScore(type) {
    if(!type) return console.error('Score type is required');
    if (scoreType[type] === undefined) return console.error('Invalid score type');
    if (type === 'ZERO') score = 0;
    else score += scoreType[type];
    scoreEl.innerText = score;
}

function handleHighscore() {
    const highscore = localSave.get('snake-highscore') || 0;
    if (score < highscore) return;
    localSave.save('snake-highscore', score);
    setHighscore();
}

function setHighscore() {
    const highscore = localSave.get('snake-highscore') || 0;
    highscoreEl.innerText = highscore;
}

function renderStartScreen() {
    ctx.font = '24px "Press Start 2P"';
    ctx.fillStyle = colorDark;
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2);
}

function renderGameOverGUI() {
    ctx.font = '24px "Press Start 2P"';
    ctx.fillStyle = colorDark;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2 + 60);
}

function handleGameOver() {
    state = stateType.GAMEOVER;
    handleHighscore();
    renderGameOverGUI();
}

function startGame() {
    state = stateType.PLAYING;

    handleScore('ZERO');

    snake.draw();
    snake.initiate();
    fruit.pickLocation();

    gameLoop = window.setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        fruit.draw();
        snake.update();
        snake.draw();

        if (snake.position.x === fruit.position.x && snake.position.y === fruit.position.y) {
            fruit.pickLocation();
            snake.grow();
            handleScore('UP');
        }

        if (snake.collide()) {
            clearInterval(gameLoop);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            handleGameOver();
        }
    }, 100);
}

function handleKeyDown(evt) {
    if (state === stateType.PLAYING) {
        const direction = evt.key.replace('Arrow', '');
        evt.stopPropagation();
        evt.preventDefault();
        snake.changeDirection(direction);
    } else {
        clearInterval(gameLoop);
        startGame();
    }
}

function init() {
    canvas.width = GAME_SIZE;
    canvas.height = GAME_SIZE;
    setHighscore();
    renderStartScreen();
}

addEventListener('keydown', handleKeyDown);
addEventListener('DOMContentLoaded', init);
