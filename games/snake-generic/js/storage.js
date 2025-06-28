// js/storage.js

import { HIGHSCORE_KEY } from './config.js';

export function getHighScore() {
    // Get score from local storage, or return 0 if it doesn't exist
    return parseInt(localStorage.getItem(HIGHSCORE_KEY) || '0', 10);
}

export function saveHighScore(score) {
    localStorage.setItem(HIGHSCORE_KEY, score);
}