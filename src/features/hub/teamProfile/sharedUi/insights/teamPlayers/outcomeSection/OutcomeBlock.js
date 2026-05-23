// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/OutcomeBlock.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import OutcomeCards from './OutcomeCards.js'
import OutcomeDetails from './OutcomeDetails.js'
import OutcomePositionLayers from './OutcomePositionLayers.js'

import {
  byGroupIds,
  getFirstGroupId,
  getInfoGroups,
  getOutcomeGroups,
  getSelectedGroup,
  getVisibleGroups,
} from './ui/index.js'

import { blockSx as sx } from './sx/index.js'

const emptyArray = []

const InfoGroups = ({ groups = emptyArray, }) => {
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

const SummaryLine = ({ summary, }) => {
  if (!summary) return null

  return (
    <Typography level="body-xs" sx={sx.blockSub}>
      {summary.checkedGroups}/{summary.groups} מקבצים עם מדגם · {summary.alertGroups} לבדיקה
    </Typography>
  )
}

const BlockHead = ({ model, }) => {
  const status = model.status || {}

  return (
    <Box sx={sx.blockHead}>
      <Box sx={sx.blockTitleWrap}>
        <Box sx={sx.blockIcon}>
          {iconUi({ id: model.icon || 'insights' })}
        </Box>

        <Box sx={sx.blockText}>
          <Typography level="title-sm" sx={sx.blockTitle}>
            {model.title}
          </Typography>

          <SummaryLine summary={model.summary} />
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
  )
}

const RoleOutcome = ({ model, groups }) => {
  const [selectedId, setSelectedId] = React.useState(getFirstGroupId(groups))

  React.useEffect(() => {
    setSelectedId(current => {
      const exists = groups.some(group => group.id === current)

      if (exists) return current

      return getFirstGroupId(groups)
    })
  }, [groups])

  const selected = React.useMemo(() => {
    return getSelectedGroup({
      groups,
      selectedId,
    })
  }, [groups, selectedId])

  return (
    <>
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
    </>
  )
}

export default function OutcomeBlock({
  model,
  separated = false,
  loading,
  hideGroupIds = emptyArray,
  infoGroupIds = emptyArray,
}) {
  if (!model) return null

  const allGroups = getOutcomeGroups(model)

  const infoGroups = getInfoGroups({
    groups: allGroups,
    infoGroupIds,
  })

  const groups = getVisibleGroups({
    groups: allGroups,
    hideGroupIds,
  })

  return (
    <Box sx={sx.block(separated)}>
      <BlockHead model={model} />

      <InfoGroups groups={infoGroups} />

      <Box sx={sx.blockBody}>
        {model.id === 'position' ? (
          <OutcomePositionLayers model={model} loading={loading} />
        ) : (
          <RoleOutcome
            model={model}
            groups={groups}
          />
        )}
      </Box>
    </Box>
  )
}
