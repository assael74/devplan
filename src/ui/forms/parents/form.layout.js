// ui/forms/parents/form.layout.js

export function getParentFormLayout({ isMobile = false } = {}) {
  if (isMobile) {
    return {
      identityCols: '1fr',
      contactCols: '1fr',
      gap: 1,
    }
  }

  return {
    identityCols: '.8fr 1.2fr',
    contactCols: '1fr',
    gap: 1,
  }
}
