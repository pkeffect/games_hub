import Game from './game/game.js';

const game = new Game();
const gameContainerElem = document.querySelector('[data-game-container]');
const gameLoaderElem = document.querySelector('[data-game-loader]');

const displayGameHandler = () => {
    gameContainerElem.style.opacity = 1;
    gameLoaderElem.style.opacity = 0;
    game.initGame();
};

window.addEventListener('load', displayGameHandler, { once: true });
