// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutReasons.js

import {
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

const REASON_ICONS = ['stats', 'performance', 'trend', 'completed']

function ProfileEvidenceCard({ evidence, index }) {
  return (
    <Box sx={sx.whyEvidenceCard}>
      <Box sx={sx.whyEvidenceIdentity}>
        <Box sx={sx.whyEvidenceIcon}>
          {iconUi({id: REASON_ICONS[index] || 'stats', size: 'md'})}
        </Box>

        <Typography level='title-sm' sx={sx.whyEvidenceTitle}>
          {evidence.title}
        </Typography>
      </Box>

      <Box sx={sx.whyEvidenceValueRow}>
        <Typography level='h3' sx={sx.whyEvidenceValue}>
          {evidence.value}
        </Typography>

        {evidence.unit ? (
          <Typography level='body-xs' sx={sx.whyEvidenceUnit}>
            {evidence.unit}
          </Typography>
        ) : null}
      </Box>

      {evidence.rule ? (
        <Box sx={sx.whyRuleCompact}>
          <Typography level='body-xs' sx={sx.whyRuleLabel}>
            רף
          </Typography>

          <Typography level='body-xs' sx={sx.whyRuleValue}>
            {evidence.rule}
          </Typography>
        </Box>
      ) : null}

      {evidence.delta || evidence.supplement ? (
        <Box sx={sx.whyEvidenceMeta}>
          {evidence.delta ? (
            <Chip size='sm' variant='soft' color='success'>
              {evidence.delta}
            </Chip>
          ) : null}

          {evidence.supplement ? (
            <Typography level='body-xs' sx={sx.whyEvidenceSupplement}>
              {evidence.supplement}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

export default function PlayerScoutReasons({ profile = null }) {
  const why = profile?.why || {}
  const evidence = Array.isArray(why.evidence) ? why.evidence : []
  const matchedCount = Number(why.matchedCount || 0)
  const requiredCount = Number(why.requiredCount || 0)
  const countLabel = requiredCount
    ? `${matchedCount} מתוך ${requiredCount} תנאים מתקיימים`
    : ''
  if (!profile) {
    return (
      <Box sx={sx.profileWorkspaceDetail}>
        <Typography level='body-sm' sx={sx.emptyText}>
          בחר פרופיל כדי לראות את פירוט התנאים שלו.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.profileWorkspaceDetail}>
      <Box sx={sx.profileDetailHeader}>
        <Box sx={sx.profileDetailTitleCompact}>
          <Typography level='title-sm' sx={sx.profileDetailTitle}>
            למה הפרופיל הזה?
          </Typography>
        </Box>

        <Box sx={sx.whyProfileMeta}>
          {countLabel ? (
            <Chip size='sm' variant='soft' color='primary'>
              {countLabel}
            </Chip>
          ) : null}

          {why.profileDepthLabel ? (
            <Chip
              size='sm'
              variant='soft'
              color={profile.role === 'near' ? 'warning' : 'success'}
            >
              {why.profileDepthLabel}
            </Chip>
          ) : null}
        </Box>
      </Box>

      {evidence.length ? (
        <Box sx={sx.whyEvidenceGrid(evidence.length)}>
          {evidence.map((item, index) => (
            <ProfileEvidenceCard
              key={item.id}
              evidence={item}
              index={index}
            />
          ))}
        </Box>
      ) : (
        <Typography level='body-sm' sx={sx.profileDetailEmpty}>
          אין כרגע פירוט תנאים מספיק כדי להסביר את הפרופיל.
        </Typography>
      )}
    </Box>
  )
}
