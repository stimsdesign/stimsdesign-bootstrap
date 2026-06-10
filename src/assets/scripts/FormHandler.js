/* eslint-disable no-useless-escape */
import { AddressVerifier } from "./AddressVerifier.js";
import { DatePicker } from "./DatePicker.js";

/**
 * Basic security sanitizer targeting specific markup injections in text inputs.
 * Strips out extreme tags locally before formData payload evaluation.
 * @param {string} str 
 */
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export class FormHandler {
    /**
     * @param {HTMLFormElement} root - The form root element
     */
    constructor(root) {
        if (root.dataset.formHandlerInitialized) return;
        root.dataset.formHandlerInitialized = "true";

        this.root = root;
        
        // Modal content from data attributes
        this.successHeader = this.root.getAttribute('data-modal-header') || "Thank You!";
        this.successParagraph = this.root.getAttribute('data-modal-paragraph') || "Your message has been sent successfully.";
        this.successButton = this.root.getAttribute('data-modal-button') || "Close";
        
        // Cache file configurations
        this.fileConfigs = new Map();
        
        this._initConfigurationCaches();

        // Sub-architectures
        this._initAddressVerification();
        this._initDatePickers();

        // Multi-part initialization
        if (this.root.dataset.multiPart === "true") {
            this._initMultiPartForm();
        }

        this._bindCentralDelegation();
    }

    /* --- INITIALIZATION --- */

    _initConfigurationCaches() {
        this.root.querySelectorAll('input[type="file"]').forEach(input => {
            this.fileConfigs.set(input, {
                maxSize: parseFloat(input.dataset.maxSize) || 10,
                allowedTypes: input.dataset.allowedTypes ? input.dataset.allowedTypes.split(',').map(t => t.trim()) : []
            });
            input.isValidFile = true;

            // VERY IMPORTANT: Native OS window cancel interactions do not bubble inside 
            // the DOM inherently. We must individually attach it to prevent floating-label bug!
            input.addEventListener('cancel', () => {
                input.parentElement?.classList.remove('file-active');
                input.blur();
            });
        });

        // Initialize dynamic inputs to update requirement tracking on DOM load
        const wrappers = this.root.querySelectorAll('.dynamic-input');
        wrappers.forEach(wrapper => this.updateDynamicDisplay(wrapper));

        // Initialize has-value class for select elements
        this.root.querySelectorAll('select').forEach(select => {
            const hasVal = select.value !== "";
            select.classList.toggle('has-value', hasVal);
            select.closest('.select-group')?.classList.toggle('has-value', hasVal);
        });
    }

    _initAddressVerification() {
        const addressGroups = this.root.querySelectorAll('.valid-address-group');
        addressGroups.forEach(group => {
            new AddressVerifier(group);
        });
    }

    _initDatePickers() {
        // Find both popups (.datepicker) and inline (.select-day) formats
        const pickers = this.root.querySelectorAll('.datepicker, .select-day');
        // We use a deduplication Set because both classes can sometimes exist in same path
        const attachedGroups = new Set();
        
        pickers.forEach(picker => {
            const group = picker.closest('.input-group, .custom-group');
            if (!group || attachedGroups.has(group)) return;
            attachedGroups.add(group);
            new DatePicker(group);
        });
    }

    /* --- GLOBAL DELEGATION ENGINE --- */
    
    _bindCentralDelegation() {
        // Form Level
        this.root.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.root.addEventListener('reset', () => this.handleNativeReset());

        // Focus Level
        this.root.addEventListener('focusin', (e) => this.handleDelegatedFocus(e));

        // Interactive Level
        this.root.addEventListener('click', (e) => this.handleDelegatedClick(e));
        this.root.addEventListener('input', (e) => this.handleDelegatedInput(e));
        this.root.addEventListener('change', (e) => this.handleDelegatedChange(e));
    }

    /* --- DELEGATION TRIGGERS --- */

    handleDelegatedFocus(e) {
        // Expand standard DatePickers on tab focus targeting
        if (e.target.classList.contains('date-input')) {
            const group = e.target.closest('.input-group');
            const wrapper = group?.querySelector('.datepicker__wrapper');
            if (wrapper) {
                wrapper.classList.remove('hidden');
                wrapper.hidden = false;
            }
        }
    }

    handleDelegatedClick(e) {
        // 1. Quantity Controls
        const minusBtn = e.target.closest('.minus');
        const plusBtn = e.target.closest('.plus');
        if (minusBtn || plusBtn) {
            e.preventDefault();
            this.updateQuantity(e.target.closest('.quantity-input'), !!plusBtn);
            return;
        }

        // 2. Password Toggles
        const toggleBtn = e.target.closest('.toggle-password');
        if (toggleBtn) {
            this.togglePasswordVisibility(toggleBtn);
            return;
        }

        // 3. Multi-Part Navigation
        const nextBtn = e.target.closest('.next-btn');
        const prevBtn = e.target.closest('.prev-btn');
        if (nextBtn && this.sections && this.sections.length > 0) {
            e.preventDefault();
            if (this.validateSection(this.sections[this.currentStepIndex])) {
                this.goToStep(this.currentStepIndex + 1, true);
            }
            return;
        }
        if (prevBtn && this.sections && this.sections.length > 0) {
            e.preventDefault();
            // Explicitly push previous step to avoid leaving the page or fighting the router
            this.goToStep(this.currentStepIndex - 1, true);
            return;
        }

        // 4. File Input Floating UI Bug Patch (Opening modal)
        const fileInput = e.target.closest('input[type="file"]');
        if (fileInput) {
            // Actively sets float UI since we can't reliably predict OS load duration
            fileInput.parentElement?.classList.add('file-active');
        }
    }

    handleDelegatedInput(e) {
        const target = e.target;

        // 1. Dynamic Elements Toggles
        if (target.hasAttribute('data-target') || target.closest('.dynamic-input')) {
            const wrapper = target.closest('.dynamic-input');
            if (wrapper) this.updateDynamicDisplay(wrapper);
        }

        // 2. Exact matched Telephone input formatting
        // We use getAttribute to prevent fallback DOM corruption where browser reports "text" physically!
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'tel') {
            this.formatPhoneInput(target);
        }

        // Zip / Postal code digit restriction & formatting
        if (target.tagName === 'INPUT' && target.getAttribute('autocomplete') === 'postal-code') {
            this.formatZipInput(target);
        }

        // 3. Password Requirements & Checking
        if (target.tagName === 'INPUT' && target.closest('.password-input-wrapper')) {
            const container = this.root.querySelector('.password-requirements');
            if (container && target.id.endsWith("-create")) {
                this.validatePasswordRequirements(target.value, container);
            }
            this.validatePasswordState(target);

            // Backwards parity mapping
            if (target.id.endsWith("-create")) {
                const confirmId = target.id.replace("-create", "-confirm");
                const confirmInput = this.root.querySelector(`#${confirmId}`);
                if (confirmInput) this.validatePasswordState(confirmInput);
            }
        }
    }

    handleDelegatedChange(e) {
        const target = e.target;

        // Manage has-value class for select elements
        if (target.tagName === 'SELECT') {
            const hasVal = target.value !== "";
            target.classList.toggle('has-value', hasVal);
            target.closest('.select-group')?.classList.toggle('has-value', hasVal);
        }

        // Dynamic Elements Select Dropdowns
        if (target.tagName === 'SELECT' && target.closest('.dynamic-input')) {
            const wrapper = target.closest('.dynamic-input');
            if (wrapper) this.updateDynamicDisplay(wrapper);
        }

        // File Validation logic processing
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'file') {
            this.validateFileInput(target);
            target.parentElement?.classList.remove('file-active');
            target.blur();
        }
    }

    handleNativeReset() {
        if (this.sections && this.sections.length > 0) {
            this.goToStep(0, true);
        }

        // Sync local states back to null off main blocking thread
        setTimeout(() => {
            this.root.querySelectorAll('input[type="file"]').forEach(fileInput => {
                this.validateFileInput(fileInput);
                fileInput.parentElement?.classList.remove('file-active');
            });
            this.root.querySelectorAll('.password-input-wrapper input').forEach(pwdInput => {
                this.validatePasswordState(pwdInput);
            });
        }, 0);
    }

    /* --- MANIPULATORS --- */

    updateQuantity(container, isIncrement) {
        if (!container) return;
        const input = container.querySelector('input[type="number"]');
        if (!input) return;

        const val = parseFloat(input.value) || 0;
        const step = parseFloat(input.step) || 1;
        const min = input.hasAttribute('min') ? parseFloat(input.min) : -Infinity;
        const max = input.hasAttribute('max') ? parseFloat(input.max) : Infinity;
        
        let newVal = isIncrement ? val + step : val - step;
        newVal = Math.min(Math.max(newVal, min), max);
        
        const precision = (step.toString().split('.')[1] || '').length;
        input.value = newVal.toFixed(precision);

        // Native triggers to expand labels naturally
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    togglePasswordVisibility(button) {
        const wrapper = button.closest(".password-input-wrapper");
        const input = wrapper?.querySelector("input");
        if (input && wrapper) {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            wrapper.classList.toggle("show-password");
        }
    }

    validateFileInput(input) {
        if (!this.fileConfigs.has(input)) return;
        const config = this.fileConfigs.get(input);
        
        const typeWarning = input.parentElement.querySelector('.file-type-warning');
        const sizeWarning = input.parentElement.querySelector('.file-size-warning');
        
        input.isValidFile = true;
        if (typeWarning) typeWarning.style.display = 'none';
        if (sizeWarning) sizeWarning.style.display = 'none';

        if (input.files.length > 0) {
            const file = input.files[0];
            const sizeMB = file.size / (1024 * 1024);

            if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(file.type)) {
                if (typeWarning) typeWarning.style.display = 'block';
                input.isValidFile = false;
            }

            if (sizeMB > config.maxSize) {
                if (sizeWarning) sizeWarning.style.display = 'block';
                input.isValidFile = false;
            }

            if (!input.isValidFile) input.classList.add('file-invalid');
            else input.classList.remove('file-invalid');
            
            input.classList.add('has-file');
        } else {
            input.classList.remove('has-file', 'file-invalid');
        }
    }

    formatPhoneInput(inputEl) {
        let input = inputEl.value.replace(/\D/g, "");
        if (input.length > 10) input = input.substring(0, 10);
        
        const formatted = input.replace(/(\d{0,3})(\d{0,3})(\d{0,4})/, (_match, p1, p2, p3) => {
            if (p3) return `(${p1}) ${p2}-${p3}`;
            else if (p2) return `(${p1}) ${p2}`;
            else if (p1) return `(${p1})`;
            return input;
        });
        inputEl.value = formatted;
    }

    formatZipInput(inputEl) {
        inputEl.value = inputEl.value.replace(/\D/g, "").substring(0, 5);
    }

    validatePasswordRequirements(value, container) {
        const reqs = {
            characters: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /\d/.test(value),
            special: /[@$!%*?&#]/.test(value)
        };

        Object.entries(reqs).forEach(([key, valid]) => {
            const el = container.querySelector(`.req-${key}`);
            if (el) el.classList.toggle('active', valid);
        });
    }

    validatePasswordState(input) {
        input.setCustomValidity(""); 

        const isConfirmField = input.id.endsWith("-confirm");
        const isCreateField = input.id.endsWith("-create");
        const isStandalone = !isConfirmField && !isCreateField;

        if (isCreateField || isStandalone) {
            const value = input.value;
            const hasUpper = /[A-Z]/.test(value);
            const hasNumber = /\d/.test(value);
            const hasSpecial = /[@$!%*?&#]/.test(value);
            const hasLength = value.length >= 8;

            if (!hasUpper || !hasNumber || !hasSpecial || !hasLength) {
                input.setCustomValidity("Password must be at least 8 characters and include uppercase, number, and special character.");
                return false;
            }
        }

        if (isConfirmField) {
            const rootId = input.id.replace("-confirm", "");
            const createInput = this.root.querySelector(`#${rootId}-create`);
            if (createInput && input.value !== createInput.value) {
                input.setCustomValidity("Passwords do not match.");
                return false;
            }
        }
        return true;
    }

    updateDynamicDisplay(wrapper) {
        const triggerId = wrapper.dataset.trigger;
        const triggers = wrapper.querySelectorAll(`[id="${triggerId}"], [name="${triggerId}"]`);
        
        let targetId = null;

        if (triggers.length > 0) {
            const first = triggers[0];
            if (first.tagName === 'SELECT') {
                const selectedOption = first.options[first.selectedIndex];
                targetId = selectedOption?.dataset.target;
            } else {
                const activeTrigger = Array.from(triggers).find(t => t.checked) || 
                                     (triggers.length === 1 ? triggers[0] : null);
                if (activeTrigger) targetId = activeTrigger.dataset.target;
            }
        }

        const targetContainer = wrapper.querySelector('.form-row') || wrapper;
        
        Array.from(targetContainer.children).slice(1).forEach(child => {
            const isTarget = targetId && (child.id === targetId || child.querySelector(`#${targetId}`));
            
            if (isTarget) {
                child.classList.add('active');
                child.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
                    if (input.dataset.origRequired === "true") input.required = true;
                });
            } else {
                child.classList.remove('active');
                child.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
                    input.required = false;
                });
            }
        });
    }

    /* --- MULTI-PART NAVIGATION --- */

    _initMultiPartForm() {
        const idString = this.root.dataset.sectionIds;
        if (!idString) return;

        this.sectionIds = idString.split(',').map(s => s.trim());
        this.sections = this.sectionIds
            .map(id => this.root.querySelector(`#${id}`))
            .filter(el => !!el);

        this.currentStepIndex = 0;
        this.historyPushed = false;

        // Sync initial step with history state (handles session persistence)
        const initialState = window.history.state;
        if (initialState && initialState.formId === this.root.id && typeof initialState.stepIndex === 'number') {
            this.currentStepIndex = initialState.stepIndex;
        }
        
        // Find UI elements
        this.stepIndicator = this.root.querySelector('.step-indicator');
        this.stepNumberEl = this.root.querySelector('.step-number');
        this.stepTotalEl = this.root.querySelector('.step-total');
        this.progressBar = this.root.querySelector('.progress-bar');

        // History Management using state-based navigation
        // This keeps the URL clean while maintaining back/forward functionality
        window.addEventListener('popstate', (event) => {
            // Safety check: ignore if this form instance is no longer in the DOM
            if (!document.body.contains(this.root)) return;

            const state = event.state;
            if (state && state.formId === this.root.id && typeof state.stepIndex === 'number') {
                if (state.stepIndex !== this.currentStepIndex) {
                    this.goToStep(state.stepIndex, false);
                }
            } else if (!state && this.currentStepIndex !== 0) {
                // If we go back to a state with no data (e.g. initial page load), default to first step
                this.goToStep(0, false);
            }
        });

        // Initialize state if none exists, preserving Astro's state to prevent router errors
        if (!initialState || initialState.formId !== this.root.id) {
            const state = initialState || {};
            window.history.replaceState({ ...state, formId: this.root.id, stepIndex: this.currentStepIndex }, "");
        }

        this.updateMultiPartUI();
    }

    updateMultiPartUI() {
        if (!this.sections || this.sections.length === 0) return;

        this.sections.forEach((section, index) => {
            if (index === this.currentStepIndex) section.classList.remove('hidden');
            else section.classList.add('hidden');
        });

        if (this.stepNumberEl) this.stepNumberEl.innerText = this.currentStepIndex + 1;
        if (this.stepTotalEl) this.stepTotalEl.innerText = this.sections.length;

        if (this.progressBar) {
            const percentage = ((this.currentStepIndex + 1) / this.sections.length) * 100;
            this.progressBar.style.width = `${percentage}%`;
        }
    }

    validateSection(section) {
        if (!section) return true;
        
        const inputs = Array.from(section.querySelectorAll('input, select, textarea'))
            .filter(input => !input.classList.contains('hidden') && input.type !== 'hidden');

        inputs.forEach(input => {
            // Re-assert password validity states locally per step
            if (input.tagName === 'INPUT' && input.closest('.password-input-wrapper')) {
                this.validatePasswordState(input);
            }
        });

        const addressGroups = section.querySelectorAll('.valid-address-group');
        addressGroups.forEach(group => {
            const provider = group.dataset.addressProvider;
            const isStrictVerify = group.dataset.verify === "true";
            
            if (isStrictVerify && provider !== 'none') {
                const verifiedFlag = group.querySelector('.address-verified-flag');
                const streetInput = group.querySelector('.street-address-container input');
                if (verifiedFlag && verifiedFlag.value !== 'true' && streetInput && streetInput.value.trim() !== '') {
                    streetInput.setCustomValidity("Please select a verified address from the suggestions.");
                } else if (streetInput) {
                    streetInput.setCustomValidity("");
                }
            } else {
                const streetInput = group.querySelector('.street-address-container input');
                if (streetInput) streetInput.setCustomValidity("");
            }
        });

        let firstInvalid = null;
        const isValid = inputs.every(input => {
            const valid = input.checkValidity();
            if (!valid && !firstInvalid) firstInvalid = input;
            return valid;
        });

        if (!isValid && firstInvalid) firstInvalid.reportValidity();
        return isValid;
    }

    goToStep(index, push = false) {
        if (index < 0 || index >= this.sections.length) return;
        this.currentStepIndex = index;

        if (push) {
            const state = window.history.state || {};
            window.history.pushState({ ...state, formId: this.root.id, stepIndex: index }, "");
            this.historyPushed = true;
        }

        this.updateMultiPartUI();
        this.root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* --- FORM SUBMISSION --- */

    handleFormSubmit = async (event) => {
        event.preventDefault();
        const myForm = event.currentTarget;

        const fileInputs = Array.from(myForm.querySelectorAll('input[type="file"]'));
        const isAllFilesValid = fileInputs.every(input => input.isValidFile !== false);
        if (!isAllFilesValid) return;

        const passwordInputs = Array.from(myForm.querySelectorAll('.password-input-wrapper input'));
        passwordInputs.forEach(input => this.validatePasswordState(input));

        if (!myForm.checkValidity()) {
            myForm.reportValidity();
            return;
        }

        const submitBtn = myForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('sending');
            if (submitBtn.innerText) submitBtn.innerText = "Sending...";
        }
        
        const formData = new FormData(myForm);
        
        // Security checks
        for (let [key, value] of formData.entries()) {
            if (typeof value === 'string') {
                formData.set(key, sanitizeInput(value));
            }
        }
        
        const body = new URLSearchParams(formData).toString();

        try {
            const res = await fetch(window.location.pathname, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body
            });
            if (res.ok) {
                const box = document.querySelector('confirmation-box');
                if (box) {
                    box.open(this.successHeader, this.successParagraph, this.successButton);
                }
                myForm.reset();
            } else {
                console.error('Form failed', res.status);
            }
        } catch (e) {
            console.error('Form error', e);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('sending');
                if (submitBtn.innerText) submitBtn.innerText = originalText || "Send Message";
            }
        }
    };
}
