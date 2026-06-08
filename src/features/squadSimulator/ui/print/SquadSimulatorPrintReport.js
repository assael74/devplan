import { Box, Sheet, Typography } from '@mui/joy'

import playerImage from '../../../../ui/core/images/playerImage.jpg'
import { ROLE_OPTIONS } from '../simulatorUi.constants.js'
import { formatNumber, getMinutesBucketLabel } from '../simulatorUi.utils.js'
import { squadSimulatorPrintSx as sx } from './sx/squadSimulatorPrint.sx.js'

const roleLabelById = ROLE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label
  return acc
}, {})

const safeText = value => {
  const text = String(value || '').trim()
  return text || '-'
}

const formatPct = value => `${Number(value || 0)}%`

function MetaBox({ label, value }) {
  return (
    <Box sx={sx.metaBox}>
      <Typography sx={sx.metaLabel}>{label}</Typography>
      <Typography sx={sx.metaValue}>{safeText(value)}</Typography>
    </Box>
  )
}

function KpiBox({ label, value, sub }) {
  return (
    <Box sx={sx.kpiBox}>
      <Typography sx={sx.kpiLabel}>{label}</Typography>
      <Typography sx={sx.kpiValue}>{value}</Typography>
      <Typography sx={sx.kpiSub}>{sub}</Typography>
    </Box>
  )
}

function Section({ title, children }) {
  return (
    <Sheet className="dpPrintSection" sx={sx.section}>
      <Typography sx={sx.sectionHeader}>{title}</Typography>
      <Box sx={sx.sectionBody}>{children}</Box>
    </Sheet>
  )
}

function SummaryRow({ title, sub, count, value }) {
  return (
    <Box className="dpPrintRow" sx={sx.summaryRow}>
      <Box>
        <Typography sx={sx.rowTitle}>{title}</Typography>
        <Typography sx={sx.rowSub}>{sub}</Typography>
      </Box>
      <Box component="span" sx={sx.chip}>
        {count}
      </Box>
      <Box component="span" sx={sx.chip}>
        {value}
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

  return (
    <Box className="dpPrintRoot" sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleBlock}>
          <Typography sx={sx.title}>דוח תכנון וסימולציית סגל</Typography>
          <Typography sx={sx.subtitle}>
            מופק עבור: מנהל מקצועי | מערכת תומכת החלטה DevPlan
          </Typography>
          <Typography sx={sx.subtitle}>מועד הפקה: {generatedAt}</Typography>
        </Box>
        <Box sx={sx.brand}>
          <Typography>DevPlan</Typography>
          <Typography sx={sx.subtitle}>Analytics</Typography>
        </Box>
      </Box>

      <Section title="1. הגדרות יעד ופרופיל קבוצה">
        <Box sx={sx.metaGrid}>
          <MetaBox label="שם קבוצה" value={teamName || 'לא הוזן'} />
          <MetaBox label="סוג יעד" value={targetMode === 'exact' ? 'מיקום מדויק' : 'אזור טבלה'} />
          <MetaBox label="יעד" value={targetLabel} />
          <MetaBox label="מערך" value={formation} />
          <MetaBox label="משחקים" value={leagueNumGames} />
          <MetaBox label="דקות משחק" value={leagueGameTime} />
          <MetaBox label="פרופיל מחושב" value={model?.targetContext?.targetProfileId} />
          <MetaBox label="שורות סגל" value={rows.length} />
        </Box>
      </Section>

      <Section title="2. סיכום דקות ושערים מתוכנן">
        <Box sx={sx.kpiGrid}>
          <KpiBox
            label="פוטנציאל שערים"
            value={`${formatNumber(goalsKpi?.target)} / ${formatNumber(goalsKpi?.allocated)}`}
            sub={`מובטח ${formatNumber(goalsKpi?.guaranteed)} | ${formatPct(goalsKpi?.guaranteedCoveragePct)}`}
          />
          <KpiBox
            label="ביטחון סגל"
            value={`${formatNumber(confidenceKpi?.scorePct)}%`}
            sub={`דורגו ${formatNumber(confidenceKpi?.targetRows)} / ${formatNumber(confidenceKpi?.ratedRows)} | סיכון ${formatNumber(confidenceKpi?.riskGoalsGap)} שערים`}
          />
          <KpiBox
            label="חלוקת דקות"
            value={`${formatNumber(minutesKpi?.target)} / ${formatNumber(minutesKpi?.allocated)}`}
            sub={`${formatPct(minutesKpi?.coveragePct)} כיסוי`}
          />
          <KpiBox
            label="רישום שחקנים"
            value={`${formatNumber(bankKpi?.selectedRows)} / ${formatNumber(bankKpi?.namedPlayers)}`}
            sub={`ייחודיים בסגל ${formatNumber(bankKpi?.uniqueSelectedPlayers)}`}
          />
          <KpiBox
            label="פער שערים"
            value={formatNumber(model?.totals?.gap)}
            sub="פער מול יעד הקבוצה"
          />
        </Box>
      </Section>

      <Box sx={sx.splitGrid}>
        <Section title="3. פיזור כובשים">
          <Box sx={sx.list}>
            {visibleGoalTiers.map(tier => (
              <SummaryRow
                key={tier.id}
                title={tier.label}
                sub={`${tier.excelLabel} שערים`}
                count={`${tier.targetCount} / ${tier.actualCount}`}
                value={`${tier.goalsTargetTotal} / ${tier.guaranteedGoalsTargetTotal ?? tier.goalsTargetTotal} ש'`}
              />
            ))}
          </Box>
        </Section>

        <Section title="4. פיזור דקות בסגל">
          <Box sx={sx.list}>
            {minutesDistribution.map(item => (
              <SummaryRow
                key={item.id}
                title={`${item.label} דקות`}
                sub={`שחקנים מעל ${item.label}`}
                count={`${item.targetCount} / ${item.actualCount}`}
                value={item.label}
              />
            ))}
          </Box>
        </Section>
      </Box>

      <Section title="5. פריסת עמדות לפי מערך">
        <Box sx={sx.list}>
          {positionDistribution.map(item => (
            <SummaryRow
              key={item.id}
              title={item.id}
              sub="כמות שחקנים מול יעד עומק"
              count={`${item.targetCount} / ${item.actualCount}`}
              value={item.status}
            />
          ))}
        </Box>
      </Section>

      <Section title="6. טבלת סגל מתוכנן">
        <Box component="table" sx={sx.table}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th">#</Box>
              <Box component="th">שחקן</Box>
              <Box component="th">מעמד</Box>
              <Box component="th">ודאות</Box>
              <Box component="th">עמדה</Box>
              <Box component="th">סלוט</Box>
              <Box component="th">מדרגת שערים</Box>
              <Box component="th">שערים</Box>
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
                <Box component="td">{safeText(row.model?.confidenceLabel)}</Box>
                <Box component="td">{safeText(row.primaryPosition)}</Box>
                <Box component="td">{safeText(row.slotId)}</Box>
                <Box component="td">{safeText(row.model?.excelGoalTierLabel)}</Box>
                <Box component="td">{formatNumber(row.model?.goalsTarget)}</Box>
                <Box component="td">{formatNumber(row.model?.guaranteedGoalsTarget)}</Box>
                <Box component="td">{getMinutesBucketLabel(row.model?.minutesTarget)}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Section>

      <Box sx={sx.noteBox}>
        הדוח מציג סימולציה תכנונית בלבד. אם שורה ללא מעמד בסגל, לא מוקצים לה יעדי דקות או שערים.
      </Box>
    </Box>
  )
}
