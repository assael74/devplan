// ui/forms/layouts/clubCreateForm.layout.js

export function getClubCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 0,
      topCols: '1fr',
      mainCols: '1fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 3,
      topCols: '1fr 1fr',
    }
  }

  return {
    shellGap: 0,
    topCols: { xs: '1fr', md: '1fr' },
    mainCols: { xs: '1fr', md: '1fr' },
  }
}
