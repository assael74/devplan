// src/features/videoHub/components/base/VideoCardBase.js
import React from 'react'
import { Box, Card } from '@mui/joy'

export default function VideoCardBase({
  variantKey,
  sx,
  video,
  Media,
  Header,
  afterHeader,
  Extra,
  Tags,
  wrapExtra,
  wrapTags,
  showDivider = true,
}) {
  return (
    <Card variant="outlined" sx={typeof sx?.cardGrid === 'function' ? sx.cardGrid(variantKey) : sx?.cardGrid}>
      {typeof Media === 'function' ? <Media video={video} /> : Media}

      <Box sx={sx?.cardBody}>
        {typeof Header === 'function' ? <Header video={video} /> : Header}

        {showDivider ? <Box sx={sx.cardTitleDivider} /> : null}

        {Extra ? (wrapExtra ? wrapExtra(Extra) : Extra) : null}

        {Tags ? (wrapTags ? wrapTags(Tags) : Tags) : null}
      </Box>
    </Card>
  )
}
