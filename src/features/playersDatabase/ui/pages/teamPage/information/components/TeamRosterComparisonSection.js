// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamRosterComparisonSection.js

import * as React from 'react'
import { Box, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import DataTable from '../../../../components/tables/dataTable/DataTable.js'
import PlayerLineClassificationChip from '../../../../components/playerMeta/PlayerLineClassificationChip.js'
import PlayerGoalsValue from '../../../../components/playerMeta/PlayerGoalsValue.js'
import ScoutProfileChip from '../../../../components/scout/profile/ScoutProfileChip.js'
import { buildTableScoutProfileChip } from '../../positionClassification/model/teamPositionScoutProfile.presentation.js'
import useTeamPositionClassificationColumns from '../../positionClassification/hooks/useTeamPositionClassificationColumns.js'
import { displayClassificationValue } from '../../positionClassification/model/teamPositionClassification.presentation.js'
import { teamPositionClassificationTableSx as tableSx } from '../../positionClassification/sx/teamPositionClassificationTable.sx.js'
import { TeamYearSection } from '../../yearDevelopment/components/TeamYearDevelopmentShared.js'
import { buildTeamRosterComparisonRows, ROSTER_COMPARISON_SEASONS as seasons } from '../model/teamRosterComparison.model.js'
import { teamRosterComparisonSx as sx, ROSTER_COMPARISON_WIDTHS as widths } from '../sx/teamRosterComparison.sx.js'

const headerIcon = id => (
  <Box component='span' aria-hidden='true' sx={sx.headerIcon}>
    {iconUi({ id, size: 'sm' })}
  </Box>
)

function Change({ value, unit = '' }) {
  if (value === null) return null
  const tone = value > 0 ? 'success' : value < 0 ? 'danger' : 'neutral'
  const label = value > 0 ? 'עלייה' : value < 0 ? 'ירידה' : 'ללא שינוי'
  return (
    <Typography component='span' sx={sx.change(tone)} aria-label={`${label}: ${Math.abs(value)} ${unit}`}>
      {iconUi({ id: value > 0 ? 'sortUp' : value < 0 ? 'sortDown' : 'equal', size: 'sm' })}
      {`${Math.abs(value)}${unit === '%' ? unit : unit ? ` ${unit}` : ''}`}
    </Typography>
  )
}

const renderLine = (row, muted) => (
  <PlayerLineClassificationChip
    classification={row.classification}
    primaryPosition={row.primaryPosition}
    positionLayer={row.positionLayer}
    compact
    muted={muted}
  />
)

const renderPreviousProfile = row => {
  const profile = buildTableScoutProfileChip(row.player)
  return profile ? (
    <Box sx={tableSx.scoutProfileCell}>
      <ScoutProfileChip {...profile} size='compact' muted showTooltip={false} />
    </Box>
  ) : row.arrivalHistory?.sourceStatus === 'missing'
    ? 'נתוני מקור לא זמינים'
    : row.arrivalHistory?.scoutStatus === 'none' ? 'לא היה פרופיל' : '—'
}

const renderMinutes = (row, percentageOnly = false) => (
  <Box sx={tableSx.minutesValues}>
    {!percentageOnly ? (
      <Typography sx={tableSx.minutesValue}>{displayClassificationValue(row.minutes)}</Typography>
    ) : null}
    <Typography sx={tableSx.minutesRate}>
      {percentageOnly ? '' : '· '}{row.minutesRate === null ? '—' : `${row.minutesRate}%`}
    </Typography>
  </Box>
)

const renderGoals = row => (
  <PlayerGoalsValue goals={row.goals} projectedGoals={row.projectedGoals} />
)

export default function TeamRosterComparisonSection({
  comparison,
  favoritePlayerKeys,
  onFavoriteToggle,
  onPlayerOpen,
  tableRef,
  maxHeight = 580,
}) {
  const rows = React.useMemo(() => buildTeamRosterComparisonRows(comparison || {}), [comparison])
  const openPlayer = React.useCallback(player => onPlayerOpen?.(player, seasons.current), [onPlayerOpen])
  const rosterColumns = useTeamPositionClassificationColumns({
    onPlayerOpen: onPlayerOpen ? openPlayer : null,
    favoritePlayerKeys,
    onFavoriteToggle,
    showProfileTooltips: false,
  })
  const columns = React.useMemo(() => rosterColumns.flatMap(column => {
    if (column.key === 'substitutedOut') return []
    const width = widths[column.key]
    const base = {
      ...column,
      sx: { ...column.sx, width: typeof width === 'number' ? `${width}%` : undefined },
    }
    if (['minutes', 'goals'].includes(column.key)) {
      const isMinutes = column.key === 'minutes'
      const changeKey = `${column.key}Change`
      const changeValue = row => isMinutes ? row.changes.minutesRate : row.changes.goals
      const headerGroup = { key: column.key, label: column.label }
      return [
        ...['current', 'previous'].map(period => ({
          ...base,
          sx: { ...base.sx, width: `${width[period]}%` },
          key: `${column.key}${period === 'current' ? 'Current' : 'Previous'}`,
          label: seasons[period],
          headerAriaLabel: `${isMinutes && period === 'previous' ? 'אחוז דקות' : column.label} ${seasons[period]}`,
          headerSx: isMinutes ? base.headerSx : sx.compactHeader,
          headerGroup,
          getSortValue: row => period === 'current' ? row[column.key]
            : row.previous?.[isMinutes ? 'minutesRate' : column.key],
          render: row => {
            const selected = period === 'current' ? row : row.previous
            if (!selected) return '—'
            return isMinutes ? renderMinutes(selected, period === 'previous') : renderGoals(selected)
          },
        })),
        {
          key: changeKey,
          label: 'שינוי',
          headerContent: headerIcon('swapVert'),
          headerSx: sx.iconHeader,
          headerAriaLabel: isMinutes ? 'שינוי באחוז הדקות' : 'שינוי בצפי השערים העונתי',
          headerGroup,
          sx: { width: `${widths[changeKey]}%` },
          getSortValue: changeValue,
          render: row => changeValue(row) === null ? '—' : (
            <Box sx={sx.cell}>
              <Change value={isMinutes ? changeValue(row) : Math.round(changeValue(row))} unit={isMinutes ? '%' : ''} />
            </Box>
          ),
        },
      ]
    }
    if (['lineClassification', 'scoutProfile'].includes(column.key)) {
      const isProfile = column.key === 'scoutProfile'
      return ['current', 'previous'].map(period => {
        const isCurrent = period === 'current'
        const select = row => isCurrent ? row : row.previous
        return {
          ...base,
          sx: { ...base.sx, width: `${width[period]}%` },
          key: `${column.key}${isCurrent ? 'Current' : 'Previous'}`,
          label: seasons[period],
          headerAriaLabel: `${column.label} ${seasons[period]}`,
          headerGroup: { key: column.key, label: isProfile ? 'פרופיל' : 'חוליה' },
          getSortValue: row => select(row) ? column.getSortValue(select(row)) : null,
          render: row => {
            const selected = select(row)
            if (!selected) return '—'
            if (!isProfile) return selected.arrivalHistory && !selected.classification
              ? selected.arrivalHistory.sourceStatus === 'missing' ? 'נתוני מקור לא זמינים' : 'לא היה סיווג'
              : renderLine(selected, !isCurrent)
            return isCurrent ? column.render(selected) || '—' : renderPreviousProfile(selected)
          },
        }
      })
    }
    if (column.key === 'gamesStarts') return [{
      ...base,
      headerContent: headerIcon('gamesCount'),
      headerAriaLabel: 'משחקים',
      headerSx: sx.iconHeader,
      render: row => row.games === null ? '—' : row.games,
    }]
    if (column.key === 'favorite') return [{ ...base, label: '' }]
    return [base]
  }), [rosterColumns])

  return (
    <TeamYearSection iconId='players' title={`השוואת שחקני הסגל · ${seasons.current} מול ${seasons.previous}`}>
      <Typography sx={sx.note}>
        כל שחקני {seasons.current} · משחקים מהעונה הנוכחית · שינוי שערים לפי צפי עונתי מול צפי או סך סופי בעונה שהסתיימה · — נתון חסר להשוואה
      </Typography>
      <Box ref={tableRef} sx={sx.scroll} className='dpScrollThin'>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={row => row.comparisonKey}
          hoverRow={false}
          defaultSort={{ key: 'minutesCurrent', direction: 'desc' }}
          wrapSx={[sx.wrap, { maxHeight }]}
          tableSx={{ ...tableSx.table, ...sx.table }}
          emptyText={`אין שחקני סגל זמינים לעונת ${seasons.current}`}
        />
      </Box>
    </TeamYearSection>
  )
}
