const SCALE = getComputedStyle(document.documentElement).getPropertyValue('--tile-scale') || 50;
const TICK_MS = 1000;
const WIDTH_SIZE = getComputedStyle(document.documentElement).getPropertyValue('--s-width') || 12;
const HEIGHT_SIZE = getComputedStyle(document.documentElement).getPropertyValue('--s-height') || 20;
const PREFIX = 'tetris-';

export { SCALE, TICK_MS, WIDTH_SIZE, HEIGHT_SIZE, PREFIX };
