import React from 'react'
import { Box, Typography } from '@mui/joy'

import { chipSx } from './sx/chipButton.sx.js'

export default function ChipButton({
  label,
  count,
  icon,
  selected = false,
  quiet = false,
  disabled = false,
  onClick,
  palette,
  sx: sxOverride,
  labelSx,
  countSx,
  contentSx,
  children,
  ariaLabel,
}) {
  const sx = chipSx(palette)

  return (
    <Box
      component="button"
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel || label}
      disabled={disabled}
      onClick={onClick}
      sx={[sx.chip, quiet && sx.chipQuiet, selected && sx.chipSelected, sxOverride]}
    >
      {icon ? <Box sx={sx.icon}>{icon}</Box> : null}

      {children ? (
        children
      ) : (
        <Box sx={[sx.content, contentSx]}>
          <Typography
            level="body-sm"
            sx={[selected ? sx.labelSelected : quiet ? sx.labelQuiet : sx.label, labelSx]}
          >
            {label}
          </Typography>

          {count != null ? (
            <Typography
              level="body-xs"
              sx={[
                selected
                  ? sx.countSelected
                  : quiet
                    ? sx.countQuiet
                    : sx.count,
                countSx,
              ]}
            >
              {count}
            </Typography>
          ) : null}
        </Box>
      )}
    </Box>
  )
}
