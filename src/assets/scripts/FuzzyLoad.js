export class FuzzyLoad {
    constructor(root) {
        this.root = root;
        this.img = root.querySelector('img');
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

export function functionFuzzyLoad(selector = '.fuzzy-load') {
    document.querySelectorAll(selector).forEach((el) => {
        new FuzzyLoad(el);
    });
}
