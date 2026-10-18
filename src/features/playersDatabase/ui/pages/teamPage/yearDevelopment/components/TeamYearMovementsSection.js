// src/features/playersDatabase/ui/pages/teamPage/yearDevelopment/components/TeamYearMovementsSection.js
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import PlayerLineClassificationChip from '../../../../components/playerMeta/PlayerLineClassificationChip.js'
import { resolvePlayerUrl } from '../../../../components/playerMeta/playerUrl.presentation.js'
import ScoutProfileChip from '../../../../components/scout/profile/ScoutProfileChip.js'
import DataTable from '../../../../components/tables/dataTable/DataTable.js'
import { teamPositionClassificationTableSx as tableSx } from '../../positionClassification/sx/teamPositionClassificationTable.sx.js'
import { buildTableScoutProfileChip } from '../../positionClassification/model/teamPositionScoutProfile.presentation.js'
import useTeamPositionClassificationColumns from '../../positionClassification/hooks/useTeamPositionClassificationColumns.js'
import { buildMovementDirectionItems, directionPresentation } from '../model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
import MovementPeriodSwitch from './MovementPeriodSwitch.js'
import { teamYearDevelopmentSharedSx } from '../sx/teamYearDevelopmentShared.sx.js'
import {
  MOVEMENT_TABLE_COLUMN_WIDTHS,
  teamYearMovementsSectionSx,
} from '../sx/teamYearMovementsSection.sx.js'

const sx = { ...teamYearDevelopmentSharedSx, ...teamYearMovementsSectionSx }
const getLevelSortValue = movement => {
  if (movement.levelChange === null || movement.levelChange === undefined) return null
  if (movement.direction === 'up') return movement.levelChange
  if (movement.direction === 'down') return -movement.levelChange
  return movement.direction === 'lateral' ? 0 : null
}

const movementDisplay = (movement, period) => (
  period === 'previous' ? movement.previousDisplay : movement.currentDisplay
)

const renderProfile = (movement, period) => {
  const profileChip = buildTableScoutProfileChip(movementDisplay(movement, period)?.player)
  if (!profileChip) return <Typography sx={sx.movementDetail}>—</Typography>

  const chip = (
    <ScoutProfileChip {...profileChip} size='compact' muted={period === 'previous'} showTooltip={false} />
  )
  return period === 'previous'
    ? <Box sx={[tableSx.scoutProfileCell, sx.movementPreviousProfile]}>{chip}</Box>
    : chip
}

const MOVEMENT_STATUS = Object.freeze({
  out: { label: 'עזב', iconId: 'rosterLeft', color: 'neutral' },
  in: { label: 'הצטרף', iconId: 'rosterJoined', color: 'primary' },
})
const MOVEMENT_SIGNAL_LABELS = Object.freeze({
  multiple: '2 איתותים · לחקירה',
  single: 'איתות אחד · למעקב',
  none: 'ללא איתות מזוהה',
})

const renderMovementPlayerName = movement => {
  const status = MOVEMENT_STATUS[movement.side]

  return (
    <Box sx={tableSx.playerNameContent}>
      <Typography sx={tableSx.player}>{movement.name}</Typography>
      {status ? (
        <Box component='span' aria-label={status.label} sx={tableSx.playerStatusBadge(status.color)}>
          {iconUi({ id: status.iconId, size: 'sm' })}
        </Box>
      ) : null}
    </Box>
  )
}

const renderTransition = movement => {
  const presentation = directionPresentation(movement.direction)
  const level = movement.levelChange === null
    ? '—'
    : String(movement.levelChange)

  return (
    <Box sx={sx.movementTransition}>
      <Typography sx={sx.movementTeam}>{movement.otherTeamName || '—'}</Typography>
      <Box
        aria-label={`${presentation.label} · ${level}`}
        sx={sx.movementTag(presentation.color)}
      >
        {iconUi({ id: presentation.iconId, size: 'sm' })}
        <Typography component='span' sx={sx.movementTagText}>{level}</Typography>
      </Box>
    </Box>
  )
}

