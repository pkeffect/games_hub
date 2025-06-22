import SoundsService from './../services/SoundsService.js';

const INITIAL_VELOCITY = 0.025;
const VELOCITY_INCREASE = 0.000001;

export default class Ball {
    soundsService = null;

    constructor(element) {
        this.element = element;
        this.soundsService = new SoundsService();
        this.init();
    }

    get x() {
        return parseFloat(getComputedStyle(this.element).getPropertyValue('--x'));
    }

    set x(value) {
        this.element.style.setProperty('--x', value);
    }

    get y() {
        return parseFloat(getComputedStyle(this.element).getPropertyValue('--y'));
    }

    set y(value) {
        this.element.style.setProperty('--y', value);
    }

    get rect() {
        return this.element.getBoundingClientRect();
    }

    init() {
        this.x = 50;
        this.y = 50;

        this.direction = { x: 0 };

        this.setCorrectDirection();

        this.velocity = INITIAL_VELOCITY;
    }

    setCorrectDirection() {
        while (
            Math.abs(this.direction.x) <= 0.2 ||
            Math.abs(this.direction.x) >= 0.8
        ) {
            const heading = randomNumberBetween(0, 2 * Math.PI);

            this.direction = {
                x: Math.cos(heading),
                y: Math.sin(heading)
            };
        }
    }

    update(delta, objects) {
        this.x += this.direction.x * this.velocity * delta;
        this.y += this.direction.y * this.velocity * delta;
        this.velocity += VELOCITY_INCREASE * delta;

        this.handleWallCollision();
        this.handleObjectsCollision(objects);
    }

    xCollision() {
        const rect = this.rect;

        return rect.right >= window.innerWidth ? 'right' : rect.left <= 0 ? 'left' : false;
    }

    yCollision() {
        const rect = this.rect;

        return rect.bottom >= window.innerHeight || rect.top <= 0;
    }

    handleWallCollision() {
        if (this.yCollision()) {
            this.bounceY();
            this.soundsService.playSFX('ballHitsWall');
        }
    }

    handleObjectsCollision(objects) {
        objects.some(object => {
            if(isCollision(object, this.rect)) {
                console.log(this.direction.y);
                this.bounceX(object, this.rect);
                this.diverseY(object, this.rect);
                this.playPaddleCollisionSound();
            }
        });
    }

    bounceX() {
        this.direction.x *= -1;
    }

    diverseY(object, rect) {
        const hitPosition = Math.abs((rect.y + (rect.height / 2))) - Math.abs((object.y + (object.height / 2)));
        const boundary = object.height / 2;

        const newDirection = Math.abs(hitPosition / boundary);

        this.direction.y = Math.sign(this.direction.y) * newDirection;
    }

    bounceY() {
        this.direction.y *= -1;
    }

    playPaddleCollisionSound() {
        this.soundsService.playSFX('ballHitsPaddle');
    }

    getSoundsCollection(collectionURL) {
        return fetch(collectionURL);  
    }

    createSoundsService(collection) {
        this.soundsService = new SoundsService(collection);
    }
}

function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function isCollision(rectA, rectB) {
    return (
        rectA.left <= rectB.right &&
        rectA.right >= rectB.left &&
        rectA.top <= rectB.bottom &&
        rectA.bottom >= rectB.top
    );
}
