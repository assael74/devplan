// src/features/playersDatabase/ui/components/modals/ExternalLinkIcon.js

import {
  IconButton,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { externalLinkIconSx as styles } from './sx/externalLinkIcon.sx.js'

export default function ExternalLinkIcon({
  href = '',
  tooltip = '',
  onClick,
  sx: linkSx,
}) {
  const safeHref = String(href || '').trim()

  if (!safeHref) return null

  return (
    <Tooltip title={tooltip || safeHref}>
      <IconButton
        component='a'
        href={safeHref}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        size='sm'
        variant='plain'
        color='primary'
        sx={[styles.root, linkSx]}
        onClick={onClick}
      >
        {iconUi({
          id: 'link',
          size: 'sm',
        })}
      </IconButton>
    </Tooltip>
  )
}
