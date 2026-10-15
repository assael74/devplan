// src/features/playersDatabase/ui/components/page/DataOpsQuickAccessButton.js

import { Button } from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import {
  buildDataOpsNavigationState,
  resolveDataOpsAuditRoute,
} from '../../logic/routeBuilders.js'

export default function DataOpsQuickAccessButton() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Button
      type='button'
      size='sm'
      variant='solid'
      startDecorator={iconUi({ id: 'data', size: 'sm' })}
      onClick={() => navigate(
        resolveDataOpsAuditRoute(location),
        { state: buildDataOpsNavigationState(location) }
      )}
      sx={{
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
