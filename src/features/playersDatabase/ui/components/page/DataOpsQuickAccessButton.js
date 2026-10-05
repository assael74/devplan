// src/features/playersDatabase/ui/components/page/DataOpsQuickAccessButton.js

import { Button } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  buildDataOpsNavigationState,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'

export default function DataOpsQuickAccessButton() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Button
      type='button'
      variant='solid'
      startDecorator={iconUi({ id: 'data', size: 'sm' })}
      onClick={() => navigate(
        PLAYERS_DATABASE_UI_ROUTES.dataOps,
        { state: buildDataOpsNavigationState(location) }
      )}
      sx={{
        minHeight: 38,
        px: 2,
        whiteSpace: 'nowrap',
        bgcolor: '#173f5f',
        '&:hover': {
          bgcolor: '#0f304b',
        },
      }}
    >
      ניהול דאטה
    </Button>
  )
}
