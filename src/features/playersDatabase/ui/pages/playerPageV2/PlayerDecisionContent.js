import * as React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import teamLogo from '../../../../../ui/core/images/teamLogo.png'
import { resolveAgeGroupLabel } from '../../../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { SCOUT_PROFILE_COMBINATIONS } from '../../../../../shared/scouting/players/index.js'
import { buildTeamPlayerLineClassificationEvaluation } from '../../../../../shared/scouting/teams/lines/teamLineClassification.js'
import LeagueName from '../../components/entities/LeagueName.js'
import TeamName from '../../components/entities/TeamName.js'
import PlayerLineClassificationChip from '../../components/playerMeta/PlayerLineClassificationChip.js'
import PlayerLineClassificationTooltip from '../../components/playerMeta/PlayerLineClassificationTooltip.js'
import PlayerPositionChip from '../../components/playerMeta/PlayerPositionChip.js'
import PlayerRosterStatusBadge from '../../components/playerMeta/PlayerRosterStatusBadge.js'
import ScoutBadge from '../../components/scout/ScoutBadge.js'
import ScoutStatusChip from '../../components/scout/ScoutStatusChip.js'
import ScoutProfileChipV2 from '../../components/scout/ScoutProfileChipV2.js'
import PlayerScoutingLevelsModal from './PlayerScoutingLevelsModal.js'
import { buildPlayerScoutView } from './logic/playerScoutView.js'
import { playerDecisionContentSx as sx } from './sx/playerDecisionContent.sx.js'

const INTEREST_LABELS = {
  reasonable: 'עניין סביר',
  curious: 'מסקרן',
  interesting: 'מעניין',
  super_interesting: 'מעניין מאוד',
}

const INTEREST_REASON_ORDER = [
  'immediacy',
  'current_profile_persistence',
  'historical_profile_persistence',
  'profile_combination',
  'combination_profile_depth',
]

const INTEREST_REASON_LABELS = {
  immediacy: 'רמת המיידיות',
  current_profile_persistence: 'פרופיל ב־Current ובעונה קודמת',
  historical_profile_persistence: 'פרופיל בשתי עונות היסטוריות',
  profile_combination: 'שילוב פרופילים',
  combination_profile_depth: 'עומק פרופיל בקומבינציה',
}

const INTEREST_REASON_EXPLANATIONS = {
  immediacy: {
    active: 'המיידיות האוטומטית מוסיפה לניקוד העניין.',
    inactive: 'המיידיות האוטומטית אינה מוסיפה ניקוד כרגע.',
  },
  current_profile_persistence: {
    active: 'אותו פרופיל זוהה ב־Current ובעונה הקודמת.',
    inactive: 'לא זוהה אותו פרופיל ב־Current ובעונה הקודמת.',
  },
  historical_profile_persistence: {
    active: 'אותו פרופיל זוהה בשתי העונות ההיסטוריות האחרונות.',
    inactive: 'לא זוהה אותו פרופיל בשתי העונות ההיסטוריות האחרונות.',
  },
  profile_combination: {
    active: 'זוהתה קומבינציה ב־Current או בעונה ההיסטורית האחרונה.',
    inactive: 'לא זוהתה קומבינציה ב־Current או בעונה ההיסטורית האחרונה.',
  },
  combination_profile_depth: {
    active: 'לפחות פרופיל אחד בקומבינציה הוא בעומק של 50% ומעלה.',
    inactive: 'אין בקומבינציה פרופיל בעומק של 50% ומעלה.',
  },
}

const clean = value => String(value || '').trim()

const resolveSeasonStartYear = seasonKey => {
  const match = clean(seasonKey).match(/^(\d{2})[/_-](\d{2})$/)
  return match ? 2000 + Number(match[1]) : null
}

const resolveNextAgeGroup = row => {
  const match = clean(row?.ageGroupId).toLowerCase().match(/^u(\d+)$/)
  return match ? resolveAgeGroupLabel({ ageGroupId: `u${Number(match[1]) + 1}` }) : '-'
}

