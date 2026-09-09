import * as React from 'react'
import { Box, Typography } from '@mui/joy'

import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import ScoutStatusChip from '../../components/scout/status/ScoutStatusChip.js'
import PlayerScoutingLevelsModal from './PlayerScoutingLevelsModal.js'
import {
  INTEREST_REASON_LABELS,
  INTEREST_REASON_ORDER,
  formatImmediacyScore,
  getFactorExplanation,
  getFactorPointsLabel,
  getFactorPointsTone,
  getFactorState,
  getImmediacyParameterLabel,
  getInterest,
  getInterestConditionExplanation,
} from './logic/playerDecisionContent.model.js'
import { playerDecisionContentSx as sx } from './sx/playerDecisionContent.sx.js'

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

export default function PlayerDecisionHero({ player, view }) {
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

