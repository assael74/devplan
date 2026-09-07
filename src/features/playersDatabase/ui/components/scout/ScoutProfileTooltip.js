import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { buildScoutProfileTooltipModel } from './scoutProfileTooltip.model.js'
import { scoutProfileTooltipSx as sx } from './sx/scoutProfileTooltip.sx.js'

const ConditionList = ({ conditions = [], compact = false }) => (
  <Box sx={sx.conditions}>
    {conditions.map(condition => (
      <Box key={condition.key} sx={sx.condition({ compact })}>
        <Box sx={sx.conditionMeta({ compact })}>
          <Box sx={sx.conditionTitle({ compact })}>
            <Box aria-hidden='true' sx={sx.conditionIcon({ compact })}>
              {iconUi({ id: condition.iconId, size: 'sm' })}
            </Box>
            <Typography sx={sx.conditionLabel({ compact })}>{condition.label}</Typography>
          </Box>
          {condition.matched ? (
            <Typography sx={sx.conditionStatus({ compact })}>התקיים</Typography>
          ) : null}
        </Box>
      </Box>
    ))}
  </Box>
)

const ProfileDetails = ({ model, showConditions, showConditionsDepth, compact }) => (
  <>
    <Box sx={sx.header({ compact })}>
        <Box sx={sx.profileTitle({ compact })}>
          <Box aria-hidden='true' sx={sx.profileIcon({ compact })}>{iconUi({ id: model.iconId, size: 'sm' })}</Box>
          <Typography sx={sx.title({ compact })}>{model.label}</Typography>
        </Box>
        {model.createdAt ? <Typography sx={sx.createdAt({ compact })}>{model.createdAt}</Typography> : null}
    </Box>

      {showConditions ? (
        <>
          <Typography sx={sx.conditionsLabel({ compact })}>{model.conditionsLabel}</Typography>
          {model.conditions.length
            ? <ConditionList conditions={model.conditions} compact={compact} />
            : <Typography sx={sx.emptyState({ compact })}>אין תנאי זיהוי מוגדרים לפרופיל זה.</Typography>}
        </>
      ) : null}

      {showConditionsDepth && model.depthConditions.length ? (
        <>
          <Typography sx={sx.conditionsLabel({ compact })}>תנאים שקבעו את עומק הפרופיל</Typography>
          <ConditionList conditions={model.depthConditions} compact={compact} />
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
  compact = false,
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
    <Box sx={sx.root({ compact })}>
      {models.map((model, index) => (
        <Box key={model.profileId || index} sx={sx.profileSection({ divided: index > 0, compact })}>
          <ProfileDetails
            model={model}
            showConditions={showConditions}
            showConditionsDepth={showConditionsDepth}
            compact={compact}
          />
        </Box>
      ))}
    </Box>
  )
}
