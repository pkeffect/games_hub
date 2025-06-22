import MusicService from './MusicService.js';

export default class GUIService {
    static instance;

    GUIS = {
        game: document.querySelector('[data-game-GUI]'),
        start: document.querySelector('[data-start-GUI]'),
        pause: document.querySelector('[data-pause-GUI]'),
        options: document.querySelector('[data-options-GUI]'),
        gameOver: document.querySelector('[data-game-over-GUI]'),
        credits: document.querySelector('[data-credits-GUI]'),
        highscore: document.querySelector('[data-highscore-GUI]'),
    };

    previousGuis = null;
    currentGuis = null;

    musicService = new MusicService();

    constructor() {
        if(GUIService.instance) return GUIService.instance;
        GUIService.instance = this;
    }

    hideAllGUIs() {
        Object.values(this.GUIS).forEach(GUI => GUI?.classList.add('hidden'));
    }

    // supports multiple GUIs as an array or a single GUI as a string
    selectGUIs(guis, options = {}) {
        if(this.currentGuis === guis) return;

        const { preventSave } = options;

        this.previousGuis = JSON.parse(JSON.stringify(this.currentGuis));

        this.currentGuis = preventSave ? null : JSON.parse(JSON.stringify(guis));

        this.hideAllGUIs();

        if(typeof guis === 'string') this.GUIS[guis]?.classList.remove('hidden');
        else guis.forEach(gui => this.GUIS[gui]?.classList.remove('hidden'));

        this.musicService.play({ channelType: 'gui' });
    }

    goBack() {
        if(!this.previousGuis) return;
        this.selectGUIs(this.previousGuis);
    }
}
