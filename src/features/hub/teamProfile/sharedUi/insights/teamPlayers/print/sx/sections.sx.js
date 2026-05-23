// TEAMPROFILE/sharedUi/insights/teamPlayers/print/sx/sections.sx.js

export const sectionsSx = {
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '2.5mm',
    mb: '5mm',
  },

  summaryCard: {
    p: '2.75mm',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    bgcolor: '#ffffff',
    display: 'grid',
    gap: '2px',
    textAlign: 'center',
  },

  summaryLabel: {
    fontSize: 9.5,
    color: '#6b7280',
    lineHeight: 1.25,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  sectionsWrap: {
    display: 'grid',
    gap: '5mm',
  },

  roleSection: {
    display: 'grid',
    gap: '3mm',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  roleHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '3mm',
    p: '3mm',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    bgcolor: '#f3f4f6',
    textAlign: 'left',
  },

  roleHeaderText: {
    display: 'grid',
    gap: '1mm',
    minWidth: 0,
    textAlign: 'left',
  },

  roleTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.25,
    textAlign: 'left',
  },

  roleSub: {
    fontSize: 10.5,
    color: '#4b5563',
    lineHeight: 1.35,
    textAlign: 'left',
  },

  roleBadge: {
    px: '2.5mm',
    py: '1mm',
    border: '1px solid #d1d5db',
    borderRadius: '999px',
    bgcolor: '#ffffff',
    fontSize: 10,
    fontWeight: 700,
    color: '#374151',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },

  roleSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '2mm',
  },

  roleSummaryCard: {
    p: '2.25mm',
    border: '1px solid #e5e7eb',
    borderRadius: '7px',
    bgcolor: '#ffffff',
    display: 'grid',
    gap: '1px',
    textAlign: 'center',
  },

  roleSummaryLabel: {
    fontSize: 8.5,
    color: '#6b7280',
    lineHeight: 1.2,
  },

  roleSummaryValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.2,
  },

  recommendationsSection: {
    mt: '6mm',
    pt: '4mm',
    borderTop: '1px solid #e5e7eb',
    display: 'grid',
    gap: '3mm',
    textAlign: 'left',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#111827',
  },

  recommendationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '3mm',
  },

  recommendationItem: {
    p: '3mm',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    bgcolor: '#f9fafb',
    display: 'grid',
    gap: '1.5mm',
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    textAlign: 'left',
  },

  recommendationTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.3,
  },

  recommendationText: {
    fontSize: 9.5,
    color: '#4b5563',
    lineHeight: 1.45,
  },
}
