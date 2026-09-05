import * as React from 'react'
import { Box, Button, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamInformationSx as sx } from './sx/teamInformation.sx.js'
import TeamKpiOverview from './TeamKpiOverview.js'
import TeamPositionClassificationTable from './TeamPositionClassificationTable.js'
import TeamScoutingSummary from './TeamScoutingSummary.js'
import TeamStructureSection from './TeamStructureSection.js'
import exportTeamPositionClassificationToXlsx from './logic/teamPositionClassification.export.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'

export const TEAM_BALANCE_PRESENTATION = Object.freeze({
  PROFILE: 'profile',
  LEGACY: 'legacy',
})

const displayValue = value => value === null || value === undefined
  ? 'אין מספיק נתונים'
  : value

const Section = ({ iconId = 'players', title, action = null, children }) => (
  <Box sx={sx.section}>
    <Box sx={sx.sectionHeader}>
      <Box sx={sx.sectionTitleRow}>
        <Box sx={sx.sectionTitleIcon}>{iconUi({ id: iconId, size: 'sm' })}</Box>
        <Typography sx={sx.sectionTitle}>{title}</Typography>
      </Box>
      {action}
    </Box>
    {children}
  </Box>
)

const BalanceCard = ({ card, opportunity = false }) => (
  <Box sx={[sx.kpi, opportunity && sx.kpiOpportunity]}>
    <Box sx={sx.kpiHeader}>
      <Box sx={sx.kpiIcon}>{iconUi({ id: card.iconId, size: 'sm' })}</Box>
      <Typography sx={sx.kpiLabel}>{card.title}</Typography>
    </Box>
    <Box sx={sx.kpiStatusRow}>
      <Typography sx={sx.kpiValue}>{displayValue(card.value)}</Typography>
      {opportunity ? (
        <Box sx={sx.kpiOpportunityMarker}>
          {iconUi({ id: 'scouting', size: 'sm' })}
          <Typography component='span' sx={sx.kpiOpportunityLabel}>הזדמנות</Typography>
        </Box>
      ) : null}
    </Box>
    <Box sx={sx.kpiMeaningRow}>
      <Tooltip
        title={card.tooltip}
        placement='bottom'
        variant='soft'
        slotProps={{ tooltip: { sx: sx.kpiTooltip } }}
      >
        <Box component='span' sx={sx.kpiInfo} aria-label={`הסבר על ${card.title}`}>
          {iconUi({ id: 'info', size: 'sm' })}
        </Box>
      </Tooltip>
      <Typography sx={sx.kpiMeta}>{card.meaning}</Typography>
    </Box>
  </Box>
)

const TeamBalanceSection = ({ balance }) => {
  if (!balance) {
    return <Section title='מצב הסגל'><Box sx={sx.empty}>אין מספיק נתונים לעונת הקבוצה הנבחרת</Box></Section>
  }

  return (
    <Section title='מצב הסגל'>
      <Box sx={sx.kpiGrid}>
        {balance.cards.map(card => <BalanceCard key={card.key} card={card} />)}
      </Box>
    </Section>
  )
}

export default function TeamInformationOverview({
  view,
  balancePresentation = TEAM_BALANCE_PRESENTATION.PROFILE,
  performancePresentation,
  onPlayerRoleEdit,
  onPlayerOpen,
}) {
  const [structureFilter, setStructureFilter] = React.useState(TEAM_STRUCTURE_FILTER.CLASSIFIED)

  React.useEffect(() => {
    setStructureFilter(TEAM_STRUCTURE_FILTER.CLASSIFIED)
  }, [view.selectedSeasonKey])

  const latestExistingSeasonKey = (view.seasonTimeline || [])
    .find(season => season?.status !== 'upcoming' && season?.seasonKey)?.seasonKey || view.selectedSeasonKey || ''

  const handlePositionClassificationExport = React.useCallback(() => {
    exportTeamPositionClassificationToXlsx({
      rows: view.positionClassificationRows,
      teamName: view.team?.name,
      seasonKey: view.selectedSeasonKey,
    })
  }, [view.positionClassificationRows, view.selectedSeasonKey, view.team?.name])

  return (
    <Box className='dpScrollThin' sx={sx.content}>
      <TeamKpiOverview
        team={view.team}
        title={`ביצוע השנתון בעונת ${latestExistingSeasonKey}`}
        tablePositionTimeline={view.seasonTimeline}
        offensePriorityTimeline={view.offensePriorityTimeline}
        defensePriorityTimeline={view.defensePriorityTimeline}
        presentation={performancePresentation}
      />

      <TeamScoutingSummary
        structure={view.structure}
        title={`איזון חלוקת הדקות בעונת ${latestExistingSeasonKey}`}
        selectedFilter={structureFilter}
        onFilterChange={setStructureFilter}
      />

      {balancePresentation === TEAM_BALANCE_PRESENTATION.LEGACY ? (
        <>
          <TeamBalanceSection balance={view.balance} />
          <TeamPositionClassificationTable
            rows={view.positionClassificationRows}
            teamName={view.team?.name}
            seasonKey={view.selectedSeasonKey}
            onPlayerRoleEdit={onPlayerRoleEdit}
            onPlayerOpen={onPlayerOpen}
            structureFilter={structureFilter}
          />
        </>
      ) : (
        <>
          <TeamStructureSection
            structure={view.structure}
            title={`איזון מבנה העמדות בעונת ${latestExistingSeasonKey}`}
            seasonKey={view.selectedSeasonKey}
            selectedFilter={structureFilter}
            onFilterChange={setStructureFilter}
          />
          <Section
            title={view.selectedSeasonKey ? `שחקני סגל לעונת ${view.selectedSeasonKey}` : 'שחקני סגל'}
            action={(
              <Tooltip title='ייצוא כל נתוני הטבלה ל־Excel' placement='bottom'>
                <Button
                  size='sm'
                  variant='outlined'
                  color='neutral'
                  aria-label='ייצוא נתוני סיווג העמדה ל־Excel'
                  sx={sx.sectionExportButton}
                  disabled={!view.positionClassificationRows?.length}
                  onClick={handlePositionClassificationExport}
                  startDecorator={iconUi({ id: 'download', size: 'sm' })}
                >
                  Excel
                </Button>
              </Tooltip>
            )}
          >
            <TeamPositionClassificationTable
              rows={view.positionClassificationRows}
              teamName={view.team?.name}
              seasonKey={view.selectedSeasonKey}
              onPlayerRoleEdit={onPlayerRoleEdit}
              onPlayerOpen={onPlayerOpen}
              structureFilter={structureFilter}
              embedded
            />
          </Section>
        </>
      )}
    </Box>
  )
}
