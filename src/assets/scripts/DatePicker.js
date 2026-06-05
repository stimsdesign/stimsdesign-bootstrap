export class DatePicker {
    /**
     * Constructs a DatePicker component controller.
     * @param {HTMLElement} group - the wrapper element (.input-group or .custom-group)
     */
    constructor(group) {
        this.group = group;
        this.isInline = this.group.classList.contains('select-day') || this.group.querySelector('.select-day') !== null;
        this.input = this.group.querySelector('.date-input');
        
        // Inline calendars usually are the .select-day element itself or contain it.
        this.container = this.isInline ? (this.group.classList.contains('select-day') ? this.group : this.group.querySelector('.select-day')) : this.group.querySelector('.datepicker__wrapper');
        
        if (!this.input || !this.container) return;

        this.selectedDate = null;
        this.currentDate = new Date();

        this._initConfig();
        
        if (this.config.weekView) {
            this._alignWeekViewStart();
        }

        this._bindEvents();
        
        // Lazy loading behavior mapping:
        if (!this.isInline) {
            this.input.addEventListener('focus', () => {
                this.container.classList.remove('hidden');
                this.container.hidden = false;
                this.render();
            });

            document.addEventListener('click', (e) => {
                if (!this.group.contains(e.target)) {
                    this.container.classList.add('hidden');
                    this.container.hidden = true;
                }
            });
        } else {
            // Inline components render immediately
            this.render();
        }
    }

    _alignWeekViewStart() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startLimit = new Date(today);
        startLimit.setDate(today.getDate() + this.config.startRange);
        this.currentDate = new Date(startLimit);
        // Align to previous Sunday
        this.currentDate.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    }

    _initConfig() {
        const enabledDaysRaw = this.group.dataset.days || "sun,mon,tue,wed,thu,fri,sat";
        const weekends = this.group.dataset.weekends !== "false";
        const startRange = parseInt(this.group.dataset.startRange) || 0;
        const endRange = this.group.dataset.endRange ? parseInt(this.group.dataset.endRange) : null;
        const excludedDatesRaw = this.group.dataset.excludedDates || "";

        const dayMap = {
            'sun': 0, 'sunday': 0, 'mon': 1, 'monday': 1, 'tue': 2, 'tues': 2, 'tuesday': 2,
            'wed': 3, 'wednesday': 3, 'thu': 4, 'thurs': 4, 'thursday': 4,
            'fri': 5, 'friday': 5, 'sat': 6, 'saturday': 6
        };

        let enabledDays = enabledDaysRaw.toLowerCase().split(',').map(d => dayMap[d.trim()]).filter(d => d !== undefined);
        if (!weekends) {
            enabledDays = enabledDays.filter(d => d !== 0 && d !== 6);
        }

        const excludedDates = excludedDatesRaw.split(',')
            .map(d => d.trim())
            .filter(d => d !== "")
            .map(d => {
                const parts = d.split('/');
                if (parts.length === 3) {
                    let [m, day, y] = parts.map(p => parseInt(p));
                    if (y < 100) y += 2000;
                    return new Date(y, m - 1, day).toDateString();
                }
                return null;
            })
            .filter(d => d !== null);

        this.config = {
            enabledDays,
            startRange,
            endRange,
            excludedDates,
            hideDays: this.group.dataset.hideDays === "true",
            weekView: this.group.dataset.weekView === "true",
            disableHistory: this.group.dataset.disableHistory === "true",
            isInline: this.isInline
        };
    }

    _bindEvents() {
        const form = this.group.closest('form');
        if (form) {
            form.addEventListener('reset', () => {
                this.selectedDate = null;
                this.currentDate = new Date();
                if (this.config.weekView) this._alignWeekViewStart();
                setTimeout(() => this.render(), 0);
            });
        }

        // Navigation delegation locally to the container
        this.container.addEventListener('click', (e) => {
            const prevBtn = e.target.closest('.prev-month');
            const nextBtn = e.target.closest('.next-month');
            const dayBtn = e.target.closest('.day-btn');

            if (prevBtn && !prevBtn.disabled) {
                e.preventDefault();
                if (this.config.weekView) {
                    this.currentDate.setDate(this.currentDate.getDate() - 7);
                } else {
                    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                }
                this.render();
            } else if (nextBtn && !nextBtn.disabled) {
                e.preventDefault();
                if (this.config.weekView) {
                    this.currentDate.setDate(this.currentDate.getDate() + 7);
                } else {
                    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                }
                this.render();
            } else if (dayBtn && !dayBtn.disabled) {
                e.preventDefault();
                this.selectedDate = new Date(dayBtn.dataset.fullDate);
                this.input.value = this.selectedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                // Alert UI of change manually
                this.input.dispatchEvent(new Event('input', { bubbles: true }));
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
                
                if (!this.isInline) {
                    this.container.classList.add('hidden');
                    this.container.hidden = true;
                } else {
                    this.render();
                }
            }
        });

        // Direct Select Dropdown mapping
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('month-input') && e.target.tagName === 'SELECT') {
                this.currentDate.setMonth(e.target.selectedIndex);
                this.render();
            } else if (e.target.classList.contains('year-input') && !e.target.readOnly) {
                this.currentDate.setFullYear(parseInt(e.target.value));
                this.render();
            }
        });
    }

    render() {
        const datesGrid = this.container.querySelector('.dates');
        const monthInput = this.container.querySelector('.month-input');
        const yearInput = this.container.querySelector('.year-input');

        if (!datesGrid) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Sync header displays
        if (monthInput) {
            if (monthInput.tagName === 'SELECT') {
                monthInput.selectedIndex = month;
            } else {
                const monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                if (monthInput.tagName === 'INPUT') monthInput.value = monthsNames[month];
                else monthInput.textContent = monthsNames[month];
            }
        }
        
        if (yearInput) {
            if (yearInput.tagName === 'INPUT') yearInput.value = year;
            else yearInput.textContent = year;
        }

        datesGrid.innerHTML = '';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        today.setHours(0,0,0,0);

        // Compute Prev-Button rules based strictly on history flags
        const prevBtn = this.container.querySelector('.prev-month');
        if (prevBtn) {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '';
            prevBtn.style.cursor = '';

            if (this.config.disableHistory) {
                if (this.config.weekView) {
                    const currentWeekSun = new Date(today);
                    currentWeekSun.setDate(today.getDate() - today.getDay());
                    if (this.currentDate <= currentWeekSun) {
                        prevBtn.disabled = true;
                        prevBtn.style.opacity = '0.2';
                        prevBtn.style.cursor = 'not-allowed';
                    }
                } else {
                    if (year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth())) {
                        prevBtn.disabled = true;
                        prevBtn.style.opacity = '0.2';
                        prevBtn.style.cursor = 'not-allowed';
                    }
                }
            }
        }

        const daysContainer = this.container.querySelector('.days');
        
        if (this.config.hideDays) {
            const cols = this.config.enabledDays.length;
            if (daysContainer) daysContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            datesGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        } else {
            if (daysContainer) daysContainer.style.gridTemplateColumns = '';
            datesGrid.style.gridTemplateColumns = '';
        }

        if (daysContainer) {
            const daySpans = daysContainer.querySelectorAll('span');
            daySpans.forEach((span, index) => {
                if (this.config.hideDays) {
                    span.style.display = this.config.enabledDays.includes(index) ? '' : 'none';
                } else {
                    span.style.display = '';
                }
            });
        }

        const startLimit = new Date(today);
        startLimit.setDate(today.getDate() + this.config.startRange);
        
        let endLimit = null;
        if (this.config.endRange !== null) {
            endLimit = new Date(startLimit);
            endLimit.setDate(startLimit.getDate() + this.config.endRange);
        }

        let daysArray = [];

        if (this.config.weekView) {
            for (let i = 0; i < 7; i++) {
                const d = new Date(this.currentDate);
                d.setDate(d.getDate() + i);
                daysArray.push(d);
            }
        } else {
            if (!this.config.hideDays) {
                for (let i = 0; i < firstDay; i++) {
                    daysArray.push(null);
                }
            }
            for (let i = 1; i <= daysInMonth; i++) {
                daysArray.push(new Date(year, month, i));
            }
        }

        let firstRowStarted = false;

        daysArray.forEach(date => {
            if (date === null) {
                const empty = document.createElement('div');
                empty.className = 'empty';
                datesGrid.appendChild(empty);
                return;
            }

            const dateStr = date.toDateString();
            const dayOfWeek = date.getDay();

            const isDayEnabled = this.config.enabledDays.includes(dayOfWeek);
            const isInRange = date >= startLimit && (endLimit === null || date <= endLimit);
            const isExcluded = this.config.excludedDates.includes(dateStr);

            if (this.config.hideDays && !isDayEnabled) {
                return; 
            }

            if (this.config.hideDays && !firstRowStarted) {
                const emptyCount = this.config.enabledDays.indexOf(dayOfWeek);
                for (let j = 0; j < emptyCount; j++) {
                    const empty = document.createElement('div');
                    empty.className = 'empty';
                    datesGrid.appendChild(empty);
                }
                firstRowStarted = true;
            }

            const btn = document.createElement('button');
            btn.className = 'day-btn';
            btn.textContent = date.getDate();
            btn.dataset.fullDate = date.toISOString();
            btn.tabIndex = -1;
            
            if (!isDayEnabled || !isInRange || isExcluded) {
                btn.disabled = true;
            }

            if (this.selectedDate && dateStr === this.selectedDate.toDateString()) {
                btn.classList.add('selected');
            }

            if (dateStr === today.toDateString()) {
                btn.classList.add('today');
            }

            datesGrid.appendChild(btn);
        });
    }
}
