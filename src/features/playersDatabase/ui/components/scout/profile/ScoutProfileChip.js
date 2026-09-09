import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import ScoutProfileTooltip from './ScoutProfileTooltip.js'
import {
  buildScoutProfileChipModel,
  resolveScoutProfileDepthPct,
} from './scoutProfileChip.model.js'
import { scoutProfileChipSx as sx } from './sx/scoutProfileChip.sx.js'

export { buildScoutProfileChipModel, resolveScoutProfileDepthPct }

export default function ScoutProfileChip({
  profileId = '',
  label = '',
  iconId = '',
  depthPct,
  extraCount = 0,
  isFilter = false,
  isCombination = false,
  shortLabel = false,
  selected = false,
  tooltipSize = 'default',
  tooltip = '',
  profile = null,
  profiles = [],
  showConditions = false,
  showConditionsDepth = false,
  onClick,
  size = 'default',
  width,
}) {
  const model = buildScoutProfileChipModel({
    profileId,
    label,
    iconId,
    depthPct,
    extraCount,
    isFilter,
    isCombination,
    shortLabel,
    tooltip,
  })
  const interactive = typeof onClick === 'function'
  const compact = size === 'compact'

  if (!model) return null

  const tooltipTitle = (
    <ScoutProfileTooltip
      profileId={model.profileId}
      profile={profile}
      profiles={profiles}
      showConditions={showConditions}
      showConditionsDepth={showConditionsDepth}
      compact={tooltipSize === 'compact'}
    />
  )

  return (
    <Tooltip
      title={tooltipTitle}
      arrow
      variant='plain'
      color='neutral'
      slotProps={{ tooltip: { sx: sx.tooltip } }}
    >
      <Box
        component={interactive ? 'button' : 'span'}
        type={interactive ? 'button' : undefined}
        onClick={onClick}
        aria-label={`${model.fullLabel}, עומק התאמה ${model.depthPct}%`}
        sx={sx.root({
          interactive,
          compact,
          width,
          isFilter: model.isFilter,
          isCombination: model.isCombination,
          selected,
        })}
      >
        {model.isFilter ? null : <Box aria-hidden='true' sx={sx.fill({ depthPct: model.depthPct })} />}
        <Box sx={sx.content({ compact })}>
          <Box sx={sx.icon({
            compact,
            isFilter: model.isFilter,
            isCombination: model.isCombination,
          })}>{iconUi({ id: model.iconId, size: 'sm' })}</Box>
          <Typography component='span' sx={sx.label({ compact, isFilter: model.isFilter })}>{model.label}</Typography>
          {model.showEndLabel ? (
            <Box component='span' sx={sx.endLabel({ compact })}>{model.endLabel}</Box>
          ) : null}
        </Box>
      </Box>
    </Tooltip>
  )
}
