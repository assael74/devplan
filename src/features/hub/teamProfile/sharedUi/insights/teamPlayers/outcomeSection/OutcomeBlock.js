// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeBlock.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import OutcomeCards from './OutcomeCards.js'
import OutcomeDetails from './OutcomeDetails.js'

import { blockSx as sx } from './sx/index.js'

const emptyArray = []

const getGroups = model => {
  return Array.isArray(model?.groups) ? model.groups : emptyArray
}

const getFirstId = groups => {
  return groups?.[0]?.id || null
}

const getSelected = ({ groups, selectedId }) => {
  return groups.find(item => item.id === selectedId) || groups[0] || null
}

const byIds = ids => group => {
  return ids.includes(group.id)
}

const InfoGroups = ({ groups = emptyArray }) => {
  if (!groups.length) return null

  return (
    <Box sx={sx.infoGroups}>
      {groups.map(group => (
        <Chip
          key={group.id}
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={iconUi({ id: 'info', size: 'xs' })}
          sx={sx.infoChip}
        >
          {group.label}: {group.sample?.players || 0} שחקנים ללא שיוך לניתוח
        </Chip>
      ))}
    </Box>
  )
}

export default function OutcomeBlock({
  model,
  separated = false,
  hideGroupIds = emptyArray,
  infoGroupIds = emptyArray,
}) {
  const allGroups = getGroups(model)
  const infoGroups = allGroups.filter(byIds(infoGroupIds))
  const groups = allGroups.filter(group => !hideGroupIds.includes(group.id))

  const [selectedId, setSelectedId] = React.useState(getFirstId(groups))

  React.useEffect(() => {
    setSelectedId(current => {
      const exists = groups.some(group => group.id === current)

      if (exists) return current

      return getFirstId(groups)
    })
  }, [groups])

  const selected = React.useMemo(() => {
    return getSelected({
      groups,
      selectedId,
    })
  }, [groups, selectedId])

  if (!model) return null

  const status = model.status || {}

  return (
    <Box sx={sx.block(separated)}>
      <Box sx={sx.blockHead}>
        <Box sx={sx.blockTitleWrap}>
          <Box sx={sx.blockIcon}>
            {iconUi({ id: model.icon || 'insights' })}
          </Box>

          <Box sx={sx.blockText}>
            <Typography level="title-sm" sx={sx.blockTitle}>
              {model.title}
            </Typography>
          </Box>
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

      <InfoGroups groups={infoGroups} />

      <Box sx={sx.blockBody}>
        <OutcomeCards
          groups={groups}
          selectedId={selected?.id}
          onSelect={setSelectedId}
        />

        <OutcomeDetails
          key={selected?.id}
          group={selected}
          sourceType={model.id}
        />
      </Box>
    </Box>
  )
}
