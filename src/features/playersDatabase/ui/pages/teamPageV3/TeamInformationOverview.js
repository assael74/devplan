import * as React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamInformationSx as sx } from './sx/teamInformation.sx.js'
import TeamKpiOverview from './TeamKpiOverview.js'
import TeamPositionClassificationTable from './TeamPositionClassificationTable.js'
import TeamStructureSection from './TeamStructureSection.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'

export const TEAM_BALANCE_PRESENTATION = Object.freeze({
  PROFILE: 'profile',
  LEGACY: 'legacy',
})

const displayValue = value => value === null || value === undefined
  ? 'אין מספיק נתונים'
  : value

const Section = ({ title, meta = '', children }) => (
  <Box sx={sx.section}>
    <Box sx={sx.sectionHeader}>
      <Typography sx={sx.sectionTitle}>{title}</Typography>
      {meta ? <Typography sx={sx.sectionMeta}>{meta}</Typography> : null}
    </Box>
    {children}
  </Box>
)

// `opportunity` is a UI-only, opt-in visual variant. No balance band or data value enables it yet.
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
    <Section title='מצב הסגל' meta='איזון ושימוש בסגל'>
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

  return (
    <Box className='dpScrollThin' sx={sx.content}>
      <TeamKpiOverview
        team={view.team}
        tablePositionTimeline={view.seasonTimeline}
        offensePriorityTimeline={view.offensePriorityTimeline}
        defensePriorityTimeline={view.defensePriorityTimeline}
        presentation={performancePresentation}
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
        <TeamStructureSection
          structure={view.structure}
          title='ניתוח סגל'
          selectedFilter={structureFilter}
          onFilterChange={setStructureFilter}
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
        </TeamStructureSection>
      )}
    </Box>
  )
}
