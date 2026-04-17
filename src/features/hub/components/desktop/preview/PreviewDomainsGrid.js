// features/hub/components/desktop/preview/PreviewDomainsGrid.js
import React, { useMemo } from 'react'
import { Box } from '@mui/joy'
import PreviewDomainCard from './previewDomainCard/PreviewDomainCard.js'
import { getDrivePreviewUrl } from '../../../../../shared/media/driveLinks'

export default function PreviewDomainsGrid({
  domains,
  entity,
  onSaveInfo,
  onOpenDomain,
  context,
  isProject,
}) {
  const videoActions = useMemo(() => {
    const api = context?.video || null

    if (api?.openWatch || api?.openEdit || api?.openAttach) {
      return {
        watch: (video) => api?.openWatch({ video, entity, context }),
        edit: (video) => api?.openEdit({ video, entity, context }),
        link: (video) => api?.openAttach({ video, entity, context }),
        share: (video) => api?.share({ video, entity, context }),
      }
    }

    return {
      watch: (video) => {
        const url = getDrivePreviewUrl(video?.link) || video?.url || ''
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
      },
      edit: () => console.log('[PreviewDomainsGrid] missing context.video.openEdit'),
      link: () => console.log('[PreviewDomainsGrid] missing context.video.openAttach'),
      share: () => console.log('[PreviewDomainsGrid] missing context.video.share'),
    }
  }, [context])

  const list = (domains || []).filter(Boolean)
  if (!list.length) return null

  return (
    <Box
      sx={{
        mt: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 1,
      }}
    >
      {list.map((d) => (
        <PreviewDomainCard
          key={d.key}
          d={d}
          entity={entity}
          context={context}
          videoActions={videoActions}
          onSaveInfo={onSaveInfo}
          onOpenDomain={onOpenDomain}
          isProject={isProject}
        />
      ))}
    </Box>
  )
}
