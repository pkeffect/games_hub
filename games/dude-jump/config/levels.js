export default {
    ...Array.from({ length: 50 }, (_, i) => ({
        [i]: {
            enemies: {
                rows: Math.min(2 + Math.floor(i / 5), 6),
                columns: Math.min(6 + i % 5, 11),
                speed: Math.min(0.5 + i % 4, 4),
                attackDelay: Math.max(2000 - Math.floor(i / 4) * 500, 500),
            },
        },
    })).reduce((acc, level) => ({ ...acc, ...level }), {}),
};
