// src/features/playersDatabase/ui/components/page/PageSidePanel.js

import * as React from 'react'
import {
  IconButton,
  Stack,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import InfoPanel from './InfoPanel.js'
import { pageSidePanelSx as sx } from './sx/pageSidePanel.sx.js'

export default function PageSidePanel({
  children,
  scrollable = false,
  collapsible = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
}) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed)
  const isControlled = typeof controlledCollapsed === 'boolean'
  const collapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed

  const handleCollapsedChange = () => {
    const nextCollapsed = !collapsed

    if (!isControlled) setUncontrolledCollapsed(nextCollapsed)
    if (onCollapsedChange) onCollapsedChange(nextCollapsed)
  }

  return (
    <InfoPanel sx={[sx.panel, collapsed && sx.collapsedPanel]}>
      {collapsible ? (
        <Tooltip title={collapsed ? 'פתיחת סרגל הצד' : 'קיפול סרגל הצד'}>
          <IconButton
            size='sm'
            variant='soft'
            color='neutral'
            aria-label={collapsed ? 'פתיחת סרגל הצד' : 'קיפול סרגל הצד'}
            sx={sx.collapseButton}
            onClick={handleCollapsedChange}
          >
            {iconUi({
              id: 'arrowDown',
              size: 'sm',
              style: { transform: `rotate(${collapsed ? -90 : 90}deg)` },
              sx: { color: '#fff' },
            })}
          </IconButton>
        </Tooltip>
      ) : null}

      {!collapsed ? (
        <Stack
          spacing={1}
          className={scrollable ? 'dpScrollThin' : undefined}
          sx={scrollable ? sx.scrollableContent : sx.content}
        >
          {children}
        </Stack>
      ) : null}
    </InfoPanel>
  )
}
