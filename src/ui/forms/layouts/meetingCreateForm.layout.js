// ui/forms/layouts/meetingCreateForm.layout.js

export function getMeetingCreateFormLayout({ variant = 'modal', isMobile = false }) {
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
      topCols: '1fr',
      mainCols: '1.5fr 0.5fr',
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
