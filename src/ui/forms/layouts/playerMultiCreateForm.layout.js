// ui/forms/layouts/playerMultiCreateForm.layout.js

export function getPlayerMultiCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 2,
      topCols: '1fr',
      mainCols: '1fr',
      metaCols: '1fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 3,
      topCols: '1fr 1fr',
      mainCols: '1fr',
      metaCols: '1fr',
    }
  }

  return {
    shellGap: 1,
    defaultsCols: { xs: '1fr', md: '1fr 1fr' },
    rowCols: { xs: '1fr', md: '.8fr .8fr .8fr .8fr' },
  }
}
