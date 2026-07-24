// features/playersDatabase/ui/pages/searchPage/query/SearchQuerySection.js

import { Box, Divider, Typography } from '@mui/joy'

import { searchQuerySectionSx as sx } from './sx/searchQuerySection.sx.js'

export default function SearchQuerySection({
  title,
  step = '',
  children,
  contentSx = {},
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Typography level='title-sm' sx={sx.title}>
          {title}
        </Typography>

        {step && (
          <Typography level='body-xs' sx={sx.step}>
            {step}
          </Typography>
        )}
      </Box>

      <Divider sx={sx.divider} />

      <Box sx={[sx.content, contentSx]}>
        {children}
      </Box>
    </Box>
  )
}