const getCatalogClubStrengthLevel = clubId => {
  const club = PLAYERS_DATABASE_CLUBS_CATALOG.find(
    item => clean(item?.id) === clean(clubId)
  )
  const value = Number(club?.clubStrengthLevel)
  return Number.isFinite(value) && value > 0 ? value : null
}

const getInterestConditionExplanation = (id, active) => (
  INTEREST_REASON_EXPLANATIONS[id]?.[active ? 'active' : 'inactive'] ||
  (active ? 'התנאי פעיל בהערכת העניין.' : 'התנאי אינו פעיל כרגע.')
)

const getInterest = player => {
  const source = player.scoutPlayerInterest ||
    player.domain?.scoutPlayerInterest ||
    player.scout?.playerInterest ||
    player.playerInterest ||
    {}
  const level = clean(source.interestLevel || source.level)
  const reasons = Array.isArray(source.reasons) ? source.reasons : []
  const factors = Array.isArray(source.factors) ? source.factors : []

  return {
    level,
    label: INTEREST_LABELS[level] || 'לא נקבע',
    score: Number.isFinite(Number(source.score)) ? Number(source.score) : 0,
    maxScore: Number.isFinite(Number(source.maxScore)) ? Number(source.maxScore) : 8,
    factors: factors.map(factor => ({
      id: clean(factor?.id),
      points: Number.isFinite(Number(factor?.points)) ? Number(factor.points) : 0,
      active: Boolean(factor?.active),
    })).filter(factor => factor.id),
    reasons: reasons.map(reason => {
      const id = clean(reason?.id || reason?.reason || reason)
      return {
        id,
        label: clean(reason?.label) || INTEREST_REASON_LABELS[id] || id,
      }
    }).filter(reason => reason.label),
  }
}

const getLeagueLevel = row => {
  const value = row?.leagueLevel || row?.competitionLevel || row?.scout?.context?.competition?.leagueLevel
  return value === null || value === undefined || value === '' ? '' : String(value)
}


const getAvailableMinutesPct = row => {
  const minutes = Number(row?.minutes || 0)
  const teamMinutes = Number(row?.teamMinutes || row?.playerStats?.teamMinutes || 0)
  if (!minutes || !teamMinutes) return null

  return Math.round((minutes / teamMinutes) * 100)
}

const resolveStatTrend = (value, previousValue) => {
  if (previousValue === null || previousValue === undefined || previousValue === '') {
    return 'unavailable'
  }

  const current = Number(value)
  const previous = Number(previousValue)

  if (!Number.isFinite(current) || !Number.isFinite(previous)) return 'unavailable'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'equal'
}

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


const IMMEDIACY_PARAMETER_LABELS = {
  early_age_group: 'קבוצת גיל מוקדמת',
  profile_combination: 'שילוב פרופילים מוגדר',
  ideal_club_range: 'טווח חוזק מועדון',
  ideal_league_level: 'רמת ליגה יעד',
  future_level_risk: 'סיכון ברמת התחרות העתידית',
  playing_up_validation: 'אימות משחק בשנתון גבוה יותר',
  profile_persistence: 'התמדה של הפרופיל',
  profile_combination_persistence: 'התמדה של שילוב הפרופילים',
  signal_decay: 'דעיכת הסימן לאורך זמן',
}

const IMMEDIACY_MISSING_INFO_REASONS = new Set([
  'club_strength_unavailable',
  'league_level_unavailable',
  'future_path_unavailable',
  'future_path_season_mismatch',
])

const IMMEDIACY_MISSING_PREREQUISITE_REASONS = new Set([
  'multiple_profiles_required',
  'promoted_talent_profile_required',
  'current_profile_required',
  'current_combination_required',
])

const getImmediacyParameterLabel = item => IMMEDIACY_PARAMETER_LABELS[item.id] || item.label || item.id

