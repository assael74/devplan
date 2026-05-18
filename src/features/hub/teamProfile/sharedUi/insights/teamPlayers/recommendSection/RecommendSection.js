// TEAMPROFILE/sharedUi/insights/teamPlayers/recommendSection/RecommendSection.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import RecommendCard from './RecommendCard.js'

import { recommendSx as sx } from './sx/index.js'

const emptyArray = []
const emptyObject = {}
const defaultLimit = 4

const getItems = model => {
  return Array.isArray(model?.items) ? model.items : emptyArray
}

const SummaryText = ({ summary, visibleCount }) => {
  if (!summary) return null

  return (
    <Typography level="body-xs" sx={sx.sub}>
      {visibleCount || 0} מוצגות מתוך {summary.total || 0} המלצות · {summary.danger || 0} קריטיות
    </Typography>
  )
}

export default function RecommendSection({ model = emptyObject, resetKey }) {
  const [hiddenIds, setHiddenIds] = React.useState([])

  React.useEffect(() => {
    setHiddenIds([])
  }, [resetKey])

  const items = getItems(model)
  const status = model.status || emptyObject

  const visibleItems = React.useMemo(() => {
    return items
      .filter(item => !hiddenIds.includes(item.id))
      .slice(0, defaultLimit)
  }, [items, hiddenIds])

  const hideItem = id => {
    setHiddenIds(current => (
      current.includes(id)
        ? current
        : [...current, id]
    ))
  }

  return (
    <Box sx={sx.subSection}>
      <Box sx={sx.head}>
        <Box sx={sx.titleWrap}>
          <SummaryText
            summary={model.summary}
            visibleCount={visibleItems.length}
          />
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={status.color || 'neutral'}
          sx={sx.statusChip}
        >
          {status.label || 'בבדיקה'}
        </Chip>
      </Box>

      {visibleItems.length ? (
        <Box sx={sx.list}>
          {visibleItems.map((item, index) => (
            <RecommendCard
              key={item.id}
              item={item}
              index={index}
              onDismiss={hideItem}
            />
          ))}
        </Box>
      ) : (
        <Typography level="body-sm" sx={sx.empty}>
          אין המלצות להצגה כרגע.
        </Typography>
      )}
    </Box>
  )
}
