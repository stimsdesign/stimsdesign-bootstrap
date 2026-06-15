class TextTicker extends HTMLElement {
    constructor() {
        super();
        this.runner = null;
        this.item = null;
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.runner = this.querySelector(".text-ticker__runner");
        this.item = this.runner?.querySelector(".text-ticker__item") || null;
        if (!this.runner || !this.item) return;

        this.applyAutoClasses();
        this.cloneItems();
    }

    applyAutoClasses() {
        if (!this.item) return;
        const spans = this.item.querySelectorAll("span");
        spans.forEach(span => {
            const text = span.textContent || "";
            // Clean up to construct class name: lowercase, numbers, hyphens
            let className = text.trim().toLowerCase();
            // Replace spaces/underscores/hyphens with a single hyphen
            className = className.replace(/[\s_-]+/g, "-");
            // Remove anything that is not lowercase letters, numbers, or hyphens
            className = className.replace(/[^a-z0-9-]/g, "");
            // Clean leading/trailing hyphens
            className = className.replace(/^-+|-+$/g, "");

            if (className) {
                span.classList.add(className);
            }
        });
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

if (!customElements.get('text-ticker')) {
    customElements.define('text-ticker', TextTicker);
}
