// ui/forms/layouts/tagsCreateForm.layout.js

export function getTagsCreateFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      shellGap: 2,
      topCols: '1fr',
      mainCols: '1fr 1fr',
      metaCols: '.8fr 1.2fr',
    }
  }

  if (variant === 'drawer') {
    return {
      shellGap: 3,
      topCols: '1fr 1fr',
      mainCols: '1fr 1fr',
      metaCols: '1fr 1fr',
    }
  }

  return {
    shellGap: 2,
    topCols: { xs: '1fr', md: '1fr' },
    mainCols: { xs: '1fr', md: '1fr 1fr' },
    metaCols: { xs: '1fr', md: '.9fr 1.1fr' },
  }
}
