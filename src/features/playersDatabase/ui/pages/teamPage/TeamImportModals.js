// features/playersDatabase/ui/pages/teamPage/TeamImportModals.js

import * as React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import DataImportModal from '../../components/modals/DataImportModal.js'

const clean = value => String(value || '').trim()

function ExternalMetaLink({ href, children }) {
  const safeHref = clean(href)

  if (!safeHref) {
    return (
      <Typography component='span' level='body-sm'>
        {children}
      </Typography>
    )
  }

  return (
    <Typography
      component='a'
      href={safeHref}
      target='_blank'
      rel='noopener noreferrer'
      referrerPolicy='no-referrer'
      level='body-sm'
      sx={{
        color: 'primary.700',
        fontWeight: 600,
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
      }}
    >
      {children}
    </Typography>
  )
}

import {
  PLAYER_ROSTER_COLUMNS,
  PLAYER_ROSTER_PLACEHOLDER,
  PLAYER_STATS_PLACEHOLDER,
  STATS_SEASON_STATUS_OPTIONS,
} from './logic/teamPage.constants.js'

export function TeamRosterImportModal({
  open,
  hasTeamPlayers,
  teamName,
  seasonKey,
  columns = PLAYER_ROSTER_COLUMNS,
  rows,
  pasteValue,
  busy,
  onPasteChange,
  onPaste,
  onCellChange,
  onConfirm,
  onClose,
}) {
  return (
    <DataImportModal
      open={open}
      title={hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל'}
      description={`${teamName} · עונה ${seasonKey || '-'}`}
      iconId='upload'
      confirmLabel='אישור טעינת סגל'
      columns={columns}
      rows={rows}
      pasteValue={pasteValue}
      pastePlaceholder={PLAYER_ROSTER_PLACEHOLDER}
      busy={busy}
      disabled={!rows.length}
      onPasteChange={onPasteChange}
      onPaste={onPaste}
      onCellChange={onCellChange}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}

export function TeamStatsImportModal({
  open,
  team,
  teamUrl,
  leagueName,
  leagueUrl,
  seasonKey,
  hasTeamPlayers,
  columns,
  rows,
  pasteValue,
  busy,
  hasInvalidRows,
  seasonStatus,
  onSeasonStatusChange,
  onPasteChange,
  onClear,
  onPaste,
  onCellChange,
  getRowStatus,
  onConfirm,
  onClose,
}) {
  return (
    <DataImportModal
      open={open}
      title={`טעינת סטטיסטיקות - ${team.name}`}
      description={(
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
          <ExternalMetaLink href={teamUrl}>
            {team.name}
          </ExternalMetaLink>

          <Typography component='span' level='body-sm'>·</Typography>

          <Typography component='span' level='body-sm'>
            {team.ageGroupLabel || team.ageGroupId || '-'}
          </Typography>

          {team.birthYear ? (
            <>
              <Typography component='span' level='body-sm'>·</Typography>
              <Typography component='span' level='body-sm'>
                שנתון {team.birthYear}
              </Typography>
            </>
          ) : null}

          {seasonKey ? (
            <>
              <Typography component='span' level='body-sm'>·</Typography>
              <Typography component='span' level='body-sm'>
                עונה {seasonKey}
              </Typography>
            </>
          ) : null}

          {leagueName ? (
            <>
              <Typography component='span' level='body-sm'>·</Typography>
              <ExternalMetaLink href={leagueUrl}>
                {leagueName}
              </ExternalMetaLink>
            </>
          ) : null}
        </Box>
      )}
      iconId='addStats'
      confirmLabel='אישור טעינת סטטיסטיקות'
      columns={columns}
      rows={rows}
      pasteValue={pasteValue}
      pastePlaceholder={PLAYER_STATS_PLACEHOLDER}
      beforePaste={(
        <FormControl size='sm' sx={{ maxWidth: 320 }}>
          <FormLabel>סוג טעינת הסטטיסטיקה</FormLabel>
          <Select
            value={seasonStatus}
            onChange={(event, value) => onSeasonStatusChange(value)}
          >
            {STATS_SEASON_STATUS_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <FormHelperText>
            {STATS_SEASON_STATUS_OPTIONS.find(option => (
              option.value === seasonStatus
            ))?.description || ''}
          </FormHelperText>
        </FormControl>
      )}
      busy={busy}
      disabled={!hasTeamPlayers || !rows.length || hasInvalidRows}
      onPasteChange={onPasteChange}
      onPaste={onPaste}
      onClear={onClear}
      onCellChange={onCellChange}
      getRowStatus={getRowStatus}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
