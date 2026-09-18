import * as React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import teamLogo from '../../../../../ui/core/images/teamLogo.png'
import { SCOUT_PROFILE_COMBINATIONS } from '../../../../../shared/scouting/players/index.js'
import { buildTeamPlayerLineClassificationEvaluation } from '../../../../../shared/scouting/teams/lines/teamLineClassification.js'
import LeagueName from '../../components/entities/LeagueName.js'
import TeamName from '../../components/entities/TeamName.js'
import PlayerLineClassificationChip from '../../components/playerMeta/PlayerLineClassificationChip.js'
import PlayerLineClassificationTooltip from '../../components/playerMeta/PlayerLineClassificationTooltip.js'
import PlayerPositionChip from '../../components/playerMeta/PlayerPositionChip.js'
import PlayerRosterStatusBadge from '../../components/playerMeta/PlayerRosterStatusBadge.js'
import ScoutBadge from '../../components/scout/shared/ScoutBadge.js'
import ScoutProfileChip from '../../components/scout/profile/ScoutProfileChip.js'
import {
  clean,
  getAvailableMinutesPct,
  getCatalogClubStrengthLevel,
  getLeagueLevel,
  resolveNextAgeGroup,
  resolveSeasonStartYear,
  resolveStatTrend,
} from './logic/playerDecisionContent.model.js'
import { buildPlayerScoutView } from './logic/playerScoutView.js'
import { playerDecisionContentSx as sx } from './sx/playerDecisionContent.sx.js'

function SeasonStatCell({ label, value, displayValue = value, previousValue }) {
  const trend = resolveStatTrend(value, previousValue)
  const trendIcon = trend === 'up'
    ? iconUi({ id: 'sortUp', size: 'sm' })
    : trend === 'down'
      ? iconUi({ id: 'sortDown', size: 'sm' })
      : trend === 'equal'
        ? iconUi({ id: 'equal', size: 'sm' })
        : '−'

  return (
    <Box sx={sx.statCell}>
      <Box sx={sx.statValueRow}>
        <Typography sx={sx.statValue}>{displayValue}</Typography>
        <Box aria-label={trend === 'unavailable' ? 'אין עונה קודמת להשוואה' : 'השוואה לעונה קודמת'} sx={[sx.statTrendBadge, sx[`statTrend_${trend}`]]}>
          {trendIcon}
        </Box>
      </Box>
      <Typography sx={sx.statLabel}>{label}</Typography>
    </Box>
  )
}