const getMissedExplanation = item => {
  const details = item.details || {}

  switch (item.reason) {
    case 'age_group_not_early':
      return 'קבוצת הגיל אינה עומדת בתנאי הגיל המוקדם.'
    case 'no_defined_combination':
      return 'יש יותר מפרופיל אחד, אך לא זוהה שילוב פרופילים מוגדר.'
    case 'club_strength_outside_ideal_range':
      return Number.isFinite(Number(details.clubStrengthLevel))
        ? `חוזק המועדון הוא ${details.clubStrengthLevel}; טווח היעד הוא ${details.min}–${details.max}.`
        : 'חוזק המועדון נמצא מחוץ לטווח היעד.'
    case 'league_level_not_ideal':
      return Number.isFinite(Number(details.leagueLevel))
        ? `רמת הליגה היא ${details.leagueLevel}; רמת היעד היא ${details.targetLeagueLevel}.`
        : 'רמת הליגה אינה רמת היעד.'
    case 'future_outlook_not_risk':
      return 'המסלול העתידי אינו מסומן כרגע כסיכון שמעלה דחיפות.'
    case 'playing_up_sample_too_small':
      return Number.isFinite(Number(details.games)) && Number.isFinite(Number(details.minGames))
        ? `המדגם הוא ${details.games} משחקים; נדרשים לפחות ${details.minGames}.`
        : 'מדגם המשחקים בשנתון הגבוה עדיין קטן מהסף הנדרש.'
    case 'profile_not_repeated':
      return 'הפרופיל עדיין לא חזר במספר העונות הנדרש.'
    case 'combination_not_repeated':
      return 'שילוב הפרופילים עדיין לא חזר במספר העונות הנדרש.'
    default:
      return 'התנאי נבדק ולא התקיים.'
  }
}

const getMissingExplanation = item => {
  switch (item.reason) {
    case 'club_strength_unavailable':
      return 'חסר נתון חוזק מועדון.'
    case 'league_level_unavailable':
      return 'חסרה רמת הליגה.'
    case 'future_path_unavailable':
      return 'חסר מסלול תחרות עתידי לעונה הנוכחית.'
    case 'future_path_season_mismatch':
      return 'קיים מסלול עתידי, אך הוא אינו תואם לעונה הנוכחית.'
    case 'multiple_profiles_required':
      return 'נדרש יותר מפרופיל פעיל אחד כדי לבדוק שילוב פרופילים.'
    case 'promoted_talent_profile_required':
      return 'נדרש פרופיל של משחק בשנתון גבוה יותר כדי לבצע את הבדיקה.'
    case 'current_profile_required':
      return 'נדרש פרופיל פעיל בעונה הנוכחית כדי לבדוק התמדה.'
    case 'current_combination_required':
      return 'נדרש שילוב פרופילים פעיל בעונה הנוכחית כדי לבדוק התמדה שלו.'
    default:
      return 'אין כרגע מספיק מידע או תנאי מקדים כדי לבצע את הבדיקה.'
  }
}

const getFactorState = item => {
  switch (item.type) {
    case 'boost':
      return { label: 'התקיים', tone: 'boost' }
    case 'reduction':
      return { label: 'הפחית', tone: 'reduction' }
    case 'no_change':
      return { label: 'לא התקיים', tone: 'missed' }
    case 'not_applicable':
      return { label: 'לא רלוונטי', tone: 'notApplicable' }
    default:
      return { label: item.resultLabel || 'מידע', tone: 'context' }
  }
}

const getFactorExplanation = item => {
  if (item.type === 'no_change') return getMissedExplanation(item)
  if (item.type === 'not_applicable') return getMissingExplanation(item)
  if (item.type === 'reduction') return 'הפרמטר מפחית את ציון המיידיות.'
  if (item.type === 'boost') return 'הפרמטר תורם לציון המיידיות.'

  return ''
}

const getFactorPointsLabel = item => {
  if (item.points === null || item.points === undefined) return '—'

  const points = Number(item.points)

  if (!Number.isFinite(points)) return '—'
  if (!points) return '0'

  return `${points > 0 ? '+' : ''}${points}`
}

