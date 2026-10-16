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
import { directionPresentation } from '../model/teamYearDevelopment.presentation.js'
import { SeasonSummaryChip, SummaryChip, SummaryFacts, TeamYearSection } from './TeamYearDevelopmentShared.js'
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

const renderProfile = movement => {
  const profilePlayer = movement.side === 'out'
    ? movement.departureProfilePlayer
    : movement.player
  const profileChip = buildTableScoutProfileChip(profilePlayer)

  return profileChip
    ? <ScoutProfileChip {...profileChip} size='compact' showTooltip={false} />
    : <Typography sx={sx.movementDetail}>—</Typography>
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
  showTitle = true,
  seasonKey,
  onPlayerOpen,
  favoritePlayerKeys,
  onFavoriteToggle,
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
        render: movement => (
          <PlayerLineClassificationChip
            classification={movement.classification}
            primaryPosition={movement.primaryPosition}
            positionLayer={movement.positionLayer}
            compact
          />
        ),
      }]
    }
    if (column.key === 'scoutProfile') {
      return [{
        ...movementColumn,
        getSortValue: movement => buildTableScoutProfileChip(
          movement.side === 'out' ? movement.departureProfilePlayer : movement.player
        )?.label || null,
        render: renderProfile,
      }]
    }
    return column.key === 'openPlayer'
      ? [transitionColumn, movementColumn]
      : [movementColumn]
  })

  return (
    <Box sx={sx.movementGroup}>
      {showTitle ? <Typography sx={sx.movementGroupTitle}>{group.title} · {rows.length}</Typography> : null}
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
    <Box sx={sx.movementInsights}>
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
}) {
  if (!seasons.length) {
    return (
      <TeamYearSection iconId='swapVert' title='מעברי שחקנים'>
        <Typography sx={sx.emptyInline}>אין עדיין נתוני העברות להצגה.</Typography>
      </TeamYearSection>
    )
  }

  return (
    <Box sx={sx.movementSeasons}>
      {seasons.map(season => {
        const directionItems = ['up', 'down', 'lateral', 'unknown'].map(direction => ({
          direction,
          count: season.directionCounts && season.directionCounts[direction] ? season.directionCounts[direction] : 0,
          ...directionPresentation(direction),
        })).filter(item => item.direction !== 'unknown' || item.count > 0)
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
                  {groups.map((group, index) => (
                    <MovementGroup
                      key={`${season.seasonKey}-${group.side}`}
                      group={group}
                      rows={group.rows}
                      showTitle={index > 0 || !summary}
                      seasonKey={season.seasonKey}
                      onPlayerOpen={onPlayerOpen}
                      favoritePlayerKeys={favoritePlayerKeys}
                      onFavoriteToggle={onFavoriteToggle}
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
