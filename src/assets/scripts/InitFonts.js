/**
 * Initialize fonts to prevent Layout Shift during page load animations
 */
export function initFonts() {
    document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
    }).catch(() => {
        document.documentElement.classList.add('fonts-loaded');
    });
}