const getFactorPointsTone = item => {
  if (item.points === null || item.points === undefined) return 'empty'

  const points = Number(item.points)

  if (!Number.isFinite(points)) return 'empty'
  if (points > 0) return 'positive'
  if (points < 0) return 'negative'
  return 'zero'
}

const formatImmediacyScore = value => {
  const score = Number(value)
  if (!Number.isFinite(score)) return '0'

  return `${score > 0 ? '+' : ''}${score}`
}

function ImmediacyTableRow({ item }) {
  const state = getFactorState(item)
  const explanation = getFactorExplanation(item)
  const showState = item.type === 'context'
  const pointsTone = getFactorPointsTone(item)

  return (
    <Box sx={sx.immediacyRow}>
      <Typography level='body-xs' sx={sx.immediacyParameter}>{getImmediacyParameterLabel(item)}</Typography>
      <Box sx={sx.immediacyScore}>
        {showState ? <Typography level='body-xs' sx={[sx.immediacyState, sx[`immediacyState_${state.tone}`]]}>{state.label}</Typography> : null}
        <Typography level='body-xs' sx={[sx.immediacyPoints, sx[`immediacyPoints_${pointsTone}`]]}>{getFactorPointsLabel(item)}</Typography>
      </Box>
      <Typography level='body-xs' sx={sx.immediacyExplanation}>{explanation || '—'}</Typography>
    </Box>
  )
}

const INITIAL_IMMEDIACY_ROWS = 4
const INITIAL_INTEREST_ROWS = 4

const scrollToExpandedRows = container => {
  if (!container) return

  const maxScrollTop = container.scrollHeight - container.clientHeight
  container.scrollTop = Math.max(0, Math.round(maxScrollTop / 2))
}

function ImmediacyFactorList({ items = [] }) {
  const [expanded, setExpanded] = React.useState(false)
  const tableRef = React.useRef(null)

  React.useEffect(() => {
    if (!expanded) return undefined

    let timer
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => scrollToExpandedRows(tableRef.current), 230)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [expanded])

  if (!items.length) {
    return <Typography level='body-sm' sx={sx.emptyText}>אין פירוט חישוב זמין מהמודל.</Typography>
  }

  const scoredItems = items.filter(item => (
    Number.isFinite(Number(item.points)) && Number(item.points) !== 0
  ))
  const missedItems = items.filter(item => item.type === 'no_change')
  const notApplicableItems = items.filter(item => item.type === 'not_applicable')
  const otherItems = items.filter(item => ![
    ...scoredItems,
    ...missedItems,
    ...notApplicableItems,
  ].includes(item))
  const orderedItems = [
    ...scoredItems,
    ...missedItems,
    ...otherItems,
    ...notApplicableItems,
  ]
  const visibleItems = orderedItems.slice(0, INITIAL_IMMEDIACY_ROWS)
  const hiddenItems = orderedItems.slice(INITIAL_IMMEDIACY_ROWS)

  return (
    <Box ref={tableRef} sx={sx.immediacyTable}>
      {visibleItems.map(item => <ImmediacyTableRow key={`${item.id}_${item.type}`} item={item} />)}
      {hiddenItems.length ? (
        <CollapseBox
          open={expanded}
          title={expanded ? 'הסתר פרמטרים נוספים' : `הצג עוד ${hiddenItems.length} פרמטרים`}
          onToggle={() => setExpanded(value => !value)}
          rootSx={sx.immediacyCollapse}
          headerSx={sx.immediacyCollapseHeader}
          indicatorSx={sx.immediacyCollapseIndicator}
          innerSx={sx.immediacyCollapseInner}
        >
          {hiddenItems.map(item => <ImmediacyTableRow key={`${item.id}_${item.type}`} item={item} />)}
        </CollapseBox>
      ) : null}
    </Box>
  )
}

