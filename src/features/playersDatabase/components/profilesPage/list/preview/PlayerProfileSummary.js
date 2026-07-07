// features/playersDatabase/components/profilesPage/list/preview/PlayerProfileSummary.js

import { Box, Chip, ChipDelete, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { clean } from '../../logic/utils.js'
import { getPlayerProfileChips, getPlayerProfileInfo, getScoutProfileTooltipData } from '../../list/logic/scout.logic.js'
import { profileSx as sx } from './sx/profile.sx.js'

function PlayerScoutProfileChip({ item, player, onRemoveProfile }) {
  const tooltipData = getScoutProfileTooltipData(item.id || item.label)

  const handleDelete = event => {
    if (event && event.stopPropagation) event.stopPropagation()
    if (typeof onRemoveProfile === 'function') onRemoveProfile({ player, profileId: item.id, profile: item })
  }

  return (
    <Tooltip
      arrow
      placement="top"
      variant="outlined"
      title={(
        <Box sx={sx.previewTooltip}>
          <Typography level="title-sm" sx={sx.previewTooltipTitle}>{tooltipData.title || item.label || '-'}</Typography>
          {tooltipData.context ? <Typography level="body-xs" sx={sx.previewTooltipText}>{tooltipData.context}</Typography> : null}

          {tooltipData.rules && tooltipData.rules.length ? (
            <Box component="ul" sx={sx.previewTooltipList}>
              {tooltipData.rules.map((rule, index) => (
                <Typography key={`${item.id || item.label || 'profile'}-${index}`} component="li" level="body-xs" sx={sx.previewTooltipText}>
                  {rule}
                </Typography>
              ))}
            </Box>
          ) : null}
        </Box>
      )}
    >
      <Chip size="sm" endDecorator={iconUi({ id: item.idIcon })} startDecorator={<ChipDelete onDelete={handleDelete} />} sx={sx.previewProfileChip}>
        {item.label}
      </Chip>
    </Tooltip>
  )
}

export default function PlayerProfileSummary({ player, onRemoveProfile }) {
  const profile = getPlayerProfileInfo(player)
  const chips = getPlayerProfileChips(player)

  const reliability =
    (profile && profile.reliabilityLevel) ||
    (profile && profile.reliabilityScore) ||
    (player && player.bestScoutReliabilityLevel) ||
    (player && player.bestScoutReliabilityScore)

  const score = profile && profile.score != null ? profile.score : player && player.bestScoutScore
  const missingPosition = !clean(player && player.positionLayer) || !clean(player && player.primaryPosition)

  return (
    <Box sx={sx.previewSection}>
      <Box sx={sx.previewSectionHead}>
        <Typography sx={sx.previewSectionTitle}>פרופילי סקאוט</Typography>
        {missingPosition ? <Chip size="sm" variant="soft" color="warning" sx={sx.previewPresenceChip}>חסרה עמדה</Chip> : null}
      </Box>

      <Box sx={sx.previewChipRow}>
        {chips.map(item => <PlayerScoutProfileChip key={item.id || item.label} item={item} player={player} onRemoveProfile={onRemoveProfile} />)}

        <Box sx={sx.previewChipTail}>
          {reliability ? <Chip size="sm" variant="soft" color="neutral" sx={sx.previewMiniChip}>ודאות {reliability}</Chip> : null}
          {score !== undefined && score !== null ? <Chip size="sm" variant="soft" color="neutral" sx={sx.previewMiniChip}>ציון {score}</Chip> : null}
        </Box>
      </Box>
    </Box>
  )
}
