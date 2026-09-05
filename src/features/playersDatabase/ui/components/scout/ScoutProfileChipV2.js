import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ScoutProfileTooltip from './ScoutProfileTooltip.js'
import {
  buildScoutProfileChipV2Model,
  resolveScoutProfileDepthPct,
} from './scoutProfileChipV2.model.js'
import { scoutProfileChipV2Sx as sx } from './sx/scoutProfileChipV2.sx.js'

export { buildScoutProfileChipV2Model, resolveScoutProfileDepthPct }

export default function ScoutProfileChipV2({
  profileId = '',
  label = '',
  iconId = '',
  depthPct,
  extraCount = 0,
  isFilter = false,
  isCombination = false,
  shortLabel = false,
  selected = false,
  tooltip = '',
  profile = null,
  profiles = [],
  showConditions = false,
  showConditionsDepth = false,
  onClick,
  size = 'default',
}) {
  const model = buildScoutProfileChipV2Model({
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
