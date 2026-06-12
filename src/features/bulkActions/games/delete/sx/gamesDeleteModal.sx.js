// src/features/bulkActions/games/delete/sx/gamesDeleteModal.sx.js

export const gamesDeleteModalSx = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: { xs: 1, md: 0 },
  },

  motionWrap: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: { xs: 1, md: 2 },
    outline: 0,
  },

  dialog: {
    width: 'min(760px, 100%)',
    maxWidth: 760,
    p: 0,
    overflow: 'hidden',
    borderRadius: '18px',

    position: 'static',
    inset: 'auto',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    transform: 'none',
    m: 0,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1.5,
    px: 2,
    py: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'danger.softBg',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    minWidth: 0,
  },

  headerIcon: {
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '12px',
    bgcolor: 'background.surface',
    color: 'danger.600',
    flexShrink: 0,
  },

  titleWrap: {
    display: 'grid',
    gap: 0.15,
    minWidth: 0,
  },

  kicker: {
    fontWeight: 700,
    color: 'danger.600',
  },

  title: {
    fontWeight: 700,
  },

  dialogContent: {
    p: 0,
  },

  content: {
    maxHeight: {
      xs: 'calc(100dvh - 210px)',
      md: 'min(620px, calc(100dvh - 220px))',
    },
    overflow: 'auto',
    p: 2,
    display: 'grid',
    gap: 1.5,
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr',
      md: 'repeat(5, 1fr)',
    },
    gap: 1,
  },

  summaryCard: {
    p: 1,
    borderRadius: '14px',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  previewBox: {
    maxHeight: 260,
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: '14px',
  },

  confirmBox: {
    display: 'grid',
    gap: 1,
    p: 1.5,
    borderRadius: '14px',
    border: '1px solid',
    borderColor: 'danger.outlinedBorder',
    bgcolor: 'danger.softBg',
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 2,
    py: 1.25,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  confirmButton: {
    fontWeight: 700,
  },
}
