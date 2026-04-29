// ui/forms/layouts/playerCreateForm.layout.js

export function getPlayerCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 2,
      topCols: '1fr 1fr',
      mainCols: '1fr 1fr',
      metaCols: '1fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 1,
      topCols: '1fr 1fr',
      mainCols: '1fr 1fr',
      metaCols: '1fr',
    }
  }

  return {
    shellGap: 2,
    topCols: '1fr',
    mainCols: '1fr 1fr 1fr',
    metaCols: '0.7fr 1.15fr 1.15fr',
  }
}
