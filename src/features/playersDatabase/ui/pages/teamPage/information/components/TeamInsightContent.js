// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamInsightContent.js

import * as React from 'react'
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/joy'
import { Link } from 'react-router-dom'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import TeamKpiOverview from '../../performance/components/TeamKpiOverview.js'
import TeamScoutingSummary from '../../scouting/components/TeamScoutingSummary.js'
import TeamStructureSection from '../../structure/components/TeamStructureSection.js'
import TeamYearMetricsSection from '../../yearDevelopment/components/TeamYearMetricsSection.js'
import TeamYearMovementsSection from '../../yearDevelopment/components/TeamYearMovementsSection.js'
import TeamYearRosterBalanceSection from '../../yearDevelopment/components/TeamYearRosterBalanceSection.js'
import TeamRosterWorkspace from './TeamRosterWorkspace.js'
import { TEAM_INSIGHTS, getTeamInsight } from '../model/teamWorkspace.navigation.js'
import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'

export default function TeamInsightContent({
  insightId,
  slideDirection = 0,
  view,
  presentation,
  structureFilter,
  onStructureFilterChange,
  toOverview,
  toInsight,
  toRoster,
  rosterProps,
}) {
  const [openRosterBalanceSeasonKey, setOpenRosterBalanceSeasonKey] = React.useState('')
  const [openMovementSeasonKey, setOpenMovementSeasonKey] = React.useState(view?.selectedSeasonKey || '')
  const insight = getTeamInsight(insightId)
  const insightIndex = TEAM_INSIGHTS.findIndex(item => item.id === insightId)
  const nextInsight = TEAM_INSIGHTS[(insightIndex + 1) % TEAM_INSIGHTS.length]
  const previousInsight = TEAM_INSIGHTS[(insightIndex - 1 + TEAM_INSIGHTS.length) % TEAM_INSIGHTS.length]
  const hasRosterPlayers = Boolean(view?.positionClassificationRows?.length)
  const { clubComparison, olderYearGroups } = presentation
  const performanceDetails = Object.fromEntries((view.performanceInsight?.details || [])
    .map(detail => [detail.key, detail]))
  const profileContextLines = [
    performanceDetails.professionalProfiles,
    performanceDetails.underuseProfiles,
  ].filter(detail => detail?.text)

  if (!insight) return null

  return (
    <Box component='section' aria-label={insight.title} sx={sx.workspaceDetail}>
      <Box sx={sx.insightTitleRow}>
        <Box sx={[sx.insightTitleMain, sx.insightSlide(slideDirection)]}>
          <Button
            component={Link}
            to={toInsight(previousInsight.id)}
            variant='soft'
            size='sm'
            startDecorator={iconUi({ id: 'forward', size: 'sm' })}
            sx={sx.insightTitleAction}
          >
            {previousInsight.title}
          </Button>
          <Typography level='h3' sx={sx.insightTitle}>{insight.title}</Typography>
        </Box>
        <Box sx={[sx.insightTitleActions, sx.insightSlide(slideDirection)]}>
          <Tooltip title='חזרה לתמונת מצב'>
            <IconButton
              component={Link}
              to={toOverview}
              variant='outlined'
              size='sm'
              aria-label='חזרה לתמונת מצב'
              sx={sx.insightOverviewAction}
            >
              {iconUi({ id: 'dashboard', size: 'sm' })}
            </IconButton>
          </Tooltip>
          <Button
            component={Link}
            to={toInsight(nextInsight.id)}
            variant='soft'
            size='sm'
            endDecorator={iconUi({ id: 'back', size: 'sm' })}
            sx={sx.insightTitleAction}
          >
            {nextInsight.title}
          </Button>
        </Box>
      </Box>

      <Box sx={[sx.insightBody, sx.insightSlide(slideDirection)]}>
        {insightId === 'performance' ? (
          <>
            <TeamKpiOverview
              team={view.team}
              competitionLevels={view.performanceInsight?.facts}
              leaguePath={view.yearDevelopment?.leaguePath}
              tablePositionTimeline={view.seasonTimeline}
              offensePriorityTimeline={view.offensePriorityTimeline}
              defensePriorityTimeline={view.defensePriorityTimeline}
              insightDetails={performanceDetails}
            />
            {view.developmentTimeline?.length ? (
              <TeamYearMetricsSection
                timeline={view.developmentTimeline}
                contextText={performanceDetails.reliability?.text}
              />
            ) : <Typography>אין עדיין נתוני עונות להשוואה.</Typography>}
            <TeamRosterWorkspace
              {...rosterProps}
              collapsible
              insightNotes={profileContextLines}
            />
          </>
        ) : null}

        {insightId === 'roster-balance' ? (
          <>
            <TeamScoutingSummary
              structure={view.structure}
              hasRosterPlayers={hasRosterPlayers}
              title='חלוקת דקות העונה'
              selectedFilter={structureFilter}
              onFilterChange={onStructureFilterChange}
            />
            <TeamStructureSection
              structure={view.structure}
              hasRosterPlayers={hasRosterPlayers}
              title='איזון מבנה העמדות'
              seasonKey={view.selectedSeasonKey}
              selectedFilter={structureFilter}
              onFilterChange={onStructureFilterChange}
            />
            <TeamYearRosterBalanceSection
              overview={view.yearDevelopment}
              openSeasonKey={openRosterBalanceSeasonKey}
              onToggle={setOpenRosterBalanceSeasonKey}
            />
          </>
        ) : null}

        {insightId === 'year-movements' ? (
          <TeamYearMovementsSection
            seasons={view.yearDevelopment?.movementSeasons || []}
            openSeasonKey={openMovementSeasonKey}
            onToggle={setOpenMovementSeasonKey}
          />
        ) : null}

        {insightId === 'future-competition' ? (
          <>
            <Typography>צפי שינוי רמת התחרות עדיין לא נקבע. השנתונים שמעל במועדון מוצגים כרקע לבדיקה.</Typography>
            {olderYearGroups.length ? olderYearGroups.map(group => (
              <Box key={group.birthYear} sx={sx.evidenceRow}>
                <Typography level='title-sm'>שנתון {group.birthYear}</Typography>
                {(group.seasons?.current?.teams || []).map(team => (
                  <Typography key={team.teamId} level='body-sm'>
                    {team.league?.leagueName || 'ליגה לא ידועה'} · {team.league?.leagueLevel ? `רמה ${team.league.leagueLevel}` : 'רמה לא ידועה'}
                  </Typography>
                ))}
              </Box>
            )) : <Typography>אין כרגע נתוני שנתונים מעל להצגה.</Typography>}
          </>
        ) : null}

        {insightId === 'club-gap' ? (
          <>
            <Typography level='title-md'>{clubComparison.summary}</Typography>
            {clubComparison.available ? (
              <Box sx={sx.evidenceRow}>
                <Typography>רמת הליגה של השנתון: {clubComparison.leagueLevel}</Typography>
                <Typography>רמת הייחוס של המועדון: {clubComparison.clubLevel}</Typography>
                <Typography level='body-sm'>ההשוואה מבוססת על רמת המועדון ורמת הליגה בעונה הנבחרת.</Typography>
              </Box>
            ) : (
              <Typography>
                {clubComparison.isPrimaryTeam
                  ? 'חסרה רמת ליגה או רמת מועדון להשוואה.'
                  : 'השוואה לרמת המועדון מוצגת לקבוצה הראשית של השנתון.'}
              </Typography>
            )}
          </>
        ) : null}

        {insightId !== 'performance' ? (
          <Button component={Link} to={toRoster} variant='outlined' sx={sx.rosterEntry}>
            המשך לבדיקה של שחקני הסגל
          </Button>
        ) : null}
      </Box>
    </Box>
  )
}
