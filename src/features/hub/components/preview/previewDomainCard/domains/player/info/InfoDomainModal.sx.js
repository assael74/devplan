// src/features/hub/components/preview/previewDomainCard/domains/player/info/InfoDomainModal.sx.js

export const sx = {
  root: { minWidth: 0 },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1.25,
  },

  headerText: { display: 'grid', gap: 0.25, minWidth: 0 },

  headerTitle: { lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  headerSub: { opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    flexShrink: 0,
    bgcolor: 'neutral.softBg',
    border: '1px solid',
    borderColor: 'divider',
  },

  sectionTitle: (mb = 0.5) => ({ mb }),

  namesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 1,
  },

  gridBase: {
    display: 'grid',
    gap: 1,
    alignItems: 'start',
    '& .MuiFormControl-root': { minWidth: 0 },
    '& input': { minWidth: 0 },
  },

  contactGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
    gap: 1,
    alignItems: 'start',
    '& .MuiFormControl-root': { minWidth: 0 },
    '& input': { minWidth: 0 },
  },

  statusGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr 2fr 2fr' },
    gap: 1,
    alignItems: 'start',
    '& .MuiFormControl-root': { minWidth: 0 },
    '& input': { minWidth: 0 },
  },

  actions: {
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end', // שומר ימין
    mt: 2,
  },
}
