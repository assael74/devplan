// src/features/playersDatabase/ui/pages/playerPage/PlayerHistorySection.js

import { Box } from '@mui/joy'

import PageContentPanel from '../../components/page/PageContentPanel.js'
import PlayerHistoryTable from './PlayerHistoryTable.js'
import { playerHistorySectionSx as sx } from './sx/playerHistorySection.sx.js'

export default function PlayerHistorySection({ rows, hasRealData, onRowOpen }) {
  return (
    <PageContentPanel
      title='היסטוריית ביצועים'
      subtitle='סטטיסטיקה ופרופילי סקאוט לפי עונה וקבוצה'
      meta={`${rows.length} הקשרים`}
    >
      {!hasRealData ? (
        <Box sx={sx.placeholderBanner}>
          מוצגים נתוני placeholder עד לחיבור מסמכי העונות.
        </Box>
      ) : null}

      <PlayerHistoryTable
        rows={rows}
        onRowOpen={onRowOpen}
      />
    </PageContentPanel>
  )
}
