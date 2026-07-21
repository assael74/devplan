// features/playersDatabase/ui/pages/teamPage/TeamImportModals.js

import * as React from 'react'

import DataImportModal from '../../components/modals/DataImportModal.js'
import {
  PLAYER_ROSTER_COLUMNS,
  PLAYER_ROSTER_PLACEHOLDER,
  PLAYER_STATS_PLACEHOLDER,
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
  seasonKey,
  hasTeamPlayers,
  columns,
  rows,
  pasteValue,
  busy,
  hasInvalidRows,
  onPasteChange,
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
      description={[
        team.ageGroupLabel || team.ageGroupId,
        team.birthYear ? `שנתון ${team.birthYear}` : '',
        seasonKey ? `עונה ${seasonKey}` : '',
      ].filter(Boolean).join(' · ')}
      iconId='addStats'
      confirmLabel='אישור טעינת סטטיסטיקות'
      columns={columns}
      rows={rows}
      pasteValue={pasteValue}
      pastePlaceholder={PLAYER_STATS_PLACEHOLDER}
      busy={busy}
      disabled={!hasTeamPlayers || !rows.length || hasInvalidRows}
      onPasteChange={onPasteChange}
      onPaste={onPaste}
      onCellChange={onCellChange}
      getRowStatus={getRowStatus}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
