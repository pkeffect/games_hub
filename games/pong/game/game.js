import NotificationsService from './../services/NotificationsService.js';
import SoundsService from './../services/SoundsService.js';
import Ball from './../components/Ball.js';
import Player from './../components/Player.js';
import {
    showScreen,
    hideScreen,
    getFocusedIndexFromNodes,
    setElementText,
    setElementValue,
    setAndHideScreens
} from './../utils/dom-manipulation.js';

const SET_GAME_SCORE = 5;

const botPaddleElem = document.querySelector('[data-paddle=bot]');
const botScoreElem = document.querySelector('[data-score=bot]');
const gameResultTitleElem = document.querySelector('[data-set-results-text]');
const humanPaddleElem = document.querySelector('[data-paddle=human]');
const humanScoreElem = document.querySelector('[data-score=human]');
const notificationsElem = document.querySelector('[data-notifications-area]');
const setGameScoreElem = document.querySelector('[data-input-set-game-score]');

const optionsScreenElem = document.querySelector('[data-screen=options]');
const pauseScreenElem = document.querySelector('[data-screen=pause]');
const setScreenElem = document.querySelector('[data-screen=set]');
const startScreenElem = document.querySelector('[data-screen=start]');


export default class Game {
    lastTime = 0;
    gameStatus = 'STOPPED';
    currentScreen = '';
    setGameScore = localStorage.getItem('setGameScore') || SET_GAME_SCORE;

    constructor() {
        setAndHideScreens([optionsScreenElem, pauseScreenElem, setScreenElem, startScreenElem]);
        this.notificationsService = new NotificationsService(notificationsElem);
        this.soundsService = new SoundsService();
        this.ball = new Ball(document.querySelector('[data-ball]'));
        this.botPlayer = new Player('bot', botScoreElem, botPaddleElem);
        this.humanPlayer = new Player('human', humanScoreElem, humanPaddleElem);
    }

    initGame = () => {
        this.switchToScreen(startScreenElem);

        document.removeEventListener('click', this.clickHandler);
        document.addEventListener('click', this.clickHandler);

        document.removeEventListener('mousemove', this.movePlayerPaddle);
        document.addEventListener('mousemove', this.movePlayerPaddle);

        document.removeEventListener('keyup', this.keyUpHandler);
        document.addEventListener('keyup', this.keyUpHandler);

        window.requestAnimationFrame(this.update);
    };

    switchToScreen(screen = '') {
        document.body.setAttribute('screen', screen && screen?.getAttribute('data-screen') || 'game');
        hideScreen(this.currentScreen);
        this.currentScreen = screen;
        if (screen) showScreen(screen);
    }

    clickHandler = (e) => {
    // console.log(e.target); // DEV QUICK CHECK
        if (e.target.hasAttribute('data-button-exit')) this.exitGameHandler();
        if (e.target.hasAttribute('data-button-options')) this.goToOptionsHandler();
        if (e.target.hasAttribute('data-button-restart')) this.restartGameHandler();
        if (e.target.hasAttribute('data-button-resume')) this.resumeGameHandler();
        if (e.target.hasAttribute('data-button-save-options'))
            this.saveOptionsHandler();
        if (e.target.hasAttribute('data-button-start')) this.startGameHandler();
    };

    restartGameHandler = () => {
        this.switchToScreen();
        this.resetGame();
        this.gameStatus = 'STARTED';
        this.soundsService.playMusic('intro');
    };

    exitGameHandler = () => {
        this.gameStatus = 'STOPPED';
        this.resetGame();
        this.switchToScreen(startScreenElem);
        this.soundsService.stop();
    };

    saveOptionsHandler = () => {
        this.saveSetGameScore(setGameScoreElem.value);
    };

    saveSetGameScore = (value) => {
        if (!value || value <= 0) return;
        localStorage.setItem('setGameScore', value);
        this.setGameScore = Number(value);
        this.notificationsService.show('Settings updated successfully', 'success');
    };

    keyUpHandler = (e) => {
        if (e.code === 'ArrowDown') this.arrowDownHandler();
        if (e.code === 'ArrowUp') this.arrowUpHandler();
        if (e.code === 'Escape') this.togglePause();
    };

