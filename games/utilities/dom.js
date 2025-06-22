const getFocusableElements = (container = document) => {
    const selectors = 'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
    return Array.from(
        container.querySelectorAll(selectors),
    ).filter((element) => element.offsetParent !== null && !element.hasAttribute('disabled') && element.getAttribute('tabindex') !== '-1');
};

const focusNext = () => {
    const currentElement = document.activeElement;
    const focusable = getFocusableElements();
    const currentIndex = focusable.indexOf(currentElement);
    const nextElement = focusable[currentIndex + 1] || focusable[0]; // Wrap to start if at end
    nextElement.focus();
    return nextElement;
};

const focusPrevious = () => {
    const currentElement = document.activeElement;
    const focusable = getFocusableElements();
    const currentIndex = focusable.indexOf(currentElement);
    const previousElement = focusable[currentIndex - 1] || focusable[focusable.length - 1]; // Wrap to end if at start
    previousElement.focus();
    return previousElement;
};

export { focusNext, focusPrevious };
