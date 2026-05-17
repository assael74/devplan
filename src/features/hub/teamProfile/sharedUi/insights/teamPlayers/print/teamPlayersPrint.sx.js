// teamProfile/sharedUi/insights/teamPlayers/print/teamPlayersPrint.sx.js

export const teamPlayersPrintSx = {
  root: {
    direction: 'rtl',
    width: '100%',
    p: '10mm',
    bgcolor: '#ffffff',
    color: '#111827',
    fontFamily: 'Arial, sans-serif',
  },

  header: {
    display: 'grid',
    gap: '4px',
    mb: '8mm',
    pb: '4mm',
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
    gap: '4px',
    p: '4mm',
    mb: '6mm',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    bgcolor: '#f9fafb',
    textAlign: 'left',
  },

  scopeTitle: {
    fontSize: 14,
    fontWeight: 700,
  },

  scopeText: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 1.45,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '3mm',
    mb: '5mm',
    //direction: 'rtl',
  },

  summaryCard: {
    p: '3mm',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    bgcolor: '#ffffff',
    display: 'grid',
    gap: '2px',
    //direction: 'rtl',
    textAlign: 'center',
  },

  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 1.25,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  profileCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: '2mm',
    mb: '5mm',
    direction: 'rtl',
  },

  profileCard: {
    p: '2.5mm',
    border: '1px solid #d1d5db',
    borderRadius: '7px',
    bgcolor: '#ffffff',
    display: 'grid',
    gap: '1px',
    minHeight: '13mm',
    alignContent: 'center',
    textAlign: 'center',
    direction: 'rtl',
  },

  profileCardLabel: {
    fontSize: 8.5,
    color: '#4b5563',
    lineHeight: 1.2,
    fontWeight: 600,
  },

  profileCardValue: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.2,
  },

  tableWrap: {
    width: '100%',
    overflow: 'visible',
    direction: 'rtl',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontSize: 9.5,
    direction: 'rtl',
  },

  th: {
    border: '1px solid #d1d5db',
    bgcolor: '#f3f4f6',
    color: '#111827',
    fontWeight: 700,
    p: '5px 4px',
    textAlign: 'center',
    verticalAlign: 'middle',
    direction: 'rtl',
  },

  tdImpact: (tone = 'neutral') => {
    const colors = {
      positive: {
        bg: '#ecfdf3',
        border: '#bbf7d0',
        color: '#166534',
      },
      negative: {
        bg: '#fef2f2',
        border: '#fecaca',
        color: '#991b1b',
      },
      neutral: {
        bg: '#ffffff',
        border: '#e5e7eb',
        color: '#374151',
      },
    }

    const palette = colors[tone] || colors.neutral

    return {
      border: `1px solid ${palette.border}`,
      p: '5px 4px',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.35,
      fontWeight: 700,
      bgcolor: palette.bg,
      color: palette.color,
      direction: 'rtl',
    }
  },

  td: {
    border: '1px solid #e5e7eb',
    p: '5px 4px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.35,
    wordBreak: 'break-word',
    direction: 'rtl',
  },

  tdNote: {
    border: '1px solid #e5e7eb',
    p: '5px 4px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 0,
    color: '#374151',
    direction: 'rtl',
  },

  muted: {
    color: '#6b7280',
  },

  legendSection: {
    mt: '6mm',
    pt: '4mm',
    borderTop: '1px solid #e5e7eb',
    display: 'grid',
    gap: '3mm',
    textAlign: 'left',
  },

  legendSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
  },

  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '2.5mm',
  },

  legendItem: {
    p: '3mm',
    border: '1px solid #e5e7eb',
    borderRadius: '7px',
    bgcolor: '#f9fafb',
    display: 'grid',
    gap: '1mm',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    textAlign: 'left',
  },

  legendTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.25,
  },

  legendText: {
    fontSize: 9.5,
    color: '#4b5563',
    lineHeight: 1.35,
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