function InterestConditionList({ factors = [] }) {
  const [expanded, setExpanded] = React.useState(false)
  const rowsRef = React.useRef(null)
  const factorsById = new Map(factors.map(factor => [factor.id, factor]))
  const activeIds = new Set(factors.filter(factor => factor.active).map(factor => factor.id))
  const orderedReasonIds = [
    ...INTEREST_REASON_ORDER.filter(id => activeIds.has(id)),
    ...INTEREST_REASON_ORDER.filter(id => !activeIds.has(id)),
  ]
  const visibleReasonIds = orderedReasonIds.slice(0, INITIAL_INTEREST_ROWS)
  const hiddenReasonIds = orderedReasonIds.slice(INITIAL_INTEREST_ROWS)

  React.useEffect(() => {
    if (!expanded) return undefined

    let timer
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => scrollToExpandedRows(rowsRef.current), 230)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [expanded])

  return (
    <Box ref={rowsRef} sx={sx.interestRows}>
      {visibleReasonIds.map(id => {
        const factor = factorsById.get(id)
        const active = factor?.active === true
        return (
          <Box key={id} sx={sx.interestRow}>
            <Box sx={sx.interestRowTop}>
              <Typography level='body-xs' sx={[sx.factorText, !active && sx.factorTextMuted]}>
                {INTEREST_REASON_LABELS[id]}
              </Typography>
              <Box sx={[sx.factorState, active ? sx.factorState_active : sx.factorState_inactive]}>
                {active ? `+${factor.points}` : '0'}
              </Box>
            </Box>
            <Typography level='body-xs' sx={sx.interestExplanation}>
              {getInterestConditionExplanation(id, active)}
            </Typography>
          </Box>
        )
      })}
      {hiddenReasonIds.length ? (
        <CollapseBox
          open={expanded}
          title={expanded ? 'הסתר תנאים נוספים' : `הצג עוד ${hiddenReasonIds.length} תנאים`}
          onToggle={() => setExpanded(value => !value)}
          rootSx={sx.immediacyCollapse}
          headerSx={sx.immediacyCollapseHeader}
          indicatorSx={sx.immediacyCollapseIndicator}
          innerSx={sx.immediacyCollapseInner}
        >
          {hiddenReasonIds.map(id => {
            const factor = factorsById.get(id)
            const active = factor?.active === true

            return (
              <Box key={id} sx={sx.interestRow}>
                <Box sx={sx.interestRowTop}>
                  <Typography level='body-xs' sx={[sx.factorText, !active && sx.factorTextMuted]}>
                    {INTEREST_REASON_LABELS[id]}
                  </Typography>
                  <Box sx={[sx.factorState, active ? sx.factorState_active : sx.factorState_inactive]}>
                    {active ? `+${factor.points}` : '0'}
                  </Box>
                </Box>
                <Typography level='body-xs' sx={sx.interestExplanation}>
                  {getInterestConditionExplanation(id, active)}
                </Typography>
              </Box>
            )
          })}
        </CollapseBox>
      ) : null}
    </Box>
  )
}

