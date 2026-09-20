// src/features/playersDatabase/ui/components/modals/ImportActionArea.js

import { Button, Stack } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { importActionAreaSx as sx } from './sx/importActionArea.sx.js'

const presentationByRole = {
  clear: {
    color: 'danger',
    variant: 'outlined',
  },
  back: {
    color: 'neutral',
    variant: 'outlined',
  },
  continue: {
    color: 'primary',
    variant: 'solid',
  },
  confirm: {
    color: 'primary',
    variant: 'solid',
  },
  primary: {
    color: 'primary',
    variant: 'solid',
  },
  secondary: {
    color: 'neutral',
    variant: 'outlined',
  },
}

const resolvePresentation = action => (
  presentationByRole[action.presentationRole] || presentationByRole.secondary
)

export default function ImportActionArea({ actions = [] }) {
  const visibleActions = actions.filter(Boolean)

  if (!visibleActions.length) return null

  return (
    <Stack direction='row' sx={sx.actions}>
      {visibleActions.map(action => {
        const presentation = resolvePresentation(action)
        const loading = action.loading === true || action.busy === true

        return (
          <Button
            key={action.id || action.label}
            size='sm'
            color={action.color || presentation.color}
            variant={action.variant || presentation.variant}
            disabled={action.disabled === true || action.busy === true}
            loading={loading}
            startDecorator={!loading && action.iconId
              ? iconUi({ id: action.iconId, size: 'sm' })
              : null}
            onClick={action.onClick}
            sx={action.sx}
          >
            {action.label}
          </Button>
        )
      })}
    </Stack>
  )
}
