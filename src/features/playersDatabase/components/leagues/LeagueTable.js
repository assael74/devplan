// src/features/playersDatabase/components/leagues/LeagueTable.js

import React from 'react'
import {
  Add,
  Groups,
  KeyboardArrowDown,
  ManageSearch,
  MoreHoriz,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Link,
  Typography,
} from '@mui/joy'

import ScoutDetails from './ScoutDetails.js'
import {
  SCOUT_PROFILES,
} from '../../../../shared/players/scouting/index.js'
import { formatLtrNumber } from '../../../../shared/format/direction.js'
import { tableSx as sx } from './sx/table.sx.js'

const toPct = value => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '-'

  return formatLtrNumber(Math.round(numeric * 100), {
    signed: true,
    suffix: '%',
  })
}

const getPerfColor = value => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 'neutral'
  if (numeric >= 0.1) return 'success'
  if (numeric >= 0) return 'warning'

  return 'danger'
}

const hasActiveSearch = drilldown => {
  const settings = drilldown?.settings || {}

  return Boolean(
    settings.includeUniversal ||
    (
      settings.attackPerformanceThreshold !== null &&
      settings.attackPerformanceThreshold !== undefined
    ) ||
    (
      settings.defensePerformanceThreshold !== null &&
      settings.defensePerformanceThreshold !== undefined
    )
  )
}

const nextTeamSlot = value => {
  const slot = Number(value) || 1
  if (slot >= 3) return 1

  return slot + 1
}

function TeamCell({ row, playerSearch, onTeamSlotChange }) {
  const teamSlot = Number(row.teamSlot) || 1
  const safePlayerCount = Number(row.playersCount) || 0
  const searchPlayerCount = Number(playerSearch?.count) || 0
  const statsCount = Number(row.statsCount) || 0
  const scoutProfilesCount = Number(row.scoutProfilesCount) || 0
  const teamUrl = String(row.teamUrl || '').trim()
  const playersLabel = `${formatLtrNumber(safePlayerCount)} שחקנים`
  const searchLabel = `${formatLtrNumber(searchPlayerCount)} ${playerSearch?.profileLabel || 'פרופיל'}`

  return (
    <Box sx={sx.teamCell}>
      <Box
        component="button"
        type="button"
        title="לחץ לשינוי מספר קבוצה במועדון"
        sx={sx.teamIconBtn(teamSlot)}
        onClick={event => {
          event.stopPropagation()
          onTeamSlotChange(
            row.rowId,
            String(nextTeamSlot(teamSlot))
          )
        }}
      >
        <Groups fontSize="inherit" />

        {teamSlot > 1 ? (
          <Box component="span" sx={sx.teamSlotBadge}>
            {formatLtrNumber(teamSlot)}
          </Box>
        ) : null}
      </Box>

      {teamUrl ? (
        <Link
          href={teamUrl}
          target="_blank"
          rel="noreferrer noopener"
          referrerPolicy="no-referrer"
          underline="hover"
          title="פתח באתר ההתאחדות"
          sx={[sx.teamName, sx.teamNameLink]}
          onClick={event => event.stopPropagation()}
        >
          {row.clubName}
        </Link>
      ) : (
        <Typography level="body-sm" sx={sx.teamName}>
          {row.clubName}
        </Typography>
      )}

      <Chip
        size="sm"
        variant="soft"
        color={safePlayerCount > 0 ? 'primary' : 'neutral'}
        title="כמות שחקנים ממסמך הליגה"
        aria-label={playersLabel}
        sx={sx.playersCountChip}
      >
        {playersLabel}
      </Chip>

      {playerSearch?.active ? (
        <Chip
          size="sm"
          variant="soft"
          color={searchPlayerCount > 0 ? 'success' : 'neutral'}
          title={playerSearch.modeLabel || ''}
          aria-label={searchLabel}
          sx={sx.playersCountChip}
        >
          {searchLabel}
        </Chip>
      ) : null}

      {statsCount > 0 ? (
        <Chip
          size="sm"
          variant="soft"
          color="neutral"
          sx={sx.playersCountChip}
        >
          {formatLtrNumber(statsCount)} סטט׳
        </Chip>
      ) : null}

      {scoutProfilesCount > 0 ? (
        <Chip
          size="sm"
          variant="soft"
          color="success"
          sx={sx.playersCountChip}
        >
          {formatLtrNumber(scoutProfilesCount)} פרופ׳
        </Chip>
      ) : null}
    </Box>
  )
}

function PerformanceCell({ value }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={getPerfColor(value)}
      sx={sx.perfChip}
    >
      {toPct(value)}
    </Chip>
  )
}

const getActiveProfilesCount = drilldown => {
  if (!hasActiveSearch(drilldown)) return 0

  if (drilldown?.settings?.includeUniversal) {
    return SCOUT_PROFILES.length
  }

  return (drilldown?.profiles || []).length
}

const getProfilesColor = count => {
  if (count === SCOUT_PROFILES.length) return 'success'
  if (count > 0) return 'warning'

  return 'neutral'
}

