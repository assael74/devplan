import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import useScrollToTopOnChange from '../../../../../../../ui/core/useScrollToTopOnChange.js'
import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'
import TeamKpiOverview from '../../performance/components/TeamKpiOverview.js'
import TeamPerformanceContextBar from '../../performance/components/TeamPerformanceContextBar.js'
import TeamPositionClassificationTable from '../../positionClassification/components/TeamPositionClassificationTable.js'
import TeamScoutingSummary from '../../scouting/components/TeamScoutingSummary.js'
import TeamStructureSection from '../../structure/components/TeamStructureSection.js'
import LeagueName from '../../../../components/entities/LeagueName.js'
import exportTeamPositionClassificationToXlsx from '../../positionClassification/logic/teamPositionClassification.export.js'
import { TEAM_STRUCTURE_FILTER } from '../../structure/model/teamStructureFilter.model.js'

const Section = ({ iconId = 'players', title, titleMeta = null, action = null, children }) => (
  <Box sx={sx.section}>
    <Box sx={sx.sectionHeader}>
      <Box sx={sx.sectionTitleRow}>
        <Box sx={sx.sectionTitleIcon}>{iconUi({ id: iconId, size: 'sm' })}</Box>
        <Typography sx={sx.sectionTitle}>{title}</Typography>
        {titleMeta}
      </Box>
      {action}
    </Box>
    {children}
  </Box>
)

