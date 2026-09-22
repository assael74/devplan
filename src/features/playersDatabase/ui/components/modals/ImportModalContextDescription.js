import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { importModalContextDescriptionSx as sx } from './sx/importModalContextDescription.sx.js'

const clean = value => String(value || '').trim()

function ContextItem({ item }) {
  const label = clean(item?.label) || '-'
  const href = clean(item?.href)

  if (!href) {
    return (
      <Typography component='span' level='body-sm' sx={sx.missingLink}>
        {label}
      </Typography>
    )
  }

  return (
    <Tooltip title={href} placement='top' arrow>
      <Typography
        component='a'
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        level='body-sm'
        sx={sx.link}
      >
        {label}
      </Typography>
    </Tooltip>
  )
}

export default function ImportModalContextDescription({ items = [] }) {
  const visibleItems = items.filter(item => clean(item?.label))

  return (
    <Box sx={sx.root}>
      {visibleItems.map((item, index) => (
        <Box key={`${item.label}-${index}`} sx={sx.item}>
          {index > 0 ? <Typography component='span' level='body-sm'>·</Typography> : null}
          <ContextItem item={item} />
        </Box>
      ))}
    </Box>
  )
}