function ProfilesCell({ drilldown }) {
  const activeCount = getActiveProfilesCount(drilldown)
  const label = `${activeCount}/${SCOUT_PROFILES.length} פרופילים`

  return (
    <Box sx={sx.matchCell}>
      <Chip
        size="sm"
        variant="soft"
        color={getProfilesColor(activeCount)}
        title={label}
        sx={sx.matchChip}
      >
        <Box component="span" sx={sx.matchIcon}>
          <ManageSearch fontSize="inherit" />
        </Box>

        {label}
      </Chip>
    </Box>
  )
}

function ExpandCell({ expanded, onToggle }) {
  return (
    <Box sx={sx.edgeCell}>
      <Button
        size="sm"
        variant="plain"
        color="neutral"
        sx={sx.expandBtn}
        aria-label="פתיחה"
        onClick={event => {
          event.stopPropagation()
          onToggle()
        }}
      >
        <Box sx={sx.toggleIcon(expanded)}>
          {expanded ? (
            <KeyboardArrowDown fontSize="small" />
          ) : (
            <Add fontSize="small" />
          )}
        </Box>
      </Button>
    </Box>
  )
}

function RowActionsCell({ row, onEditTeamLink }) {
  const canEdit = Boolean(row.teamSeasonKey || row.teamSlotId)

  return (
    <Box sx={sx.edgeCell}>
      <Button
        size="sm"
        variant="plain"
        color={row.teamUrl ? 'primary' : 'neutral'}
        disabled={!canEdit}
        sx={sx.rowActionsBtn}
        title="ערוך קישור קבוצה"
        aria-label="ערוך קישור קבוצה"
        onClick={event => {
          event.stopPropagation()
          if (!canEdit) return

          onEditTeamLink?.(row)
        }}
      >
        <MoreHoriz fontSize="small" />
      </Button>
    </Box>
  )
}

export default function LeagueTable({
  rows,
  onToggle,
  onTeamSlotChange,
  onLeagueIndexRefresh,
  onEditTeamLink,
}) {
  const teamOptions = rows.map(item => item.row).filter(Boolean)

  return (
    <Box className="dpScrollThin" sx={sx.wrap}>
      <Box component="table" sx={sx.table}>
        <thead>
          <tr>
            <th>מקום</th>
            <th>קבוצה</th>
            <th>משחקים</th>
            <th>ביצוע התקפי</th>
            <th>ביצוע הגנתי</th>
            <th>שערי זכות</th>
            <th>שערי חובה</th>
            <th>נקודות</th>
            <th>פרופילים</th>
            <th aria-label="פעולות" />
            <th aria-label="פתיחה" />
          </tr>
        </thead>

        <tbody>
          {rows.map(item => {
            const { row, drilldown, expanded, playerSearch } = item
            const metrics = drilldown?.metrics || {}

            return (
              <React.Fragment key={row.id}>
                <tr
                  className={[ row.placeholder ? 'isPlaceholder' : '', expanded ? 'isExpanded' : '', ]
                    .filter(Boolean)
                    .join(' ') || undefined}
                  onClick={() => onToggle(row.id)}
                >
                  <td>{formatLtrNumber(row.leaguePosition)}</td>

                  <td>
                    <TeamCell
                      row={row}
                      playerSearch={playerSearch}
                      onTeamSlotChange={onTeamSlotChange}
                    />
                  </td>

                  <td>{formatLtrNumber(row.games)}</td>

                  <td>
                    <PerformanceCell value={metrics.attackEdge} />
                  </td>

                  <td>
                    <PerformanceCell value={metrics.defenseEdge} />
                  </td>

                  <td>{formatLtrNumber(row.goalsFor)}</td>
                  <td>{formatLtrNumber(row.goalsAgainst)}</td>
                  <td>{formatLtrNumber(row.points)}</td>

                  <td>
                    <ProfilesCell drilldown={drilldown} />
                  </td>

                  <td>
                    <RowActionsCell
                      row={row}
                      onEditTeamLink={onEditTeamLink}
                    />
                  </td>

                  <td>
                    <ExpandCell
                      expanded={expanded}
                      onToggle={() => onToggle(row.id)}
                    />
                  </td>
                </tr>

                <tr className="isScoutDetails">
                  <td colSpan={11}>
                    <Box sx={sx.collapse(expanded)}>
                      <Box sx={sx.collapseInner}>
                        <ScoutDetails
                          drilldown={drilldown}
                          team={{
                            ...row,
                            attackEdge: metrics.attackEdge,
                            defenseEdge: metrics.defenseEdge,
                          }}
                          teamOptions={teamOptions}
                          active={expanded}
                          playerSearch={playerSearch}
                          onLeagueIndexRefresh={onLeagueIndexRefresh}
                        />
                      </Box>
                    </Box>
                  </td>
                </tr>
              </React.Fragment>
            )
          })}
        </tbody>
      </Box>
    </Box>
  )
}
