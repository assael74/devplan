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
      <Box sx={sx.whyEvidenceTop}>
        <Box sx={sx.whyEvidenceIcon}>
          {iconUi({id: REASON_ICONS[index] || 'stats', size: 'sm'})}
        </Box>

        <Box sx={sx.whyEvidenceHeading}>
          <Typography level='title-sm' sx={sx.whyEvidenceTitle}>
            {evidence.title}
          </Typography>

          {evidence.metricLabel && evidence.metricLabel !== evidence.title ? (
            <Typography level='body-xs' sx={sx.whyEvidenceMetric}>
              {evidence.metricLabel}
            </Typography>
          ) : null}
        </Box>
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
        <Box sx={sx.whyRuleRow}>
          <Typography level='body-xs' sx={sx.whyRuleLabel}>
            תנאי הפרופיל
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

export default function PlayerScoutReasons({ why = {} }) {
  const evidence = Array.isArray(why.evidence) ? why.evidence : []
  const matchedCount = Number(why.matchedCount || 0)
  const requiredCount = Number(why.requiredCount || 0)
  const countLabel = requiredCount
    ? `${matchedCount} מתוך ${requiredCount} תנאים מתקיימים`
    : ''

  return (
    <Box sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionHeading}>
          <Box sx={[sx.sectionIcon, sx.sectionIconTone.info]}>
            {iconUi({id: 'stats', size: 'sm'})}
          </Box>

          <Box>
            <Typography level='title-md' sx={sx.sectionTitle}>
              למה הפרופיל הזה?
            </Typography>

            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              התנאים שהמנוע זיהה בפועל והפער שלהם מרף הפרופיל
            </Typography>
          </Box>
        </Box>
      </Box>

      {why.profileLabel ? (
        <Box sx={sx.whyProfileSummary}>
          <Box sx={sx.whyProfileIdentity}>
            <Typography level='body-xs' sx={sx.whyProfileEyebrow}>
              הפרופיל הראשי
            </Typography>

            <Typography level='title-md' sx={sx.whyProfileName}>
              {why.profileLabel}
            </Typography>
          </Box>

          <Box sx={sx.whyProfileMeta}>
            {countLabel ? (
              <Chip size='sm' variant='soft' color='primary'>
                {countLabel}
              </Chip>
            ) : null}

            {why.profileDepthLabel ? (
              <Chip size='sm' variant='soft' color='success'>
                {why.profileDepthLabel}
              </Chip>
            ) : null}
          </Box>
        </Box>
      ) : null}

      {evidence.length ? (
        <Box sx={sx.whyEvidenceGrid}>
          {evidence.map((item, index) => (
            <ProfileEvidenceCard
              key={item.id}
              evidence={item}
              index={index}
            />
          ))}
        </Box>
      ) : (
        <Typography level='body-sm' sx={sx.emptyText}>
          אין כרגע פירוט תנאים מספיק כדי להסביר את הפרופיל.
        </Typography>
      )}
    </Box>
  )
}
