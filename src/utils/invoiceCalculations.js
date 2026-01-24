/**
 * Invoice calculation utilities for VAIB CRM
 * Centralizes all invoice-related calculations for consistency
 *
 * IMPORTANT: For forfettario tax regime, what matters is:
 * - INCASSATO (received payments) based on paidDate, not issueDate
 * - The year of paidDate determines the fiscal year
 */

import { INVOICE_STATUS } from '../constants/invoiceStatuses';
import {
    FORFETTARIO_LIMIT,
    FORFETTARIO_WARNING_THRESHOLD,
    FORFETTARIO_DANGER_THRESHOLD
} from '../constants/business';

/**
 * Filter invoices by year based on a specific date field
 * @param {Array} invoices - Array of invoice objects
 * @param {number|string} year - Year to filter by (or 'all' for no filter)
 * @param {string} dateField - Date field to use for filtering ('issueDate', 'paidDate', etc.)
 * @returns {Array} Filtered invoices
 */
export function filterInvoicesByYear(invoices, year, dateField = 'issueDate') {
    if (!invoices || !Array.isArray(invoices)) return [];
    if (year === 'all' || !year) return invoices;

    const targetYear = parseInt(year);

    return invoices.filter(invoice => {
        const dateValue = invoice[dateField];
        if (!dateValue) return false;

        const invoiceYear = new Date(dateValue).getFullYear();
        return invoiceYear === targetYear;
    });
}

/**
 * Calculate total fatturato (invoiced amount) for a given year
 * Based on issueDate - when the invoice was issued
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {number|string} year - Year to calculate for (or 'all')
 * @returns {number} Total fatturato
 */
export function calculateFatturato(invoices, year = 'all') {
    if (!invoices || !Array.isArray(invoices)) return 0;

    return invoices
        .filter(invoice => {
            // Must have issueDate
            if (!invoice.issueDate) return false;

            // Must be emessa or pagata
            if (invoice.status !== INVOICE_STATUS.EMESSA &&
                invoice.status !== INVOICE_STATUS.PAGATA) {
                return false;
            }

            // Filter by year if specified
            if (year !== 'all') {
                const issueYear = new Date(invoice.issueDate).getFullYear();
                if (issueYear !== parseInt(year)) return false;
            }

            return true;
        })
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
}

/**
 * Calculate total incassato (received payments) for a given year
 * Based on paidDate - when payment was received
 * THIS IS WHAT MATTERS FOR FORFETTARIO TAX REGIME
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {number|string} year - Year to calculate for (or 'all')
 * @returns {number} Total incassato
 */
export function calculateIncassato(invoices, year = 'all') {
    if (!invoices || !Array.isArray(invoices)) return 0;

    return invoices
        .filter(invoice => {
            // Must be paid
            if (invoice.status !== INVOICE_STATUS.PAGATA) return false;

            // Must have paidDate
            if (!invoice.paidDate) return false;

            // Filter by year if specified
            if (year !== 'all') {
                const paidYear = new Date(invoice.paidDate).getFullYear();
                if (paidYear !== parseInt(year)) return false;
            }

            return true;
        })
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
}

/**
 * Calculate total da incassare (pending payments)
 * Invoices that are issued but not yet paid
 *
 * @param {Array} invoices - Array of invoice objects
 * @returns {number} Total pending amount
 */
export function calculateDaIncassare(invoices) {
    if (!invoices || !Array.isArray(invoices)) return 0;

    return invoices
        .filter(invoice => invoice.status === INVOICE_STATUS.EMESSA)
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
}

/**
 * Calculate total da emettere (to be issued)
 * Invoices that are planned but not yet issued
 *
 * @param {Array} invoices - Array of invoice objects
 * @returns {number} Total to issue amount
 */
export function calculateDaEmettere(invoices) {
    if (!invoices || !Array.isArray(invoices)) return 0;

    return invoices
        .filter(invoice => invoice.status === INVOICE_STATUS.DA_EMETTERE)
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
}

/**
 * Calculate overdue amount (invoices past due date)
 *
 * @param {Array} invoices - Array of invoice objects
 * @returns {number} Total overdue amount
 */
