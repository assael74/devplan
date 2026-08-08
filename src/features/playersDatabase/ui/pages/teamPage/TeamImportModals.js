// features/playersDatabase/ui/pages/teamPage/TeamImportModals.js

import * as React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import PlayersDatabaseModal from '../../components/modals/PlayersDatabaseModal.js'
import DataImportPasteArea from '../../components/modals/dataImport/DataImportPasteArea.js'
import DataImportPreviewTable from '../../components/modals/dataImport/DataImportPreviewTable.js'
import {
  PLAYER_ROSTER_COLUMNS,
  PLAYER_ROSTER_PLACEHOLDER,
  PLAYER_STATS_PLACEHOLDER,
  STATS_SEASON_STATUS_OPTIONS,
} from './logic/teamPage.constants.js'
import { teamImportModalsSx as sx } from './sx/teamImportModals.sx.js'

function clean(value) {
  return String(value || '').trim()
}

function ExternalMetaLink({ href, children, missingLabel }) {
  const safeHref = clean(href)

  if (!safeHref) {
    return (
      <Typography
        component='span'
        level='body-sm'
        sx={sx.missingLink}
      >
        {missingLabel || 'לא הוגדר קישור למקור'}
      </Typography>
    )
  }

  return (
    <Tooltip title={safeHref} placement='top' arrow>
      <Typography
        component='a'
        href={safeHref}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        level='body-sm'
        dir='ltr'
        sx={sx.metaLink}
      >
        {children}
      </Typography>
    </Tooltip>
  )
}

export function TeamRosterImportModal({
  team,
  seasonKey,
  hasTeamPlayers,
  controller,
}) {
  return (
    <PlayersDatabaseModal
      open={controller.open}
      title={hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל'}
      description={`${team.name} · עונה ${seasonKey || '-'}`}
      iconId='upload'
      confirmLabel='אישור טעינת סגל'
      confirmIconId='upload'
      size='xl'
      busy={controller.busy}
      disabled={!controller.rows.length}
      contentSx={sx.modalContent}
      onConfirm={controller.confirm}
      onClose={controller.close}
    >
      <Box sx={sx.content}>
        <DataImportPasteArea
          pasteValue={controller.pasteValue}
          pastePlaceholder={PLAYER_ROSTER_PLACEHOLDER}
          onPasteChange={controller.setPasteValue}
          onPaste={controller.parse}
          onClear={controller.clearPaste}
        />

        <DataImportPreviewTable
          columns={PLAYER_ROSTER_COLUMNS}
          rows={controller.rows}
          onCellChange={controller.changeCell}
          getRowStatus={controller.getRowStatus}
        />
      </Box>
    </PlayersDatabaseModal>
  )
}

export function TeamStatsImportModal({
  team,
  seasonKey,
  hasTeamPlayers,
  columns,
  source,
  controller,
}) {
  const resolvedTeamUrl = clean(source.teamUrl || team.teamUrl)
  const resolvedLeagueName = clean(source.leagueName || team.leagueName)
  const resolvedLeagueUrl = clean(source.leagueUrl)

  return (
    <PlayersDatabaseModal
      open={controller.open}
      title={`טעינת סטטיסטיקות - ${team.name}`}
      description={(
        <Box sx={sx.description}>
          <ExternalMetaLink
            href={resolvedTeamUrl}
            missingLabel='לא הוגדר קישור לקבוצה'
          >
            {team.name || 'קבוצה'}
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

          <>
            <Typography component='span' level='body-sm'>·</Typography>
            <ExternalMetaLink
              href={resolvedLeagueUrl}
              missingLabel='לא הוגדר קישור לליגה'
            >
              {resolvedLeagueName || 'ליגה'}
            </ExternalMetaLink>
          </>
        </Box>
      )}
      iconId='addStats'
      confirmLabel='אישור טעינת סטטיסטיקות'
      confirmIconId='upload'
      size='xl'
      busy={controller.busy}
      disabled={
        !hasTeamPlayers ||
        !controller.rows.length ||
        controller.hasInvalidRows
      }
      contentSx={sx.modalContent}
      onConfirm={controller.confirm}
      onClose={controller.close}
    >
      <Box sx={[sx.content, sx.statsContent]}>
        <FormControl size='sm' sx={sx.seasonStatus}>
          <FormLabel>סוג טעינת הסטטיסטיקה</FormLabel>
          <Select
            value={controller.seasonStatus}
            onChange={(event, value) => controller.changeSeasonStatus(value)}
          >
            {STATS_SEASON_STATUS_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <FormHelperText>
            {STATS_SEASON_STATUS_OPTIONS.find(option => (
              option.value === controller.seasonStatus
            ))?.description || ''}
          </FormHelperText>
        </FormControl>

        <DataImportPasteArea
          pasteValue={controller.pasteValue}
          pastePlaceholder={PLAYER_STATS_PLACEHOLDER}
          onPasteChange={controller.setPasteValue}
          onPaste={controller.parse}
          onClear={controller.clearPaste}
        />

        <DataImportPreviewTable
          columns={columns}
          rows={controller.rows}
          onCellChange={controller.changeCell}
          getRowStatus={controller.getRowStatus}
        />
      </Box>
    </PlayersDatabaseModal>
  )
}
