// teamProfile/desktop/modules/management/components/TargetsView.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { viewSx as sx } from './sx/view.sx'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  buildDifficultyRows,
  buildHomeAwayRows,
  buildScorersRows,
  buildSquadUsageRows,
  emptyTargetText,
  formatTargetValue,
} from '../../../../../../../shared/teams/targets/index.js'

const RuleChips = ({
  chips = [],
}) => {
  if (!chips.length) {
    return (
      <Typography level="body-sm" sx={sx.rowValue}>
        {emptyTargetText}
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        minWidth: 0,
      }}
    >
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          size="sm"
          color={chip.color}
          variant={chip.variant}
          startDecorator={iconUi({id: 'flag'})}
          sx={{
            fontWeight: 700,
            '--Chip-radius': '8px',
            '& svg': {
              fill: 'currentColor',
            },
          }}
        >
          {chip.label}
        </Chip>
      ))}
    </Box>
  )
}

const TargetMetric = ({
  label,
  value,
  helper,
  color = 'neutral',
}) => {
  return (
    <Sheet variant="soft" color={color} sx={sx.metric}>
      <Typography level="body-xs" sx={sx.metricLabel}>
        {label}
      </Typography>

      <Typography level="title-md" sx={sx.metricValue}>
        {value}
      </Typography>

      {!!helper && (
        <Typography level="body-xs" sx={sx.metricHelper}>
          {helper}
        </Typography>
      )}
    </Sheet>
  )
}

const TargetRow = ({
  label,
  chips,
  helper,
}) => {
  return (
    <Box sx={sx.row}>
      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-sm" sx={sx.rowLabel}>
          {label}
        </Typography>

        {!!helper && (
          <Typography level="body-xs" sx={sx.rowHelper}>
            {helper}
          </Typography>
        )}
      </Box>

      <RuleChips chips={chips} />
    </Box>
  )
}

const TargetSection = ({
  title,
  subtitle,
  rows = [],
}) => {
  if (!rows.length) return null

  return (
    <Sheet variant="soft" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        {!!subtitle && (
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={sx.rows}>
        {rows.map((row) => (
          <TargetRow
            key={row.id}
            label={row.label}
            chips={row.chips}
            helper={row.helper}
          />
        ))}
      </Box>
    </Sheet>
  )
}

export default function TargetsView({
  targets,
}) {
  const hasTargets = targets?.hasTargets === true
  const labels = targets?.labels || {}
  const values = targets?.values || {}
  const groups = targets?.groups || {}

  const squadUsageOptions = {
    squadSize: 24,
    includeRiskChips: false,
  }

  if (!hasTargets) {
    return (
      <Sheet variant="soft" sx={sx.empty}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          לא הוגדר יעד טבלה
        </Typography>

        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          לאחר בחירת יעד, המערכת תפתח אוטומטית יעדי נקודות, שערים, בית/חוץ, רמת יריבה, כובשים ושימוש בסגל.
        </Typography>
      </Sheet>
    )
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.importantGrid}>
        <TargetMetric
          label="יעד נקודות"
          value={formatTargetValue(values.points)}
          helper={values.rankRangeLabel}
          color="primary"
        />

        <TargetMetric
          label="יעד אחוז הצלחה"
          value={formatTargetValue(values.successRate, '%')}
          color="primary"
        />

        <TargetMetric
          label="שערי זכות"
          value={formatTargetValue(values.goalsFor)}
          color="success"
        />

        <TargetMetric
          label="שערי חובה"
          value={formatTargetValue(values.goalsAgainst)}
          color="danger"
        />

        <TargetMetric
          label="הפרש שערים"
          value={formatTargetValue(values.goalDifference)}
          color="neutral"
        />
      </Box>

      <Box sx={sx.sectionsGrid}>
        <TargetSection
          title="בית / חוץ"
          subtitle="רף הצלחה לפי מיקום המשחק"
          rows={buildHomeAwayRows(groups.homeAway)}
        />

        <TargetSection
          title="רמת יריבה"
          subtitle="מה מצופה לפי חוזק היריבה"
          rows={buildDifficultyRows(groups.difficulty)}
        />

        <TargetSection
          title="פיזור כובשים"
          subtitle="כמה ההתקפה צריכה להיות מגוונת ולא תלויה בשחקן אחד"
          rows={buildScorersRows(groups.scorers)}
        />

        <TargetSection
          title="שימוש בסגל"
          subtitle="כמות שחקנים רצויה מתוך סגל 24"
          rows={buildSquadUsageRows(groups.squadUsage, squadUsageOptions)}
        />
      </Box>
    </Box>
  )
}
