// ui/forms/create/objectCreate.sx.js
import { getEntityColors } from '../../../core/theme/Colors'

export function buildCreateModalSx(entityType, domainColor) {
  const c = getEntityColors(entityType)

  const headerBg = domainColor ? 'background.surface' : c.bg
  const headerText = c.text

  return {
    overlay: { backdropFilter: 'blur(2px)' },

    dialog: {
      p: 0,
      width: 720,
      maxWidth: 720,
      minWidth: 720,
      borderRadius: 'lg',
      overflow: 'hidden',
      overflowX: 'hidden',
      minWidth: { xs: '92vw', sm: 520 },
      maxWidth: 640,
      maxHeight: '92vh',
      display: 'flex',
      flexDirection: 'column',
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      px: 1.5,
      py: 1.25,
      bgcolor: headerBg,
      color: headerText,
      borderBottom: '1px solid',
      borderColor: 'divider',
      flex: '0 0 auto',
      ...(domainColor
        ? { backgroundImage: `linear-gradient(90deg, color-mix(in srgb, ${domainColor} 50%, transparent) 0%, transparent 92%)`,}
        :null),
    },

    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
    },

    headerIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      display: 'grid',
      placeItems: 'center',
      bgcolor: domainColor || c.surface,
      color: headerText,
      border: '1px solid',
      borderColor: domainColor ? `color-mix(in srgb, ${domainColor} 28%, divider)` : 'divider',
      '& svg': { fill: 'currentColor', color: 'currentColor' },
      '& svg *': { fill: 'currentColor', stroke: 'currentColor' },
      '& svg [fill="none"]': { fill: 'none' },
    },

    title: {
      fontWeight: 700,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    actions: { display: 'flex', alignItems: 'center', gap: 1 },

    body: {
      p: 2,
      bgcolor: 'background.surface',
      flex: '1 1 auto',
      minHeight: 120,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
  }
}
