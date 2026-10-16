// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamRosterWorkspace.js

import * as React from 'react'
import { Box, Button, IconButton, Option, Select, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import TeamPositionClassificationTable from '../../positionClassification/components/TeamPositionClassificationTable.js'
import exportTeamPositionClassificationToXlsx from '../../positionClassification/logic/teamPositionClassification.export.js'
import TeamYearScoutProfilesSection from '../../yearDevelopment/components/TeamYearScoutProfilesSection.js'
import TeamSeasonPicker from './TeamSeasonPicker.js'
import { formatTeamLoadAge } from '../model/teamRosterLoad.presentation.js'
import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'

export default function TeamRosterWorkspace({
  overview = false,
  collapsible = false,
  showProfiles = true,
  view,
  tableView = null,
  seasons,
  onSeasonSelect,
  profileFilterKey,
  profileFilterOptions,
  onProfileFilterChange,
  onPlayerRoleEdit,
  onPlayerOpen,
  structureFilter,
  favoritePlayerKeys,
  onFavoriteToggle,
  insightNotes = [],
  selectedPlayer = null,
  onPlayerSelect,
  onSelectionClear,
}) {
  const [rosterOpen, setRosterOpen] = React.useState(true)
  const [now, setNow] = React.useState(() => Date.now())
  const [openProfileSeasonKey, setOpenProfileSeasonKey] = React.useState('')
  const canCollapse = overview || collapsible
  const selectedView = tableView || view
  const selectedPlayerInSeason = selectedPlayer && selectedView.allPositionClassificationRows?.some(row => (
    (row.favoriteKey || row.id) === selectedPlayer.key
  ))
  const rosterContentId = React.useId()
  const selectedSeason = seasons.find(season => season.selected)
  const selectedProfileFilter = profileFilterOptions.find(option => (
    option.value === profileFilterKey
  )) || profileFilterOptions[0]
  const hasInsufficientSeasonSample = selectedView?.structure?.availabilityReason ===
    'season_sample_insufficient'
  const rosterPlayerCount = Number(selectedView.selectedTeamSeason?.playersCount) || 0
  const rosterLoadLabel = formatTeamLoadAge(
    selectedView.selectedTeamSeason?.roster?.rosterImport?.loadedAt,
    now
  ) || 'לא תועד'
  const statsLoadLabel = selectedView.selectedTeamSeason?.stats?.statsLoadState?.status === 'loaded'
    ? formatTeamLoadAge(selectedView.selectedTeamSeason.stats.statsLoadState.updatedAt, now) || 'לא תועד'
    : 'טרם נטען'

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleExport = () => exportTeamPositionClassificationToXlsx({
    rows: selectedView.positionClassificationRows,
    seasonDoc: selectedView.selectedTeamSeason,
    teamName: selectedView.team?.name,
    seasonKey: selectedView.selectedSeasonKey,
    birthYear: selectedSeason?.birthYear || selectedView.team?.birthYear,
    ageGroupLabel: selectedSeason?.ageGroupLabel,
  })

  const profileFilter = (
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
      renderValue={() => !selectedProfileFilter ? 'כל הפרופילים' : (
        <Box sx={sx.rosterProfileFilterValue}>
          <Box sx={sx.rosterProfileFilterIcon}>
            {iconUi({ id: selectedProfileFilter.iconId || 'profile', size: 'sm' })}
          </Box>
          <Typography sx={sx.rosterProfileFilterValuePrimary}>{selectedProfileFilter.label}</Typography>
          <Typography sx={sx.rosterProfileFilterValueCount}>{selectedProfileFilter.count}</Typography>
        </Box>
      )}
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

  const exportButton = (
    <Tooltip title='ייצוא כל נתוני הטבלה ל־Excel' placement='bottom'>
      <Button
        size='sm'
        variant='outlined'
        color='neutral'
        aria-label='ייצוא נתוני סיווג העמדה ל־Excel'
        sx={sx.sectionExportButton}
        disabled={!selectedView.positionClassificationRows?.length}
        onClick={handleExport}
        startDecorator={iconUi({ id: 'download', size: 'sm' })}
      >
        Excel
      </Button>
    </Tooltip>
  )

  const loadDates = (
    <Box sx={sx.loadTimes}>
      <Tooltip title={`טעינת סגל · ${rosterLoadLabel}`}>
        <Typography level='body-xs' startDecorator={iconUi({ id: 'addPlayers', size: 'sm' })} sx={sx.loadTimeItem}>
          <Box component='span' sx={sx.loadTimeText}>{rosterLoadLabel}</Box>
        </Typography>
      </Tooltip>
      <Tooltip title={`טעינת סטטס · ${statsLoadLabel}`}>
        <Typography level='body-xs' startDecorator={iconUi({ id: 'stats', size: 'sm' })} sx={sx.loadTimeItem}>
          <Box component='span' sx={sx.loadTimeText}>{statsLoadLabel}</Box>
        </Typography>
      </Tooltip>
    </Box>
  )

  return (
    <>
      {!overview && showProfiles ? (
        <TeamYearScoutProfilesSection
          overview={view.yearDevelopment}
          openSeasonKey={openProfileSeasonKey}
          onToggle={setOpenProfileSeasonKey}
          insightNotes={insightNotes}
        />
      ) : null}
      <Box sx={[sx.section, sx.compactRosterSection]}>
        <Box sx={[sx.sectionHeader, sx.rosterSectionHeader]}>
          <Box sx={sx.rosterHeaderTop}>
            <Box sx={sx.sectionTitleRow}>
              <Box sx={sx.sectionTitleIcon}>{iconUi({ id: 'players', size: 'sm' })}</Box>
              <Typography sx={sx.sectionTitle}>
                {overview ? 'סגל ומועמדים' : 'שחקני סגל'}
              </Typography>
            </Box>
            {canCollapse ? (
              <IconButton
                type='button'
                size='sm'
                variant='plain'
                color='neutral'
                aria-label={rosterOpen ? 'קיפול טבלת הסגל' : 'פתיחת טבלת הסגל'}
                aria-expanded={rosterOpen}
                aria-controls={rosterContentId}
                onClick={() => setRosterOpen(open => !open)}
                sx={sx.rosterCollapseButton(rosterOpen)}
              >
                {iconUi({ id: 'arrowDown', size: 'sm' })}
              </IconButton>
            ) : null}
          </Box>
          <Box className='dpScrollThin' sx={sx.rosterHeaderMeta}>
            {loadDates}
            <Box aria-hidden='true' sx={sx.rosterHeaderDivider} />
            <Typography sx={sx.rosterPlayerCount}>{rosterPlayerCount} שחקני סגל</Typography>
            <Box aria-hidden='true' sx={sx.rosterHeaderDivider} />
            <TeamSeasonPicker seasons={seasons} onSelect={onSeasonSelect} />
            <Box sx={sx.rosterProfileSlot}>
              {profileFilter}
              {exportButton}
            </Box>
          </Box>
        </Box>
        <Box
          id={rosterContentId}
          aria-hidden={canCollapse && !rosterOpen ? true : undefined}
          sx={canCollapse ? sx.rosterCollapseContent(rosterOpen) : undefined}
        >
          <Box sx={canCollapse ? sx.rosterCollapseInner : undefined}>
            {hasInsufficientSeasonSample ? (
              <Typography sx={sx.rosterSampleNotice}>
                המדגם עדיין קטן — נתוני השחקנים מוצגים, אך ניתוח הסגל והביצועים הוא ראשוני ותחזיתי.
              </Typography>
            ) : null}
            <TeamPositionClassificationTable
              rows={selectedView.positionClassificationRows}
              seasonDoc={selectedView.selectedTeamSeason}
              teamName={selectedView.team?.name}
              seasonKey={selectedView.selectedSeasonKey}
              birthYear={selectedSeason?.birthYear || selectedView.team?.birthYear}
              ageGroupLabel={selectedSeason?.ageGroupLabel}
              onPlayerRoleEdit={onPlayerRoleEdit}
              onPlayerOpen={onPlayerOpen}
              favoritePlayerKeys={favoritePlayerKeys}
              onFavoriteToggle={onFavoriteToggle}
              structureFilter={structureFilter}
              selectedPlayerKey={selectedPlayer?.key || ''}
              onPlayerSelect={onPlayerSelect}
              toolbar={onPlayerSelect ? (
                <Box sx={sx.rosterSelectionToolbar}>
                  <Typography level='body-sm' aria-live='polite'>
                    {selectedPlayer
                      ? `${selectedPlayer.name} · ${selectedPlayerInSeason ? 'הסימון נשמר בהחלפת עונה' : `אינו מופיע בנתוני עונת ${selectedView.selectedSeasonKey}`}`
                      : 'לחצו על שורה או על מספר השחקן כדי לסמן אותו להשוואה בין העונות'}
                  </Typography>
                  {selectedPlayer ? <Button size='sm' variant='plain' onClick={onSelectionClear}>ביטול סימון</Button> : null}
                </Box>
              ) : null}
              embedded
            />
          </Box>
        </Box>
      </Box>
    </>
  )
}
