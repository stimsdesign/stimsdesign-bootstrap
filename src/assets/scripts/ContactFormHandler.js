export class ContactFormHandler {
    constructor(root) {
        this.root = root;
        this.telephoneFields = Array.from(this.root.querySelectorAll('input[type="tel"]'));
        this.formModalOverlay = document.querySelector('.form-modal-overlay');
        this.closeModalBtn = this.formModalOverlay?.querySelector('.close-modal') || null;

        this.bindEvents();
    }

    formatPhoneInput(inputEl) {
        let input = inputEl.value.replace(/\D/g, ""); // Remove non-numeric characters
        if (input.length > 10) {
            input = input.substring(0, 10); // Limit to 10 digits
        }
        const formatted = input.replace(
            /(\d{0,3})(\d{0,3})(\d{0,4})/,
            (_match, p1, p2, p3) => {
                if (p3) {
                    return `(${p1}) ${p2}-${p3}`;
                } else if (p2) {
                    return `(${p1}) ${p2}`;
                } else if (p1) {
                    return `(${p1})`;
                }
                return input;
            }
        );
        inputEl.value = formatted;
    }

    closeModal = () => {
        if (!this.formModalOverlay) return;
        this.formModalOverlay.classList.remove('active');
        // window.location.href = '/';
    };

    handleFormSubmit = async (event) => {
        event.preventDefault();

        const myForm = event.currentTarget;

        const submitBtn = myForm.querySelector('.submit-btn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const originalText = btnText?.textContent;
        if (btnText) btnText.textContent = "Sending...";
        if (submitBtn) submitBtn.disabled = true;


        const formData = new FormData(myForm);

        // Encode the form data for x-www-form-urlencoded
        // const body = new URLSearchParams(Array.from(formData.entries())).toString();
        const body = new URLSearchParams(formData).toString();


        try {
            const res = await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            });
            if (res.ok) {
                // show the thank you modal
                if (this.formModalOverlay) this.formModalOverlay.classList.add('active');
                myForm.reset();
            } else {
                console.error('Form failed', res.status);
            }
        } catch (e) {
            console.error('Form error', e);
        } finally {
            if (btnText) btnText.textContent = originalText || "Send Message";
            if (submitBtn) submitBtn.disabled = false;
        }
    };

    bindEvents() {
        this.telephoneFields.forEach(field => {
            field.addEventListener('input', (e) => this.formatPhoneInput(e.target));
        });

        this.root.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Handle Modal Close (click)
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', this.closeModal);
        }

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.formModalOverlay?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
}
