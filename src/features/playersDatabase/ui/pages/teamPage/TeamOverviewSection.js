import * as React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamOverviewSx as sx } from './sx/teamOverview.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const toNumber = value => {
  const next = Number(value)
  return Number.isFinite(next) ? next : null
}

const PERFORMANCE_LABELS = {
  elite: 'עילית',
  high: 'גבוה',
  medium: 'בינוני',
  typical: 'טיפוסי',
  low: 'נמוך',
}

const BALANCE_LABELS = {
  above_typical: 'מעל לטיפוסי',
  typical: 'טיפוסי',
  below_typical: 'מתחת לטיפוסי',
}

const RELIABILITY_LABELS = {
  sufficient: 'תמונה מלאה',
  partial: 'תמונה חלקית',
  insufficient: 'מידע לא מספיק',
}

const resolvePerformance = (season, side) => (
  season?.[`team${side === 'attack' ? 'Attack' : 'Defense'}Performance`] ||
  season?.performance?.[side] ||
  {}
)

const resolvePerformanceLabel = performance => PERFORMANCE_LABELS[
  clean(performance?.rankingLevel || performance?.targetLevel || performance?.priorityLevel)
] || clean(performance?.rankingLevel || performance?.targetLevel) || 'לא זמין'

const resolveRank = (season, side, performance) => toNumber(
  performance?.rank ||
  season?.[`table${side === 'attack' ? 'Attack' : 'Defense'}Rank`]
)

const resolvePerGame = (season, side) => toNumber(
  season?.[side === 'attack' ? 'goalsForPerGame' : 'goalsAgainstPerGame'] ||
  season?.teamStats?.[side === 'attack' ? 'goalsForPerGame' : 'goalsAgainstPerGame']
)

const Metric = ({ label, value }) => (
  <Box sx={sx.metric}>
    <Typography sx={sx.metricValue}>{value}</Typography>
    <Typography sx={sx.metricLabel}>{label}</Typography>
  </Box>
)

function PerformanceCard({ season, side }) {
  const performance = resolvePerformance(season, side)
  const rank = resolveRank(season, side, performance)
  const perGame = resolvePerGame(season, side)
  const isAttack = side === 'attack'

  return (
    <Box sx={sx.performanceCard}>
      <Box sx={sx.cardHeading}>
        <Box sx={sx.headingText}>
          <Typography sx={sx.eyebrow}>ביצוע קבוצתי</Typography>
          <Typography sx={sx.cardTitle}>{isAttack ? 'התקפה' : 'הגנה'}</Typography>
        </Box>
        <Box sx={sx.performanceState}>{resolvePerformanceLabel(performance)}</Box>
      </Box>

      <Box sx={sx.metricsRow}>
        <Metric label='דירוג בליגה' value={rank ? `מקום ${rank}` : '—'} />
        <Metric
          label={isAttack ? 'שערים למשחק' : 'ספיגות למשחק'}
          value={perGame === null ? '—' : perGame.toFixed(1)}
        />
      </Box>
    </Box>
  )
}

const resolveBalanceMetrics = balance => [
  {
    key: 'minutesTop5',
    label: 'פיזור דקות',
    band: balance?.minutesTop5Band,
    meaning: 'עד כמה דקות המשחק מרוכזות אצל השחקנים המרכזיים.',
  },
  {
    key: 'usage70',
    label: 'עומק שימוש',
    band: balance?.usage70Band,
    meaning: 'כמה שחקנים נדרשים כדי להגיע לחלק משמעותי מדקות הקבוצה.',
  },
  {
    key: 'productionTop1',
    label: 'פיזור תפוקה',
    band: balance?.productionTop1Band,
    meaning: 'עד כמה התפוקה ההתקפית מרוכזת בשחקן אחד.',
  },
  {
    key: 'rotationStartsTop5',
    label: 'רוטציית הרכב',
    band: balance?.rotationStartsTop5Band,
    meaning: 'עד כמה הפתיחות בהרכב מרוכזות אצל קבוצת שחקנים מצומצמת.',
  },
].filter(metric => clean(metric.band))

function BalanceCard({ season }) {
  const balance = season?.teamBalance || {}
  const metrics = resolveBalanceMetrics(balance)
  const reliability = RELIABILITY_LABELS[clean(balance?.reliability)] || 'ללא הערכת אמינות'

  return (
    <Box sx={sx.balanceCard}>
      <Box sx={sx.cardHeading}>
        <Box sx={sx.headingText}>
          <Typography sx={sx.eyebrow}>פרשנות איזון</Typography>
          <Typography sx={sx.cardTitle}>חלוקת הסגל</Typography>
        </Box>
        <Tooltip title='רמת האמינות נקבעת לפי כיסוי הנתונים הזמין למדדי האיזון.'>
          <Box sx={sx.reliability}>
            {reliability}
            {iconUi({ id: 'info', size: 'sm' })}
          </Box>
        </Tooltip>
      </Box>

      {metrics.length ? (
        <Box sx={sx.balanceMetrics}>
          {metrics.map(metric => (
            <Tooltip key={metric.key} title={metric.meaning}>
              <Box sx={sx.balanceMetric}>
                <Typography sx={sx.balanceMetricLabel}>{metric.label}</Typography>
                <Typography sx={sx.balanceMetricValue}>
                  {BALANCE_LABELS[metric.band] || metric.band}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      ) : (
        <Typography sx={sx.emptyText}>אין עדיין מספיק נתונים לפרשנות איזון.</Typography>
      )}
    </Box>
  )
}

function StructureCard({ season }) {
  const structure = season?.teamBalance?.lineStructure || {}
  const lines = structure?.lines || {}
  const classified = toNumber(structure?.classifiedPlayersCount)
  const total = toNumber(season?.playersCount)

  const lineItems = [
    ['הגנה', lines?.defense?.playersCount],
    ['קישור', lines?.midfield?.playersCount],
    ['התקפה', lines?.attack?.playersCount],
  ].filter(([, value]) => toNumber(value) !== null)

  return (
    <Box sx={sx.structureCard}>
      <Box sx={sx.cardHeading}>
        <Box sx={sx.headingText}>
          <Typography sx={sx.eyebrow}>מבנה מקצועי</Typography>
          <Typography sx={sx.cardTitle}>חלוקה לפי חוליות</Typography>
        </Box>
        {classified !== null ? (
          <Typography sx={sx.coverageText}>
            {total ? `${classified} מתוך ${total} מסווגים` : `${classified} מסווגים`}
          </Typography>
        ) : null}
      </Box>

      {lineItems.length ? (
        <Box sx={sx.lineRow}>
          {lineItems.map(([label, value]) => (
            <Metric key={label} label={label} value={toNumber(value)} />
          ))}
        </Box>
      ) : (
        <Typography sx={sx.emptyText}>אין עדיין מספיק נתונים להצגת מבנה החוליות.</Typography>
      )}
    </Box>
  )
}

export default function TeamOverviewSection({ season }) {
  if (!season) return null

  return (
    <Box sx={sx.section}>
      <Box sx={sx.sectionHeading}>
        <Box>
          <Typography sx={sx.sectionTitle}>תמונת מצב מקצועית</Typography>
          <Typography sx={sx.sectionSubtitle}>
            ביצועי הקבוצה, חלוקת הסגל והמבנה שנוצר בעונה הנבחרת
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.performanceGrid}>
        <PerformanceCard season={season} side='attack' />
        <PerformanceCard season={season} side='defense' />
      </Box>

      <Box sx={sx.contextGrid}>
        <BalanceCard season={season} />
        <StructureCard season={season} />
      </Box>
    </Box>
  )
}
