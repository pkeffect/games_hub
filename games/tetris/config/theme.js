const BG_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--c-bg') || 'black';
const BG_LIGHT_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--c-light-bg') || 'white';

const TILE_COLORS = [
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-1') || 'red',
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-2') || 'blue',
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-3') || 'green',
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-4') || 'yellow',
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-5') || 'purple',
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-6') || 'orange',
    getComputedStyle(document.documentElement).getPropertyValue('--c-tile-7') || 'cyan',
];

export { TILE_COLORS, BG_COLOR, BG_LIGHT_COLOR};
