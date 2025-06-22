import { SPACING, SPEED } from '../config/global.js';

const spriteMap = {
    DOWN: {
        x: 0,
        y: 0
    },
    LEFT: {
        x: 0,
        y: 199
    },
    RIGHT: {
        x: 0,
        y: 99
    },
};

const directionType = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
};


export default class Player {
    constructor({ ctx }) {
        this.ctx = ctx;
        this.velocity = { x: 0, y: -SPEED };
        this.direction = directionType.RIGHT;

        const image = new Image();
        image.src = './assets/images/player.png';

        image.onload = () => {
            this.image = image;
            this.width = image.width / 4 - 1;
            this.height = image.height / 4 - 2;
            this.position = {
                x: 0,
                y: this.ctx.canvas.height - this.height - SPACING
            };
        };
    }

    draw() {
        if(!this.image) return;

        const { x, y } = spriteMap[this.direction];
        this.ctx.drawImage(this.image, x, y, this.width, this.height, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        if(!this.position?.x || !this.position?.y) return;
        this.draw(this.ctx);
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        if(this.velocity.y > 0) this.direction = directionType.DOWN;
        else {
            if(this.velocity.x >= 0) this.direction = directionType.RIGHT;
            else if(this.velocity.x < 0) this.direction = directionType.LEFT;
        }
    }

    resetPosition() {
        this.position = { x: (this.ctx.canvas.width / 2) - (this.width / 2), y: this.ctx.canvas.height - this.height - SPACING };
    }

    resetVelocity() {
        this.velocity = { x: 0, y: 0 };
    }

    reset() {
        this.resetPosition();
        this.resetVelocity();
    }

    jump() {
        this.velocity.y = -SPEED;
    }

    get left () {
        return this.position?.x;
    }

    get right () {
        return this.position?.x + this.width;
    }

    get top () {
        return this.position?.y;
    }

    get bottom () {
        return this.position?.y + this.height;
    }
}
