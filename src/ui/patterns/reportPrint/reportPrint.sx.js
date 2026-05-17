// src/ui/patterns/reportPrint/reportPrint.sx.js

export const reportPrintSx = {
  hiddenShell: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
  },

  printContent: {
    display: 'block',
    position: 'relative',
    width: '210mm',
    maxWidth: '210mm',
    height: 'auto',
    minHeight: 'auto',
    overflow: 'visible',
    bgcolor: '#fff',
    color: '#111827',
    boxSizing: 'border-box',
  },
}
