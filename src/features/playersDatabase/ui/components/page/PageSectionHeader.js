// src/features/playersDatabase/ui/components/page/PageSectionHeader.js

import {
  Box,
  Typography,
} from '@mui/joy'

import { pageSectionHeaderSx as sx } from './sx/pageSectionHeader.sx.js'

export default function PageSectionHeader({
  title,
  subtitle = '',
  meta = '',
  tone = 'default',
  actions = null,
}) {
  return (
    <Box
      sx={[
        sx.header,
        tone === 'soft' ? sx.soft : null,
      ]}
    >
      <Box sx={sx.textArea}>
        <Typography level='title-lg' sx={sx.title}>
          {title}
        </Typography>

        {subtitle ? (
          <Typography level='body-xs' sx={sx.subtitle}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {(meta || actions) ? (
        <Box sx={sx.endArea}>
          {actions}

          {meta ? (
            <Typography level='body-sm' sx={sx.meta}>
              {meta}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}
