/**
 * Invoice status constants for VAIB CRM
 * Single source of truth for invoice statuses across frontend and backend
 */

import { FileText, Clock, Check } from 'lucide-react';

// ============================================
// INVOICE STATUSES
// ============================================

/**
 * Valid invoice status values
 * IMPORTANT: These must match the backend exactly
 */
export const INVOICE_STATUS = {
    DA_EMETTERE: 'da_emettere',
    EMESSA: 'emessa',
    PAGATA: 'pagata'
};

/**
 * Array of all valid statuses (for validation)
 */
export const INVOICE_STATUSES = Object.values(INVOICE_STATUS);

/**
 * Ordered stages for Kanban display
 */
export const INVOICE_STAGES = [
    INVOICE_STATUS.DA_EMETTERE,
    INVOICE_STATUS.EMESSA,
    INVOICE_STATUS.PAGATA
];

/**
 * Configuration for each invoice status
 */
export const INVOICE_STATUS_CONFIG = {
    [INVOICE_STATUS.DA_EMETTERE]: {
        id: INVOICE_STATUS.DA_EMETTERE,
        label: 'Da Emettere',
        labelShort: 'Da Em.',
        description: 'Fattura da creare ed emettere',
        color: '#94a3b8',
        bgColor: '#f1f5f9',
        textColor: '#475569',
        icon: FileText,
        order: 1
    },
    [INVOICE_STATUS.EMESSA]: {
        id: INVOICE_STATUS.EMESSA,
        label: 'Emessa',
        labelShort: 'Emessa',
        description: 'Fattura emessa, in attesa di pagamento',
        color: '#f59e0b',
        bgColor: '#fef3c7',
        textColor: '#92400e',
        icon: Clock,
        order: 2
    },
    [INVOICE_STATUS.PAGATA]: {
        id: INVOICE_STATUS.PAGATA,
        label: 'Incassata',
        labelShort: 'Inc.',
        description: 'Fattura pagata e incassata',
        color: '#10b981',
        bgColor: '#d1fae5',
        textColor: '#065f46',
        icon: Check,
        order: 3
    }
};

/**
 * Get configuration for a specific status
 * @param {string} status - Invoice status
 * @returns {Object} Status configuration
 */
export function getInvoiceStatusConfig(status) {
    return INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG[INVOICE_STATUS.DA_EMETTERE];
}

/**
 * Get label for a status
 * @param {string} status - Invoice status
 * @param {boolean} short - Use short label
 * @returns {string}
 */
export function getInvoiceStatusLabel(status, short = false) {
    const config = getInvoiceStatusConfig(status);
    return short ? config.labelShort : config.label;
}

/**
 * Get color for a status
 * @param {string} status - Invoice status
 * @returns {string} Color hex code
 */
export function getInvoiceStatusColor(status) {
    return getInvoiceStatusConfig(status).color;
}

/**
 * Check if a status is valid
 * @param {string} status - Status to validate
 * @returns {boolean}
 */
export function isValidInvoiceStatus(status) {
    return INVOICE_STATUSES.includes(status);
}

/**
 * Get the next logical status in the workflow
 * @param {string} currentStatus - Current invoice status
 * @returns {string|null} Next status or null if at end
 */
export function getNextInvoiceStatus(currentStatus) {
    const currentIndex = INVOICE_STAGES.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === INVOICE_STAGES.length - 1) {
        return null;
    }
    return INVOICE_STAGES[currentIndex + 1];
}

/**
 * Get the previous status in the workflow
 * @param {string} currentStatus - Current invoice status
 * @returns {string|null} Previous status or null if at beginning
 */
export function getPreviousInvoiceStatus(currentStatus) {
    const currentIndex = INVOICE_STAGES.indexOf(currentStatus);
    if (currentIndex <= 0) {
        return null;
    }
    return INVOICE_STAGES[currentIndex - 1];
}

// ============================================
// INVOICE TYPES
// ============================================

export const INVOICE_TYPE = {
    EMESSA: 'emessa',       // Invoice we issue to clients
    RICEVUTA: 'ricevuta'    // Invoice we receive from suppliers (future use)
};

export const INVOICE_TYPES = Object.values(INVOICE_TYPE);

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate invoice data consistency
 * @param {Object} invoice - Invoice data
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateInvoiceData(invoice) {
    const errors = [];

    // Paid invoices must have paidDate
    if (invoice.status === INVOICE_STATUS.PAGATA && !invoice.paidDate) {
        errors.push('Una fattura incassata deve avere una data di incasso');
    }

    // Issued invoices must have issueDate
    if (invoice.status === INVOICE_STATUS.EMESSA && !invoice.issueDate) {
        errors.push('Una fattura emessa deve avere una data di emissione');
    }

    // dueDate should be >= issueDate
    if (invoice.issueDate && invoice.dueDate) {
        if (new Date(invoice.dueDate) < new Date(invoice.issueDate)) {
            errors.push('La data di scadenza non può essere precedente alla data di emissione');
        }
    }

    // paidDate should be >= issueDate
    if (invoice.issueDate && invoice.paidDate) {
        if (new Date(invoice.paidDate) < new Date(invoice.issueDate)) {
            errors.push('La data di incasso non può essere precedente alla data di emissione');
        }
    }

    // Amount must be positive
    if (invoice.amount !== undefined && invoice.amount !== null) {
        const amount = parseFloat(invoice.amount);
        if (isNaN(amount) || amount <= 0) {
            errors.push('L\'importo deve essere un numero positivo');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get required fields based on invoice status
 * @param {string} status - Invoice status
 * @returns {string[]} Required field names
 */
export function getRequiredFieldsForStatus(status) {
    const base = ['invoiceNumber', 'amount'];

    switch (status) {
        case INVOICE_STATUS.EMESSA:
            return [...base, 'issueDate', 'dueDate'];
        case INVOICE_STATUS.PAGATA:
            return [...base, 'issueDate', 'paidDate'];
        default:
            return base;
    }
}

export default {
    INVOICE_STATUS,
    INVOICE_STATUSES,
    INVOICE_STAGES,
    INVOICE_STATUS_CONFIG,
    getInvoiceStatusConfig,
    getInvoiceStatusLabel,
    getInvoiceStatusColor,
    isValidInvoiceStatus,
    getNextInvoiceStatus,
    getPreviousInvoiceStatus,
    INVOICE_TYPE,
    INVOICE_TYPES,
    validateInvoiceData,
    getRequiredFieldsForStatus
};
