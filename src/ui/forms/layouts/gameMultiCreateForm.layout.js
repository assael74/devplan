// ui/forms/layouts/gameMultiCreateForm.layout.js

export function getGameMultiCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 2,
      defaultsCols: '1fr',
      rowCols: '1fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 2,
      defaultsCols: '1fr 1fr',
      rowCols: '1.5fr 1fr .9fr .9fr',
    }
  }

  return {
    shellGap: 1,
    defaultsCols: { xs: '1fr', md: '1fr 1fr' },
    rowCols: { xs: '1fr', md: '1.3fr 1.2fr .7fr .8fr' },
  }
}