    arrowDownHandler = () => {
        if (!this.currentScreen) return;

        const buttons = this.currentScreen.querySelectorAll('[data-button]');

        if (!buttons.length) return;

        let focusedIndex = getFocusedIndexFromNodes(buttons);

        if (focusedIndex === undefined || focusedIndex >= buttons.length - 1) {
            focusedIndex = 0;
        } else focusedIndex += 1;

        buttons[focusedIndex].focus();
    };

    arrowUpHandler = () => {
        if (!this.currentScreen) return;

        const buttons = this.currentScreen.querySelectorAll('[data-button]');

        if (!buttons.length) return;

        let focusedIndex = getFocusedIndexFromNodes(buttons);

        if (!focusedIndex) focusedIndex = buttons.length - 1;
        else focusedIndex -= 1;

        buttons[focusedIndex].focus();
    };

    movePlayerPaddle = (e) => {
        if (this.gameStatus !== 'STARTED') return;
        this.humanPlayer.paddle.position = (e.y / window.innerHeight) * 100;
    };

    startGameHandler = () => {
        this.gameStatus = 'STARTED';
        this.switchToScreen();
        this.soundsService.playMusic('intro');
    };

    pauseGame = () => {
        this.gameStatus = 'PAUSED';
        this.switchToScreen(pauseScreenElem);
        this.soundsService.setVolume(this.soundsService.getVolume() * 0.5);
    };

    resumeGameHandler = () => {
        this.gameStatus = 'STARTED';
        this.switchToScreen();
        this.soundsService.playMusic();
        this.soundsService.setVolume(this.soundsService.getVolume() * 2);
    };

    goToOptionsHandler = () => {
        this.switchToScreen(optionsScreenElem);
        setElementValue(setGameScoreElem, this.setGameScore);
    };

    togglePause = () => {
        if (this.gameStatus === 'PAUSED') this.resumeGameHandler();
        else if (this.gameStatus === 'STARTED') this.pauseGame();
    };

    resetGame = () => {
        this.humanPlayer.reset();
        this.botPlayer.reset();
        this.ball.init();
        this.botPlayer.resetPaddle();
        this.humanPlayer.resetPaddle();
    };

    handleLose = (ballCollisionDirection) => {
        if (!ballCollisionDirection) return;
        this.setScore(ballCollisionDirection);
        this.humanPlayer.resetPaddle();
        this.botPlayer.resetPaddle();
        this.ball.init();
        if (
            this.humanPlayer.score >= Number(this.setGameScore) ||
      this.botPlayer.score >= Number(this.setGameScore)
        )
            this.handleFinish();
    };

    youWon = () => {
        return this.humanPlayer.score > this.botPlayer.score;
    };

    handleFinish = () => {
        this.gameStatus = 'STOPPED';
        this.switchToScreen(setScreenElem);
        const score = this.youWon() ? 'YOU AWESOME :)' : 'GAME OVER :(';
        setElementText(gameResultTitleElem, score);
        this.soundsService.restart();

        if (this.youWon()) this.soundsService.setSpeed(1.25);
        else this.soundsService.setSpeed(0.75);
    };

    setScore = (ballCollisionDirection) => {
        if (!ballCollisionDirection) return;
        if (ballCollisionDirection === 'left') this.botPlayer.increaseScore();
        if (ballCollisionDirection === 'right') this.humanPlayer.increaseScore();
    };

    update = (time) => {
        if (this.lastTime !== null && this.gameStatus === 'STARTED') {
            const delta = time - this.lastTime;
            this.ball.update(delta, [
                this.humanPlayer.paddle.rect,
                this.botPlayer.paddle.rect,
            ]);

            if (this.ball.x > 90 && this.ball.direction.x > 0) {
                this.botPlayer.paddle.update(delta, this.ball.y);
            }

            const ballXCollision = this.ball.xCollision();
            if (ballXCollision) this.handleLose(ballXCollision);
        }

        this.lastTime = time;
        window.requestAnimationFrame(this.update);
    };
}
