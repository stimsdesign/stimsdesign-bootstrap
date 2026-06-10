export class FuzzyImage {

    constructor(root) {
        this.root = root;
        this.img = root.nextElementSibling;
        if (!this.img) return;
        this.init();
    }

    async init() {
        if (!this.img) return;
        if (this.img.complete) {
            await this.tryDecode();
        } else {
            this.img.addEventListener('load', async () => {
                await this.tryDecode();
            }, { once: true });
        }
    }

    async tryDecode() {
        if (!this.img) return;
        try {
            const decodePromise = this.img.decode();
            const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));            
            await Promise.race([decodePromise, timeoutPromise]);
            this.markLoaded();
        } catch (e) {
            // Fallback for older browsers or broken decodes
            this.markLoaded();
        }
    }

    markLoaded() {
        this.root.classList.add('loaded');
    }
}

export function functionFuzzyImage(selector = '.fuzzy-image') {
    document.querySelectorAll(selector).forEach((el) => {
        new FuzzyImage(el);
    });
}