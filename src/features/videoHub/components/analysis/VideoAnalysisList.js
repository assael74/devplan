// C:\projects\devplan\src\features\videoHub\components\analysis\VideoAnalysisList.js
import React, { useMemo } from 'react'
import { Box } from '@mui/joy'
import VideoAnalysisCard from '../../../../ui/domains/video/videoAnalysis/VideoAnalysisCard'
import StickySectionsByMonth from '../../../../ui/patterns/stickySections/StickySectionsByMonth.js'

export const getMonthKey = (v) => {
  const y = String(v?.year || '').padStart(4, '0')
  const m = String(v?.month || '').padStart(2, '0')
  if (y && m && y !== '0000' && m !== '00') return `${y}-${m}`
  const d = v?.date || v?.videoDate || v?.createdAt
  if (!d) return 'unknown'
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return 'unknown'
  const yy = String(dt.getFullYear())
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

export const getMonthLabel = (key) => {
  const [yy, mm] = String(key || '').split('-')
  const y = Number(yy)
  const m = Number(mm)
  if (!y || !m) return key || 'לא ידוע'
  const d = new Date(y, m - 1, 1)
  return `${String(m).padStart(2,'0')}/${y}`
}

export default function VideoAnalysisList({
  items,
  context,
  onShare,
  onWatch,
  onEdit,
  onLink,
}) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items])

  return (
    <Box sx={{ width: '100%', minHeight: 0 }}>
      <StickySectionsByMonth
        items={list}
        getMonthKey={getMonthKey}
        getMonthLabel={getMonthLabel}
        headerTop={0}
        gridSx={{
          display: 'grid',
          gap: 1,
          width: '100%',
          maxWidth: 1600,
          mx: 'auto',
          alignContent: 'start',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
        renderItem={(video) => (
          <VideoAnalysisCard
            key={video.id}
            video={video}
            preset="videoHub"
            from="videoHub"
            onShare={onShare}
            onWatch={onWatch}
            onEdit={onEdit}
            onLink={onLink}
            context={context}
          />
        )}
      />
    </Box>
  )
}
