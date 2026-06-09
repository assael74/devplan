import { Box, Sheet, Typography } from '@mui/joy'

import playerImage from '../../../../ui/core/images/playerImage.jpg'
import { CONFIDENCE_LEVEL_OPTIONS, ROLE_OPTIONS } from '../simulatorUi.constants.js'
import { formatNumber, getMinutesBucketLabel } from '../simulatorUi.utils.js'
import { squadSimulatorPrintSx as sx } from './sx/squadSimulatorPrint.sx.js'

const roleLabelById = ROLE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const confidenceLabelById = CONFIDENCE_LEVEL_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const safeText = value => {
  const text = String(value || '').trim()
  return text || '-'
}

const formatPct = value => `${Number(value || 0)}%`

const getStatusText = status => {
  if (status === 'success' || status === 'ok') return 'תקין'
  if (status === 'warning') return 'פער קל'
  if (status === 'danger') return 'פער קריטי'
  if (status === 'above') return 'מעל יעד'
  if (status === 'below') return 'מתחת יעד'
  return 'לבדיקה'
}

const sumRows = (rows, selector) => {
  return rows.reduce((sum, row) => sum + Number(selector(row) || 0), 0)
}

function HighlightPill({ label, value }) {
  return (
    <Box sx={sx.highlightPill}>
      <Typography sx={sx.highlightLabel}>{label}</Typography>
      <Typography sx={sx.highlightValue}>{safeText(value)}</Typography>
    </Box>
  )
}

function KpiBox({ label, value, sub, tone = 'blue' }) {
  return (
    <Box sx={sx.kpiBox(tone)}>
      <Typography sx={sx.kpiLabel}>{label}</Typography>
      <Typography sx={sx.kpiValue}>{value}</Typography>
      <Typography sx={sx.kpiSub}>{sub}</Typography>
    </Box>
  )
}

function Section({ number, title, children, dense = false }) {
  return (
    <Sheet className="dpPrintSection" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionNumber}>{number}</Box>
        <Typography sx={sx.sectionTitle}>{title}</Typography>
      </Box>
      <Box sx={dense ? sx.sectionBodyDense : sx.sectionBody}>{children}</Box>
    </Sheet>
  )
}

function DistributionRow({ title, sub, target, actual, value, status }) {
  return (
    <Box className="dpPrintRow" sx={sx.distributionRow(status)}>
      <Box sx={sx.distributionMain}>
        <Typography sx={sx.rowTitle}>{title}</Typography>
        <Typography sx={sx.rowSub}>{sub}</Typography>
      </Box>
      <Box component="span" sx={sx.countChip(status)}>
        {formatNumber(actual)} / {formatNumber(target)}
      </Box>
      <Box component="span" sx={sx.valueChip}>
        {safeText(value)}
      </Box>
    </Box>
  )
}

function PlayerNameCell({ row }) {
  return (
    <Box sx={sx.playerCell}>
      <Box
        component="img"
        src={row.photo || playerImage}
        alt=""
        sx={sx.playerAvatar}
      />
      <Typography sx={sx.playerName}>{safeText(row.fullName)}</Typography>
    </Box>
  )
}

function buildConfidenceRows(rows) {
  const rowsWithTargets = rows.filter(row => Number(row?.model?.goalsTarget || 0) > 0)

  return CONFIDENCE_LEVEL_OPTIONS.map(option => {
    const levelRows = rowsWithTargets.filter(row => row.confidenceLevel === option.value)
    const theoretical = sumRows(levelRows, row => row.model?.goalsTarget)
    const guaranteed = sumRows(levelRows, row => row.model?.guaranteedGoalsTarget)

    return {
      id: option.value,
      label: option.label,
      shortLabel: option.shortLabel,
      players: levelRows.length,
      theoretical,
      guaranteed,
      risk: Math.max(0, theoretical - guaranteed),
      tone: option.color || 'neutral',
    }
  })
}

