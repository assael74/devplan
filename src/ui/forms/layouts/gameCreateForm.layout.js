// ui/forms/layouts/gameCreateForm.layout.js

export function getGameCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 2,
      topCols: '1fr 1fr',
      mainCols: '1fr 1fr',
      metaCols: '1fr 1fr 1fr',
      resultCols: '1fr 1fr 1fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 2,
      topCols: '1fr 1fr',
      mainCols: '1.5fr 0.5fr',
      metaCols: '1fr 1fr 1fr',
      durationCols: '1fr 1fr',
      resultCols: '1fr 1fr 1fr',
    }
  }

  return {
    shellGap: 2,
    topCols: '1fr 1fr',
    mainCols: '1.5fr .5fr',
    metaCols: '1fr 1fr 1fr',
    durationCols: '1fr 1fr',
    resultCols: '1fr 1fr 1fr',
  }
}
