// src/features/bulkActions/players/delete/sx/playersDeleteModal.sx.js

export const playersDeleteModalSx = {
  root: {
    display: 'grid',
    placeItems: 'center',
    p: 1.5,
  },

  motionWrap: {
    width: '100%',
    maxWidth: 920,
    maxHeight: 'calc(100dvh - 32px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dialog: {
    width: '100%',
    maxWidth: 920,
    maxHeight: 'calc(100dvh - 32px)',
    minHeight: 0,
    p: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    borderRadius: 'lg',
  },

  header: {
    minHeight: 64,
    px: 2,
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  headerLeft: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
  },

  headerIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    color: 'danger.500',
    bgcolor: 'danger.softBg',
  },

  titleWrap: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  kicker: {
    color: 'danger.500',
    fontWeight: 700,
  },

  title: {
    lineHeight: 1.2,
  },

  dialogContent: {
    minHeight: 0,
    p: 0,
  },

  content: {
    minHeight: 0,
    height: '100%',
    overflow: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1.5,
    p: 2,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 1,
  },

  summaryCard: {
    minWidth: 0,
    p: 1.25,
    display: 'grid',
    gap: 0.25,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
    bgcolor: 'background.surface',
  },

  previewBox: {
    maxHeight: '34dvh',
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'md',
  },

  previewTable: {
    minWidth: 700,
    '--TableCell-paddingX': '8px',
    '--TableCell-paddingY': '6px',

    '& th': {
      whiteSpace: 'nowrap',
    },

    '& td': {
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
    },
  },

  confirmBox: {
    display: 'grid',
    gap: 1,
    p: 1.5,
    border: '1px solid',
    borderColor: 'danger.outlinedBorder',
    borderRadius: 'md',
    bgcolor: 'danger.softBg',
  },

  confirmLabel: {
    mb: 0.5,
  },

  footer: {
    minHeight: 68,
    px: 2,
    py: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  confirmButton: {
    minWidth: 126,
  },
}
