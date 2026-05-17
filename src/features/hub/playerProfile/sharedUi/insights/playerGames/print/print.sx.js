// playerProfile/sharedUi/insights/playerGames/print/print.sx.js

export const printSx = {
  root: {
    width: '100%',
    bgcolor: '#fff',
    color: '#111827',
    fontFamily: 'Assistant, Arial, sans-serif',
    display: 'grid',
    gap: 1.65,
  },

  headerRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 1,
    alignItems: 'center',
  },

  headerText: {
    display: 'grid',
    gap: 0.2,
    minWidth: 0,
  },

  avatarWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid #d1d5db',
    bgcolor: '#f3f4f6',
    overflow: 'hidden',
  },

  reportType: {
    fontSize: 11,
    fontWeight: 700,
    color: '#6b7280',
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
    color: '#111827',
  },

  subtitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#4b5563',
  },

  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 0.5,
  },

  metaItem: {
    border: '1px solid',
    borderColor: '#e5e7eb',
    bgcolor: '#fff',
    borderRadius: 8,
    p: 0.7,
    minHeight: 44,
    display: 'grid',
    alignContent: 'center',
    gap: 0.15,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  metaLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#6b7280',
  },

  metaValue: {
    fontSize: 11.5,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.15,
  },

  divider: {
    my: 0.15,
  },

  mainBox: {
    border: '1px solid',
    borderColor: '#dbeafe',
    bgcolor: '#eff6ff',
    borderRadius: 10,
    p: 1.15,
    display: 'grid',
    gap: 1,
    minHeight: 128,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  mainContent: {
    display: 'grid',
    gap: 0.2,
  },

  mainKicker: {
    fontSize: 10,
    fontWeight: 700,
    color: '#2563eb',
  },

  mainTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.15,
  },

  mainText: {
    fontSize: 11.5,
    fontWeight: 500,
    color: '#374151',
    lineHeight: 1.35,
  },

  mainAction: {
    fontSize: 10.5,
    fontWeight: 700,
    color: '#1d4ed8',
    lineHeight: 1.3,
  },

  factsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  smallFact: {
    border: '1px solid',
    borderColor: 'rgba(37, 99, 235, 0.18)',
    bgcolor: '#fff',
    borderRadius: 8,
    p: 0.6,
    display: 'grid',
    gap: 0.15,
  },

  smallFactLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#6b7280',
  },

  smallFactValue: {
    fontSize: 12.5,
    fontWeight: 700,
    color: '#111827',
  },

  mainMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 0.65,
  },

  metricCard: {
    border: '1px solid',
    borderColor: '#e5e7eb',
    bgcolor: '#fff',
    borderRadius: 9,
    p: 0.75,
    minHeight: 66,
    display: 'grid',
    alignContent: 'start',
    gap: 0.2,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  metricTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#6b7280',
    lineHeight: 1.1,
  },

  metricValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.1,
  },

  metricSub: {
    fontSize: 9,
    fontWeight: 500,
    color: '#4b5563',
    lineHeight: 1.2,
  },

  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 1.5,
    alignItems: 'start',
    mt: 2
  },

  section: {
    border: '1px solid',
    borderColor: '#e5e7eb',
    bgcolor: '#fff',
    borderRadius: 10,
    p: 0.95,
    display: 'grid',
    gap: 0.75,
    alignContent: 'start',
    minHeight: 122,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },

  sectionHeader: {
    display: 'grid',
    gap: 0.2,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#111827',
    lineHeight: 1.15,
  },

  sectionSummary: {
    fontSize: 10,
    fontWeight: 500,
    color: '#374151',
    lineHeight: 1.25,
  },

  sectionCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.6,
  },

  footer: {
    mt: 0.2,
    pt: 0.5,
    borderTop: '1px solid #e5e7eb',
  },

  footerText: {
    fontSize: 9,
    color: '#6b7280',
  },
}