function MovementGroup({
  group,
  rows,
  seasonKey,
  onPlayerOpen,
  favoritePlayerKeys,
  onFavoriteToggle,
  profilePeriod,
  onProfilePeriodChange,
}) {
  const rosterColumns = useTeamPositionClassificationColumns({
    onPlayerOpen: onPlayerOpen ? player => onPlayerOpen(player, seasonKey) : null,
    favoritePlayerKeys,
    onFavoriteToggle,
    showTooltips: false,
  })
  const transitionColumn = {
    key: 'transition',
    label: `${group.teamColumn} · שינוי רמה`,
    headerAriaLabel: 'שינוי רמת מועדון',
    headerContent: <Box component='span' sx={sx.movementHeaderLabel}>{group.teamColumn} · שינוי רמה</Box>,
    sx: { width: `${MOVEMENT_TABLE_COLUMN_WIDTHS.transition}%` },
    getSortValue: getLevelSortValue,
    render: renderTransition,
  }
  const columns = rosterColumns.flatMap(column => {
    const movementColumn = {
      ...column,
      sx: {
        ...column.sx,
        width: `${MOVEMENT_TABLE_COLUMN_WIDTHS[column.key]}%`,
      },
    }
    if (column.key === 'name') {
      return [{
        ...movementColumn,
        headerContent: <Box component='span' sx={sx.movementHeaderLabel}>{column.label}</Box>,
        getHref: movement => resolvePlayerUrl(movement.playerUrl),
        render: renderMovementPlayerName,
      }]
    }
    if (column.key === 'favorite') {
      return [{ ...movementColumn, label: '' }]
    }
    if (column.key === 'lineClassification') {
      return [{
        ...movementColumn,
        getSortValue: movement => {
          const display = movementDisplay(movement, profilePeriod)
          if (display?.isGoalkeeper) return 0
          const order = ({ DEFENSE: 1, MIDFIELD: 2, ATTACK: 3 })[display?.classification?.line]
          return order === undefined ? 4 : order
        },
        render: movement => {
          const display = movementDisplay(movement, profilePeriod)
          const chip = (
            <PlayerLineClassificationChip
              classification={display?.classification}
              primaryPosition={display?.primaryPosition}
              positionLayer={display?.positionLayer}
              compact
              muted={profilePeriod === 'previous'}
            />
          )
          return profilePeriod === 'previous'
            ? <Box sx={sx.movementPreviousLine}>{chip}</Box>
            : chip
        },
      }]
    }
    if (column.key === 'scoutProfile') {
      return [{
        ...movementColumn,
        getSortValue: movement => buildTableScoutProfileChip(
          movementDisplay(movement, profilePeriod)?.player
        )?.label || null,
        render: movement => renderProfile(movement, profilePeriod),
      }]
    }
    return column.key === 'openPlayer'
      ? [transitionColumn, movementColumn]
      : [movementColumn]
  })

  return (
    <Box sx={sx.movementGroup}>
      <Box sx={sx.movementGroupHeader}>
        <Typography sx={sx.movementGroupTitle}>{group.title} · {rows.length}</Typography>
        <MovementPeriodSwitch period={profilePeriod} onChange={onProfilePeriodChange} label={group.title} />
      </Box>
      <Box sx={sx.movementTableScroll} className='dpScrollThin'>
        <DataTable
          className='dpScrollThin'
          hoverRow={false}
          columns={columns}
          rows={rows}
          getRowSx={movement => sx.movementRow(movement.side)}
          getRowKey={(movement, index) => (
            movement.movementId || `${seasonKey}-${group.side}-${movement.playerId || movement.name}-${index}`
          )}
          defaultSort={{ key: 'transition', direction: 'desc' }}
          wrapSx={sx.movementTableWrap}
          tableSx={{ ...tableSx.table, ...sx.movementTable }}
          bodyScrollSx={sx.movementTableBody}
          emptyText='לא נמצאו מעברים להצגה'
        />
      </Box>
    </Box>
  )
}

