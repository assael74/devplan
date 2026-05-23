// ui/actions/GenericFabMenu.js
// TEMP TEST VERSION - no Joy Dropdown/Menu

import * as React from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import IconButton from '@mui/joy/IconButton'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'

import { getEntityColors } from '../core/theme/Colors'
import { iconUi } from '../core/icons/iconUi.js'
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded'
import { sxFabMenu as sx } from './GenericFabMenu.sx'

const POS = {
  br: { left: { xs: 14, md: 22 }, bottom: { xs: 14, md: 22 } },
  bl: { right: { xs: 14, md: 22 }, bottom: { xs: 14, md: 22 } },
  tr: { left: { xs: 14, md: 22 }, top: { xs: 14, md: 22 } },
  tl: { right: { xs: 14, md: 22 }, top: { xs: 14, md: 22 } },
}

const safeColors = k => {
  try {
    return k ? getEntityColors(k) : null
  } catch {
    return null
  }
}

const isDividerItem = item => item?.type === 'divider'
const isSectionItem = item => item?.type === 'section'

const ActionLabel = ({ action }) => {
  return (
    <Box sx={sx.actionLabelWrap}>
      <Box component="span" sx={sx.actionSpan}>
        {action.label || action.title}
      </Box>

      {action.metaLabel ? (
        <Chip
          size="sm"
          variant="soft"
          color={action.metaColor || 'neutral'}
          sx={sx.chip}
        >
          {action.metaLabel}
        </Chip>
      ) : null}
    </Box>
  )
}

export default function GenericFabMenu({
  placement = 'br',
  actions = [],
  disabled = false,
  showLabel = false,
  label = '',
  entityType,
  fabSx,
}) {
  const [open, setOpen] = React.useState(false)

  const palette = React.useMemo(() => safeColors(entityType), [entityType])
  const visible = React.useMemo(() => {
    return actions.filter(action => !action?.hidden)
  }, [actions])

  const hasMenu = visible.length > 0

  return (
    <Box sx={{ position: 'fixed', zIndex: 1200, ...(POS[placement] || POS.br) }}>
      {open ? (
        <Sheet variant="outlined" sx={sx.sheet}>
          {visible.map((action, index) => {
            if (isSectionItem(action)) {
              return (
                <Typography
                  key={action.id || `section-${index}`}
                  level="body-xs"
                  sx={{ px: 1, py: 0.5, color: 'text.tertiary' }}
                >
                  {action.label}
                </Typography>
              )
            }

            if (isDividerItem(action)) {
              return (
                <Box key={action.id || `divider-${index}`} sx={{ height: 0.5, bgcolor: 'divider', my: 0.25 }}/>
              )
            }

            return (
              <Box
                key={action.id || index}
                role="button"
                onClick={() => {
                  if (action.disabled) return

                  setOpen(false)
                  action.onClick?.()
                }}
                sx={sx.boxButton(action)}
              >
                {action.icon ? (
                  <Box sx={{ flex: '0 0 auto', display: 'flex' }}>
                    {action.icon}
                  </Box>
                ) : null}

                <ActionLabel action={action} />
              </Box>
            )
          })}
        </Sheet>
      ) : null}

      <Box sx={sx.trigger}>
        {showLabel && label ? (
          <Typography level="body-sm" sx={sx.label(palette)}>
            {label}
          </Typography>
        ) : null}

        <IconButton
          disabled={disabled || !hasMenu}
          variant="plain"
          onClick={() => setOpen(current => !current)}
          sx={[sx.fab(open, palette), fabSx]}
        >
          {open ? (
            <KeyboardArrowUpRounded />
          ) : (
            iconUi({ id: 'quickActions', size: 'md' })
          )}
        </IconButton>
      </Box>
    </Box>
  )
}
