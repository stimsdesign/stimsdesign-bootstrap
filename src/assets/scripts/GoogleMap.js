class GoogleMapElement extends HTMLElement {
    constructor() {
        super();
        this.iframe = null;
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.iframe = this.querySelector('iframe');
        this.loadMap();
    }

    loadMap() {
        if (window.innerWidth > 768) {
            if (this.iframe && this.iframe.dataset.src && !this.iframe.src) {
                this.iframe.src = this.iframe.dataset.src;
            }
        } else {
            this.style.display = 'none';
            // Notify parent to hide the container if needed
            const parent = this.closest('#service-area__map');
            if (parent) parent.style.display = 'none';
        }
    }
}

if (!customElements.get('google-map')) {
    customElements.define('google-map', GoogleMapElement);
}
