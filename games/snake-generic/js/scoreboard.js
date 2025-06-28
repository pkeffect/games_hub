// js/scoreboard.js

// In-memory storage for high scores (session-based)
let highScoresData = [
    { name: "ACE", score: 150, time: "02:32.45" },
    { name: "PLR", score: 120, time: "01:48.22" },
    { name: "TOP", score: 85, time: "01:25.67" },
    { name: "GUN", score: 60, time: "00:58.91" },
    { name: "JET", score: 35, time: "00:42.33" }
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
    addScore: function(name, score, time, maxEntries = 5) {
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
    isHighScore: function(score, maxEntries = 5) {
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
            { name: "ACE", score: 150, time: "02:32.45" },
            { name: "PLR", score: 120, time: "01:48.22" },
            { name: "TOP", score: 85, time: "01:25.67" },
            { name: "GUN", score: 60, time: "00:58.91" },
            { name: "JET", score: 35, time: "00:42.33" }
        ];
    },

    /**
     * Draws the high scores screen
     */
    draw: function(ctx, width, height) {
        // Clear background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#00ff66';
        ctx.font = '32px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', width / 2, 80);

        // Headers
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('RANK', 120, 150);
        ctx.fillText('NAME', 200, 150);
        ctx.fillText('SCORE', 320, 150);
        ctx.fillText('TIME', 480, 150);

        // Underline
        ctx.fillStyle = '#333';
        ctx.fillRect(120, 160, 360, 2);

        // Scores
        const scores = this.getHighScores();
        scores.forEach((score, index) => {
            const y = 200 + (index * 40);
            
            // Rank
            ctx.fillStyle = '#00ffff';
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), 135, y);
            
            // Name
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(score.name, 200, y);
            
            // Score
            ctx.fillStyle = '#00ff66';
            ctx.textAlign = 'right';
            ctx.fillText(score.score.toString(), 400, y);
            
            // Time
            ctx.fillStyle = '#c0c0c0';
            ctx.textAlign = 'left';
            ctx.fillText(score.time, 480, y);
        });

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS ESC TO RETURN TO MENU', width / 2, height - 40);
    }
};