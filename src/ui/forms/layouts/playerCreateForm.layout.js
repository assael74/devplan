// ui/forms/layouts/playerCreateForm.layout.js

export function getPlayerCreateFormLayout({ variant = 'modal', isMobile = false }) {
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
    shellGap: 2,
    topCols: { xs: '1fr', md: '1fr 1fr' },
    mainCols: { xs: '1fr', md: '1fr 1fr' },
    metaCols: { xs: '1fr', md: '0.7fr 1.15fr 1.15fr' },
  }
}
