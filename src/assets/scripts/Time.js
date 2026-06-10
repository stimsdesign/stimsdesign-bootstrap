/**
 * Client-side formatting function with timezone support
 */
function formatTime(date, fmt, tz) {
    try {
        const options = {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: tz || undefined,
        };
        
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(date);
        
        const p = (type) => parts.find(part => part.type === type)?.value || '00';
        
        const h24 = parseInt(p('hour'));
        const m = p('minute');
        const s = p('second');
        
        const h12 = h24 % 12 || 12;
        const am = h24 >= 12 ? 'pm' : 'am';
        const AM = h24 >= 12 ? 'PM' : 'AM';

        const tokens = {
            'hh': h12.toString().padStart(2, '0'),
            'h': h12.toString(),
            'HH': h24.toString().padStart(2, '0'),
            'H': h24.toString(),
            'mm': m.padStart(2, '0'),
            'm': m.replace(/^0/, ''),
            'ss': s.padStart(2, '0'),
            's': s.replace(/^0/, ''),
            'a': am,
            'A': AM
        };

        return fmt.replace(/hh|h|HH|H|mm|m|ss|s|a|A/g, matched => tokens[matched]);
    } catch (e) {
        console.error('Invalid Timezone:', tz);
        return "Invalid TZ";
    }
}

/**
 * Update all time elements on the page
 */
function updateTimes() {
    const elements = document.querySelectorAll('time[data-time-format]');
    if (elements.length === 0) return;
    
    const now = new Date();
    elements.forEach(el => {
        const fmt = el.getAttribute('data-time-format');
        const tz = el.getAttribute('data-timezone');
        if (fmt) {
            el.textContent = formatTime(now, fmt, tz || undefined);
        }
    });
}

let intervalId = null;

/**
 * Start the synchronization interval
 */
function init() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    const elements = document.querySelectorAll('time[data-time-format]');
    if (elements.length === 0) return;

    updateTimes();

    const needsSeconds = Array.from(elements).some(el => {
        const fmt = el.getAttribute('data-time-format');
        return fmt && (fmt.includes('s') || fmt.includes('ss'));
    });

    intervalId = window.setInterval(updateTimes, needsSeconds ? 1000 : 30000);
}

document.addEventListener('astro:page-load', init);
