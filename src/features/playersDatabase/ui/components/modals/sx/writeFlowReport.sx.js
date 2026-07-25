// features/playersDatabase/ui/components/modals/sx/writeFlowReport.sx.js

export const writeFlowReportSx = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
    minHeight: 0,
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },
  summaryItem: {
    p: 1.25,
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'divider',
  },
  label: {
    color: 'text.tertiary',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  },
  tableWrap: {
    overflow: 'auto',
    maxHeight: 280,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
  },
  technical: {
    m: 0,
    p: 1.25,
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: 12,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1,
  },
}
