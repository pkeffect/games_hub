class MusicService {
    static instance = null;

    #tracks = {
        music: './assets/sounds/spaceship-travelling.mp3',
        laser: './assets/sounds/laser-shoot.wav',
        enemyDeath: './assets/sounds/enemy-death.wav',
        nextLevel: './assets/sounds/next-level.mp3',
        gui: './assets/sounds/gui.wav',
        start: './assets/sounds/start.wav',
        playerHit: './assets/sounds/player-hit.wav',
        gameOver: './assets/sounds/game-over.wav',
    };

    #channels = {};

    #musicVolume = 0.5;
    #sfxVolume = 0.5;

    constructor() {
        if (MusicService.instance) {
            return MusicService.instance;
        }

        this.#initializeChannels();
        MusicService.instance = this;
    }

    static getInstance() {
        if (!MusicService.instance) {
            MusicService.instance = new MusicService();
        }
        return MusicService.instance;
    }

    #initializeChannels() {
        try {
            for (const [key, path] of Object.entries(this.#tracks)) {
                const audio = new Audio();
                audio.src = path;
                audio.preload = 'auto';
                audio.addEventListener('error', (e) => {
                    console.error(`Error loading audio ${key}:`, e);
                });
                this.#channels[key] = audio;
            }
        } catch (error) {
            console.error('Failed to initialize audio channels:', error);
            throw new Error('Audio initialization failed');
        }
    }

    play({ channelType, loop = false, speed = 1 }) {
        this.#validateChannelType(channelType);

        const channel = this.#channels[channelType];
        try {
            channel.currentTime = 0;
            channel.loop = loop;
            channel.volume = this.#getVolumeForChannel(channelType);
            channel.playbackRate = this.#clampPlaybackRate(speed);

            const playPromise = channel.play();
            if (playPromise) {
                playPromise.catch(error => {
                    console.error(`Error playing ${channelType}:`, error);
                });
            }
        } catch (error) {
            console.error(`Failed to play ${channelType}:`, error);
            throw new Error(`Playback failed for ${channelType}`);
        }
    }

    pause({ channelType }) {
        this.#validateChannelType(channelType);
        this.#channels[channelType].pause();
    }

    stop({ channelType }) {
        this.#validateChannelType(channelType);
        const channel = this.#channels[channelType];
        channel.pause();
        channel.currentTime = 0;
    }

    isPlaying({ channelType }) {
        this.#validateChannelType(channelType);
        return !this.#channels[channelType].paused;
    }

    setMusicVolume(volume) {
        this.#musicVolume = this.#clampVolume(volume);
        this.#channels.music.volume = this.#musicVolume;
    }

    setSFXVolume(volume) {
        this.#sfxVolume = this.#clampVolume(volume);
        Object.entries(this.#channels).forEach(([key, channel]) => {
            if (key !== 'music') {
                channel.volume = this.#sfxVolume;
            }
        });
    }

    #validateChannelType(channelType) {
        if (!this.#channels[channelType]) {
            throw new Error(`Invalid channel type: ${channelType}`);
        }
    }

    #getVolumeForChannel(channelType) {
        return channelType === 'music' ? this.#musicVolume : this.#sfxVolume;
    }

    #clampVolume(volume) {
        return Math.max(0, Math.min(1, volume));
    }

    #clampPlaybackRate(rate) {
        return Math.max(0.25, Math.min(4, rate));
    }
}

export default MusicService;