function MovementSeasonInsights({ season, signal, clubLevel }) {
  const unavailableText = season.isUpcoming
    ? 'העונה טרם החלה; תובנות המעברים עדיין אינן זמינות.'
    : !season.movementDataAvailable
      ? 'נתוני המעברים לעונה עדיין אינם זמינים.'
      : 'רמת המועדון חסרה לקביעת סף האיתות.'
  const directionLabel = Number(clubLevel) === 1
    ? 'עזבו לרמה זהה או גבוהה יותר'
    : 'עזבו לרמה גבוהה יותר'

  return (
    <Box sx={sx.movementInsights} data-movement-toolbar-entry={`${season.seasonKey}:season`}>
      <Typography sx={sx.movementInsightsTitle}>תובנות</Typography>
      {!signal || signal.status === 'limited' ? (
        <Typography sx={sx.movementInsightsUnavailable}>{unavailableText}</Typography>
      ) : (
        <>
          <Typography sx={sx.movementSignalStatus(signal.status)}>
            {MOVEMENT_SIGNAL_LABELS[signal.status]}
          </Typography>
          <Typography sx={sx.movementInsightItem(signal.directionActive)}>
            כיוון המעבר: {signal.directionDepartureCount} {directionLabel}
            {signal.directionActive ? ' · איתות' : ''}
          </Typography>
          <Typography sx={sx.movementInsightItem(signal.professionalActive)}>
            פרופילים מקצועיים: {signal.professionalDepartureCount} עזבו עם פרופיל מקצועי
            {signal.professionalActive ? ' · איתות' : ''}
          </Typography>
        </>
      )}
    </Box>
  )
}

export default function TeamYearMovementsSection({
  seasons = [],
  seasonSignals = [],
  clubLevel = null,
  onPlayerOpen,
  favoritePlayerKeys,
  onFavoriteToggle,
  profilePeriod = 'current',
  onProfilePeriodChange,
  sectionRef,
}) {
  if (!seasons.length) {
    return (
      <TeamYearSection iconId='swapVert' title='מעברי שחקנים'>
        <Typography sx={sx.emptyInline}>אין עדיין נתוני העברות להצגה.</Typography>
      </TeamYearSection>
    )
  }

  return (
    <Box ref={sectionRef} sx={sx.movementSeasons}>
      {seasons.map(season => {
        const directionItems = buildMovementDirectionItems(season)
        const signal = seasonSignals.find(item => item.seasonKey === season.seasonKey)
        const groups = [
          { side: 'out', title: 'עזבו', teamColumn: 'קבוצה שאליה עבר' },
          { side: 'in', title: 'הצטרפו', teamColumn: 'קבוצה שממנה הגיע' },
        ].map(group => ({
          ...group,
          rows: season.movements.filter(movement => movement.side === group.side),
        })).filter(group => group.rows.length)
        const summary = !season.isUpcoming && season.movementDataAvailable ? (
          <SummaryFacts>
            <SummaryChip iconId='rosterLeft' label='עזבו' value={season.leftCount} />
            <SummaryChip iconId='rosterJoined' label='הצטרפו' value={season.joinedCount} />
            {directionItems.map(item => (
              <SummaryChip key={item.direction} iconId={item.iconId} label={item.label} value={item.count} />
            ))}
          </SummaryFacts>
        ) : null

        return (
          <TeamYearSection
            key={season.seasonKey}
            iconId='swapVert'
            title='מעברי שחקנים לעונת'
            titleAfter={<SeasonSummaryChip season={season} />}
            titleExtra={summary}
            titleExtraSx={sx.movementHeaderSummary}
          >
            <Box sx={sx.movementSeasonContent}>
              <MovementSeasonInsights season={season} signal={signal} clubLevel={clubLevel} />
              {season.isUpcoming ? (
                <Typography sx={sx.emptyInline}>טרם החלה העונה ולכן אין עדיין נתוני סגל או מעברים.</Typography>
              ) : season.movements.length ? (
                <Box sx={sx.movementGroups}>
                  {groups.map(group => (
                    <MovementGroup
                      key={`${season.seasonKey}-${group.side}`}
                      group={group}
                      rows={group.rows}
                      seasonKey={season.seasonKey}
                      onPlayerOpen={onPlayerOpen}
                      favoritePlayerKeys={favoritePlayerKeys}
                      onFavoriteToggle={onFavoriteToggle}
                      profilePeriod={profilePeriod}
                      onProfilePeriodChange={onProfilePeriodChange}
                    />
                  ))}
                </Box>
              ) : <Typography sx={sx.emptyInline}>לא נמצאו מעברים בעונה זו.</Typography>}
            </Box>
          </TeamYearSection>
        )
      })}
    </Box>
  )
}
