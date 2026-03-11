// Console statements for debugging
console.log('Complete the puzzle for a prize! Who is Kazuhisa Hashimoto?');
console.log('To review more of my code, please visit my github → https://github.com/stimsdesign');
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

        // Construct paths at runtime to prevent pre-scanners from preloading
        const romDir = '/roms';
        const gameLoader = romDir + '/loader.js';
        const romFile = romDir + '/journey-to-silius.nes';

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'easter-egg-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        });

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        Object.assign(closeBtn.style, {
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '40px',
            color: '#fff',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            lineHeight: '1'
        });
        closeBtn.onclick = () => {
            document.body.removeChild(overlay);
        };
        overlay.appendChild(closeBtn);

        // Click background to close
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };

        // Create game container
        const gameWrapper = document.createElement('div');
        Object.assign(gameWrapper.style, {
            width: '640px',
            height: '480px',
            maxWidth: '100%',
            backgroundColor: '#000',
            boxShadow: '0 0 50px rgba(0,0,0,0.5)',
            position: 'relative'
        });

        const gameContainer = document.createElement('div');
        gameContainer.id = 'game';
        Object.assign(gameContainer.style, {
            width: '100%',
            height: '100%'
        });

        gameWrapper.appendChild(gameContainer);
        overlay.appendChild(gameWrapper);
        document.body.appendChild(overlay);

        // Initialize EJS
        window['EJS_player'] = '#game';
        window['EJS_biosUrl'] = '';
        window['EJS_gameUrl'] = romFile;
        window['EJS_core'] = 'nes';
        window['EJS_lightgun'] = false;
        window['EJS_startOnLoaded'] = true;
        window['EJS_fullscreenOnLoaded'] = true;

        // Load loader.js
        const script = document.createElement('script');
        script.src = gameLoader;
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }
})();