// features/insightsHub/performance/components/PerformanceFlowSummary.js

import React from 'react'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  flowSx,
} from './sx/flow.sx.js'

const flowItems = [
  {
    id: 'team-target',
    num: 1,
    label: 'יעד קבוצה',
    sub: 'איזה מקום בטבלה רוצים שהקבוצה תסיים',
    iconId: 'teams',
    tone: 'team',
  },
  {
    id: 'numeric-targets',
    num: 2,
    label: 'יעדים מספריים',
    sub: 'הופכים את היעד בטבלה ליעדים עם כמות שערים, בישולים ונקודות',
    iconId: 'rate',
    tone: 'numeric',
  },
  {
    id: 'player-targets',
    num: 3,
    label: 'יעדים אישיים לשחקנים',
    sub: 'מיעדי הקבוצה גוזרים יעדים אישיים לשחקנים, מותאמים למעמדם ולעמדה שלהם',
    iconId: 'players',
    tone: 'player',
  },
  {
    id: 'rating',
    num: 4,
    label: 'מדד יעילות',
    sub: 'בוחן את קצב העמידה ביעד האישי והקבוצתי',
    iconId: 'scoringRating',
    tone: 'metrics',
  },
  {
    id: 'impact',
    num: 5,
    label: 'מדד השפעה מצטברת',
    sub: 'אוסף את הפער החיובי או השלילי שנוצר במהלך העונה',
    iconId: 'scoringImpact',
    tone: 'metrics',
  },
  {
    id: 'profile',
    num: 6,
    label: 'פרופיל ביצוע',
    sub: 'הופך את מדד היעילות ומדד ההשפעה המצטברת לפרופיל ביצוע',
    iconId: 'performanceProfile',
    tone: 'profile',
  },
]

const flowRows = [
  ['team-target'],
  ['numeric-targets'],
  ['player-targets'],
  ['rating', 'impact'],
  ['profile'],
]

const getItem = id => {
  return flowItems.find(item => item.id === id)
}

const getButtonLabel = ({ done, started }) => {
  if (done) return 'הצג מהתחלה'
  if (started) return 'המשך במסלול'

  return 'הצג את מסלול המודל'
}

const isItemVisible = ({ item, visibleCount }) => {
  return item.num <= visibleCount
}

const isItemActive = ({ item, visibleCount }) => {
  return item.num === visibleCount
}

const isRowVisible = ({ row, visibleCount }) => {
  return row.some(id => {
    const item = getItem(id)

    return item?.num <= visibleCount
  })
}

function FlowConnector({ visible }) {
  return <Box sx={flowSx.connector(visible)} />
}

function FlowCard({ item, visible, active }) {
  return (
    <Box sx={flowSx.card(item.tone, { visible, active })}>
      <Box sx={flowSx.numBadge(item.tone, { active })}>
        {item.num}
      </Box>

      <Box sx={flowSx.icon(item.tone)}>
        {iconUi({ id: item.iconId, size: 'sm' })}
      </Box>

      <Box sx={flowSx.body}>
        <Typography level="title-md" sx={flowSx.label}>
          {item.label}
        </Typography>

        <Typography level="body-xs" sx={flowSx.sub}>
          {item.sub}
        </Typography>
      </Box>
    </Box>
  )
}

function FlowRow({ row, visibleCount }) {
  return (
    <Box sx={flowSx.row(row.length)}>
      {row.map(id => {
        const item = getItem(id)
        if (!item) return null

        return (
          <FlowCard
            key={item.id}
            item={item}
            visible={isItemVisible({ item, visibleCount })}
            active={isItemActive({ item, visibleCount })}
          />
        )
      })}
    </Box>
  )
}

export default function PerformanceFlowSummary() {
  const scrollRef = React.useRef(null)
  const itemRefs = React.useRef([])
  const [visibleCount, setVisibleCount] = React.useState(1)

  const maxCount = flowItems.length
  const done = visibleCount >= maxCount
  const started = visibleCount > 1

  const scrollToStep = index => {
    const wrap = scrollRef.current
    const target = itemRefs.current[index]

    if (!wrap || !target) return

    const wrapRect = wrap.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

    const nextTop =
      wrap.scrollTop +
      targetRect.top -
      wrapRect.top -
      (wrap.clientHeight - target.offsetHeight) / 2

    wrap.scrollTo({
      top: Math.max(nextTop, 0),
      behavior: 'smooth',
    })
  }

  const handleReset = () => {
    setVisibleCount(1)

    window.requestAnimationFrame(() => {
      scrollToStep(0)
    })
  }

  const handleNext = () => {
    if (done) {
      handleReset()
      return
    }

    const nextCount = Math.min(visibleCount + 1, maxCount)
    setVisibleCount(nextCount)

    window.requestAnimationFrame(() => {
      scrollToStep(nextCount - 1)
    })
  }

  return (
    <Box sx={flowSx.root}>
      <Box sx={flowSx.actions}>
        <Button
          size="lg"
          variant="solid"
          color="primary"
          onClick={handleNext}
          sx={flowSx.flowButton}
        >
          {getButtonLabel({ done, started })}
        </Button>
      </Box>

      <Box ref={scrollRef} className="dpScrollThin" sx={flowSx.flowScroll}>
        <Box sx={flowSx.flow}>
          {flowRows.map((row, rowIndex) => {
            const visible = isRowVisible({ row, visibleCount })
            const lastRow = rowIndex === flowRows.length - 1

            return (
              <Box
                key={row.join('-')}
                ref={el => {
                  row.forEach(id => {
                    const item = getItem(id)
                    if (item) itemRefs.current[item.num - 1] = el
                  })
                }}
                sx={flowSx.itemWrap}
              >
                <FlowRow row={row} visibleCount={visibleCount} />

                {!lastRow ? (
                  <FlowConnector visible={visible} />
                ) : null}
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
