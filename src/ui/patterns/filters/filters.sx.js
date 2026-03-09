// src/ui/filters/filters.sx.js

export const drawerConsProps = (open, onClose) => ({
  open,
  onClose,
  anchor: 'bottom',
  slotProps: {
    content: {
      sx: {
        bgcolor: 'transparent',
        p: { xs: 0, md: 2 }, // פחות "חלל" בדסקטופ
        boxShadow: 'none',
      },
    },
  },
})

export const sheetDrwerProps = {
  sx: {
    width: '100%',
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

export const resetButtonProps = {
  size: 'sm',
  variant: 'outlined',
  color: 'neutral',
  sx: { borderRadius: 10 },
}

export const closeButtonProps = {
  size: 'sm',
  variant: 'plain',
  sx: { borderRadius: 10 },
}

export const headerSx = {
  px: { xs: 1.5, md: 2 },
  py: 1.1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
  position: 'sticky',
  top: 0,
  zIndex: 2,
  bgcolor: 'background.surface',
}

export const bodySx = {
  flex: 1,
  overflowY: 'auto',
  px: { xs: 1.5, md: 2 },
  py: { xs: 1.25, md: 1.5 },
  display: 'grid',
  gap: 1.5,
  alignItems: 'start',
}

export const footerSx = {
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
}

export const fieldsWrapSx = {
  display: 'grid',
  gap: 1,
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, // query | monthKey
  alignItems: 'end',
}

export const fieldBoxSx = {
  display: 'grid',
  gap: 0.5,
}

export const groupsWrapSx = {
  display: 'grid',
  gap: 1.25,
  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
  alignItems: 'start',
}

export const groupCardSx = {
  p: 1,
  borderRadius: 12,
  bgcolor: 'background.level1',
}

export const chipsWrapSx = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.75,
}
