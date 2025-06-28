// js/scoreboard.js

// In-memory storage for high scores (session-based)
let highScoresData = [
    { name: "ACE", score: 15000, time: "05:32.45" },
    { name: "PLR", score: 12000, time: "04:18.22" },
    { name: "TOP", score: 8500, time: "03:45.67" }
];

// We export an object containing our public functions
export const Scoreboard = {
    /**
     * Gets the high scores from memory.
     * @returns {Array} An array of score objects, e.g., [{name: "ACE", score: 5000}]
     */
    getHighScores: function() {
        return [...highScoresData]; // Return a copy to prevent external modification
    },

    /**
     * Adds a new score to the high score list.
     * @param {string} name - The player's name.
     * @param {number} score - The player's score.
     * @param {string} time - The formatted time string.
     * @param {number} maxEntries - The maximum number of scores to keep.
     */
    addScore: function(name, score, time, maxEntries) {
        const newScore = { name: name.toUpperCase().substring(0, 3), score, time };
        
        highScoresData.push(newScore);
        highScoresData.sort((a, b) => b.score - a.score);
        highScoresData.splice(maxEntries); // Keep only the top scores
    },

    /**
     * Checks if a score is high enough to make the list.
     * @param {number} score - The score to check.
     * @param {number} maxEntries - The maximum number of scores on the list.
     * @returns {boolean}
     */
    isHighScore: function(score, maxEntries) {
        const scores = this.getHighScores();
        
        // If we don't have enough scores yet, it's automatically a high score
        if (scores.length < maxEntries) {
            return true;
        }
        
        // Check if this score beats the lowest high score
        const lowestScore = scores[maxEntries - 1]?.score ?? 0;
        return score > lowestScore;
    },

    /**
     * Clears all high scores (useful for testing or reset functionality)
     */
    clearHighScores: function() {
        highScoresData = [];
    },

    /**
     * Sets default high scores (for demonstration purposes)
     */
    setDefaultScores: function() {
        highScoresData = [
            { name: "ACE", score: 15000, time: "05:32.45" },
            { name: "PLR", score: 12000, time: "04:18.22" },
            { name: "TOP", score: 8500, time: "03:45.67" },
            { name: "GUN", score: 6000, time: "02:58.91" },
            { name: "JET", score: 3500, time: "02:12.33" }
        ];
    }
};