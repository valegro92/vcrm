/**
 * Custom hook for drag and drop functionality
 * Reusable across Pipeline, Invoices, and Projects components
 */

import { useState, useCallback } from 'react';

/**
 * @typedef {Object} DragAndDropState
 * @property {any} draggedItem - Currently dragged item
 * @property {string|null} dragOverColumn - Column being dragged over
 * @property {boolean} isDragging - Whether a drag is in progress
 * @property {boolean} isUpdating - Whether an async update is in progress
 */

/**
 * @typedef {Object} DragAndDropHandlers
 * @property {Function} handleDragStart - Handler for drag start
 * @property {Function} handleDragEnd - Handler for drag end
 * @property {Function} handleDragOver - Handler for drag over
 * @property {Function} handleDragLeave - Handler for drag leave
 * @property {Function} handleDrop - Handler for drop
 */

/**
 * Custom hook for managing drag and drop state and handlers
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onDrop - Async callback when item is dropped on a new column
 *   Signature: (item, newColumnId, oldColumnId) => Promise<void>
 * @param {Function} [options.getItemColumn] - Function to get the current column of an item
 *   Signature: (item) => string
 * @param {Function} [options.onError] - Error handler callback
 *   Signature: (error) => void
 * @param {Function} [options.onSuccess] - Success callback after drop completes
 *   Signature: (item, newColumnId) => void
 *
 * @returns {[DragAndDropState, DragAndDropHandlers]}
 *
 * @example
 * const [dragState, dragHandlers] = useDragAndDrop({
 *   onDrop: async (item, newStage) => {
 *     await api.updateItemStage(item.id, newStage);
 *   },
 *   getItemColumn: (item) => item.stage,
 *   onError: (error) => toast.error(error.message)
 * });
 */
export function useDragAndDrop({
    onDrop,
    getItemColumn = (item) => item.stage || item.status,
    onError = console.error,
    onSuccess
}) {
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Handle drag start event
     * @param {DragEvent} e - Drag event
     * @param {any} item - Item being dragged
     */
    const handleDragStart = useCallback((e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';

        // Add visual feedback
        if (e.target) {
            e.target.classList?.add('dragging');
        }
    }, []);

    /**
     * Handle drag end event
     * @param {DragEvent} [e] - Drag event
     */
    const handleDragEnd = useCallback((e) => {
        setDraggedItem(null);
        setDragOverColumn(null);

        // Remove visual feedback
        if (e?.target) {
            e.target.classList?.remove('dragging');
        }
    }, []);

    /**
     * Handle drag over event on a column
     * @param {DragEvent} e - Drag event
     * @param {string} columnId - ID of the column being dragged over
     */
    const handleDragOver = useCallback((e, columnId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (dragOverColumn !== columnId) {
            setDragOverColumn(columnId);
        }
    }, [dragOverColumn]);

    /**
     * Handle drag leave event
     */
    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null);
    }, []);

    /**
     * Handle drop event
     * @param {DragEvent} e - Drop event
     * @param {string} newColumnId - ID of the target column
     */
    const handleDrop = useCallback(async (e, newColumnId) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedItem) {
            return;
        }

        const currentColumn = getItemColumn(draggedItem);

        // Don't do anything if dropped on the same column
        if (currentColumn === newColumnId) {
            setDraggedItem(null);
            return;
        }

        // Store item before clearing state
        const item = draggedItem;
        setDraggedItem(null);
        setIsUpdating(true);

        try {
            await onDrop(item, newColumnId, currentColumn);
            onSuccess?.(item, newColumnId);
        } catch (error) {
            onError(error);
        } finally {
            setIsUpdating(false);
        }
    }, [draggedItem, getItemColumn, onDrop, onError, onSuccess]);

    // State object
    const state = {
        draggedItem,
        dragOverColumn,
        isDragging: draggedItem !== null,
        isUpdating
    };

    // Handlers object
    const handlers = {
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop
    };

    return [state, handlers];
}

/**
 * Get CSS classes for a draggable item
 * @param {Object} state - Drag state from useDragAndDrop
 * @param {any} item - The item to check
 * @param {Function} [getId] - Function to get item ID (default: item.id)
 * @returns {string} CSS class string
 */
export function getDragItemClasses(state, item, getId = (i) => i.id) {
    const classes = [];

    if (state.draggedItem && getId(state.draggedItem) === getId(item)) {
        classes.push('dragging');
    }

    if (state.isUpdating) {
        classes.push('updating');
    }

    return classes.join(' ');
}

/**
 * Get CSS classes for a drop column
 * @param {Object} state - Drag state from useDragAndDrop
 * @param {string} columnId - Column ID to check
 * @returns {string} CSS class string
 */
export function getDropColumnClasses(state, columnId) {
    const classes = [];

    if (state.dragOverColumn === columnId) {
        classes.push('drag-over');
    }

    if (state.isDragging) {
        classes.push('can-drop');
    }

    return classes.join(' ');
}

export default useDragAndDrop;
