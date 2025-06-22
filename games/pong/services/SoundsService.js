const DEFAULT_SFX_VOLUME = 0.6;
const DEFAULT_MUSIC_VOLUME = 0.4;

const SOUNDS_COLLECTION = {
    intro: './assets/sounds/8bit-dark-underground-funk.mp3',
    ballHitsPaddle: './assets/sounds/ball-hits-paddle.mp3',
    ballHitsWall: './assets/sounds/ball-hits-wall.mp3',
    gameOver: './assets/sounds/game-over.ogg'
};

export default class SoundsService {
    selectedMusic = null;
    musicVolume = DEFAULT_MUSIC_VOLUME;
    SFXVolume = DEFAULT_SFX_VOLUME;
    collection = SOUNDS_COLLECTION;

    constructor() {}

    playMusic(id, options = { speed: 1, volume: null, loop: true }) {
        const { speed, volume, loop } = options;
        if(!this.collection) return;
        if(!id && this.selectedMusic) return this.selectedMusic.play();
        if(!id) return;
        const url = this.collection[id];
        if(!url) return;
        if(this.selectedMusic) this.stop();
        this.selectedMusic = new Audio(url);
        if(!this.selectedMusic) return;
        this.selectedMusic.volume = volume || this.musicVolume;
        this.selectedMusic.playbackRate = speed || 1;
        this.selectedMusic.loop = loop;
        this.selectedMusic.play();
    }
    
    playSFX(id) {
        if(!id || !this.collection) return;
        const url = this.collection[id];
        if(!url) return;
        const sound = new Audio(url);
        if(!sound) return;
        sound.volume = this.SFXVolume;
        sound.play();
    }

    pause() {
        if(!this.selectedMusic) return this.devErrorHandler('NO_ACTIVE_MUSIC');
        this.selectedMusic.pause();
    }

    stop() {
        if(!this.selectedMusic) return this.devErrorHandler('NO_ACTIVE_MUSIC');
        this.selectedMusic.pause();
        this.selectedMusic.currentTime = 0;
    }

    restart() {
        this.stop();
        this.playMusic();
    }

    setSpeed(speed) {
        if(!this.selectedMusic) return this.devErrorHandler('NO_ACTIVE_MUSIC');
        if(speed <= 0) return;
        this.selectedMusic.playbackRate = speed;
    }

    setVolume(volume) {
        if(!this.selectedMusic) return this.devErrorHandler('NO_ACTIVE_MUSIC');
        if(volume < 0 || volume > 1) return this.devErrorHandler('INVALID_VOLUME_VALUE');
        this.selectedMusic.volume = volume;
    }
    
    getVolume() {
        if(!this.selectedMusic) return this.devErrorHandler('NO_ACTIVE_MUSIC');
        return this.selectedMusic.volume;
    }

    devErrorHandler(message, type = 'warn') {
        const messages = {
            NO_ACTIVE_MUSIC: 'No active music',
            INVALID_VOLUME_VALUE: 'Invalid volume value',
        };

        console[type](messages[message]);
    }
}
