// features/playersDatabase/ui/components/actions/ActionPanel.js

import * as React from 'react'
import { Button, Card, Stack, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export default function ActionPanel({ title = 'פעולות אפשריות', actions = [] }) {
  return (
    <Card sx={{ borderRadius: 8, border: '1px solid #dbe5f4' }}>
      <Stack spacing={1.25}>
        <Typography level='title-lg' sx={{ color: '#0b1f4d' }}>{title}</Typography>
        {actions.map(action => (
          <Button
            key={action.label}
            variant={action.primary ? 'solid' : 'outlined'}
            color={action.primary ? 'primary' : 'neutral'}
            onClick={action.onClick}
            startDecorator={action.iconId ? iconUi({ id: action.iconId, size: 'sm' }) : null}
            sx={{ justifyContent: 'center' }}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Card>
  )
}
