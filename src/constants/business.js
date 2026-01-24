/**
 * Business constants for VAIB CRM
 * Centralizes all business logic constants
 */

// ============================================
// FORFETTARIO (Italian Tax Regime)
// ============================================

/**
 * Annual revenue limit for forfettario tax regime (€85,000)
 * This is the maximum INCASSATO (received payments) per year
 */
export const FORFETTARIO_LIMIT = 85000;

/**
 * Warning threshold - show warning when reaching this percentage of limit
 */
export const FORFETTARIO_WARNING_THRESHOLD = 0.75; // 75%

/**
 * Danger threshold - show danger alert when reaching this percentage
 */
export const FORFETTARIO_DANGER_THRESHOLD = 0.90; // 90%

/**
 * Get forfettario status based on current incassato
 * @param {number} incassato - Total received payments for the year
 * @returns {Object} Status info
 */
export function getForfettarioStatus(incassato) {
    const progress = incassato / FORFETTARIO_LIMIT;
    const remaining = FORFETTARIO_LIMIT - incassato;

    return {
        incassato,
        limit: FORFETTARIO_LIMIT,
        remaining: Math.max(0, remaining),
        progress,
        progressPercent: progress * 100,
        isWarning: progress >= FORFETTARIO_WARNING_THRESHOLD && progress < FORFETTARIO_DANGER_THRESHOLD,
        isDanger: progress >= FORFETTARIO_DANGER_THRESHOLD,
        isOver: progress >= 1,
        status: progress >= 1 ? 'over' :
                progress >= FORFETTARIO_DANGER_THRESHOLD ? 'danger' :
                progress >= FORFETTARIO_WARNING_THRESHOLD ? 'warning' : 'ok'
    };
}

// ============================================
// DATE & YEAR UTILITIES
// ============================================

/**
 * Get current year
 */
export const CURRENT_YEAR = new Date().getFullYear();

/**
 * Default payment terms in days
 */
export const DEFAULT_PAYMENT_DAYS = 30;

/**
 * Generate an array of year options for dropdowns
 * @param {number} startOffset - Years before current year (negative = past)
 * @param {number} endOffset - Years after current year
 * @returns {number[]} Array of years
 */
export function generateYearOptions(startOffset = -2, endOffset = 2) {
    const years = [];
    for (let i = startOffset; i <= endOffset; i++) {
        years.push(CURRENT_YEAR + i);
    }
    return years;
}

/**
 * Default year options for selectors
 */
export const DEFAULT_YEAR_OPTIONS = generateYearOptions(-2, 2);

/**
 * Get default year for new records (current year)
 */
export function getDefaultYear() {
    return CURRENT_YEAR;
}

// ============================================
// PIPELINE PROBABILITIES
// ============================================

/**
 * Default probabilities for each pipeline stage
 */
export const STAGE_PROBABILITIES = {
    'Lead': 10,
    'In contatto': 30,
    'Follow Up da fare': 50,
    'Revisionare offerta': 75,
    'Chiuso Vinto': 100,
    'Chiuso Perso': 0
};

/**
 * Get probability for a stage
 * @param {string} stage - Pipeline stage name
 * @returns {number} Probability percentage
 */
export function getStageProbability(stage) {
    return STAGE_PROBABILITIES[stage] ?? 30;
}

// ============================================
// CONTACT STATUSES
// ============================================

export const CONTACT_STATUSES = ['Lead', 'Prospect', 'Cliente'];

export const CONTACT_STATUS_COLORS = {
    'Lead': { bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#3730a3' },
    'Prospect': { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#92400e' },
    'Cliente': { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46' }
};

/**
 * Get color config for a contact status
 * @param {string} status - Contact status
 * @returns {Object} Color configuration { bg, color }
 */
export function getContactStatusColor(status) {
    return CONTACT_STATUS_COLORS[status] || CONTACT_STATUS_COLORS['Lead'];
}

// ============================================
// TASK PRIORITIES
// ============================================

export const TASK_PRIORITIES = ['Alta', 'Media', 'Bassa'];

export const TASK_PRIORITY_COLORS = {
    'Alta': { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' },
    'Media': { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    'Bassa': { bg: '#d1fae5', color: '#059669', border: '#a7f3d0' }
};

/**
 * Get color config for a task priority
 * @param {string} priority - Task priority
 * @returns {Object} Color configuration
 */
export function getTaskPriorityColor(priority) {
    const key = priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();
    return TASK_PRIORITY_COLORS[key] || TASK_PRIORITY_COLORS['Media'];
}

// ============================================
// TASK TYPES
// ============================================

export const TASK_TYPES = ['Chiamata', 'Email', 'Meeting', 'Documento'];

export const TASK_TYPE_COLORS = {
    'Chiamata': { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' },
    'Email': { bg: '#cffafe', color: '#0891b2', border: '#a5f3fc' },
    'Meeting': { bg: '#ede9fe', color: '#7c3aed', border: '#ddd6fe' },
    'Documento': { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' }
};

/**
 * Get color config for a task type
 * @param {string} type - Task type
 * @returns {Object} Color configuration
 */
export function getTaskTypeColor(type) {
    return TASK_TYPE_COLORS[type] || TASK_TYPE_COLORS['Documento'];
}

// ============================================
// PROJECT STATUSES
// ============================================

export const PROJECT_STATUSES = [
    { id: 'in_lavorazione', label: 'In Lavorazione', color: 'blue' },
    { id: 'in_revisione', label: 'In Revisione', color: 'orange' },
    { id: 'consegnato', label: 'Consegnato', color: 'green' },
    { id: 'chiuso', label: 'Chiuso', color: 'purple' },
    { id: 'archiviato', label: 'Archiviato', color: 'gray' }
];

/**
 * Get project status config by id
 * @param {string} statusId - Project status ID
 * @returns {Object} Status configuration
 */
export function getProjectStatus(statusId) {
    return PROJECT_STATUSES.find(s => s.id === statusId) || PROJECT_STATUSES[0];
}

// ============================================
// MONTH NAMES
// ============================================

export const MONTH_NAMES_SHORT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
export const MONTH_NAMES_LONG = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
export const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export default {
    // Forfettario
    FORFETTARIO_LIMIT,
    FORFETTARIO_WARNING_THRESHOLD,
    FORFETTARIO_DANGER_THRESHOLD,
    getForfettarioStatus,
    // Dates
    CURRENT_YEAR,
    DEFAULT_PAYMENT_DAYS,
    DEFAULT_YEAR_OPTIONS,
    generateYearOptions,
    getDefaultYear,
    MONTH_NAMES_SHORT,
    MONTH_NAMES_LONG,
    DAY_NAMES_SHORT,
    // Pipeline
    STAGE_PROBABILITIES,
    getStageProbability,
    // Contacts
    CONTACT_STATUSES,
    CONTACT_STATUS_COLORS,
    getContactStatusColor,
    // Tasks
    TASK_PRIORITIES,
    TASK_PRIORITY_COLORS,
    getTaskPriorityColor,
    TASK_TYPES,
    TASK_TYPE_COLORS,
    getTaskTypeColor,
    // Projects
    PROJECT_STATUSES,
    getProjectStatus
};