function SeasonCard({ player, row, previousRow = null }) {
  const seasonView = React.useMemo(() => buildPlayerScoutView({
    player,
    historyRows: [row],
    selectedRow: row,
  }), [player, row])
  const primary = seasonView.profiles?.primary
  const supporting = Array.isArray(seasonView.profiles?.supporting) ? seasonView.profiles.supporting : []
  const sourceProfiles = Array.isArray(row.scoutProfiles)
    ? row.scoutProfiles
    : Array.isArray(row.scout?.profiles)
      ? row.scout.profiles
      : []
  const primaryProfile = sourceProfiles.find(profile => clean(profile?.profileId || profile?.id) === primary?.id) || null
  const supportingProfiles = supporting
    .map(item => sourceProfiles.find(profile => clean(profile?.profileId || profile?.id) === item.id))
    .filter(Boolean)
  const sourceProfileIds = new Set(
    sourceProfiles
      .map(profile => clean(profile?.profileId || profile?.id))
      .filter(Boolean)
  )
  const combination = SCOUT_PROFILE_COMBINATIONS.find(item => (
    item.profileIds.every(profileId => sourceProfileIds.has(profileId))
  )) || null
  const leagueLevel = getLeagueLevel(row)
  const availableMinutesPct = getAvailableMinutesPct(row)
  const previousAvailableMinutesPct = getAvailableMinutesPct(previousRow)
  const teamName = clean(row.clubName || row.teamName) || 'קבוצה לא ידועה'
  const clubStrengthLevel = getCatalogClubStrengthLevel(row.clubId)
  const attackPriority = clean(
    row.teamAttackPerformance?.priorityLevel ||
    row.teamAttackPerformance?.priority?.level ||
    row.teamAttackLevel
  )
  const defensePriority = clean(
    row.teamDefensePerformance?.priorityLevel ||
    row.teamDefensePerformance?.priority?.level ||
    row.teamDefenseLevel
  )
  const hasLineClassification = Boolean(clean(row.lineClassification?.line))
  const hasKnownPosition = Boolean(clean(row.primaryPosition || row.position?.primary || row.positionLayer || row.position?.layer))
  const lineClassificationEvaluation = React.useMemo(() => (
    buildTeamPlayerLineClassificationEvaluation({
      player: {
        primaryPosition: row.primaryPosition || row.position?.primary || '',
        positionLayer: row.positionLayer || row.position?.layer || '',
        playerStats: {
          games: row.games,
          goals: row.goals,
          minutes: row.minutes,
          teamMinutes: row.teamMinutes,
          teamGames: row.teamGames,
          starts: row.starts,
          substitutedOut: row.substitutedOut,
        },
      },
    })
  ), [row])

  return (
    <Box sx={sx.seasonCard}>
      <Box sx={sx.seasonHeader}>
        <Box sx={sx.seasonMetaLine}>
          <Typography level='title-md' sx={sx.seasonKey}>{row.seasonKey || '-'}</Typography>
          <Box sx={sx.seasonContextMeta}>
            <Typography level='body-xs' sx={sx.metaItem}>{row.ageGroupLabel || '-'}</Typography>
            <Typography component='span' sx={sx.metaSeparator}>·</Typography>
            <LeagueName
              value={row.leagueName}
              level={leagueLevel}
              showLevel
              fontSize={11}
              levelFontSize={9}
              nameSx={sx.leagueItem}
            />
          </Box>
        </Box>

        <Box sx={sx.teamLine}>
          <Box sx={sx.teamAvatarWrap}>
            <Box component='img' src={teamLogo} alt='' sx={sx.teamAvatar} />
            {clubStrengthLevel !== null ? (
              <Box sx={sx.clubStrengthBadge}>{clubStrengthLevel}</Box>
            ) : null}
          </Box>
          <Box sx={sx.teamIdentity}>
            <TeamName
              value={teamName}
              slot={row.birthTeamSlot || 1}
              fontSize={14}
              nameSx={sx.teamName}
            />
          </Box>
          <Box sx={sx.teamPerformanceGrid}>
            <Box sx={sx.teamPerformanceItem}>
              <Typography level='body-xs' sx={sx.teamPerformanceLabel}>ביצוע התקפי</Typography>
              <ScoutBadge value={attackPriority} short fontSize={10} />
            </Box>
            <Box sx={sx.teamPerformanceItem}>
              <Typography level='body-xs' sx={sx.teamPerformanceLabel}>ביצוע הגנתי</Typography>
              <ScoutBadge value={defensePriority} short fontSize={10} />
            </Box>
          </Box>
          <PlayerRosterStatusBadge
            rosterStatus={row.rosterStatus}
            isYoungerAgeGroup={row.isYoungerAgeGroup}
            sx={sx.seasonStatusBadge}
          />
        </Box>
      </Box>

      <Box sx={sx.statsGrid}>
        <SeasonStatCell label='משחקים' value={row.games || 0} previousValue={previousRow?.games} />
        <SeasonStatCell label='זמן אפשרי' value={availableMinutesPct} displayValue={availableMinutesPct === null ? '-' : `${availableMinutesPct}%`} previousValue={previousAvailableMinutesPct} />
        <SeasonStatCell label='שערים' value={row.goals || 0} previousValue={previousRow?.goals} />
        <SeasonStatCell label='הרכב' value={row.starts || 0} previousValue={previousRow?.starts} />
      </Box>

      <Box sx={sx.profileArea}>
        <Box sx={sx.profileHeader}>
          <Typography level='body-xs' sx={sx.areaLabel}>פרופיל סקאוט בעונה</Typography>
          {hasLineClassification ? (
            <PlayerLineClassificationChip
              classification={row.lineClassification}
              primaryPosition={row.primaryPosition || row.position?.primary || ''}
              positionLayer={row.positionLayer || row.position?.layer || ''}
              showTooltip
              tooltipContent={<PlayerLineClassificationTooltip
                classification={row.lineClassification}
                evaluation={lineClassificationEvaluation}
                stats={row}
                compact
              />}
              compact
            />
          ) : hasKnownPosition ? (
            <PlayerPositionChip
              primaryPosition={row.primaryPosition || row.position?.primary || ''}
              positionLayer={row.positionLayer || row.position?.layer || ''}
            />
          ) : null}
        </Box>
        {primary ? (
          <ScoutProfileChip
            profileId={combination?.id || primary.id}
            label={combination?.label || primary.label}
            iconId={combination?.idIcon || ''}
            depthPct={primary.depthPct}
            extraCount={supporting.length}
            isCombination={Boolean(combination)}
            profile={primaryProfile}
            profiles={supportingProfiles}
            showConditions
            tooltipSize='compact'
            size='compact'
            width='190px'
          />
        ) : (
          <Typography level='body-sm' sx={sx.emptyText}>לא זוהה פרופיל סקאוט בעונה זו.</Typography>
        )}
      </Box>
    </Box>
  )
}

