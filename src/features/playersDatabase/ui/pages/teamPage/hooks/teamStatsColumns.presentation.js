import * as React from 'react'
import {
  Box, Button, Chip, Dropdown, IconButton, Menu, MenuButton, Option, Select, Stack, Tooltip, Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { buildScoutCompactView } from '../../../components/scout/shared/scoutDisplay.model.js'
import { STATS_IDENTITY_STATUS } from '../logic/teamStatsMatch.logic.js'
import { teamStatsColumnsSx as sx } from './useTeamStatsColumns.sx.js'

export function getIdentityColor(status) {
  const colors = {
    [STATS_IDENTITY_STATUS.ROSTER_MATCH]: 'success',
    [STATS_IDENTITY_STATUS.SYSTEM_MATCH]: 'primary',
    [STATS_IDENTITY_STATUS.SYSTEM_CANDIDATE]: 'warning',
    [STATS_IDENTITY_STATUS.NEW_PLAYER]: 'neutral',
    [STATS_IDENTITY_STATUS.AMBIGUOUS]: 'warning',
    [STATS_IDENTITY_STATUS.UNRESOLVED]: 'danger',
  }

  return colors[status] || 'neutral'
}

export const resolvePlayerUrl = value => {
  const playerUrl = String(value || '').trim()

  if (!playerUrl) return ''
  if (/^https?:\/\//i.test(playerUrl)) return playerUrl

  const path = playerUrl.startsWith('/')
    ? playerUrl
    : `/${playerUrl}`

  return `https://www.football.org.il${path}`
}

export const TRANSFER_DIRECTIONS = ['unknown', 'up', 'lateral', 'down']

export const getNextTransferDirection = value => {
  const currentIndex = TRANSFER_DIRECTIONS.indexOf(value)
  return TRANSFER_DIRECTIONS[(currentIndex + 1) % TRANSFER_DIRECTIONS.length]
}

export const getTransferDirectionIcon = value => ({
  up: 'sortUp',
  lateral: 'swapVert',
  down: 'sortDown',
}[value] || 'swapVert')

export const getTransferDirectionColor = value => ({
  up: 'success',
  lateral: 'primary',
  down: 'danger',
}[value] || 'neutral')

export const TableHeaderIcon = ({ id, label }) => (
  <Tooltip title={label}>
    <Box
      component='span'
      aria-label={label}
      sx={sx.tableHeaderIcon}
    >
      {iconUi({ id, size: 'sm' })}
    </Box>
  </Tooltip>
)

export const getMinutesCorrectionImpactLabel = row => {
  const impact = row?.statsMinutesCorrection
  if (!impact) return ''

  const added = Array.isArray(impact.addedProfiles) ? impact.addedProfiles : []
  const removed = Array.isArray(impact.removedProfiles) ? impact.removedProfiles : []
  const addedLabel = added.length ? `נוספו: ${added.map(item => item.label).join(', ')}` : ''
  const removedLabel = removed.length ? `הוסרו: ${removed.map(item => item.label).join(', ')}` : ''

  if (!addedLabel && !removedLabel) {
    return `תיקון דקות: -${impact.amount} · ללא שינוי בפרופיל`
  }

  return [
    `תיקון דקות: -${impact.amount}`,
    addedLabel,
    removedLabel,
  ].filter(Boolean).join(' · ')
}

export const getTransferDirectionLabel = value => ({
  unknown: 'כיוון מעבר: לא ידוע',
  up: 'כיוון מעבר: התקדם לרמה גבוהה יותר',
  lateral: 'כיוון מעבר: אותה רמה',
  down: 'כיוון מעבר: ירד רמה',
}[value] || 'כיוון מעבר: לא ידוע')

export const renderMarkedNumber = ({ value, mark }) => {
  if (!mark) {
    return (
      <Typography level='body-sm'>
        {value || value === 0 ? value : '-'}
      </Typography>
    )
  }

  return (
    <Tooltip title={mark.text}>
      <Chip
        size='sm'
        color={mark.color || 'success'}
        variant={mark.variant || 'soft'}
        sx={sx.markedNumber}
      >
        {value || value === 0 ? value : '-'}
      </Chip>
    </Tooltip>
  )
}

export const PlayerUrlIcon = ({ playerUrl }) => {
  const href = resolvePlayerUrl(playerUrl)

  if (!href) return null

  return (
    <Tooltip title={href}>
      <IconButton
        component='a'
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        size='sm'
        variant='plain'
        color='primary'
        sx={sx.playerUrlIcon}
        onClick={event => event.stopPropagation()}
      >
        {iconUi({
          id: 'link',
          size: 'sm',
        })}
      </IconButton>
    </Tooltip>
  )
}

export const resolveScoutProfileSortLabel = row => {
  const profiles = [
    ...(Array.isArray(row.scoutProfiles) ? row.scoutProfiles : []),
    ...(Array.isArray(row.scoutSignals) ? row.scoutSignals : []),
  ]
  const scoutView = buildScoutCompactView({
    profiles,
    combinations: Array.isArray(row.scoutCombinations)
      ? row.scoutCombinations
      : [],
    display: row.scoutProfileDisplay || {},
    player: row,
  })

  return scoutView.label || ''
}

export const isTransferRosterStatus = status => (
  status === 'transferredOut' ||
  status === 'transferredIn'
)

export const ROSTER_STATUS_SHORT_LABELS = {
  regular: 'בסגל',
  transferredOut: 'עזב',
  transferredIn: 'הצטרף',
  retired: 'פרש',
  youngerAgeGroup: 'צעיר',
}

export function NameMatchPopover({
  value,
  selectedValue,
  message,
  options,
  playerUrl,
  onChange,
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Box sx={sx.matchRow}>
      <Dropdown open={open} onOpenChange={(event, nextOpen) => setOpen(nextOpen)}>
        <Tooltip title={message}>
          <MenuButton size='sm' color='neutral' variant='plain' sx={sx.invalidNameButton}>
            {value || 'בחר שחקן'}
          </MenuButton>
        </Tooltip>
        <Menu size='sm' variant='outlined' placement='bottom-start'>
        <Stack sx={sx.nameMatchPopover} spacing={0.65}>
          <Typography level='body-xs'>{message}</Typography>
          <Select size='sm' value={selectedValue || null} placeholder='בחר שחקן מהסגל' onChange={(event, nextValue) => { onChange(nextValue || ''); setOpen(false) }}>
            {options.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
          </Select>
        </Stack>
        </Menu>
      </Dropdown>
      <PlayerUrlIcon playerUrl={playerUrl} />
    </Box>
  )
}

export function IdentityResolutionPopover({
  row,
  rowIndex,
  column,
  onCellChange,
  mode,
  label,
}) {
  const [open, setOpen] = React.useState(false)
  const candidates = Array.isArray(row.identityCandidates) ? row.identityCandidates : []
  const systemCandidate = candidates[0] || null
  const originalFullName = row.originalFullName || row.fullName || '-'
  const approveCandidate = candidate => {
    if (!candidate?.playerId || typeof onCellChange !== 'function') return

    onCellChange({
      row,
      rowIndex,
      column: { ...column, key: 'systemCandidateApproval' },
      value: candidate.candidateKey || candidate.playerId,
    })
    setOpen(false)
  }

  return (
    <Dropdown open={open} onOpenChange={(event, nextOpen) => setOpen(nextOpen)}>
      <MenuButton
        size='sm'
        variant='soft'
        color='warning'
        sx={sx.identityResolutionButton}
      >
        {label}
      </MenuButton>
      <Menu size='sm' variant='outlined' placement='bottom-start'>
        <Stack sx={sx.identityResolutionPopover} spacing={0.7}>
          <Typography level='body-xs' sx={sx.identityResolutionName}>
            {originalFullName}
          </Typography>
          {mode === 'systemCandidate' ? (
            <>
              <Typography level='body-xs'>
                {systemCandidate?.displayName || systemCandidate?.fullName || systemCandidate?.playerDocumentId || 'לא נמצאה התאמה מאושרת'}
              </Typography>
              {systemCandidate?.playerId ? (
                <Button size='sm' onClick={() => approveCandidate(systemCandidate)}>
                  אשר התאמה
                </Button>
              ) : (
                <Typography level='body-xs' color='warning'>
                  קיים במערכת אך חסר קישור זהות קנוני
                </Typography>
              )}
            </>
          ) : null}
          {mode === 'ambiguous' ? (
            <Select
              size='sm'
              value={null}
              placeholder='בחר התאמה קיימת'
              onChange={(event, candidateKey) => {
                const candidate = candidates.find(item => item.candidateKey === candidateKey)
                if (candidate) approveCandidate(candidate)
              }}
            >
              {candidates.map(candidate => (
                <Option
                  key={candidate.candidateKey || candidate.playerId || candidate.playerDocumentId}
                  value={candidate.candidateKey}
                  disabled={!candidate.playerId}
                >
                  {candidate.displayName || candidate.fullName || candidate.playerDocumentId || candidate.playerId}
                </Option>
              ))}
            </Select>
          ) : null}
        </Stack>
      </Menu>
    </Dropdown>
  )
}
