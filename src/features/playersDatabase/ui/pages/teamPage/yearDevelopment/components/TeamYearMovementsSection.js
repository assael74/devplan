// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/components/TeamYearMovementsSection.js
import * as React from 'react'
import { Avatar, Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../../../ui/patterns/collapseBox/index.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import PlayerLineClassificationChip from '../../../../components/playerMeta/PlayerLineClassificationChip.js'
import ScoutProfileChip from '../../../../components/scout/profile/ScoutProfileChip.js'
import { sortDataTableRows } from '../../../../components/tables/dataTable/dataTable.sort.js'
import { buildTableScoutProfileChip } from '../../positionClassification/model/teamPositionScoutProfile.presentation.js'
import { directionPresentation } from '../model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
import { teamYearDevelopmentSharedSx } from '../sx/teamYearDevelopmentShared.sx.js'
import { teamYearMovementsSectionSx } from '../sx/teamYearMovementsSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearMovementsSectionSx }
const lineSortLabels = { DEFENSE: 'הגנה', MIDFIELD: 'קישור', ATTACK: 'התקפה' }
const getLevelSortValue = movement => {
  if (movement.levelChange === null || movement.levelChange === undefined) return null
  if (movement.direction === 'up') return movement.levelChange
  if (movement.direction === 'down') return -movement.levelChange
  return movement.direction === 'lateral' ? 0 : null
}

const movementSortColumns = [
  { key: 'name', label: 'שחקן', getSortValue: movement => movement.name },
  {
    key: 'position',
    label: 'עמדה',
    getSortValue: movement => {
      if (movement.player?.primaryPosition === 'GK' || movement.player?.positionLayer === 'goalkeeper') return 'שוער'
      const line = lineSortLabels[movement.classification?.line] || ''
      return [line, movement.classification?.position].filter(Boolean).join(' ') || null
    },
  },
  {
    key: 'scoutProfile',
    label: 'פרופיל סקאוט',
    getSortValue: movement => buildTableScoutProfileChip(movement.player)?.label || null,
  },
  { key: 'otherTeamName', label: '', getSortValue: movement => movement.otherTeamName },
  { key: 'levelChange', label: 'שינוי רמת מועדון', getSortValue: getLevelSortValue },
]

function MovementGroup({ group, rows }) {
  const [sortState, setSortState] = React.useState({ key: 'levelChange', direction: 'desc' })
  const columns = React.useMemo(() => movementSortColumns.map(column => (
    column.key === 'otherTeamName' ? { ...column, label: group.teamColumn } : column
  )), [group.teamColumn])
  const sortedRows = React.useMemo(() => sortDataTableRows({
    rows,
    column: columns.find(column => column.key === sortState.key),
    direction: sortState.direction,
  }), [rows, columns, sortState])

  const handleSort = key => setSortState(current => ({
    key,
    direction: current.key === key
      ? (current.direction === 'asc' ? 'desc' : 'asc')
      : (key === 'levelChange' ? 'desc' : 'asc'),
  }))

  const sortButton = column => (
    <Box
      component='button'
      type='button'
      key={column.key}
      onClick={() => handleSort(column.key)}
      aria-label={`מיון לפי ${column.label}`}
      sx={[sx.movementSortButton, sortState.key === column.key && sx.movementSortButtonActive]}
    >
      {column.label}
      {sortState.key === column.key && iconUi({
        id: sortState.direction === 'asc' ? 'sortUp' : 'sortDown',
        size: 'sm',
        sx: sx.movementSortIcon,
      })}
    </Box>
  )

  return (
    <Box sx={sx.movementGroup}>
      <Typography sx={sx.movementGroupTitle}>{group.title} · {rows.length}</Typography>
      <Box sx={sx.movementTableHeader}>
        {columns.map(column => (
          <Box
            key={column.key}
            role='columnheader'
            aria-sort={sortState.key === column.key
              ? (sortState.direction === 'asc' ? 'ascending' : 'descending')
              : 'none'}
          >
            {sortButton(column)}
          </Box>
        ))}
      </Box>
      <Box sx={sx.movementMobileSort} aria-label={`מיון תנועת שחקנים: ${group.title}`}>
        {columns.map(sortButton)}
      </Box>
      <Box sx={sx.movementList}>
        {sortedRows.map((movement, index) => {
          const presentation = directionPresentation(movement.direction)
          const profileChip = buildTableScoutProfileChip(movement.player)
          const level = movement.levelChange === null
            ? '—'
            : `${movement.levelChange} ${movement.levelChange === 1 ? 'רמה' : 'רמות'}`

          return (
            <Box key={movement.movementId || `${movement.name}-${index}`} sx={sx.movementItem}>
              <Box sx={sx.movementPlayer}>
                <Avatar src={playerImage} alt='' sx={sx.movementAvatar} />
                <Typography sx={sx.movementName}>{movement.name}</Typography>
              </Box>
              <Box sx={sx.movementCell}>
                <Typography sx={sx.movementMobileLabel}>עמדה</Typography>
                <PlayerLineClassificationChip
                  classification={movement.classification}
                  primaryPosition={movement.player?.primaryPosition}
                  positionLayer={movement.player?.positionLayer}
                  compact
                />
              </Box>
              <Box sx={sx.movementCell}>
                <Typography sx={sx.movementMobileLabel}>פרופיל סקאוט</Typography>
                {profileChip ? (
                  <ScoutProfileChip {...profileChip} size='compact' showConditions showConditionsDepth />
                ) : <Typography sx={sx.movementDetail}>—</Typography>}
              </Box>
              <Box sx={sx.movementCell}>
                <Typography sx={sx.movementMobileLabel}>{group.teamColumn}</Typography>
                <Typography sx={sx.movementTeam}>{movement.otherTeamName || '—'}</Typography>
              </Box>
              <Box sx={sx.movementCell}>
                <Typography sx={sx.movementMobileLabel}>שינוי רמת מועדון</Typography>
                <Tooltip title={movement.levelChange === null
                  ? 'אין השוואת רמות מועדון זמינה למעבר זה'
                  : 'לפי רמות המועדונים בספרייה הנוכחית'}>
                  <Box sx={sx.movementTag(presentation.color)}>
                    {iconUi({ id: presentation.iconId, size: 'sm' })}
                    <Typography component='span' sx={sx.movementTagText}>{level}</Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default function TeamYearMovementsSection({ seasons = [], openSeasonKey = '', onToggle }) {
  return (
    <TeamYearSection iconId='swapVert' title='מעברי שחקנים לאורך העונות'>
      <Box sx={sx.movementSeasons}>
        {!seasons.length ? <Typography sx={sx.emptyInline}>אין עדיין נתוני העברות להצגה.</Typography> : null}
        {seasons.map(season => {
          const isOpen = openSeasonKey === season.seasonKey
          const directionItems = ['up', 'down', 'lateral', 'unknown'].map(direction => ({
            direction,
            count: season.directionCounts && season.directionCounts[direction] ? season.directionCounts[direction] : 0,
            ...directionPresentation(direction),
          })).filter(item => item.direction !== 'unknown' || item.count > 0)
          const headerLeft = (
            <Box sx={sx.evolutionCollapseSummary}>
              <SeasonSummaryChip season={season} />
              {season.isUpcoming ? <Typography sx={sx.evolutionCollapseEmptySummary}>טרם החלה</Typography> : (
                <SummaryFacts>
                  <SummaryChip iconId='rosterLeft' label='עזבו' value={season.leftCount} />
                  <SummaryChip iconId='rosterJoined' label='הצטרפו' value={season.joinedCount} />
                  {directionItems.map(item => <SummaryChip key={item.direction} iconId={item.iconId} label={item.label} value={item.count} />)}
                </SummaryFacts>
              )}
            </Box>
          )

          return (
            <CollapseBox
              key={season.seasonKey}
              open={isOpen}
              onToggle={() => onToggle(isOpen ? '' : season.seasonKey)}
              headerLeft={headerLeft}
              iconId='arrowDown'
              rootSx={sx.movementCollapse}
              headerSx={sx.movementCollapseHeader}
            >
              <Box sx={sx.movementCollapseBody}>
                {season.isUpcoming ? (
                  <Typography sx={sx.emptyInline}>טרם החלה העונה ולכן אין עדיין נתוני סגל או מעברים.</Typography>
                ) : season.movements.length ? (
                  <Box sx={sx.movementGroups}>
                    {[
                      { side: 'out', title: 'עזבו', teamColumn: 'קבוצה שאליה עבר' },
                      { side: 'in', title: 'הצטרפו', teamColumn: 'קבוצה שממנה הגיע' },
                    ].map(group => {
                      const rows = season.movements.filter(movement => movement.side === group.side)
                      if (!rows.length) return null

                      return <MovementGroup key={`${season.seasonKey}-${group.side}`} group={group} rows={rows} />
                    })}
                  </Box>
                ) : <Typography sx={sx.emptyInline}>לא נמצאו מעברים בעונה זו.</Typography>}
              </Box>
            </CollapseBox>
          )
        })}
      </Box>
    </TeamYearSection>
  )
}
