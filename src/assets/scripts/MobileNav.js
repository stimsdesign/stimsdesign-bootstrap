class MobileNavElement extends HTMLElement {
    constructor() {
        super();
        this.toggle = null;
        this.hamburger = null;
        this.drawer = null;
        this.closeBtn = null;
        this.overlay = null;
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.hamburger = this.querySelector('#mobile-hamburger');
        this.drawer = this.querySelector('#mobile-menu-drawer');
        this.closeBtn = this.querySelector('#mobile-menu-close');
        this.overlay = this.querySelector('#mobile-menu-overlay');

        // Toggle Events
        this.hamburger?.addEventListener('click', () => this.open());
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.classList.contains('open')) {
                this.close();
            }
        });

        // Close on swipeLeft (if custom event exists)
        this.drawer?.addEventListener("swipeLeft", () => {
            this.close();
        });
    }

    open() {
        this.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('open');
        document.body.style.overflow = '';
    }

    toggle() {
        if (this.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    }
}

if (!customElements.get('mobile-nav')) {
    customElements.define('mobile-nav', MobileNavElement);
}