function FutureSeasonCard({ seasonKey, ageGroupLabel }) {
  return (
    <Box sx={[sx.seasonCard, sx.futureSeasonCard]}>
      <Box sx={sx.seasonHeader}>
        <Box sx={sx.seasonMetaLine}>
          <Typography level='title-md' sx={sx.seasonKey}>{seasonKey}</Typography>
          <Typography level='body-xs' sx={sx.metaItem}>{ageGroupLabel}</Typography>
        </Box>
      </Box>
      <Box sx={sx.futureSeasonContent}>
        <Chip size='sm' variant='soft' color='neutral'>לקראת עונה</Chip>
        <Typography level='body-sm' sx={sx.emptyText}>טרם נטענו נתונים לעונה זו.</Typography>
      </Box>
    </Box>
  )
}

export default function PlayerMultiSeasonPath({ player, historyRows, catalogSeasonKey = '' }) {
  const rows = (Array.isArray(historyRows) ? historyRows : [])
    .slice()
    .sort((firstRow, secondRow) => (
      (resolveSeasonStartYear(secondRow?.seasonKey) || 0) -
      (resolveSeasonStartYear(firstRow?.seasonKey) || 0)
    ))
  const teamCount = new Set(rows.map(row => clean(row.clubName || row.teamName)).filter(Boolean)).size
  const futureSeason = React.useMemo(() => {
    const actualRows = rows.filter(row => !row.placeholder)
    const catalogStartYear = resolveSeasonStartYear(catalogSeasonKey)
    const latestRow = actualRows.reduce((latest, row) => {
      const rowStartYear = resolveSeasonStartYear(row.seasonKey)
      return rowStartYear && (!latest || rowStartYear > resolveSeasonStartYear(latest.seasonKey))
        ? row
        : latest
    }, null)

    if (
      !latestRow ||
      !catalogStartYear ||
      actualRows.some(row => row.isCurrentSeason) ||
      actualRows.some(row => clean(row.seasonKey) === clean(catalogSeasonKey)) ||
      catalogStartYear !== resolveSeasonStartYear(latestRow.seasonKey) + 1
    ) {
      return null
    }

    return {
      seasonKey: catalogSeasonKey,
      ageGroupLabel: resolveNextAgeGroup(latestRow),
    }
  }, [catalogSeasonKey, rows])

  return (
    <Box sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleContainer}>
          <Box sx={sx.sectionTitleRow}>
            <Box sx={sx.sectionTitleIcon}>{iconUi({ id: 'history', size: 'sm' })}</Box>
            <Typography level='title-lg' sx={sx.sectionTitle}>המסלול הרב־עונתי</Typography>
          </Box>
        </Box>
        <Box sx={sx.summaryChips}>
          <Chip size='sm' variant='soft' color='neutral'>{rows.length} עונות</Chip>
          <Chip size='sm' variant='soft' color='neutral'>{teamCount} קבוצות</Chip>
        </Box>
      </Box>

      <Box sx={sx.seasonsGrid}>
        {futureSeason ? <FutureSeasonCard {...futureSeason} /> : null}
        {rows.map((row, index) => {
          const seasonStartYear = resolveSeasonStartYear(row.seasonKey)
          const previousRow = rows.slice(index + 1).find(candidate => (
            resolveSeasonStartYear(candidate.seasonKey) < seasonStartYear
          )) || null

          return <SeasonCard key={row.id || `${row.seasonKey}_${row.teamId}`} player={player} row={row} previousRow={previousRow} />
        })}
      </Box>
    </Box>
  )
}

