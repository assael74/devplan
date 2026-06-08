// src/features/squadSimulator/ui/components/sx/squadSimulator.sx.js

export const squadSimulatorSx = {
  page: {
    minHeight: '100%',
    bgcolor: '#f5f7fb',
    borderRadius: 'md',
    p: { xs: 1.5, md: '0 12px 12px' },
  },

  shell: {
    maxWidth: 1520,
    mx: 'auto',
    display: 'grid',
    gap: 1.25,
  },

  header: {
    display: 'flex',
    alignItems: { xs: 'stretch', md: 'center' },
    justifyContent: 'space-between',
    flexDirection: { xs: 'column-reverse', md: 'row' },
    gap: 1,
    mb: 0,
    pt: 0,
  },

  actions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1.25,
    alignItems: 'center',
    justifyContent: { xs: 'flex-start', md: 'flex-start' },
    flexWrap: 'wrap',
  },

  control: {
    '& .MuiFormLabel-root': {
      textAlign: 'right',
      alignSelf: 'flex-start',
    },
  },

  rtlField: {
    textAlign: 'right',
    '& input': {
      textAlign: 'right',
    },
    '& .MuiSelect-button': {
      textAlign: 'right',
      justifyContent: 'flex-start',
    },
  },

  layout: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', xl: '370px minmax(0, 1fr)' },
    gap: 2,
    alignItems: 'start',
  },

  panel: {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    bgcolor: '#fff',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
  },

  sidePanel: {
    position: { xs: 'static', xl: 'sticky' },
    top: 16,
    maxHeight: { xs: 'none', xl: 'calc(100vh - 250px)' },
    overflowY: { xs: 'visible', xl: 'auto' },
    scrollbarGutter: 'stable',
    height: '100%',
  },

  panelHeader: {
    px: 2,
    py: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  tierList: {
    p: 1,
    display: 'grid',
    gap: 1,
  },

  sideAccordionGroup: {
    pl: 1,
    py: 1,
    gap: 1,
    pr: 0,
    maxHeight: { xs: 'none', xl: '100%' },
    overflowY: { xs: 'visible', xl: 'auto' },
    '& .MuiAccordion-root': {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 8,
      bgcolor: '#fbfdff',
      overflow: 'hidden',
    },
    '& .MuiAccordionSummary-root': {
      px: 0.25,
      py: 0.75,
    },
    '& .MuiAccordionDetails-root': {
      p: 0,
    },
  },

  bankList: {
    display: 'grid',
    gap: 0.75,
    maxHeight: { xs: 'none', xl: 210 },
    overflowY: { xs: 'visible', xl: 'auto' },
    pr: 0.25,
  },

  bankRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 34px',
    gap: 0.5,
    alignItems: 'center',
    bgcolor: 'transparent',
  },

  sideSection: {
    display: 'grid',
    gap: 0.75,
    borderRadius: 8,
    p: 0,
    bgcolor: '#fbfdff',
    minHeight: { xs: 'none', xl: 210 },
    overflowY: { xs: 'visible', xl: 'auto' },
  },

  tierRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr minmax(82px, auto) minmax(58px, auto)',
    gap: 1,
    alignItems: 'center',
    border: '1px solid',
    borderColor: '#dbe3ef',
    borderRadius: 8,
    p: 0.75,
    bgcolor: '#fff',
  },

  sideSectionTitle: {
    px: 1,
    py: 0.75,
    border: '1px solid',
    borderColor: '#bfdbfe',
    bgcolor: '#eff6ff',
    borderRadius: 6,
    color: '#0f4c81',
  },

  tierCount: {
    display: 'grid',
    gap: 0.25,
    justifyItems: 'center',
    minWidth: 92,
    pt: 0.3,
  },

  pill: {
    justifySelf: 'start',
    minWidth: 58,
    textAlign: 'center',
  },
}
