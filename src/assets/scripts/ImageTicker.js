class ImageTicker extends HTMLElement {
    constructor() {
        super();
        this.runner = null;
        this.item = null;
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.runner = this.querySelector(".image-ticker__runner");
        this.item = this.runner?.querySelector(".image-ticker__img") || null;
        if (!this.runner || !this.item) return;
        this.cloneItems();
    }

    cloneItems() {
        if (!this.runner || !this.item) return;
        
        // Clean up previously cloned items if connectedCallback runs again
        // keeping only the first element (the original runner content container)
        const originalChild = this.item;
        this.runner.innerHTML = "";
        this.runner.appendChild(originalChild);

        for (let i = 0; i < 3; i++) {
            this.runner.appendChild(originalChild.cloneNode(true));
        }
    }
}

if (!customElements.get('image-ticker')) {
    customElements.define('image-ticker', ImageTicker);
}
