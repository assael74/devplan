// src/features/playersDatabase/components/scan/ScanProfileRow.js

import React from 'react'
import { Box, Button, Checkbox, Chip, Tooltip, Typography } from '@mui/joy'

import { ReportPrintButton } from '../../../../ui/patterns/reportPrint/index.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import ScanPlayersPrintReport from './print/ScanPlayersReport.js'
import ScanPlayerResultSelectable from './ScanPlayerResultSelectable.js'
import ScanProfileTooltip from './ScanProfileTooltip.js'
import { useScanPrintSelection } from './hooks/useScanPrintSelection.js'
import { SCAN_SCOPE_LABELS } from './logic/constants.js'
import { getProfileBreakdownRows, getScanStatusColor, getScanStatusLabel } from './logic/profiles.logic.js'
import { scanProfileSx as sx } from './sx/profile.sx.js'

function ProfileStats({ row }) {
  return (
    <Box sx={sx.stats}>
      <Chip size="sm" variant="soft" color={getScanStatusColor(row.status)}>{getScanStatusLabel(row.status)}</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.leaguesCount || 0} ליגות</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.loadedTeamsCount || 0} קבוצות נטענו</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.loadedPlayersCount || 0} שחקנים נטענו</Chip>
      <Chip size="sm" variant="soft" color="neutral">{row.scoutProfilesCount || 0} פרופילים</Chip>
      <Chip size="sm" variant="soft" color={row.riskCount ? 'warning' : 'neutral'}>{row.riskCount || 0} בסיכון</Chip>
    </Box>
  )
}

export default function ScanProfileRow({ row, selected, expanded, selectedProfileIds = [], result, onSelect, onToggle, onToggleProfile, onLoadDocuments, onEditLink, onRemoveProfile }) {
  const profileBreakdown = getProfileBreakdownRows(row.profileCounts)
  const resultRows = result?.rows || []
  const loadedProfileRows = profileBreakdown.filter(item => selectedProfileIds.includes(item.profileId))
  const print = useScanPrintSelection(row.id, resultRows)

  return (
    <Box sx={sx.card}>
      <Box className={selected ? 'isSelected' : ''} sx={sx.row} onClick={() => { onSelect(row.id); onToggle(row) }}>
        <Box sx={sx.identity}>
          <Typography level="body-xs" sx={sx.meta}>{SCAN_SCOPE_LABELS[row.scope] || row.scope}</Typography>
          <Typography level="title-md" sx={sx.title}>{row.title}</Typography>
          <Typography level="body-sm" sx={sx.meta}>{row.subtitle || '-'}</Typography>
        </Box>

        <Box sx={sx.rowActions}>
          <ProfileStats row={row} />
          <Button size="sm" variant="soft" color="primary" onClick={event => { event.stopPropagation(); onToggle(row) }}>{expanded ? 'סגור' : 'בחר פרופילים'}</Button>
        </Box>
      </Box>

      {expanded ? (
        <Box sx={sx.body}>
          <Box sx={sx.pickerHeader}>
            <Typography level="title-sm" sx={sx.title}>בחר פרופילים לטעינה</Typography>
            <Button size="sm" color="primary" loading={Boolean(result?.loading)} disabled={!selectedProfileIds.length} onClick={() => onLoadDocuments(row)}>טען מסמכי שחקנים</Button>
          </Box>

          <Box sx={sx.loadedDocuments}>
            <Typography level="body-sm" sx={sx.loadedLabel}>מסמכים טעונים</Typography>
            <Box sx={sx.loadedChips}>
              {loadedProfileRows.length ? loadedProfileRows.map(item => <Tooltip key={item.profileId} title={<ScanProfileTooltip profileId={item.profileId} />} variant="soft"><Chip size="sm" variant="soft" color="neutral">{item.label} ({item.count})</Chip></Tooltip>) : <Typography level="body-sm" sx={sx.meta}>עדיין לא נבחרו מסמכים לטעינה</Typography>}
            </Box>
          </Box>

          {profileBreakdown.length ? <Box sx={sx.picker}>{profileBreakdown.map(item => <Checkbox key={item.profileId} size="sm" label={`${item.label} (${item.count})`} checked={selectedProfileIds.includes(item.profileId)} onChange={() => onToggleProfile(row.id, item.profileId)} />)}</Box> : <Typography level="body-sm" sx={sx.meta}>אין פרופילים זמינים לבחירה לפי התקציר הנוכחי.</Typography>}
          {result?.error ? <Typography sx={sx.error}>{result.error}</Typography> : null}

          {resultRows.length ? (
            <Box sx={sx.results}>
              <Box sx={sx.printToolbar}>
                <Typography level="body-sm" sx={sx.meta}>נטענו {resultRows.length} התאמות מתוך {result?.teamsCount || 0} קבוצות</Typography>
                <Box sx={sx.printActions}>
                  {print.selectionMode ? (
                    <>
                      <Typography level="body-sm" sx={sx.printCount}>נבחרו {print.selectedRows.length} מתוך {resultRows.length}</Typography>
                      <Button size="sm" variant="soft" color="neutral" onClick={print.selectAll}>בחר הכל</Button>
                      <Button size="sm" variant="soft" color="neutral" onClick={print.clearSelection}>נקה בחירה</Button>
                      <Button size="sm" variant="soft" color="neutral" onClick={print.cancelSelection}>ביטול</Button>
                      <ReportPrintButton size="sm" variant="solid" color="primary" startIcon="print" label="צור PDF" tooltip="צור PDF מהשחקנים המסומנים" documentTitle="שחקנים-מסומנים" disabled={!print.selectedRows.length} renderContent={() => <ScanPlayersPrintReport row={row} resultRows={print.selectedRows} />} />
                    </>
                  ) : <Button size="sm" variant="soft" color="primary" startDecorator={iconUi({ id: 'print', size: 'small' })} onClick={print.startSelection}>הדפסה</Button>}
                </Box>
              </Box>

              {resultRows.map(player => <ScanPlayerResultSelectable key={`${player.searchDocId || player.id}-${player.profileId}-${player.teamSeasonKey}`} player={player} selected={Boolean(print.selectedIds[print.getRowKey(player)])} selectionMode={print.selectionMode} onToggleSelect={print.toggleSelection} onEditLink={playerRow => onEditLink?.(row, playerRow)} onRemoveProfile={(playerRow, profileId) => onRemoveProfile?.(row, playerRow, profileId)} />)}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}
