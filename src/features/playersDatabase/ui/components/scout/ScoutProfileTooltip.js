import { Box, LinearProgress, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { buildScoutProfileTooltipModel } from './scoutProfileTooltip.model.js'
import { scoutProfileTooltipSx as sx } from './sx/scoutProfileTooltip.sx.js'

const ConditionList = ({ conditions = [] }) => (
  <Box sx={sx.conditions}>
    {conditions.map(condition => (
      <Box key={condition.key} sx={sx.condition}>
        <Box sx={sx.conditionMeta}>
          <Box sx={sx.conditionTitle}>
            <Box aria-hidden='true' sx={sx.conditionIcon}>
              {iconUi({ id: condition.iconId, size: 'sm' })}
            </Box>
            <Typography sx={sx.conditionLabel}>{condition.label}</Typography>
          </Box>
          {condition.progressPct !== null ? (
            <Typography sx={sx.conditionProgress}>{`${condition.progressPct}%`}</Typography>
          ) : null}
        </Box>
        {condition.progressPct !== null ? (
          <LinearProgress determinate value={condition.progressPct} sx={sx.progressTrack} />
        ) : null}
      </Box>
    ))}
  </Box>
)

const ProfileDetails = ({ model, showConditions, showConditionsDepth }) => (
  <>
    <Box sx={sx.header}>
        <Box sx={sx.profileTitle}>
          <Box aria-hidden='true' sx={sx.profileIcon}>{iconUi({ id: model.iconId, size: 'sm' })}</Box>
          <Typography sx={sx.title}>{model.label}</Typography>
        </Box>
        {model.createdAt ? <Typography sx={sx.createdAt}>{model.createdAt}</Typography> : null}
    </Box>

      {showConditions ? (
        <>
          <Typography sx={sx.conditionsLabel}>{model.conditionsLabel}</Typography>
          {model.conditions.length
            ? <ConditionList conditions={model.conditions} />
            : <Typography sx={sx.emptyState}>אין תנאי זיהוי מוגדרים לפרופיל זה.</Typography>}
        </>
      ) : null}

      {showConditionsDepth && model.depthConditions.length ? (
        <>
          <Typography sx={sx.conditionsLabel}>תנאים שקבעו את עומק הפרופיל</Typography>
          <ConditionList conditions={model.depthConditions} />
        </>
      ) : null}
  </>
)

export default function ScoutProfileTooltip({
  profileId = '',
  profile = null,
  profiles = [],
  showConditions = false,
  showConditionsDepth = false,
}) {
  const candidates = [profile, ...(Array.isArray(profiles) ? profiles : [])]
  const seen = new Set()
  const models = candidates
    .map(candidate => buildScoutProfileTooltipModel({
      profileId: candidate?.profileId || candidate?.id || profileId,
      profile: candidate,
    }))
    .filter(model => {
      if (!model || seen.has(model.profileId)) return false
      seen.add(model.profileId)
      return true
    })

  if (!models.length) return null

  return (
    <Box sx={sx.root}>
      {models.map((model, index) => (
        <Box key={model.profileId || index} sx={sx.profileSection({ divided: index > 0 })}>
          <ProfileDetails
            model={model}
            showConditions={showConditions}
            showConditionsDepth={showConditionsDepth}
          />
        </Box>
      ))}
    </Box>
  )
}
