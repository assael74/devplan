// features/playersDatabase/ui/pages/playerPage/PlayerHistorySection.js

import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

import PlayerActionsPanel from './PlayerActionsPanel.js'
import PlayerHistoryTable from './PlayerHistoryTable.js'
import { playerContentSx as sx } from './sx/playerContent.sx.js'

export default function PlayerHistorySection({
  rows,
  selectedSeasonKey,
  seasonOptions,
  filter,
  hasRealData,
  onSeasonChange,
  onFilterChange,
  onRowOpen,
  onAction,
}) {
  return (
    <Box sx={sx.contentGrid}>
      <Card sx={sx.historyPanel}>
        <Box sx={sx.historyHeader}>
          <Box>
            <Typography
              level='title-lg'
              sx={sx.panelTitle}
            >
              היסטוריית ביצועים
            </Typography>

            <Typography
              level='body-xs'
              sx={sx.panelSubtitle}
            >
              סטטיסטיקה ופרופילי סקאוט לפי עונה וקבוצה
            </Typography>
          </Box>

          <Typography
            level='body-sm'
            sx={sx.rowsCount}
          >
            {rows.length} הקשרים
          </Typography>
        </Box>

        {!hasRealData ? (
          <Box sx={sx.placeholderBanner}>
            מוצגים נתוני placeholder עד לחיבור מסמכי העונות.
          </Box>
        ) : null}

        <PlayerHistoryTable
          rows={rows}
          onRowOpen={onRowOpen}
        />
      </Card>

      <PlayerActionsPanel
        selectedSeasonKey={selectedSeasonKey}
        seasonOptions={seasonOptions}
        filter={filter}
        onSeasonChange={onSeasonChange}
        onFilterChange={onFilterChange}
        onAction={onAction}
      />
    </Box>
  )
}
