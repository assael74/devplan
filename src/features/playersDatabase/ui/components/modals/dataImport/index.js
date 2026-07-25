// features/playersDatabase/ui/components/modals/dataImport/index.js

/**
 * Data import modal UI
 *
 * DataImportModal.js
 * - Orchestrates the import modal and preserves the public props contract.
 *
 * DataImportPasteArea.js
 * - Handles pasted tabular content and optional spreadsheet file selection.
 *
 * DataImportPreviewTable.js
 * - Renders preview rows, column headers and row validation state.
 *
 * DataImportPreviewCell.js
 * - Renders editable, read-only and select cells.
 *
 * DataImportStatusCell.js
 * - Displays row validity and validation messages.
 *
 * dataImport.model.js
 * - Holds default columns, option resolution and row-status logic.
 */

export { default as DataImportModal } from './DataImportModal.js'
export { default as DataImportPasteArea } from './DataImportPasteArea.js'
export { default as DataImportPreviewTable } from './DataImportPreviewTable.js'
