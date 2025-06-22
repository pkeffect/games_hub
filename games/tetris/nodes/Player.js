import MusicService from './../services/music.service.js';

export default class Player {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.tile = null;
        this.musicService = new MusicService();
    }

    moveLeft() {
        this.position.x -= 1;
    }

    moveRight() {
        this.position.x += 1;
    }

    moveDown() {
        this.position.y += 1;
    }

    moveUp() {
        this.position.y -= 1;
    }

    rotate() {
        this.musicService.playSFX({ track: 'rotate' });
        this.tile = this.tile[0].map((_, index) => this.tile.map(row => row[index]).reverse());
    }

    setTile({ tile = [] }) {
        this.tile = tile;
    }

    reset() {
        this.position = { x: 0, y: 0 };
        this.tile = null;
    }

    get left () {
        return this.position.x;
    }

    get right() {
        return this.position.x + this.tile[0].length;
    }

    get top() {
        return this.position.y;
    }

    get bottom() {
        return this.position.y + this.tile.length;
    }
}
