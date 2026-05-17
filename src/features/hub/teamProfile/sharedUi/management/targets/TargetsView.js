// teamProfile/sharedUi/management/targets/TargetsView.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import {
  buildDifficultyRows,
  buildHomeAwayRows,
  buildScorersRows,
  buildSquadUsageRows,
  emptyTargetText,
  formatTargetValue,
} from '../../../../../../shared/teams/targets/index.js'

import { viewSx as sx } from '../sx/view.sx.js'

const RuleChips = ({ chips = [], print = false }) => {
  if (!chips.length) {
    return (
      <Typography level="body-sm" sx={sx.rowValue}>
        {emptyTargetText}
      </Typography>
    )
  }

  return (
    <Box sx={sx.chips(print)}>
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          size="sm"
          color={print ? 'neutral' : chip.color}
          variant={print ? 'outlined' : chip.variant}
          startDecorator={!print ? iconUi({ id: 'flag' }) : null}
          sx={sx.chip}
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
  print = false,
}) => {
  return (
    <Sheet
      variant="soft"
      color={print ? 'neutral' : color}
      sx={sx.metric(print)}
    >
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

const TargetRow = ({ label, chips, helper, print = false }) => {
  return (
    <Box sx={sx.row(print)}>
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

      <RuleChips chips={chips} print={print} />
    </Box>
  )
}

const TargetSection = ({ title, subtitle, rows = [], print = false }) => {
  if (!rows.length) return null

  return (
    <Sheet variant="soft" sx={sx.section(print)}>
      <Box sx={sx.sectionHeader}>
        <Typography level="title-sm" sx={sx.sectionTitle}>
          {title}
        </Typography>

        {!!subtitle && (
          <Typography level="body-xs" sx={sx.sectionSubtitle}>
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
            print={print}
          />
        ))}
      </Box>
    </Sheet>
  )
}

export default function TargetsView({ targets, isMobile = false, print = false }) {
  const hasTargets = targets?.hasTargets === true
  const values = targets?.values || {}
  const groups = targets?.groups || {}

  const squadUsageOptions = {
    squadSize: 24,
    includeRiskChips: false,
  }

  if (!hasTargets) {
    return (
      <Sheet variant="soft" sx={sx.empty(print)}>
        <Typography level="title-sm" sx={sx.emptyTitle}>
          לא הוגדר יעד טבלה
        </Typography>

        <Typography level="body-xs" sx={sx.emptyText}>
          לאחר בחירת יעד, המערכת תפתח אוטומטית יעדי נקודות, שערים, בית/חוץ, רמת יריבה, כובשים ושימוש בסגל.
        </Typography>
      </Sheet>
    )
  }

  return (
    <Box sx={sx.root(print)}>
      <Box sx={sx.importantGrid(isMobile, print)}>
        <TargetMetric
          label="יעד נקודות"
          value={formatTargetValue(values.points)}
          helper={values.rankRangeLabel}
          color="primary"
          print={print}
        />

        <TargetMetric
          label="יעד אחוז הצלחה"
          value={formatTargetValue(values.successRate, '%')}
          color="primary"
          print={print}
        />

        <TargetMetric
          label="שערי זכות"
          value={formatTargetValue(values.goalsFor)}
          color="success"
          print={print}
        />

        <TargetMetric
          label="שערי חובה"
          value={formatTargetValue(values.goalsAgainst)}
          color="danger"
          print={print}
        />

        <TargetMetric
          label="הפרש שערים"
          value={formatTargetValue(values.goalDifference)}
          color="neutral"
          print={print}
        />
      </Box>

      <Box sx={sx.sectionsGrid(print)}>
        <TargetSection
          title="בית / חוץ"
          subtitle="רף הצלחה לפי מיקום המשחק"
          rows={buildHomeAwayRows(groups.homeAway)}
          print={print}
        />

        <TargetSection
          title="רמת יריבה"
          subtitle="מה מצופה לפי חוזק היריבה"
          rows={buildDifficultyRows(groups.difficulty)}
          print={print}
        />

        <TargetSection
          title="פיזור כובשים"
          subtitle="כמה ההתקפה צריכה להיות מגוונת ולא תלויה בשחקן אחד"
          rows={buildScorersRows(groups.scorers)}
          print={print}
        />

        <TargetSection
          title="שימוש בסגל"
          subtitle="כמות שחקנים רצויה מתוך סגל 24"
          rows={buildSquadUsageRows(groups.squadUsage, squadUsageOptions)}
          print={print}
        />
      </Box>
    </Box>
  )
}
