import * as React from 'react'
import { Avatar, Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { resolveScoutProfileDefinition } from '../../../../../shared/scouting/players/profiles.js'
import LeagueName from '../../components/entities/LeagueName.js'
import ScoutBadge from '../../components/scout/ScoutBadge.js'
import TableRankBadge from '../../components/tables/TableRankBadge.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { teamYearDevelopmentSx as sx } from './sx/teamYearDevelopment.sx.js'

const METRICS = Object.freeze([
  { key: 'tableRank', label: 'מיקום בטבלה', iconId: 'league', presentation: 'tableRank' },
  { key: 'games', label: 'משחקים', iconId: 'gamesCount' },
  { key: 'goalsForPerGame', label: 'שערים למשחק', iconId: 'goals', decimal: true },
  { key: 'goalsAgainstPerGame', label: 'ספיגה למשחק', iconId: 'defensive', decimal: true },
  { key: 'tableAttackRank', label: 'דירוג התקפה', iconId: 'offensive', priorityKey: 'offensePriorityLevel' },
  { key: 'tableDefenseRank', label: 'דירוג הגנה', iconId: 'defensive', priorityKey: 'defensePriorityLevel' },
])

const displayValue = ({ value, decimal = false }) => {
  if (value === null || value === undefined) return '—'
  return decimal ? Number(value).toFixed(1) : value
}

const renderMetricValue = ({ metric, season }) => {
  const value = season[metric.key]

  if (metric.presentation === 'tableRank') {
    return value === null || value === undefined ? '—' : <TableRankBadge value={value} />
  }

  if (metric.priorityKey) {
    const priority = String(season[metric.priorityKey] || '').trim()
    const priorityLabel = ({
      elite: 'יעד מוביל',
      high: 'עדיפות גבוהה',
      positive: 'חיובי',
      neutral: 'רגיל',
      low: 'עדיפות נמוכה',
    })[priority] || 'רגיל'
    return priority ? (
      <ScoutBadge
        value={priority}
        short
        fontSize={12}
        tooltip={`${metric.label}: ${priorityLabel}${value ? ` · מקום ${value} ביחס לליגה` : ''}`}
      />
    ) : '—'
  }

  return displayValue({ value, decimal: metric.decimal })
}

const Section = ({ iconId, title, titleExtra, children }) => (
  <Box sx={sx.section}>
    <Box sx={sx.header}>
      <Box sx={sx.titleContainer}>
        <Box sx={sx.titleRow}>
          <Box sx={sx.titleIdentity}>
            <Box sx={sx.titleIcon}>{iconUi({ id: iconId, size: 'sm' })}</Box>
            <Typography sx={sx.title}>{title}</Typography>
          </Box>
          {titleExtra ? <Box sx={sx.titleExtra}>{titleExtra}</Box> : null}
        </Box>
      </Box>
    </Box>
    {children}
  </Box>
)

const directionPresentation = direction => ({
  up: { label: 'עבר לרמה גבוהה יותר', color: 'success', iconId: 'sortUp' },
  down: { label: 'עבר לרמה נמוכה יותר', color: 'warning', iconId: 'sortDown' },
  lateral: { label: 'עבר לרמה דומה', color: 'primary', iconId: 'swapVert' },
}[direction] || { label: 'עזב במהלך העונה', color: 'neutral', iconId: 'rosterLeft' })

const linePresentation = line => ({
  GOALKEEPER: { label: 'שוער', iconId: 'goalkeeping' },
  DEFENSE: { label: 'הגנה', iconId: 'defensive' },
  MIDFIELD: { label: 'קישור', iconId: 'position' },
  ATTACK: { label: 'התקפה', iconId: 'offensive' },
}[line] || { label: line === 'UNKNOWN' ? 'לא ידוע' : line, iconId: 'position' })

const LINE_DISTRIBUTION_COLORS = Object.freeze({
  goalkeeper: '#657684',
  defense: '#2F86C7',
  midfield: '#7C3AED',
  attack: '#D97706',
  unclassified: '#A16207',
})

const LineLegend = () => (
  <Box sx={sx.evolutionLegend}>
    {[
      ['goalkeeper', 'שוער'],
      ['defense', 'הגנה'],
      ['midfield', 'קישור'],
      ['attack', 'התקפה'],
      ['unclassified', 'לא מסווגים / מדגם חסר'],
    ].map(([key, label]) => (
      <Box key={key} sx={sx.evolutionLegendItem}>
        <Box sx={sx.evolutionLegendColor(LINE_DISTRIBUTION_COLORS[key])} />
        <Typography>{label}</Typography>
      </Box>
    ))}
  </Box>
)

const LineDistributionTooltip = ({ category, seasonKey, total }) => {
  const share = total ? Math.round((category.count / total) * 100) : 0

  return (
    <Box sx={sx.evolutionTooltipContent}>
      <Box sx={sx.evolutionTooltipHead}>
        <Box sx={sx.evolutionTooltipColor(LINE_DISTRIBUTION_COLORS[category.key])} />
        <Typography>{category.label}</Typography>
      </Box>
      <Typography sx={sx.evolutionTooltipValue}>{category.count} שחקנים · {share}%</Typography>
      <Typography sx={sx.evolutionTooltipMeta}>עונת {seasonKey}</Typography>
    </Box>
  )
}

const profilePresentation = profileId => {
  const definition = resolveScoutProfileDefinition(profileId)

  return {
    label: definition?.shortLabel || definition?.label || 'פרופיל סקאוט',
    iconId: definition?.idIcon || 'performanceProfile',
  }
}

const SummaryChip = ({ iconId, label, value }) => (
  <Box sx={sx.evolutionSummaryChip}>
    {iconUi({ id: iconId, size: 'sm' })}
    <Typography>{label}</Typography>
    <Box sx={sx.evolutionSummaryValue}><Typography>{value}</Typography></Box>
  </Box>
)

const SummaryFacts = ({ children }) => {
  const facts = React.Children.toArray(children).filter(Boolean)
  return (
    <Box sx={sx.evolutionCollapseFacts}>
      {facts.map((fact, index) => (
        <React.Fragment key={fact.key || index}>
          {index > 0 ? <Box component='span' aria-hidden sx={sx.evolutionSummarySeparator}>•</Box> : null}
          {fact}
        </React.Fragment>
      ))}
    </Box>
  )
}

export default function TeamYearDevelopment({ timeline = [], overview = {} }) {
  const movementSeasons = overview.movementSeasons || []
  const [openMovementSeasonKey, setOpenMovementSeasonKey] = React.useState('')
  const [openRosterBalanceSeasonKey, setOpenRosterBalanceSeasonKey] = React.useState('')
  const [openProfileSeasonKey, setOpenProfileSeasonKey] = React.useState('')
  const hasInitializedMovementSeasons = React.useRef(false)

  React.useEffect(() => {
    if (hasInitializedMovementSeasons.current || !movementSeasons.length) return

    hasInitializedMovementSeasons.current = true
    setOpenMovementSeasonKey(movementSeasons.find(season => !season.isUpcoming)?.seasonKey || movementSeasons[0]?.seasonKey || '')
  }, [movementSeasons])

  if (!timeline.length) {
    return (
      <Box sx={sx.empty}>
        {iconUi({ id: 'trend', size: 'md' })}
        <Typography sx={sx.emptyText}>אין עדיין נתוני עונות להצגת התפתחות השנתון.</Typography>
      </Box>
    )
  }

  const columnsTemplate = `minmax(126px, 1.1fr) repeat(${timeline.length}, minmax(96px, 1fr))`

  return (
    <Box className='dpScrollThin' sx={sx.content}>
      <Section
        iconId='trend'
        title='התפתחות השנתון לאורך עונות'
      >
        <Box sx={sx.timelineWrap}>
          <Box sx={[sx.timeline, { gridTemplateColumns: columnsTemplate }]}>
            <Box sx={[sx.cell, sx.metricHead]} />
            {timeline.map(season => (
              <Box key={season.seasonKey} sx={[sx.cell, sx.seasonHead, season.isCurrent && sx.currentSeasonHead]}>
                <Typography sx={sx.seasonTitle}>{season.seasonKey}</Typography>
              </Box>
            ))}

            {METRICS.map(metric => (
              <Box key={metric.key} sx={sx.metricGroup}>
                <Box sx={[sx.cell, sx.metricLabel]}>
                  <Box sx={sx.metricIcon}>{iconUi({ id: metric.iconId, size: 'sm' })}</Box>
                  <Typography sx={sx.metricText}>{metric.label}</Typography>
                </Box>
                {timeline.map(season => (
                  <Box key={`${metric.key}-${season.seasonKey}`} sx={[sx.cell, sx.valueCell, season.isCurrent && sx.currentValueCell]}>
                    <Box sx={sx.value}>{renderMetricValue({ metric, season })}</Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Section>

      <Section
        iconId='league'
        title={`מסלול שנתון${overview.birthYear ? ` ${overview.birthYear}` : ''}`}
      >
        <Box sx={sx.leaguePath}>
          {(overview.leaguePath || []).map(season => (
            <Box key={season.seasonKey} sx={[sx.leagueCard, season.isCurrent && sx.leagueCardCurrent]}>
              <Box sx={sx.leagueCardHead}>
                <Typography sx={sx.cardSeason}>{season.seasonKey}</Typography>
                {season.ageGroupLabel ? <Typography sx={sx.ageGroup}>{season.ageGroupLabel}</Typography> : null}
              </Box>
              <LeagueName
                value={season.leagueName}
                level={season.leagueLevel}
                showLevel
                fontSize={12}
                levelFontSize={9}
              />
            </Box>
          ))}
        </Box>
      </Section>

      <Section
        iconId='players'
        title='איזון הסגל לאורך עונות'
        titleExtra={<LineLegend />}
      >
        <Box sx={sx.evolutionGroup}>
            <Box sx={sx.evolutionRows}>
              {(overview.rosterBalanceTimeline || []).map((season, index) => {
                if (!season) {
                  const seasonKey = overview.rosterTimeline?.[index]?.seasonKey || ''
                  const headerLeft = (
                    <Box sx={sx.evolutionCollapseSummary}>
                      <Typography sx={sx.evolutionCollapseSeason}>{seasonKey}</Typography>
                      <Typography sx={sx.evolutionCollapseEmptySummary}>אין נתוני סיווג לעונה זו</Typography>
                    </Box>
                  )
                  return (
                    <CollapseBox
                      key={seasonKey || index}
                      disabled
                      headerLeft={headerLeft}
                      rootSx={sx.evolutionCollapse}
                      headerSx={sx.evolutionCollapseHeader}
                    />
                  )
                }

                const totalInBar = season.categories.reduce((sum, item) => sum + item.count, 0)
                const isOpen = openRosterBalanceSeasonKey === season.seasonKey
                const headerLeft = (
                  <Box sx={sx.evolutionCollapseSummary}>
                    <Typography sx={sx.evolutionCollapseSeason}>{season.seasonKey}</Typography>
                    <SummaryFacts>
                      <SummaryChip iconId='players' label='סגל' value={season.total ?? totalInBar} />
                      {season.categories.map(item => <SummaryChip key={item.key} iconId={linePresentation(item.key === 'goalkeeper' ? 'GOALKEEPER' : item.key.toUpperCase()).iconId} label={item.label} value={item.count} />)}
                    </SummaryFacts>
                  </Box>
                )
                return (
                  <CollapseBox
                    key={season.seasonKey}
                    open={isOpen}
                    onToggle={() => setOpenRosterBalanceSeasonKey(isOpen ? '' : season.seasonKey)}
                    headerLeft={headerLeft}
                    rootSx={sx.evolutionCollapse}
                    headerSx={sx.evolutionCollapseHeader}
                    contentSx={sx.evolutionCollapseContent}
                  >
                    <Box sx={sx.evolutionCollapseBody}>
                      {totalInBar ? (
                        <Box sx={sx.stackedBar}>
                          {season.categories.filter(item => item.count > 0).map(item => (
                            <Tooltip
                              key={item.key}
                              title={<LineDistributionTooltip category={item} seasonKey={season.seasonKey} total={totalInBar} />}
                              arrow
                              placement='top'
                              slotProps={{ tooltip: { sx: sx.evolutionTooltip } }}
                            >
                              <Box sx={sx.stackedSegment({ width: (item.count / totalInBar) * 100, color: LINE_DISTRIBUTION_COLORS[item.key] })} />
                            </Tooltip>
                          ))}
                        </Box>
                      ) : <Typography sx={sx.evolutionEmptyValue}>אין שחקנים מסווגים להצגה</Typography>}
                      <Box sx={sx.evolutionCounts}>
                        {season.categories.map(item => <Typography key={item.key}>{item.label} {item.count}</Typography>)}
                        {season.total !== null ? <Typography sx={sx.evolutionTotal}>סה״כ {season.total}</Typography> : null}
                      </Box>
                    </Box>
                  </CollapseBox>
                )
              })}
            </Box>
        </Box>
      </Section>

      <Section
        iconId='scouting'
        title='פרופילי הסקאוט לאורך עונות'
      >
        <Box sx={sx.evolutionGroup}>
            <Box sx={sx.evolutionRows}>
              {(() => {
                const profileMaximum = Math.max(
                  1,
                  ...(overview.scoutProfileDistributionTimeline || [])
                    .flatMap(season => season?.profiles || [])
                    .map(profile => profile.count || 0)
                )

                return (overview.scoutProfileDistributionTimeline || []).map((season, index) => {
                  if (!season) {
                    const seasonKey = overview.profileTimeline?.[index]?.seasonKey || ''
                    const headerLeft = (
                      <Box sx={sx.evolutionCollapseSummary}>
                        <Typography sx={sx.evolutionCollapseSeason}>{seasonKey}</Typography>
                        <Typography sx={sx.evolutionCollapseEmptySummary}>אין נתוני פרופילים לעונה זו</Typography>
                      </Box>
                    )
                    return (
                      <CollapseBox
                        key={seasonKey || index}
                        disabled
                        headerLeft={headerLeft}
                        rootSx={sx.evolutionCollapse}
                        headerSx={sx.evolutionCollapseHeader}
                      />
                    )
                  }

                  const isOpen = openProfileSeasonKey === season.seasonKey
                  const leadingProfile = season.profiles[0]
                  const leadingPresentation = leadingProfile ? profilePresentation(leadingProfile.profileId) : null
                  const headerLeft = (
                    <Box sx={sx.evolutionCollapseSummary}>
                      <Typography sx={sx.evolutionCollapseSeason}>{season.seasonKey}</Typography>
                      <SummaryFacts>
                        <SummaryChip iconId='scouting' label='פרופילים פעילים' value={season.total ?? 0} />
                        <SummaryChip iconId='performanceProfile' label='סוגי פרופיל' value={season.profiles.length} />
                        {leadingProfile ? (
                          <SummaryChip iconId={leadingPresentation.iconId} label={`מוביל: ${leadingPresentation.label}`} value={leadingProfile.count} />
                        ) : null}
                      </SummaryFacts>
                    </Box>
                  )
                  return (
                    <CollapseBox
                      key={season.seasonKey}
                      open={isOpen}
                      disabled={!season.profiles.length}
                      onToggle={() => setOpenProfileSeasonKey(isOpen ? '' : season.seasonKey)}
                      headerLeft={headerLeft}
                      rootSx={sx.evolutionCollapse}
                      headerSx={sx.evolutionCollapseHeader}
                      contentSx={sx.evolutionCollapseContent}
                    >
                      <Box sx={sx.evolutionCollapseBody}>
                        <Box sx={sx.profileDistributionList}>
                          {season.profiles.map(profile => {
                            const presentation = profilePresentation(profile.profileId)
                            return (
                              <Box key={profile.profileId} sx={sx.profileDistributionRow}>
                                <Box sx={sx.profileDistributionLabel}>
                                  {iconUi({ id: presentation.iconId, size: 'sm' })}
                                  <Typography>{presentation.label}</Typography>
                                </Box>
                                <Box sx={sx.profileDistributionTrack}>
                                  <Box sx={sx.profileDistributionFill((profile.count / profileMaximum) * 100)} />
                                </Box>
                                <Typography sx={sx.profileDistributionCount}>{profile.count}</Typography>
                              </Box>
                            )
                          })}
                        </Box>
                      </Box>
                    </CollapseBox>
                  )
                })
              })()}
            </Box>
        </Box>
      </Section>

      <Section
        iconId='players'
        title='תנועת שחקנים בין עונות'
      >
        <Box sx={sx.movementSeasons}>
          {movementSeasons.map(season => {
            const isOpen = openMovementSeasonKey === season.seasonKey
            const directionItems = ['up', 'down', 'lateral'].map(direction => ({
              direction,
              count: season.directionCounts?.[direction] || 0,
              ...directionPresentation(direction),
            }))
            const lineItems = ['GOALKEEPER', 'DEFENSE', 'MIDFIELD', 'ATTACK', 'UNKNOWN']
              .map(line => ({
                line,
                count: season.lineCounts?.[line] || 0,
                ...linePresentation(line),
              }))
              .filter(item => item.count > 0)
            const headerLeft = (
              <Box sx={sx.evolutionCollapseSummary}>
                <Typography sx={sx.evolutionCollapseSeason}>{season.seasonKey}</Typography>
                {season.isUpcoming ? <Typography sx={sx.evolutionCollapseEmptySummary}>טרם החלה</Typography> : (
                  <SummaryFacts>
                    <SummaryChip iconId='rosterLeft' label='עזבו' value={season.leftCount} />
                    <SummaryChip iconId='rosterJoined' label='הצטרפו' value={season.joinedCount} />
                    {directionItems.map(item => <SummaryChip key={item.direction} iconId={item.iconId} label={item.label} value={item.count} />)}
                    {lineItems.map(item => <SummaryChip key={item.line} iconId={item.iconId} label={item.label} value={item.count} />)}
                  </SummaryFacts>
                )}
              </Box>
            )

            return (
              <CollapseBox
                key={season.seasonKey}
                open={isOpen}
                onToggle={() => setOpenMovementSeasonKey(isOpen ? '' : season.seasonKey)}
                headerLeft={headerLeft}
                iconId='arrowDown'
                rootSx={sx.movementCollapse}
                headerSx={sx.movementCollapseHeader}
              >
                <Box sx={sx.movementCollapseBody}>
                  {season.isUpcoming ? (
                    <Typography sx={sx.emptyInline}>טרם החלה העונה ולכן אין עדיין נתוני סגל או מעברים.</Typography>
                  ) : season.movements.length ? (
                    <Box sx={sx.movementList}>
                      {season.movements.map((movement, index) => {
                        const presentation = directionPresentation(movement.direction)
                        return (
                          <Box key={`${movement.name}-${index}`} sx={sx.movementItem}>
                            <Box sx={sx.movementPlayer}>
                              <Avatar src={playerImage} alt='' sx={sx.movementAvatar} />
                              <Typography sx={sx.movementName}>{movement.name}</Typography>
                            </Box>
                            <Typography sx={sx.movementProfile}>{movement.hasScoutProfile ? 'עם פרופיל סקאוט' : 'ללא פרופיל סקאוט'}</Typography>
                            <Box sx={sx.movementTag(presentation.color)}>
                              {iconUi({ id: presentation.iconId, size: 'sm' })}
                              <Typography component='span' sx={sx.movementTagText}>{presentation.label}</Typography>
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  ) : <Typography sx={sx.emptyInline}>לא נמצאו עוזבים בעונה זו.</Typography>}
                </Box>
              </CollapseBox>
            )
          })}
        </Box>
      </Section>
    </Box>
  )
}
