// MeetingEditDrawer.sx.js

export const drawerSlotSx = {
  content: {
    sx: { bgcolor: 'transparent', p: 0, boxShadow: 'none' },
  },
}

export const sheetSx = {
  variant: 'outlined',
  sx: {
    width: '100vw',
    maxWidth: '100vw',
    height: { xs: '92vh', md: '78vh' },
    borderTopLeftRadius: { xs: 14, md: 16 },
    borderTopRightRadius: { xs: 14, md: 16 },
    boxShadow: 'lg',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.surface',
  },
}

export const headerSx = {
  sx: {
    px: { xs: 1.5, md: 2 },
    py: 1.1,
    display: 'flex',
    alignItems: 'center',
    gap: 1.1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: 'background.surface',
  },
}

export const headerTitleWrapSx = {
  sx: { minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1 },
}

export const headerTitleSx = {
  sx: { minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
}

export const headerChipSx = {
  sx: { flexShrink: 0 },
}

export const headerSubtitleSx = {
  sx: { opacity: 0.65, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
}

export const closeBtnSx = {
  sx: { borderRadius: 10 },
}

export const bodySx = {
  sx: {
    flex: 1,
    overflowY: 'auto',
    px: { xs: 1.5, md: 2 },
    py: { xs: 1.25, md: 1.5 },
    display: 'grid',
    gap: 1,
    alignItems: 'start',
  },
}

export const footerSx = {
  sx: {
    px: { xs: 1.5, md: 2 },
    py: 1.1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
    bgcolor: 'background.surface',
  },
}

export const gridBoxSx = {
  sx: {
    display: 'grid',
    gap: 1,
    alignItems: 'start',
    gridTemplateColumns: {
      xs: '1fr',
      md: '1.25fr 1.35fr 0.9fr 1.6fr',
    },
  }
}

export const sheetRowProps = {
  variant: "soft",
  sx: {
    p: 1,
    borderRadius: 12,
    flex: { xs: '0 0 auto', md: '0 0 420px' },
    minWidth: 0,
    bgcolor: 'background.level1',
  }
}
