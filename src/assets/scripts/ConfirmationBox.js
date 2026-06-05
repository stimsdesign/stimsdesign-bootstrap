class ConfirmationBoxElement extends HTMLElement {
    constructor() {
        super();
        this.header = null;
        this.paragraph = null;
        this.closeBtn = null;
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.header = this.querySelector('[data-modal-title]');
        this.paragraph = this.querySelector('[data-modal-text]');
        this.closeBtn = this.querySelector('.close-modal, [data-modal-close]');

        this.closeBtn?.addEventListener('click', () => this.close());

        this.addEventListener('click', (e) => {
            if (e.target === this) {
                this.close();
            }
        });

        if (!window._confirmationBoxListenerAdded) {
            document.addEventListener('keydown', (e) => {
                const activeBox = document.querySelector('confirmation-box.active');
                if (e.key === 'Escape' && activeBox) {
                    activeBox.close();
                }
            });

            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('.open-confirmation');
                if (trigger) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const box = document.querySelector('confirmation-box');
                    if (box) {
                        const title = trigger.getAttribute('data-modal-header') || '';
                        const message = trigger.getAttribute('data-modal-paragraph') || '';
                        const buttonText = trigger.getAttribute('data-modal-button') || '';
                        box.open(title, message, buttonText);
                    }
                }
            }, { capture: true });

            window._confirmationBoxListenerAdded = true;
        }
    }

    open(title, message, buttonText) {
        if (this.header && title) this.header.textContent = title;
        if (this.paragraph && message) this.paragraph.textContent = message;
        if (this.closeBtn && buttonText) this.closeBtn.textContent = buttonText;

        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (!customElements.get('confirmation-box')) {
    customElements.define('confirmation-box', ConfirmationBoxElement);
}
