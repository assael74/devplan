// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.sx.js

export const dialogContentSx = {
  opacity: 0.6,
}

export const dividerSx = {
  mt: -1,
  flexShrink: 0,
}

const scrollBarSx = {
  '&::-webkit-scrollbar': { width: '0px' },
  '&:hover::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: '999px',
    border: '2px solid transparent',
    backgroundClip: 'content-box',
  },
  '&:hover::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(0,0,0,0.25) transparent',
}

export const modalDialogFrameSx = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  maxHeight: 'min(88dvh, 920px)',
  overflow: 'hidden',
}

export const drawerSlotProps = {
  content: {
    sx: {
      bgcolor: 'transparent',
      p: { xs: 0, md: 2.5 },
      boxShadow: 'none',
      height: '100dvh',
    },
  },
}

export const drawerSheetSx = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  borderRadius: { xs: 0, md: 'xl' },
  overflow: 'hidden',
  boxShadow: { xs: 'none', md: 'lg' },
  mx: { xs: 0, md: 'auto' },
  width: { xs: '100%', md: 'min(980px, calc(100% - 24px))' },
}

export const handleWrapSx = {
  display: 'flex',
  justifyContent: 'center',
  pt: 1,
  pb: 0.5,
  bgcolor: 'background.surface',
  flexShrink: 0,
}

export const handleBarSx = {
  width: 56,
  height: 5,
  borderRadius: 999,
  bgcolor: 'neutral.300',
  opacity: 0.9,
}

export const headerWrapSx = {
  px: { xs: 1.25, md: 2 },
  pb: 1.25,
  pt: 0.25,
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.surface',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 1,
  flexShrink: 0,
}

export const headerMainSx = {
  flex: 1,
  minWidth: 0,
}

export const closeBtnSx = {
  mt: 0.25,
  flexShrink: 0,
  borderRadius: 'md',
}

export const bodyScrollSx = {
  flex: 1,
  minHeight: 0,
  overflow: 'auto',
  p: { xs: 1, md: 1.5 },
  ...scrollBarSx,
}

export const footerWrapSx = {
  borderTop: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.surface',
  px: { xs: 1.25, md: 2 },
  py: 1,
  display: 'flex',
  justifyContent: 'flex-start',
  position: 'sticky',
  bottom: 0,
  zIndex: 2,
  flexShrink: 0,
}

export const footerBtnSx = {
  borderRadius: 'md',
  minWidth: 96,
}
