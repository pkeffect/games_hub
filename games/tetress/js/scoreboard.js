// js/scoreboard.js

// In-memory storage for high scores (session-based)
let highScoresData = [
    { name: "ACE", score: 25000, lines: 125, time: "05:32.45", level: 13 },
    { name: "PRO", score: 18000, lines: 98, time: "04:18.22", level: 10 },
    { name: "TOP", score: 12500, lines: 75, time: "03:25.67", level: 8 },
    { name: "GUN", score: 8000, lines: 52, time: "02:58.91", level: 6 },
    { name: "JET", score: 4500, lines: 28, time: "01:42.33", level: 3 }
];

export const Scoreboard = {
    getHighScores: function() {
        return [...highScoresData];
    },

    addScore: function(name, score, lines, level, time, maxEntries = 5) {
        console.log('Adding score with time:', time);
        
        const newScore = { 
            name: name.toUpperCase().substring(0, 3), 
            score, 
            lines, 
            level,
            time 
        };
        
        console.log('New score object:', newScore);
        
        highScoresData.push(newScore);
        highScoresData.sort((a, b) => b.score - a.score);
        highScoresData.splice(maxEntries);
        
        console.log('Updated high scores:', highScoresData);
    },

    isHighScore: function(score, maxEntries = 5) {
        const scores = this.getHighScores();
        
        if (scores.length < maxEntries) {
            return true;
        }
        
        const lowestScore = scores[maxEntries - 1]?.score ?? 0;
        return score > lowestScore;
    },

    clearHighScores: function() {
        highScoresData = [];
    },

    setDefaultScores: function() {
        highScoresData = [
            { name: "ACE", score: 25000, lines: 125, time: "05:32.45", level: 13 },
            { name: "PRO", score: 18000, lines: 98, time: "04:18.22", level: 10 },
            { name: "TOP", score: 12500, lines: 75, time: "03:25.67", level: 8 },
            { name: "GUN", score: 8000, lines: 52, time: "02:58.91", level: 6 },
            { name: "JET", score: 4500, lines: 28, time: "01:42.33", level: 3 }
        ];
    },

    draw: function(ctx, width, height) {
        // Clear background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.save();
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 32px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HIGH SCORES', width / 2, 80);
        ctx.restore();

        // Headers
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 14px Orbitron, monospace';
        ctx.textAlign = 'left';
        
        const headerY = 140;
        ctx.fillText('RANK', 40, headerY);
        ctx.fillText('NAME', 100, headerY);
        ctx.fillText('SCORE', 160, headerY);
        ctx.fillText('LINES', 240, headerY);
        ctx.fillText('LEVEL', 290, headerY);
        ctx.fillText('TIME', 340, headerY);

        // Underline
        ctx.fillStyle = '#333';
        ctx.fillRect(40, headerY + 5, 360, 2);

        // Scores
        const scores = this.getHighScores();
        scores.forEach((score, index) => {
            const y = 180 + (index * 30);
            
            // Rank with medal colors
            const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#00ffff', '#00ffff'];
            ctx.fillStyle = rankColors[index] || '#ffffff';
            ctx.font = 'bold 16px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), 55, y);
            
            // Name
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(score.name, 100, y);
            
            // Score
            ctx.fillStyle = '#00ff66';
            ctx.textAlign = 'right';
            ctx.fillText(score.score.toLocaleString(), 230, y);
            
            // Lines
            ctx.fillStyle = '#ffff00';
            ctx.textAlign = 'center';
            ctx.fillText(score.lines.toString(), 255, y);
            
            // Level
            ctx.fillStyle = '#ff6600';
            ctx.textAlign = 'center';
            ctx.fillText(score.level.toString(), 305, y);
            
            // Time
            ctx.fillStyle = '#ff66ff';
            ctx.textAlign = 'left';
            ctx.fillText(score.time || '00:00.00', 340, y);
        });

        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS ESC TO RETURN TO MENU', width / 2, height - 40);
    }
};