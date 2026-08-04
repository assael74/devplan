// ui/forms/clubs/edit.layout.js

export function getClubEditFormLayout({ variant = 'modal', isMobile = false }) {
  if (isMobile) {
    return {
      cols: '.7fr 1.3fr',
      areas: `
        "status name"
        "link link"
      `,
    }
  }

  if (variant === 'profile') {
    return {
      cols: '1fr 1fr',
      areas: `
        "status status"
        "name link"
      `,
    }
  }

  if (variant === 'drawer') {
    return {
      cols: '1fr 1fr',
      areas: `
        "name link"
        "status status"
      `,
    }
  }

  return {
    cols: { xs: '1fr', md: '1fr 1fr' },
    areas: {
      xs: `
        "name"
        "link"
        "status"
      `,
      md: `
        "name link"
        "status status"
      `,
    },
  }
}