export function calculateOverdue(invoices) {
    if (!invoices || !Array.isArray(invoices)) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices
        .filter(invoice => {
            if (invoice.status !== INVOICE_STATUS.EMESSA) return false;
            if (!invoice.dueDate) return false;

            const dueDate = new Date(invoice.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate < today;
        })
        .reduce((sum, invoice) => sum + (parseFloat(invoice.amount) || 0), 0);
}

/**
 * Calculate forfettario stats for a given year
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {number|string} year - Year to calculate for
 * @returns {Object} Forfettario stats
 */
export function calculateForfettarioStats(invoices, year) {
    const incassato = calculateIncassato(invoices, year);
    const progress = incassato / FORFETTARIO_LIMIT;
    const remaining = FORFETTARIO_LIMIT - incassato;

    return {
        incassato,
        limit: FORFETTARIO_LIMIT,
        remaining: Math.max(0, remaining),
        progress,
        progressPercent: Math.min(100, progress * 100),
        isWarning: progress >= FORFETTARIO_WARNING_THRESHOLD && progress < FORFETTARIO_DANGER_THRESHOLD,
        isDanger: progress >= FORFETTARIO_DANGER_THRESHOLD,
        isOver: progress >= 1,
        status: progress >= 1 ? 'over' :
                progress >= FORFETTARIO_DANGER_THRESHOLD ? 'danger' :
                progress >= FORFETTARIO_WARNING_THRESHOLD ? 'warning' : 'ok'
    };
}

/**
 * Calculate all invoice stats for a given year
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {number|string} year - Year to calculate for (or 'all')
 * @returns {Object} Complete invoice stats
 */
export function calculateInvoiceStats(invoices, year = 'all') {
    const fatturato = calculateFatturato(invoices, year);
    const incassato = calculateIncassato(invoices, year);
    const daIncassare = calculateDaIncassare(invoices);
    const daEmettere = calculateDaEmettere(invoices);
    const overdue = calculateOverdue(invoices);
    const forfettario = year !== 'all' ? calculateForfettarioStats(invoices, year) : null;

    // Count by status
    const counts = {
        total: invoices?.length || 0,
        daEmettere: invoices?.filter(i => i.status === INVOICE_STATUS.DA_EMETTERE).length || 0,
        emesse: invoices?.filter(i => i.status === INVOICE_STATUS.EMESSA).length || 0,
        pagate: invoices?.filter(i => i.status === INVOICE_STATUS.PAGATA).length || 0
    };

    return {
        fatturato,
        incassato,
        daIncassare,
        daEmettere,
        overdue,
        forfettario,
        counts,
        year
    };
}

/**
 * Calculate monthly breakdown of invoices
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {number} year - Year to calculate for
 * @returns {Array} Array of 12 monthly stats objects
 */
export function calculateMonthlyBreakdown(invoices, year) {
    const months = Array.from({ length: 12 }, (_, index) => ({
        month: index,
        fatturato: 0,
        incassato: 0,
        count: 0
    }));

    if (!invoices || !Array.isArray(invoices)) return months;

    invoices.forEach(invoice => {
        // Fatturato by issueDate
        if (invoice.issueDate &&
            (invoice.status === INVOICE_STATUS.EMESSA || invoice.status === INVOICE_STATUS.PAGATA)) {
            const issueDate = new Date(invoice.issueDate);
            if (issueDate.getFullYear() === year) {
                const month = issueDate.getMonth();
                months[month].fatturato += parseFloat(invoice.amount) || 0;
                months[month].count++;
            }
        }

        // Incassato by paidDate
        if (invoice.paidDate && invoice.status === INVOICE_STATUS.PAGATA) {
            const paidDate = new Date(invoice.paidDate);
            if (paidDate.getFullYear() === year) {
                const month = paidDate.getMonth();
                months[month].incassato += parseFloat(invoice.amount) || 0;
            }
        }
    });

    // Calculate cumulative values
    let cumFatturato = 0;
    let cumIncassato = 0;

    return months.map(m => {
        cumFatturato += m.fatturato;
        cumIncassato += m.incassato;

        return {
            ...m,
            cumFatturato,
            cumIncassato
        };
    });
}

/**
 * Get invoices that should appear for a given year
 * Shows invoices that have any activity in the year
 *
 * @param {Array} invoices - Array of invoice objects
 * @param {number|string} year - Year to filter
 * @returns {Array} Filtered invoices
 */
export function getInvoicesForYear(invoices, year) {
    if (!invoices || !Array.isArray(invoices)) return [];
    if (year === 'all') return invoices;

    const targetYear = parseInt(year);

    return invoices.filter(invoice => {
        // Show if issued in this year
        if (invoice.issueDate) {
            const issueYear = new Date(invoice.issueDate).getFullYear();
            if (issueYear === targetYear) return true;
        }

        // Show if paid in this year
        if (invoice.paidDate) {
            const paidYear = new Date(invoice.paidDate).getFullYear();
            if (paidYear === targetYear) return true;
        }

        // Show if no dates set (draft invoices)
        if (!invoice.issueDate && !invoice.paidDate) return true;

        return false;
    });
}

/**
 * Check if an invoice has data consistency issues
 *
 * @param {Object} invoice - Invoice object
 * @returns {Array} Array of warning messages
 */
export function getInvoiceWarnings(invoice) {
    const warnings = [];

    // Paid without paidDate
    if (invoice.status === INVOICE_STATUS.PAGATA && !invoice.paidDate) {
        warnings.push('Fattura incassata senza data di incasso');
    }

    // Issued without issueDate
    if (invoice.status === INVOICE_STATUS.EMESSA && !invoice.issueDate) {
        warnings.push('Fattura emessa senza data di emissione');
    }

    // Past due
    if (invoice.status === INVOICE_STATUS.EMESSA && invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        if (dueDate < today) {
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            warnings.push(`Scaduta da ${daysOverdue} giorni`);
        }
    }

    return warnings;
}

export default {
    filterInvoicesByYear,
    calculateFatturato,
    calculateIncassato,
    calculateDaIncassare,
    calculateDaEmettere,
    calculateOverdue,
    calculateForfettarioStats,
    calculateInvoiceStats,
    calculateMonthlyBreakdown,
    getInvoicesForYear,
    getInvoiceWarnings
};
