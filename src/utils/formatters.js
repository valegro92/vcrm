/**
 * Utility functions for formatting values across the application
 * Centralizes all formatting logic to ensure consistency
 */

/**
 * Format a number as Italian currency (Euro)
 * @param {number|string} value - The value to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.compact - Use compact notation (K, M) for large numbers
 * @param {boolean} options.showDecimals - Show decimal places
 * @param {number} options.decimals - Number of decimal places (default: 0 for compact, 2 otherwise)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, options = {}) {
    const { compact = true, showDecimals = false, decimals } = options;
    const num = parseFloat(value) || 0;

    if (compact) {
        if (num >= 1000000) {
            return `€${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `€${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
        }
    }

    const decimalPlaces = decimals ?? (showDecimals ? 2 : 0);

    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
    }).format(num);
}

/**
 * Format a date string for display
 * @param {string|Date} dateStr - The date to format
 * @param {string} format - Format type: 'short', 'medium', 'long', 'relative'
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr, format = 'short') {
    if (!dateStr) return 'N/D';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/D';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Relative format for recent dates
    if (format === 'relative') {
        if (isSameDay(date, today)) return 'Oggi';
        if (isSameDay(date, tomorrow)) return 'Domani';
        if (isSameDay(date, yesterday)) return 'Ieri';
    }

    const formatOptions = {
        short: { day: '2-digit', month: '2-digit', year: '2-digit' },
        medium: { day: 'numeric', month: 'short', year: 'numeric' },
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        monthDay: { day: 'numeric', month: 'short' },
        monthYear: { month: 'long', year: 'numeric' }
    };

    return date.toLocaleDateString('it-IT', formatOptions[format] || formatOptions.short);
}

/**
 * Format a date for display with relative labels for today/tomorrow
 * @param {string|Date} dateStr - The date to format
 * @returns {string} Formatted date with relative labels
 */
export function formatDateRelative(dateStr) {
    if (!dateStr) return 'Nessuna scadenza';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Nessuna scadenza';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(date, today)) return 'Oggi';
    if (isSameDay(date, tomorrow)) return 'Domani';

    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

/**
 * Check if two dates are the same day
 * @param {Date} date1
 * @param {Date} date2
 * @returns {boolean}
 */
export function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

/**
 * Check if a date is in the past (before today)
 * @param {string|Date} dateStr - The date to check
 * @returns {boolean}
 */
export function isOverdue(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
}

/**
 * Check if a date is today
 * @param {string|Date} dateStr - The date to check
 * @returns {boolean}
 */
export function isToday(dateStr) {
    if (!dateStr) return false;
    return isSameDay(new Date(dateStr), new Date());
}

/**
 * Format a percentage value
 * @param {number} value - The percentage value (0-100 or 0-1)
 * @param {Object} options - Formatting options
 * @param {boolean} options.isDecimal - If true, value is 0-1 instead of 0-100
 * @param {number} options.decimals - Number of decimal places
 * @param {boolean} options.showSymbol - Whether to show % symbol
 * @returns {string}
 */
export function formatPercentage(value, options = {}) {
    const { isDecimal = false, decimals = 0, showSymbol = true } = options;
    const num = parseFloat(value) || 0;
    const percentage = isDecimal ? num * 100 : num;
    const formatted = percentage.toFixed(decimals);
    return showSymbol ? `${formatted}%` : formatted;
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @param {number} maxLength - Maximum number of initials (default: 2)
 * @returns {string}
 */
export function getInitials(name, maxLength = 2) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, maxLength).toUpperCase();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format a number with thousand separators (Italian format)
 * @param {number|string} value - The value to format
 * @returns {string}
 */
export function formatNumber(value) {
    const num = parseFloat(value) || 0;
    return num.toLocaleString('it-IT');
}

export default {
    formatCurrency,
    formatDate,
    formatDateRelative,
    formatPercentage,
    formatNumber,
    getInitials,
    truncate,
    isOverdue,
    isToday,
    isSameDay
};
