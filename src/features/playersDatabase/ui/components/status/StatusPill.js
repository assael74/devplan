// features/playersDatabase/ui/components/status/StatusPill.js

import * as React from 'react'
import { Chip } from '@mui/joy'

import { resolveStatusMeta } from '../../logic/status.logic.js'

export default function StatusPill({ value, label }) {
  const meta = resolveStatusMeta(value)
  return <Chip size='sm' variant='soft' color={meta.tone}>{label || meta.label}</Chip>
}
