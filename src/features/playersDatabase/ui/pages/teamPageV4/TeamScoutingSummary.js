import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { TEAM_STRUCTURE_FILTER } from './model/teamStructureFilter.model.js'
import { teamScoutingSummarySx as sx } from './sx/teamScoutingSummary.sx.js'

const SUMMARY_ITEMS = Object.freeze([
  {
    key: 'defense',
    label: 'הגנה',
    iconId: 'defense',
    filterKey: TEAM_STRUCTURE_FILTER.DEFENSE,
  },
  {
    key: 'offense',
    label: 'התקפה',
    iconId: 'attack',
    filterKey: TEAM_STRUCTURE_FILTER.ATTACK,
  },
  {
    key: 'squad',
    label: 'שימוש בסגל',
    iconId: 'group',
    filterKey: TEAM_STRUCTURE_FILTER.ALL_SQUAD,
  },
])

const resolveItemState = ({ structure, item }) => {
  const interest = item.key === 'squad'
    ? structure?.teamInterest?.squad
    : structure?.teamInterest?.lines?.[item.key]
  const presentation = structure?.interestPresentation?.[item.key]
  const isInteresting = Boolean(interest?.isInteresting)

  if (isInteresting) {
    return {
      tone: 'review',
      status: 'לבדיקה',
      title: presentation?.label || `${item.label} — נמצא ממצא`,
      explanation: presentation?.explanation || 'נמצא שילוב נתונים שמצדיק בחינה ממוקדת.',
    }
  }

  return {
    tone: 'clear',
    status: 'אין ממצא לבדיקה',
    title: item.key === 'squad'
      ? 'חלוקת דקות ללא ממצא משמעותי'
      : `${item.label} — ללא ממצא משמעותי`,
    explanation: item.key === 'squad'
      ? 'לא נמצא כרגע דפוס שימוש בסגל שמצדיק העמקה.'
      : 'לא נמצא כרגע שילוב של מבנה הסגל והביצועים שמצדיק העמקה.',
  }
}

export default function TeamScoutingSummary({
  structure = null,
  title = 'תמונת סקאוטינג',
  selectedFilter = null,
  onFilterChange,
}) {
  if (!structure || structure.availability === 'unavailable') return null

  return (
    <Box sx={sx.section}>
      <Box sx={sx.header}>
        <Box sx={sx.titleRow}>
          <Box sx={sx.titleIcon}>{iconUi({ id: 'scouting', size: 'sm' })}</Box>
          <Typography sx={sx.title}>{title}</Typography>
        </Box>
      </Box>

      <Box sx={sx.grid}>
        {SUMMARY_ITEMS.map(item => {
          const state = resolveItemState({ structure, item })
          const clickable = Boolean(item.filterKey && onFilterChange)
          const selected = item.filterKey === selectedFilter

          return (
            <Box
              key={item.key}
              component={clickable ? 'button' : 'div'}
              type={clickable ? 'button' : undefined}
              onClick={clickable ? () => onFilterChange(item.filterKey) : undefined}
              sx={[
                sx.card,
                state.tone === 'review' ? sx.cardReview : sx.cardClear,
                clickable && sx.cardClickable,
                selected && (state.tone === 'review' ? sx.cardReviewSelected : sx.cardSelected),
              ]}
              aria-pressed={clickable ? selected : undefined}
            >
              <Box sx={sx.cardBody}>
                <Box sx={sx.cardTop}>
                  <Box sx={sx.cardHeading}>
                    <Box sx={sx.icon}>{iconUi({ id: item.iconId, size: 'sm' })}</Box>
                    <Typography sx={sx.cardLabel}>{item.label}</Typography>
                  </Box>
                  <Box sx={[
                    sx.status,
                    state.tone === 'review' ? sx.statusReview : sx.statusClear,
                  ]}>
                    {state.tone === 'review'
                      ? iconUi({ id: 'scouting', size: 'sm' })
                      : iconUi({ id: 'verified', size: 'sm' })}
                    <Typography component='span' sx={sx.statusText}>{state.status}</Typography>
                  </Box>
                </Box>

                <Typography sx={sx.cardTitle}>{state.title}</Typography>
                <Typography sx={sx.cardExplanation}>{state.explanation}</Typography>

              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
