// Console statements for debugging
console.log('Complete the puzzle for a prize! Who is Kazuhisa Hashimoto?');
console.log('');
// console.log('User is logged in:', userLoggedIn);

// Global flag for mobile breakpoint
(function () {
    function setIsMobile() {
        const viewportWidth = window.visualViewport
            ? window.visualViewport.width
            : document.documentElement.clientWidth;
        window.IS_MOBILE = viewportWidth <= 768;
        document.documentElement.dataset.isMobile = window.IS_MOBILE; // optional hook for CSS html[data-is-mobile="true"]
    }
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setIsMobile, 150); // debounce
    });
    setIsMobile();
})();

// Mobile swipe custom events: swipeLeft & swipeRight
(function () {
    const HORIZONTAL_THRESHOLD = 40;
    const VERTICAL_RESTRAINT = 60;
    const ALLOWED_TIME = 600;

    let startX = 0, startY = 0, startTime = 0, tracking = false, startTarget = null;

    document.addEventListener('touchstart', (e) => {
        if (!window.IS_MOBILE) return;
        if (e.touches.length !== 1) return;
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        startTime = Date.now();
        startTarget = e.target;            // capture origin element
        tracking = true;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;
        if (!window.IS_MOBILE) return;

        const t = e.changedTouches[0];
        const distX = t.clientX - startX;
        const distY = t.clientY - startY;
        const elapsed = Date.now() - startTime;

        if (elapsed > ALLOWED_TIME) return;
        if (Math.abs(distY) > VERTICAL_RESTRAINT) return;
        if (Math.abs(distX) < HORIZONTAL_THRESHOLD) return;

        const direction = distX < 0 ? 'swipeLeft' : 'swipeRight';

        const evt = new CustomEvent(direction, {
            detail: {
                distance: Math.abs(distX),
                elapsed,
                startTarget
            },
            bubbles: true,          // allow bubbling up to slider root
            cancelable: false,
            composed: true          // allow crossing shadow DOM if any
        });

        (startTarget || document).dispatchEvent(evt);
        startTarget = null;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!tracking) return;
        if (e.touches.length !== 1) tracking = false;
    }, { passive: true });
})();

// Touch hover support for elements with .touch class
(function () {
    if (!('ontouchstart' in window)) return; // Only run on touch devices
    document.addEventListener('touchstart', (e) => {
        const touchElement = e.target.closest('.touch');
        document.querySelectorAll('.touch.hover').forEach(el => {
            if (el !== touchElement) el.classList.remove('hover');
        });
        if (touchElement) {
            touchElement.classList.add('hover');
        }
    }, { passive: true });
})();

// Easter egg Konami code
(function () {
    const EASTER_EGG = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a', 'Enter'];
    let currentIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === EASTER_EGG[currentIndex]) {
            currentIndex++;
            if (currentIndex === EASTER_EGG.length) {
                currentIndex = 0; // Reset after successful input
                launchEasterEggGame();
            }
        } else {
            currentIndex = 0; // Reset if sequence is broken
        }
    });

    function launchEasterEggGame() {
        if (document.getElementById('easter-egg-overlay')) return;
        console.log('Easter Egg Activated!');
    }
})();