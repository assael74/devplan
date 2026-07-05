// features/playersDatabase/components/profilesPage/list/ProfileRow.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { ReportPrintButton } from '../../../../../ui/patterns/reportPrint/index.js'
import { PROFILE_SCOPE_LABELS } from '../logic/constants.js'
import { getProfileStatusColor, getProfileStatusLabel } from '../logic/profiles.logic.js'
import { usePrintSelection } from './hooks/usePrintSelection.js'
import PlayerResultSelectable from './PlayerResultSelectable.js'
import ProfilesPlayersReport from './print/ProfilesPlayersReport.js'
import { profileSx as sx } from './sx/profile.sx.js'

function ProfileStats({ row }) {
  return (
    <Box sx={sx.stats}>
      <Chip size="sm" variant="soft" color={getProfileStatusColor(row.status)}>
        {getProfileStatusLabel(row.status)}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.leaguesCount || 0} ליגות
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.loadedTeamsCount || 0} קבוצות נטענו
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.loadedPlayersCount || 0} שחקנים נטענו
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.scoutProfilesCount || 0} פרופילים
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={row.riskCount ? 'warning' : 'neutral'}
      >
        {row.riskCount || 0} בסיכון
      </Chip>
    </Box>
  )
}

export default function ProfileRow({
  row,
  selected,
  result,
  removingProfileId,
  onSelect,
  onEditLink,
  onRemoveProfile,
  onClearDocumentsSelection,
}) {
  const resultRows = result?.rows || []
  const print = usePrintSelection(row.id, resultRows)

  const handleRowClick = () => {
    onSelect(row.id)
  }

  return (
    <Box sx={sx.card}>
      <Box
        className={selected ? 'isSelected' : ''}
        sx={sx.row}
        onClick={handleRowClick}
      >
        <Box sx={sx.identity}>
          <Typography level="body-xs" sx={sx.meta}>
            {PROFILE_SCOPE_LABELS[row.scope] || row.scope}
          </Typography>

          <Typography level="title-md" sx={sx.title}>
            {row.title}
          </Typography>

          <Typography level="body-sm" sx={sx.meta}>
            {row.subtitle || '-'}
          </Typography>
        </Box>

        <Box sx={sx.rowActions}>
          <ProfileStats row={row} />
        </Box>
      </Box>

      {result?.error ? (
        <Box sx={sx.body}>
          <Typography sx={sx.error}>{result.error}</Typography>
        </Box>
      ) : null}

      {resultRows.length ? (
        <Box sx={sx.body}>
          <Box sx={sx.printToolbar}>
            <Typography level="body-sm" sx={sx.meta}>
              נטענו {resultRows.length} התאמות מתוך {result?.teamsCount || 0} קבוצות
            </Typography>

            <Box sx={sx.printActions}>
              {print.selectionMode ? (
                <>
                  <Typography level="body-sm" sx={sx.printCount}>
                    נבחרו {print.selectedRows.length} מתוך {resultRows.length}
                  </Typography>

                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    onClick={print.selectAll}
                  >
                    בחר הכל
                  </Button>

                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    onClick={() => {
                      print.clearSelection()
                      onClearDocumentsSelection?.(row.id)
                    }}
                  >
                    נקה בחירה
                  </Button>

                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    onClick={print.cancelSelection}
                  >
                    ביטול
                  </Button>

                  <ReportPrintButton
                    size="sm"
                    variant="solid"
                    color="primary"
                    startIcon="print"
                    label="צור PDF"
                    tooltip="צור PDF מהשחקנים המסומנים"
                    documentTitle="שחקנים-מסומנים"
                    disabled={!print.selectedRows.length}
                    renderContent={() => (
                      <ProfilesPlayersReport
                        row={row}
                        resultRows={print.selectedRows}
                      />
                    )}
                  />
                </>
              ) : (
                <Button
                  size="sm"
                  variant="soft"
                  color="primary"
                  startDecorator={iconUi({ id: 'print', size: 'small' })}
                  onClick={print.startSelection}
                >
                  הדפסה
                </Button>
              )}
            </Box>
          </Box>

          {resultRows.map(player => (
            <PlayerResultSelectable
              key={`${player.searchDocId || player.id}-${player.profileId}-${player.teamSeasonKey}`}
              player={player}
              result={result}
              removingProfileId={removingProfileId}
              selected={Boolean(print.selectedIds[print.getRowKey(player)])}
              selectionMode={print.selectionMode}
              onToggleSelect={print.toggleSelection}
              onEditLink={playerRow => onEditLink(row, playerRow)}
              onRemoveProfile={(playerRow, profileId) =>
                onRemoveProfile(row, playerRow, profileId)
              }
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
