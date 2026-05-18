// TEAMPROFILE/sharedUi/insights/teamPlayers/print/sx/base.sx.js

export const baseSx = {
  root: {
    direction: 'rtl',
    width: '100%',
    p: '8mm',
    bgcolor: '#ffffff',
    color: '#111827',
    fontFamily: 'Arial, sans-serif',
  },

  header: {
    display: 'grid',
    gap: '4px',
    mb: '5mm',
    pb: '3mm',
    borderBottom: '1px solid #d1d5db',
    direction: 'rtl',
    textAlign: 'right',
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.25,
  },

  subtitle: {
    fontSize: 13,
    color: '#4b5563',
  },

  scopeBox: {
    display: 'grid',
    gap: '3px',
    p: '3.5mm',
    mb: '4mm',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    bgcolor: '#f9fafb',
    textAlign: 'right',
    direction: 'rtl',
  },

  scopeTitle: {
    fontSize: 14,
    fontWeight: 700,
  },

  scopeText: {
    fontSize: 11,
    color: '#4b5563',
    lineHeight: 1.45,
  },

  footer: {
    mt: '6mm',
    pt: '3mm',
    borderTop: '1px solid #e5e7eb',
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'left',
  },
}
