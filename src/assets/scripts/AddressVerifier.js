/**
 * AddressVerifier.js
 * Handles multi-provider address autocomplete and verification.
 * Uses a strategy pattern to map different provider responses to a standard format.
 */

const PROVIDERS = {
    photon: {
        endpoint: (q) => `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`,
        map: (feature) => {
            const p = feature.properties;
            // Photon specific mapping: Combine housenumber and street
            // Note: In some regions, name is used instead of street
            const streetName = p.street || p.name || '';
            const street = [p.housenumber, streetName].filter(Boolean).join(' ');
            
            return {
                street,
                city: p.city || '',
                state: p.state || '',
                zip: p.postcode || '',
                // Search label for the dropdown
                label: [street, p.city, p.state, p.postcode].filter(Boolean).join(', ')
            };
        }
    },
    // Future providers can be added here easily:
    /*
    mapbox: {
        endpoint: (q) => `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${KEY}`,
        map: (feature) => ({
            street: feature.address + ' ' + feature.text,
            city: ...
        })
    }
    */
};

export class AddressVerifier {
    constructor(container) {
        this.container = container;
        this.providerKey = container.dataset.addressProvider;
        this.prefix = container.dataset.idPrefix;
        
        // Strategy Selection
        this.strategy = PROVIDERS[this.providerKey];
        
        this.inputs = {
            street: container.querySelector(`#${this.prefix}-street`),
            apt: container.querySelector(`#${this.prefix}-apt`),
            city: container.querySelector(`#${this.prefix}-city`),
            state: container.querySelector(`#${this.prefix}-state`),
            zip: container.querySelector(`#${this.prefix}-zip`),
            verified: container.querySelector(`#${this.prefix}-verified`)
        };

        this.suggestionsEl = container.querySelector(`#${this.prefix}-suggestions`);
        
        if (this.strategy && this.inputs.street) {
            this.init();
        }
    }

    init() {
        let debounceTimer;
        this.inputs.street.addEventListener('input', (e) => {
            if (this.isAutoFilling) return;
            
            const query = e.target.value;
            this.setVerified(false);
            
            clearTimeout(debounceTimer);
            if (!query.includes(' ')) {
                this.hideSuggestions();
                return;
            }

            debounceTimer = setTimeout(() => this.fetchSuggestions(query), 300);
        });

        this.inputs.street.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 250);
        });
    }

    async fetchSuggestions(query) {
        try {
            const res = await fetch(this.strategy.endpoint(query));
            const data = await res.json();
            // Provider responses vary (Photon uses .features, Google uses .predictions, etc)
            // We assume a standard list for now, but the strategy can handle this too
            const results = data.features || data.results || [];
            this.renderSuggestions(results);
        } catch (err) {
            console.error(`Address Verification Error (${this.providerKey}):`, err);
        }
    }

    renderSuggestions(rawResults) {
        if (!this.suggestionsEl) return;
        this.suggestionsEl.innerHTML = '';
        
        if (!rawResults || rawResults.length === 0) {
            this.hideSuggestions();
            return;
        }

        rawResults.forEach(raw => {
            const mapped = this.strategy.map(raw);
            
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-main">${mapped.street}</span>
                <span class="suggestion-sub">${[mapped.city, mapped.state, mapped.zip].filter(Boolean).join(', ')}</span>
            `;
            
            div.addEventListener('click', () => this.applySelection(mapped));
            this.suggestionsEl.appendChild(div);
        });

        this.suggestionsEl.classList.remove('hidden');
    }

    applySelection(mappedData) {
        this.isAutoFilling = true;
        if (this.inputs.street) this.inputs.street.value = mappedData.street;
        if (this.inputs.city) this.inputs.city.value = mappedData.city;
        if (this.inputs.state) this.inputs.state.value = mappedData.state;
        if (this.inputs.zip) this.inputs.zip.value = mappedData.zip;
        
        this.setVerified(true);
        this.hideSuggestions();

        // Refresh styles/labels
        Object.values(this.inputs).forEach(input => {
            if (input) {
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        this.isAutoFilling = false;
    }

    setVerified(isVerified) {
        if (this.inputs.verified) {
            this.inputs.verified.value = isVerified ? 'true' : 'false';
        }
    }

    hideSuggestions() {
        if (this.suggestionsEl) this.suggestionsEl.classList.add('hidden');
    }
}
