// TEAMPROFILE/sharedUi/insights/teamPlayers/print/sx/table.sx.js

export const tableSx = {
  tableWrap: {
    width: '100%',
    overflow: 'visible',
    direction: 'rtl',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    fontSize: 8.8,
    direction: 'rtl',
  },

  th: {
    border: '1px solid #d1d5db',
    backgroundColor: '#f3f4f6',
    color: '#111827',
    fontWeight: 700,
    padding: '5px 3px',
    textAlign: 'center',
    verticalAlign: 'middle',
    direction: 'rtl',
  },

  td: {
    border: '1px solid #e5e7eb',
    padding: '5px 3px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.35,
    wordBreak: 'break-word',
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
      padding: '5px 3px',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.35,
      fontWeight: 700,
      backgroundColor: palette.bg,
      color: palette.color,
      direction: 'rtl',
    }
  },

  tdNote: {
    border: '1px solid #e5e7eb',
    padding: '5px 3px',
    textAlign: 'center',
    verticalAlign: 'middle',
    lineHeight: 1.25,
    color: '#374151',
    direction: 'rtl',
  },

  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImg: {
    width: 26,
    height: 26,
    borderRadius: '999px',
    objectFit: 'cover',
    display: 'block',
  },

  avatarFallback: {
    width: 26,
    height: 26,
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
  },

  emptyText: {
    p: '3mm',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    bgcolor: '#f9fafb',
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
  },
}
