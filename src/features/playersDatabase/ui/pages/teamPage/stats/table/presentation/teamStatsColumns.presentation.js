import * as React from 'react'
import {
  Autocomplete, Box, Button, Chip, Dropdown, IconButton, Menu, MenuButton, Option, Select, Stack, Tooltip, Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { buildScoutCompactView } from '../../../../../components/scout/shared/scoutDisplay.model.js'
import { STATS_IDENTITY_STATUS } from '../../shared/logic/teamStatsMatch.logic.js'
import { teamStatsColumnsSx as sx } from '../sx/useTeamStatsColumns.sx.js'

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

export const ROSTER_STATUS_SHORT_LABELS = {
  regular: 'בסגל',
  joined: 'הצטרף',
  left: 'עזב',
  youngerAgeGroup: 'צעיר',
}

export function StatsRosterStatusControl({
  row,
  rowIndex,
  column,
  onCellChange,
  options,
  teamRootOptions = [],
}) {
  const movementDecision = ['left', 'joined'].includes(row.statsMovementDecision)
    ? row.statsMovementDecision
    : ''
  const needsManualClassification = Boolean(row.requiresStatsMovementDecision) && !movementDecision
  const selectedStatus = !needsManualClassification && (movementDecision || options.some(option => option.value === row.rosterStatus))
    ? movementDecision || row.rosterStatus
    : null
  const [selectedClub, setSelectedClub] = React.useState(null)
  const resolvedClub = selectedClub || (row.statsMovementTeam
    ? teamRootOptions.find(option => option.clubId === row.statsMovementTeam.clubId) || null
    : null)
  const availableTeams = Array.isArray(resolvedClub?.availableTeams)
    ? resolvedClub.availableTeams
    : []

  const setStatus = value => {
    if (typeof onCellChange !== 'function') return

    setSelectedClub(null)

    if (value === 'youngerAgeGroup' && row.requiresStatsMovementDecision) {
      onCellChange({
        row,
        rowIndex,
        column: { ...column, key: 'statsMovementDecision' },
        value: { decision: value, team: null },
      })
      return
    }

    onCellChange({
      row,
      rowIndex,
      column,
      value: value || 'unresolved',
    })
  }

  const selectMovementTeam = movementTeam => {
    if (!movementDecision || !movementTeam?.birthTeamDocumentId) return

    onCellChange?.({
      row,
      rowIndex,
      column: { ...column, key: 'statsMovementDecision' },
      value: { decision: movementDecision, team: movementTeam },
    })
  }

  const selectClub = club => {
    setSelectedClub(club || null)
    const defaultTeam = (Array.isArray(club?.availableTeams) ? club.availableTeams : [])
      .find(team => Number(team.birthTeamSlot) === 1) || null

    if (defaultTeam) selectMovementTeam(defaultTeam)
  }

  return (
    <Stack direction='row' spacing={0.45} sx={sx.statusMovementControls}>
      <Select
        size='sm'
        indicator={null}
        value={selectedStatus}
        placeholder={needsManualClassification ? 'לא מזוהה' : 'סטטוס'}
        sx={sx.statusSelect}
        onChange={(event, nextValue) => setStatus(nextValue)}
      >
        {options.map(option => (
          <Option key={option.value} value={option.value}>
            {ROSTER_STATUS_SHORT_LABELS[option.value] || option.label}
          </Option>
        ))}
      </Select>
      {movementDecision ? (
        <>
          <Autocomplete
            size='sm'
            options={teamRootOptions}
            value={resolvedClub}
            forcePopupIcon={false}
            slotProps={{
              clearIndicator: {
                sx: {
                  width: 18,
                  height: 18,
                  '--Icon-fontSize': '14px',
                },
              },
              listbox: {
                className: 'dpScrollThin',
                sx: {
                  fontSize: '0.72rem',
                  '--ListItem-minHeight': '26px',
                  py: 0.25,
                },
              },
            }}
            getOptionLabel={option => option?.label || option?.clubName || option?.displayName || ''}
            isOptionEqualToValue={(option, value) => option?.clubId === value?.clubId}
            onChange={(event, value) => selectClub(value)}
            placeholder={movementDecision === 'left' ? 'יעד' : 'מקור'}
            sx={sx.statusMovementTeamSelect}
          />
          <Select
            size='sm'
            indicator={null}
            value={row.statsMovementTeam?.birthTeamDocumentId || null}
            placeholder='1'
            disabled={!availableTeams.length}
            sx={sx.statusMovementSlotSelect}
            onChange={(event, teamId) => {
              const team = availableTeams.find(item => item.birthTeamDocumentId === teamId)
              if (team) selectMovementTeam(team)
            }}
          >
            {availableTeams.map(team => (
              <Option key={team.birthTeamDocumentId} value={team.birthTeamDocumentId}>
                {team.birthTeamSlot}
              </Option>
            ))}
          </Select>
        </>
      ) : null}
    </Stack>
  )
}

export function NameMatchPopover({
  value,
  selectedValue,
  message,
  options,
  playerUrl,
  allowCreateNew = false,
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
          {allowCreateNew ? (
            <Button
              size='sm'
              variant='soft'
              color='warning'
              onClick={() => { onChange('__createNew'); setOpen(false) }}
            >
              אשר כשחקן חדש
            </Button>
          ) : null}
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
  teamRootOptions = [],
}) {
  const [open, setOpen] = React.useState(false)
  const candidates = Array.isArray(row.identityCandidates) ? row.identityCandidates : []
  const systemCandidate = candidates[0] || null
  const originalFullName = row.originalFullName || row.fullName || '-'
  const [movementDecision, setMovementDecision] = React.useState(row.statsMovementDecision || '')
  const [movementTeam, setMovementTeam] = React.useState(null)

  React.useEffect(() => {
    if (!open || mode !== 'statsMovement') return

    setMovementDecision(row.statsMovementDecision || '')
    setMovementTeam(null)
  }, [mode, open, row.statsMovementDecision])
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
  const approveMovementDecision = () => {
    const requiresTeam = ['joined', 'left'].includes(movementDecision)
    if (!movementDecision || (requiresTeam && !movementTeam?.birthTeamDocumentId)) return

    onCellChange?.({
      row,
      rowIndex,
      column: { ...column, key: 'statsMovementDecision' },
      value: { decision: movementDecision, team: movementTeam },
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
          {mode === 'statsMovement' ? (
            <>
              <Typography level='body-xs'>השחקן מופיע בסטטיסטיקה אך לא בסגל המקורי של העונה.</Typography>
              <Select
                size='sm'
                value={movementDecision || null}
                placeholder='בחר סיווג'
                onChange={(event, value) => { setMovementDecision(value || ''); setMovementTeam(null) }}
              >
                <Option value='left'>עזב במהלך העונה</Option>
                <Option value='joined'>הצטרף במהלך העונה</Option>
                <Option value='youngerAgeGroup'>שנתון צעיר</Option>
              </Select>
              {['left', 'joined'].includes(movementDecision) ? (
                <Autocomplete
                  size='sm'
                  options={teamRootOptions}
                  value={movementTeam}
                  getOptionLabel={option => option
                    ? `${option.displayName || option.birthTeamId} · ${option.birthYear || '-'} · קבוצה ${option.birthTeamSlot || 1}`
                    : ''}
                  isOptionEqualToValue={(option, value) => option?.birthTeamDocumentId === value?.birthTeamDocumentId}
                  onChange={(event, value) => setMovementTeam(value || null)}
                  placeholder={movementDecision === 'left' ? 'בחר קבוצת יעד' : 'בחר קבוצת מקור'}
                />
              ) : null}
              <Button
                size='sm'
                disabled={!movementDecision || (['left', 'joined'].includes(movementDecision) && !movementTeam?.birthTeamDocumentId)}
                onClick={approveMovementDecision}
              >
                אשר סיווג
              </Button>
              <Button size='sm' variant='plain' color='neutral' onClick={() => setOpen(false)}>
                סגור
              </Button>
            </>
          ) : null}
        </Stack>
      </Menu>
    </Dropdown>
  )
}
