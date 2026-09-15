import * as React from 'react'
import { Box, Button, Input, Sheet, Typography } from '@mui/joy'

import RegularModal from './RegularModal.js'
import { jsonViewerModalSx as sx } from './sx/jsonViewerModal.sx.js'

const jsonTextOf = value => JSON.stringify(value === undefined ? null : value)
const formatJson = value => JSON.stringify(value === undefined ? {} : value, null, 2)
const isBranch = value => value !== null && typeof value === 'object'

const primitiveLabel = value => {
  if (value === null) return 'null'
  if (typeof value === 'string') return JSON.stringify(value)
  return String(value)
}

function JsonTreeNode({
  label,
  value,
  depth = 0,
  query = '',
  path = 'root',
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase('he')
  const [isOpen, setIsOpen] = React.useState(Boolean(normalizedQuery) || depth < 1)

  React.useEffect(() => {
    if (normalizedQuery) setIsOpen(true)
  }, [normalizedQuery])

  if (normalizedQuery && !jsonTextOf(value).toLocaleLowerCase('he').includes(normalizedQuery)) {
    return null
  }

  if (!isBranch(value)) {
    return (
      <Box sx={sx.primitiveRow(depth)}>
        <Typography component='span' level='body-xs' sx={sx.primitiveText}>
          {`${label}:`}
        </Typography>
        <Typography
          component='span'
          level='body-xs'
          sx={sx.primitiveText}
        >
          {primitiveLabel(value)}
        </Typography>
      </Box>
    )
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [index, item])
    : Object.entries(value)
  const marker = Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`
  const shouldRenderChildren = isOpen || Boolean(normalizedQuery)

  return (
    <Box
      component='details'
      key={`${path}-${normalizedQuery}`}
      open={isOpen}
      onToggle={event => setIsOpen(event.currentTarget.open)}
      sx={sx.branch(depth)}
    >
      <Box component='summary' sx={sx.summary}>
        <Typography component='span' level='body-xs' sx={sx.summaryMarker}>
          {isOpen ? '−' : '+'}
        </Typography>
        <Typography component='span' level='body-xs' sx={sx.summaryLabel}>
          {label}
        </Typography>
        <Typography component='span' level='body-xs' sx={sx.summaryCount}>
          {marker}
        </Typography>
      </Box>

      {shouldRenderChildren ? (
        <Box>
          {entries.map(([childLabel, childValue]) => (
            <JsonTreeNode
              key={`${path}.${childLabel}`}
              label={Array.isArray(value) ? `[${childLabel}]` : childLabel}
              value={childValue}
              depth={depth + 1}
              query={query}
              path={`${path}.${childLabel}`}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

export default function JsonViewerModal({
  open = false,
  title = 'JSON',
  description = 'תצוגה לקריאה בלבד',
  data = {},
  onClose,
  onDownload,
}) {
  const [query, setQuery] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setQuery('')
    setCopied(false)
  }, [open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatJson(data))
      setCopied(true)
    } catch (error) {
      setCopied(false)
    }
  }

  return (
    <RegularModal
      open={open}
      title={title}
      description={description}
      iconId='view'
      size='xl'
      hideFooter
      onClose={onClose}
      contentSx={sx.content}
    >
      <Input
        size='sm'
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder='חיפוש בתוך ה־JSON'
      />

      <Box sx={sx.actions}>
        <Button size='sm' variant='outlined' onClick={handleCopy}>
          {copied ? 'הועתק' : 'העתקת JSON'}
        </Button>
        {onDownload ? (
          <Button size='sm' variant='outlined' onClick={onDownload}>
            הורדת JSON
          </Button>
        ) : null}
      </Box>

      <Sheet
        className='dpScrollThin'
        variant='outlined'
        dir='ltr'
        sx={sx.viewer}
      >
        <Box
          dir='ltr'
          sx={sx.tree}
        >
          <JsonTreeNode
            label='root'
            value={data}
            query={query}
          />
        </Box>
      </Sheet>
    </RegularModal>
  )
}
