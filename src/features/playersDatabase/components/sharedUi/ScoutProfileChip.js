import React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import ChipButton from './ChipButton.js'
import { clean } from '../profilesPage/logic/utils.js'
import { getScoutProfileTooltipData } from '../profilesPage/list/logic/scout.logic.js'

const chipPalette = {
  selectedStart: '#173b57',
  selectedMid: '#245273',
  selectedEnd: '#4c87b1',
  selectedLine: '#5aa9d8',
}

const tooltipSx = {
  maxWidth: 300,
  p: 0.75,
  display: 'flex',
  flexDirection: 'column',
  gap: 0.45,
}

const tooltipTitleSx = {
  color: '#17202a',
  fontSize: 13,
  fontWeight: 800,
  lineHeight: 1.15,
}

const tooltipLineSx = {
  color: '#4e5a66',
  fontSize: 11.5,
  lineHeight: 1.35,
}

const tooltipListSx = {
  m: 0,
  pl: 1.5,
  display: 'grid',
  gap: 0.2,
}

export default function ScoutProfileChip({
  profileId = '',
  label = '',
  count = null,
  iconId = '',
  active = false,
  selected = false,
  tooltip = true,
  onClick,
  onRemove,
  deleteAriaLabel = 'הסר פרופיל',
  disabled = false,
  quiet = false,
  sx,
  tooltipPlacement = 'top',
}) {
  const resolvedId = clean(profileId || label)
  const resolvedLabel = clean(label || resolvedId)
  const tooltipData = tooltip ? getScoutProfileTooltipData(resolvedId || resolvedLabel) : null
  const isQuiet = quiet

  const chip = (
    <ChipButton
      label={resolvedLabel}
      count={count}
      startDecorator={iconId ? iconUi({ id: iconId, size: 'sm' }) : null}
      selected={selected || active}
      quiet={isQuiet}
      disabled={disabled}
      onClick={onClick}
      palette={chipPalette}
      sx={sx}
      endDecorator={
        onRemove ? (
          <Box
            component="span"
            role="button"
            tabIndex={0}
            aria-label={deleteAriaLabel}
            sx={{
              ml: 0.3,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 17,
              height: 17,
              lineHeight: 0,
              borderRadius: '999px',
              color: 'inherit',
              opacity: 0.94,
              '&:hover': {
                opacity: 1,
              },
            }}
            onClick={event => {
              event.preventDefault()
              event.stopPropagation()
              onRemove(resolvedId)
            }}
            onKeyDown={event => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              event.stopPropagation()
              onRemove(resolvedId)
            }}
          >
            {iconUi({ id: 'close', size: 'sm' })}
          </Box>
        ) : null
      }
      endDecoratorSx={{
        alignSelf: 'center',
      }}
    />
  )

  if (!tooltip) return chip

  return (
    <Tooltip
      arrow
      placement={tooltipPlacement}
      variant="outlined"
      title={(
        <Box sx={tooltipSx}>
          <Typography level="title-sm" sx={tooltipTitleSx}>
            {tooltipData?.title || resolvedLabel || resolvedId || '-'}
          </Typography>

          {tooltipData?.context ? (
            <Typography level="body-xs" sx={tooltipLineSx}>
              {tooltipData.context}
            </Typography>
          ) : null}

          {tooltipData?.rules?.length ? (
            <Box component="ul" sx={tooltipListSx}>
              {tooltipData.rules.map((rule, index) => (
                <Typography
                  key={`${resolvedId || resolvedLabel || 'rule'}-${index}`}
                  component="li"
                  level="body-xs"
                  sx={tooltipLineSx}
                >
                  {rule}
                </Typography>
              ))}
            </Box>
          ) : null}
        </Box>
      )}
    >
      {chip}
    </Tooltip>
  )
}
