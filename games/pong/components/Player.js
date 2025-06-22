import Paddle from './Paddle.js';

export default class Player {
    score = 0;
  
    constructor(playerType, playerScoreElement, paddleElement) {
        this.playerType = playerType;
        this.scoreElement = playerScoreElement;
        this.paddle = new Paddle(paddleElement);
    }

    increaseScore() {
        this.score = this.score + 1;
        this.scoreElement.textContent = this.score;
    }

    reset() {
        this.score = 0;
        this.scoreElement.textContent = 0;
    }

    resetPaddle() {
        this.paddle.reset();
    }
}
