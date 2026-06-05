/**
 * Modal Component Logic
 * 
 * Usage:
 * <modal-component data-modal-id="my-modal">...</modal-component>
 * <button data-modal-id="my-modal">Open</button>
 */
class ModalComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.init();
    }

    init() {
        // Close on backdrop click or close button click
        this.addEventListener('click', (e) => {
            const isBackdrop = e.target === this;
            const isCloseBtn = e.target.closest('.close-modal');
            if (isBackdrop || isCloseBtn) {
                this.close();
            }
        });

        // Global trigger listener (only once)
        if (!window._modalTriggerListenerAdded) {
            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('[data-modal-id]');
                // Only act if the trigger is NOT inside a modal-component (to avoid close buttons etc triggering new ones unless intended)
                // But specifically we look for triggers that are NOT modal-components themselves
                if (trigger && trigger.tagName !== 'MODAL-COMPONENT') {
                    const modalId = trigger.getAttribute('data-modal-id');
                    const modal = document.getElementById(modalId);
                    if (modal && modal.tagName === 'MODAL-COMPONENT') {
                        e.preventDefault();
                        modal.open();
                    }
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('modal-component.active');
                    if (activeModal) activeModal.close();
                }
            });

            window._modalTriggerListenerAdded = true;
        }
    }

    open() {
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (!customElements.get('modal-component')) {
    customElements.define('modal-component', ModalComponent);
}
