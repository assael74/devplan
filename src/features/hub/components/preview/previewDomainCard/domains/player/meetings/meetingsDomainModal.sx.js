// src/features/players/components/preview/PreviewDomainCard/domains/meetings/meetingsDomainModal.sx.js
export const sx = {
  // Summary
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 0.9,
    py: 0.6,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  },
  // Modal
  modalFooter: {
    position: 'sticky',
    bottom: 0,
    mt: 2,
    pt: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    gap: 1,
    backgroundColor: 'background.body',
    borderTop: '1px solid',
    borderColor: 'divider',
    zIndex: 2,
  },
  topBar: { p: 1, borderRadius: 'md', mb: 1 },
  topBarRow: { display: 'flex', alignItems: 'center', gap: 1 },
  tableWrap: { borderRadius: 'md', overflow: 'hidden' },
  table: {
    '--TableCell-paddingY': '10px',
    '--TableCell-paddingX': '10px',
  },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 1 },

  // Drawer
  drawerRoot: { zIndex: 1400 },

  drawerContent: {
    minHeight: { xs: '50vh', md: '25vh' },
    maxHeight: { xs: '78vh', md: '40vh' },
    overflow: 'auto',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 'lg',
    borderTopRightRadius: 'lg',
  },
  drawerContentBasic: {
    // basic is typically shorter
    minHeight: { xs: '40vh', md: '20vh' },
    maxHeight: { xs: '70vh', md: '40vh' },
    overflow: 'auto',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 'lg',
    borderTopRightRadius: 'lg',
  },

  drawerHeaderSx: {
    root: { p: 1 },
    row: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 },
    left: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start' },
    center: { minWidth: 0 },
    meta: { opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    right: { display: 'flex', alignItems: 'center', gap: 1 },
    player: { display: 'flex', alignItems: 'center', gap: 0.75 },
    playerName: { whiteSpace: 'nowrap', textAlign: 'right' },
    saveBtn: { flexShrink: 0 },
  },

  drawerBody: {
    p: 1,
    display: 'grid',
    gap: 1,
    maxWidth: 920,
    margin: '0 auto',
    width: '100%',
    px: { xs: 1.5, md: 0 },
  },

  // Forms
  grid2: { display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } },
  grid3: { display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '0.75fr 0.75fr 0fr 1.5fr' } },

  card: { p: 1, borderRadius: 'md' },
  cardTitle: { mb: 1 },

  // Videos
  videosHeader: { display: 'flex', alignItems: 'center', gap: 1 },
  videosList: { display: 'grid', gap: 0.8 },
  emptyText: { opacity: 0.7 },

  videoRow: { p: 0.8, borderRadius: 'md', mt: 1 },
  videoRowGrid: { display: 'grid', gap: 0.8, alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: '1fr 44px' } },
}
