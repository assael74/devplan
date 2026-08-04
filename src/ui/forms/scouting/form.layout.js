// ui/forms/scouting/form.layout.js

export function getScoutFormLayout({ isMobile = false } = {}) {
  if (isMobile) {
    return {
      identityCols: '1fr',
      affiliationCols: '1fr',
      gap: 1,
    }
  }

  return {
    identityCols: { xs: '1fr', md: '0.5fr 0.5fr 2fr' },
    affiliationCols: { xs: '1fr', md: '1fr 1fr 1fr' },
    gap: 1,
  }
}
