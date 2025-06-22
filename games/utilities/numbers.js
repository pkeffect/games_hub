export function getRandomFromRange(min, max) {
    return Math.random() * (max - min) + min;
}

export function getRandomXYFromGrid(xMax, yMax, scale) {
    return {
        x: Math.floor(Math.random() * xMax) * scale,
        y: Math.floor(Math.random() * yMax) * scale
    };
}
