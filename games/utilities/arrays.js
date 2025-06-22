export const getRandomItemFromArray = (array) => array[Math.floor(Math.random() * array.length)];

export const rotateMatrix = (matrix) => matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());

export const generateMatrix = (width, height, value = 0) => {
    return Array.from({ length: height }, () => Array(width).fill(value));
};