export default function TeamInformationOverview({
  view,
  seasonSnapshots = [],
  onSeasonSelect,
  profileFilterKey = 'all',
  profileFilterOptions = [],
  onProfileFilterChange,
  onPlayerRoleEdit,
  onPlayerOpen,
}) {
  const hasInsufficientSeasonSample = view?.structure?.availabilityReason ===
    'season_sample_insufficient'
  const defaultStructureFilter = (
    view?.structure?.availabilityReason === 'stats_not_loaded' ||
    hasInsufficientSeasonSample
  )
    ? TEAM_STRUCTURE_FILTER.ALL_SQUAD
    : TEAM_STRUCTURE_FILTER.CLASSIFIED
  const [structureFilter, setStructureFilter] = React.useState(defaultStructureFilter)
  const [showPerformanceContext, setShowPerformanceContext] = React.useState(false)
  const contentRef = React.useRef(null)
  const selectedProfileFilter = profileFilterOptions.find(option => (
    option.value === profileFilterKey
  )) || profileFilterOptions[0]
  const rosterSeasonChips = React.useMemo(() => {
    const seen = new Set()

    return (Array.isArray(seasonSnapshots) ? seasonSnapshots : [])
      .filter(season => {
        const seasonKey = String(season?.seasonKey || season?.seasonId || '').trim()
        if (!seasonKey || seen.has(seasonKey)) return false
        seen.add(seasonKey)
        return true
      })
      .map(season => ({
        key: String(season?.seasonKey || season?.seasonId).trim(),
        label: [
          season?.seasonKey || season?.seasonId,
          season?.ageGroupLabel || season?.ageGroupId,
        ].filter(Boolean).join(' · '),
        leagueName: season?.leagueName || season?.league?.leagueName || '',
        leagueLevel: season?.leagueLevel || season?.league?.leagueLevel || null,
        birthYear: season?.birthYear || '',
        ageGroupLabel: season?.ageGroupLabel || season?.ageGroupId || '',
        selected: String(season?.seasonKey || season?.seasonId || '').trim() === String(view.selectedSeasonKey || '').trim(),
        leagueId: String(season?.leagueId || '').trim(),
      }))
  }, [seasonSnapshots, view.selectedSeasonKey])
  const performanceRef = React.useRef(null)
  useScrollToTopOnChange(contentRef, view.selectedSeasonKey)
  const renderSeasonChip = (season, interactive = true) => (
    <Chip
      key={season.key}
      size='sm'
      variant='soft'
      color='neutral'
      sx={[
        sx.rosterSeasonChip,
        season.selected && sx.rosterSeasonChipSelected,
        !interactive && sx.rosterSeasonChipStatic,
      ]}
      onClick={interactive ? () => onSeasonSelect?.(season) : undefined}
    >
      <Box sx={sx.rosterSeasonChipContent}>
        <Typography component='span' sx={sx.rosterSeasonChipText}>{season.label}</Typography>
        {season.leagueName ? (
          <>
            <Typography component='span' sx={sx.rosterSeasonChipSeparator}>·</Typography>
            <LeagueName
              value={season.leagueName}
              level={season.leagueLevel}
              showLevel
              fontSize={10}
              levelFontSize={9}
              nameSx={sx.rosterSeasonChipText}
              levelSx={sx.rosterSeasonLeagueLevel}
            />
          </>
        ) : null}
      </Box>
    </Chip>
  )
  const renderSeasonChips = () => (
    <Box sx={sx.rosterSeasonChips} aria-label='בחירת עונה לשנתון'>
      {rosterSeasonChips.map(season => renderSeasonChip(season))}
    </Box>
  )
  const selectedSeasonChip = rosterSeasonChips.find(season => season.selected)

  React.useEffect(() => {
    // Before stats are loaded, position classification is intentionally not
    // available. Show the persisted roster instead of an empty classified
    // table; once stats exist, retain the focused classified default.
    setStructureFilter(defaultStructureFilter)
  }, [defaultStructureFilter, view.selectedSeasonKey])

  React.useEffect(() => {
    const root = contentRef.current
    const target = performanceRef.current
    if (!root || !target) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      setShowPerformanceContext(!entry.isIntersecting)
    }, { root, threshold: 0.05 })

    observer.observe(target)
    return () => observer.disconnect()
  }, [view.selectedSeasonKey])

  const handlePositionClassificationExport = React.useCallback(() => {
    exportTeamPositionClassificationToXlsx({
      rows: view.positionClassificationRows,
      teamName: view.team?.name,
      seasonKey: view.selectedSeasonKey,
      birthYear: selectedSeasonChip?.birthYear || view.team?.birthYear,
      ageGroupLabel: selectedSeasonChip?.ageGroupLabel,
    })
  }, [
    selectedSeasonChip?.ageGroupLabel,
    selectedSeasonChip?.birthYear,
    view.positionClassificationRows,
    view.selectedSeasonKey,
    view.team?.birthYear,
    view.team?.name,
  ])

  const handleReturnToPerformance = React.useCallback(() => {
    performanceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const rosterProfileFilter = (
    <Select
      size='sm'
      value={profileFilterKey || 'all'}
      onChange={(_, value) => onProfileFilterChange?.(value || 'all')}
      disabled={!profileFilterOptions.length}
      indicator={null}
      sx={sx.rosterProfileFilterSelect}
      slotProps={{
        listbox: {
          className: 'dpScrollThin',
          sx: sx.rosterProfileFilterListbox,
        },
      }}
      renderValue={() => {
        if (!selectedProfileFilter) return 'כל הפרופילים'

        return (
          <Box sx={sx.rosterProfileFilterValue}>
            <Box sx={sx.rosterProfileFilterIcon}>
              {iconUi({ id: selectedProfileFilter.iconId || 'profile', size: 'sm' })}
            </Box>
            <Typography sx={sx.rosterProfileFilterValuePrimary}>
              {selectedProfileFilter.label}
            </Typography>
            <Typography sx={sx.rosterProfileFilterValueCount}>
              {selectedProfileFilter.count}
            </Typography>
          </Box>
        )
      }}
    >
      {profileFilterOptions.map(option => (
        <Option key={option.value} value={option.value} sx={sx.rosterProfileFilterOption}>
          <Box sx={sx.rosterProfileFilterOptionContent}>
            <Box sx={sx.rosterProfileFilterIcon}>
              {iconUi({ id: option.iconId || 'profile', size: 'sm' })}
            </Box>
            <Typography sx={sx.rosterProfileFilterOptionLabel}>{option.label}</Typography>
            <Box component='span' sx={sx.rosterProfileFilterOptionCount}>{option.count}</Box>
          </Box>
        </Option>
      ))}
    </Select>
  )

  const rosterTableToolbar = (
    <Box sx={sx.rosterTableToolbar}>
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
      {rosterProfileFilter}
    </Box>
  )

  return (
    <Box ref={contentRef} className='dpScrollThin' sx={sx.content}>
      <Box ref={performanceRef} sx={sx.performanceAnchor}>
        <TeamKpiOverview
          team={view.team}
          title='ביצוע השנתון'
          titleMeta={rosterSeasonChips.length ? renderSeasonChips() : null}
          tablePositionTimeline={view.seasonTimeline}
          offensePriorityTimeline={view.offensePriorityTimeline}
          defensePriorityTimeline={view.defensePriorityTimeline}
        />
      </Box>

      {showPerformanceContext ? (
        <TeamPerformanceContextBar
          offensePriority={view.offensePriorityTimeline?.[0]?.level}
          defensePriority={view.defensePriorityTimeline?.[0]?.level}
          squadUsageState={view.structure?.classificationCoverageBenchmark?.state}
          seasonChip={selectedSeasonChip ? renderSeasonChip(selectedSeasonChip, false) : null}
          onReturnToPerformance={handleReturnToPerformance}
        />
      ) : null}

      <TeamScoutingSummary
        structure={view.structure}
        balance={view.balance}
        title='איזון חלוקת הדקות'
        titleMeta={rosterSeasonChips.length ? renderSeasonChips() : null}
        selectedFilter={structureFilter}
        onFilterChange={setStructureFilter}
      />

      <TeamStructureSection
        structure={view.structure}
        title='איזון מבנה העמדות'
        titleMeta={rosterSeasonChips.length ? renderSeasonChips() : null}
        seasonKey={view.selectedSeasonKey}
        selectedFilter={structureFilter}
        onFilterChange={setStructureFilter}
      />

      <Section
        title='שחקני סגל'
        titleMeta={rosterSeasonChips.length ? renderSeasonChips() : null}
      >
        {hasInsufficientSeasonSample ? (
          <Typography sx={sx.rosterSampleNotice}>
            המדגם עדיין קטן — נתוני השחקנים מוצגים, אך ניתוח הסגל והביצועים הוא ראשוני ותחזיתי.
          </Typography>
        ) : null}
        <TeamPositionClassificationTable
          rows={view.positionClassificationRows}
          teamName={view.team?.name}
          seasonKey={view.selectedSeasonKey}
          birthYear={selectedSeasonChip?.birthYear || view.team?.birthYear}
          ageGroupLabel={selectedSeasonChip?.ageGroupLabel}
          onPlayerRoleEdit={onPlayerRoleEdit}
          onPlayerOpen={onPlayerOpen}
          structureFilter={structureFilter}
          embedded
          toolbar={rosterTableToolbar}
        />
      </Section>
    </Box>
  )
}
