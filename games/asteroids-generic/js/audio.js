// js/audio.js
import { CONFIG } from './config.js';

export class AudioManager {
    constructor() {
        this.context = null;
        this.sounds = {};
        this.loopingSounds = {};
        this.isInitialized = false;
        this.sfxVolume = 0.5;
        this.musicVolume = 0.3;
        
        // Heartbeat system for tension
        this.heartbeat = {
            playing: false,
            currentBeat: 1,
            timer: 0,
            baseInterval: 120, // frames between beats
            currentInterval: 120
        };
        
        // Sound definitions
        this.soundFiles = {
            fire: 'audio/fire.wav',
            thrust: 'audio/thrust.wav',
            asteroidLarge: 'audio/asteroid-large.wav',
            asteroidMedium: 'audio/asteroid-medium.wav',
            asteroidSmall: 'audio/asteroid-small.wav',
            ufoLarge: 'audio/ufo-large.wav',
            ufoSmall: 'audio/ufo-small.wav',
            beat1: 'audio/beat1.wav',
            beat2: 'audio/beat2.wav',
            extraPlayer: 'audio/extra-player.wav'
        };
        
        // Initialize asynchronously (don't block constructor)
        this.init().catch(error => {
            console.warn('Audio initialization failed:', error);
            // Continue without audio
        });
    }

    async init() {
        try {
            // Create audio context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load all sound files
            await this.loadAllSounds();
            
            this.isInitialized = true;
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    async ensureAudioContext() {
        if (!this.context) {
            await this.init();
        }
        
        // Resume context if suspended (required by some browsers)
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    async loadAllSounds() {
        const loadPromises = Object.entries(this.soundFiles).map(async ([name, url]) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                
                const arrayBuffer = await response.arrayBuffer();
                this.sounds[name] = await this.context.decodeAudioData(arrayBuffer);
                console.log(`Loaded sound: ${name}`);
            } catch (error) {
                console.warn(`Failed to load sound ${name}:`, error);
            }
        });
        
        await Promise.all(loadPromises);
    }

    async playSound(soundName, volume = 1, loop = false, fadeIn = false) {
        if (!this.isInitialized || !this.sounds[soundName]) {
            return null;
        }

        await this.ensureAudioContext();

        try {
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            
            source.buffer = this.sounds[soundName];
            source.loop = loop;
            
            // Calculate final volume
            const finalVolume = volume * this.sfxVolume;
            
            if (fadeIn) {
                gainNode.gain.setValueAtTime(0, this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(finalVolume, this.context.currentTime + 0.1);
            } else {
                gainNode.gain.value = finalVolume;
            }
            
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            source.start();
            
            // Store looping sounds for later control
            if (loop) {
                this.loopingSounds[soundName] = { source, gainNode };
            }
            
            return { source, gainNode };
        } catch (error) {
            console.warn(`Error playing sound ${soundName}:`, error);
            return null;
        }
    }

    stopSound(soundName) {
        if (this.loopingSounds[soundName]) {
            try {
                this.loopingSounds[soundName].source.stop();
                delete this.loopingSounds[soundName];
            } catch (error) {
                // Sound might already be stopped
            }
        }
    }

    stopAllLoopingSounds() {
        Object.keys(this.loopingSounds).forEach(soundName => {
            this.stopSound(soundName);
        });
    }

    // Safe method calls that won't throw errors
    safePlaySound(soundName, ...args) {
        try {
            return this.playSound(soundName, ...args);
        } catch (error) {
            return null;
        }
    }

    safeStopSound(soundName) {
        try {
            this.stopSound(soundName);
        } catch (error) {
            // Ignore errors
        }
    }

    safeStopAllLoopingSounds() {
        try {
            this.stopAllLoopingSounds();
        } catch (error) {
            // Ignore errors
        }
    }

    // Specific game sound methods
    playFire() {
        this.safePlaySound('fire', 0.3);
    }

    startThrust() {
        if (!this.loopingSounds['thrust']) {
            this.safePlaySound('thrust', 0.4, true, true);
        }
    }

    stopThrust() {
        this.safeStopSound('thrust');
    }

    playAsteroidDestroy(size) {
        const soundMap = {
            'large': 'asteroidLarge',
            'medium': 'asteroidMedium',
            'small': 'asteroidSmall'
        };
        
        const soundName = soundMap[size];
        if (soundName) {
            this.safePlaySound(soundName, 0.6);
        }
    }

    startUFO(isSmall) {
        const soundName = isSmall ? 'ufoSmall' : 'ufoLarge';
        if (!this.loopingSounds[soundName]) {
            this.safePlaySound(soundName, 0.5, true);
        }
    }

    stopUFO() {
        this.safeStopSound('ufoLarge');
        this.safeStopSound('ufoSmall');
    }

    playExtraLife() {
        this.safePlaySound('extraPlayer', 0.8);
    }

    // Heartbeat system for tension
    updateHeartbeat(asteroidCount, level) {
        if (!this.isInitialized) return;

        // Calculate heartbeat speed based on danger level
        const dangerLevel = Math.max(1, asteroidCount + (level - 1) * 0.5);
        this.heartbeat.currentInterval = Math.max(30, this.heartbeat.baseInterval / dangerLevel);

        // Start heartbeat if not already playing
        if (!this.heartbeat.playing && asteroidCount > 0) {
            this.heartbeat.playing = true;
            this.heartbeat.timer = 0;
        }

        // Stop heartbeat if no asteroids
        if (asteroidCount === 0) {
            this.heartbeat.playing = false;
        }

        // Update heartbeat timer
        if (this.heartbeat.playing) {
            this.heartbeat.timer++;
            
            if (this.heartbeat.timer >= this.heartbeat.currentInterval) {
                // Play alternating beats
                const beatSound = this.heartbeat.currentBeat === 1 ? 'beat1' : 'beat2';
                this.safePlaySound(beatSound, 0.3);
                
                this.heartbeat.currentBeat = this.heartbeat.currentBeat === 1 ? 2 : 1;
                this.heartbeat.timer = 0;
            }
        }
    }

    // Volume controls
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        
        // Update currently playing looping sounds
        Object.values(this.loopingSounds).forEach(({ gainNode }) => {
            if (gainNode) {
                gainNode.gain.value = this.sfxVolume * 0.4; // Adjust for thrust/UFO sounds
            }
        });
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        // Music volume would affect background music when implemented
    }

    // User interaction required for some browsers
    async resumeAudioContext() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    // Clean up
    destroy() {
        this.stopAllLoopingSounds();
        if (this.context) {
            this.context.close();
        }
    }
}