function DecisionHero({ player, view }) {
  const careerInterest = getInterest(player)
  const immediacyFactors = Array.isArray(view.interest?.factors) ? view.interest.factors : []
  const interestFactors = careerInterest.factors

  return (
    <Box sx={sx.heroGrid}>
      <Box sx={sx.heroCard}>
        <Box sx={sx.heroHeader}>
          <Box sx={sx.heroTitleRow}>
            <Box sx={sx.heroIcon}>{iconUi({ id: 'immediacy', size: 'sm' })}</Box>
            <Typography level='title-lg' sx={sx.heroTitle}>מיידיות מקצועית</Typography>
          </Box>
          <Box sx={sx.heroStatusArea}>
            <PlayerScoutingLevelsModal
              area='immediacy'
              trigger={<ScoutStatusChip
                type='immediacy'
                value={view.interest?.status || 'unknown'}
                label={view.interest?.label || 'לא נקבעה'}
                size='lg'
              />}
            />
            {view.interest?.isManual ? (
              <Typography level='body-xs' sx={sx.manualNote}>החלטה ידנית · המודל האוטומטי: {view.interest.automaticLabel}</Typography>
            ) : null}
          </Box>
        </Box>

        <Box sx={sx.heroReasonsArea}>
          <ImmediacyFactorList items={immediacyFactors} />
        </Box>

        <Box sx={sx.heroFooter}>
          <Typography level='body-xs' sx={sx.footerText}>ציון מיידיות</Typography>
          <Box sx={sx.immediacyTotalBadge}>{formatImmediacyScore(view.interest?.netScore)}</Box>
        </Box>
      </Box>

      <Box sx={sx.heroCard}>
        <Box sx={sx.heroHeader}>
          <Box sx={sx.heroTitleRow}>
            <Box sx={sx.heroIcon}>{iconUi({ id: 'interest', size: 'sm' })}</Box>
            <Typography level='title-lg' sx={sx.heroTitle}>עניין מקצועי</Typography>
          </Box>
          <Box sx={sx.heroStatusArea}>
            <PlayerScoutingLevelsModal
              area='interest'
              trigger={<ScoutStatusChip
                type='interest'
                value={careerInterest.level || 'unknown'}
                label={careerInterest.label}
                size='lg'
              />}
            />
          </Box>
        </Box>

        <Box sx={sx.heroReasonsArea}>
          <InterestConditionList factors={interestFactors} />
        </Box>

        <Box sx={sx.heroFooter}>
          <Typography level='body-xs' sx={sx.footerText}>ציון עניין</Typography>
          <Box sx={sx.interestTotalBadge}>{careerInterest.score}/{careerInterest.maxScore}</Box>
        </Box>
      </Box>
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
            manualTransferDirection={row.manualTransferDirection}
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
          <ScoutProfileChipV2
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

function MultiSeasonPath({ player, historyRows, catalogSeasonKey = '' }) {
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

function ChecksSection({ questions = {} }) {
  const checks = (Array.isArray(questions.checks) ? questions.checks : [])
    .filter(check => !check.answered)
    .slice()
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, 2)

  return (
    <Box sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleContainer}>
          <Box sx={sx.sectionTitleRow}>
            <Box sx={sx.sectionTitleIcon}>{iconUi({ id: 'check', size: 'sm' })}</Box>
            <Typography level='title-lg' sx={sx.sectionTitle}>מה כדאי לבדוק</Typography>
          </Box>
        </Box>
        {checks.length ? <Chip size='sm' variant='soft' color='warning'>{checks.length} בדיקות בעדיפות</Chip> : null}
      </Box>

      {checks.length ? (
        <Box sx={sx.checksGrid}>
          {checks.map((check, index) => (
            <Box key={check.id || index} sx={sx.checkCard}>
              <Box sx={sx.checkNumber}>{index + 1}</Box>
              <Box sx={sx.checkBody}>
                <Typography level='title-sm' sx={sx.checkTitle}>{check.label}</Typography>
                <Typography level='body-xs' sx={sx.checkExplanation}>
                  {check.score
                    ? `אימות הבדיקה יעזור לצמצם אי־ודאות בהחלטה. תועלת מיידית ${check.score}.`
                    : 'אימות הבדיקה יעזור לצמצם אי־ודאות בהחלטה המקצועית.'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography level='body-sm' sx={sx.emptyText}>אין כרגע בדיקות מקצועיות בעדיפות גבוהה.</Typography>
      )}
    </Box>
  )
}

export default function PlayerDecisionContent({ player = {}, historyRows = [], catalogSeasonKey = '' }) {
  const view = React.useMemo(() => buildPlayerScoutView({ player, historyRows }), [player, historyRows])

  return (
    <Box sx={sx.root}>
      <DecisionHero player={player} view={view} />
      <MultiSeasonPath player={player} historyRows={historyRows} catalogSeasonKey={catalogSeasonKey} />
      <ChecksSection questions={view.questions} />
    </Box>
  )
}
