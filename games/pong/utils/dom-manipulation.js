export function showScreen(screen) {
    if (!screen) return;
    screen.style.opacity = 1;
    screen.style.pointerEvents = 'all';
}

export function hideScreen(screen) {
    if (!screen) return;
    screen.style.opacity = 0;
    screen.style.pointerEvents = 'none';
}

export function getFocusedIndexFromNodes(nodes) {
    let focused = undefined;
    nodes.forEach((elem, i) => {
        if (document.activeElement === elem) focused = i;
    });
    return focused;
}

export function setElementText(element, text) {
    element.textContent = text;
}

export function setElementValue(element, value) {
    element.value = value;
}

export const setAndHideScreens = (screens) => {
    if(!screens && !screen.length) return;
    
    screens.forEach(screen => {
        screen.style.position = 'absolute';
        screen.style.top = '0';
        screen.style.left = '0';
        screen.style.zIndex = '10';
        screen.style.width = '100%';
        screen.style.height = '100vh';
        screen.style.opacity = '0';
        screen.style.pointerEvents = 'none';
    });
};
