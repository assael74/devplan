// ui/forms/layouts/tasksCreateForm.layout.js

export function getTasksCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 1,
      topCols: '1.1fr .9fr',
      mainCols: '1fr',
      metaCols: '1fr 1fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 3,
      topCols: '1fr 1fr',
      mainCols: '1fr',
      metaCols: '1fr 1fr 1fr 1fr 1fr',
    }
  }

  return {
    shellGap: 2,
    topCols: { xs: '1fr', md: '1.2fr 0.8fr' },
    mainCols: { xs: '1fr', md: '1.2fr 0.8fr' },
    metaCols: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
  }
}