export default function SquadSimulatorPrintReport({
  teamName,
  targetMode,
  targetProfile,
  targetPosition,
  leagueNumGames,
  leagueGameTime,
  formation,
  model,
  rows = [],
  goalsKpi,
  confidenceKpi,
  minutesKpi,
  bankKpi,
  positionDistribution = [],
  minutesDistribution = [],
}) {
  const targetLabel = model?.targetContext?.label || targetProfile || targetPosition
  const generatedAt = new Intl.DateTimeFormat('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date())

  const visibleGoalTiers = (model?.summaries?.goalTiers || []).filter(tier => tier.id !== 'none')
  const confidenceRows = buildConfidenceRows(rows)

  return (
    <Box className="dpPrintRoot" sx={sx.root}>
      <Box sx={sx.hero}>
        <Box sx={sx.heroText}>
          <Typography sx={sx.eyebrow}>DevPlan Squad Simulator</Typography>
          <Typography sx={sx.title}>דוח סימולציית סגל והיערכות עונה</Typography>
          <Typography sx={sx.subtitle}>
            סימולטור אסטרטגי לחלון ההעברות | תוכנית בניית סגל למנהל מקצועי
          </Typography>
        </Box>

        <Box sx={sx.heroMeta}>
          <HighlightPill label="קבוצה" value={teamName || 'לא הוזן'} />
          <HighlightPill label="מערך" value={formation} />
          <HighlightPill label="תאריך הדפסה" value={generatedAt} />
        </Box>
      </Box>

      <Box sx={sx.contextBar}>
        <HighlightPill
          label="סוג יעד"
          value={targetMode === 'exact' ? 'מיקום מדויק' : 'אזור טבלה'}
        />
        <HighlightPill label="יעד טבלה" value={targetLabel} />
        <HighlightPill label="משחקים" value={leagueNumGames} />
        <HighlightPill label="דקות משחק" value={leagueGameTime} />
      </Box>

      <Section number="1" title="תמונת מצב מרכזית">
        <Box sx={sx.kpiGrid}>
          <KpiBox
            label="חלוקת שערים"
            value={`${formatNumber(goalsKpi?.allocated)} / ${formatNumber(goalsKpi?.target)}`}
            sub={`מובטח ${formatNumber(goalsKpi?.guaranteed)} | כיסוי ${formatPct(goalsKpi?.guaranteedCoveragePct)}`}
            tone="green"
          />
          <KpiBox
            label="חלוקת דקות"
            value={`${formatNumber(minutesKpi?.allocated)} / ${formatNumber(minutesKpi?.target)}`}
            sub={`${formatPct(minutesKpi?.coveragePct)} כיסוי`}
            tone="orange"
          />
          <KpiBox
            label="ביטחון סגל"
            value={`${formatNumber(confidenceKpi?.scorePct)}%`}
            sub={`סיכון ${formatNumber(confidenceKpi?.riskGoalsGap)} שערים`}
            tone="blue"
          />
          <KpiBox
            label="שמות שחקנים"
            value={`${formatNumber(bankKpi?.selectedRows)} / ${formatNumber(bankKpi?.namedPlayers)}`}
            sub={`ייחודיים בסגל ${formatNumber(bankKpi?.uniqueSelectedPlayers)}`}
            tone="slate"
          />
        </Box>
      </Section>

      <Section number="2" title="ניהול סיכוני תפוקה לפי רמות ודאות" dense>
        <Box sx={sx.confidenceGrid}>
          {confidenceRows.map(item => (
            <Box key={item.id} sx={sx.confidenceCard(item.tone)}>
              <Box>
                <Typography sx={sx.confidenceTitle}>{item.label}</Typography>
                <Typography sx={sx.confidenceSub}>{formatNumber(item.players)} שחקנים</Typography>
              </Box>
              <Box sx={sx.confidenceNumbers}>
                <Typography sx={sx.confidenceValue}>
                  {formatNumber(item.guaranteed)} / {formatNumber(item.theoretical)}
                </Typography>
                <Typography sx={sx.confidenceSub}>מובטח / תאורטי</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Section>

      <Section number="3" title="פריסת עמדות לפי המערך" dense>
        <Box sx={sx.positionGrid}>
          {positionDistribution.map(item => (
            <Box key={item.id} sx={sx.positionChip(item.status)}>
              <Typography sx={sx.positionCode}>{item.id}</Typography>
              <Typography sx={sx.positionCount}>
                {formatNumber(item.actualCount)} / {formatNumber(item.targetCount)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Section>

      <Box sx={sx.splitGrid}>
        <Section number="4" title="פיזור כובשים" dense>
          <Box sx={sx.list}>
            {visibleGoalTiers.map(tier => (
              <DistributionRow
                key={tier.id}
                title={tier.label}
                sub={`${tier.excelLabel} שערים`}
                target={tier.targetCount}
                actual={tier.actualCount}
                value={`${formatNumber(tier.guaranteedGoalsTargetTotal ?? tier.goalsTargetTotal)} ש' מובטח`}
                status={tier.status}
              />
            ))}
          </Box>
        </Section>

        <Section number="5" title="פיזור חלוקת דקות בסגל" dense>
          <Box sx={sx.list}>
            {minutesDistribution.map(item => (
              <DistributionRow
                key={item.id}
                title={`${item.label} דקות`}
                sub={`שחקנים מעל ${item.label}`}
                target={item.targetCount}
                actual={item.actualCount}
                value={getStatusText(item.status)}
                status={item.status}
              />
            ))}
          </Box>
        </Section>
      </Box>

      <Sheet className="dpPrintSection" sx={sx.tableSection}>
        <Box sx={sx.sectionHeader}>
          <Box sx={sx.sectionNumber}>6</Box>
          <Typography sx={sx.sectionTitle}>טבלת שחקנים מתוכננת</Typography>
        </Box>

        <Box sx={sx.sectionBodyDense}>
          <Box component="table" sx={sx.table}>
            <Box component="thead">
              <Box component="tr">
                <Box component="th">#</Box>
                <Box component="th">שחקן</Box>
                <Box component="th">מעמד</Box>
                <Box component="th">עמדה</Box>
                <Box component="th">מדרגת שערים</Box>
                <Box component="th">ודאות</Box>
                <Box component="th">מובטח</Box>
                <Box component="th">דקות</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {rows.map((row, index) => (
                <Box component="tr" key={row.id || index}>
                  <Box component="td">{index + 1}</Box>
                  <Box component="td">
                    <PlayerNameCell row={row} />
                  </Box>
                  <Box component="td">{safeText(roleLabelById[row.squadRole])}</Box>
                  <Box component="td">{safeText(row.primaryPosition || row.slotId)}</Box>
                  <Box component="td">{safeText(row.model?.excelGoalTierLabel)}</Box>
                  <Box component="td">
                    {safeText(row.model?.confidenceLabel || confidenceLabelById[row.confidenceLevel])}
                  </Box>
                  <Box component="td">{formatNumber(row.model?.guaranteedGoalsTarget)}</Box>
                  <Box component="td">{getMinutesBucketLabel(row.model?.minutesTarget)}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Sheet>
    </Box>
  )
}
