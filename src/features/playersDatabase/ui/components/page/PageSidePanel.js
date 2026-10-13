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
  scrollable = true,
  collapsible = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = true,
  collapsedActions = [],
  onCollapsedChange,
}) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed)
  const isControlled = typeof controlledCollapsed === 'boolean'
  const collapsed = collapsible && (isControlled ? controlledCollapsed : uncontrolledCollapsed)

  const handleCollapsedChange = () => {
    const nextCollapsed = !collapsed

    if (!isControlled) setUncontrolledCollapsed(nextCollapsed)
    if (onCollapsedChange) onCollapsedChange(nextCollapsed)
  }

  return (
    <InfoPanel sx={[sx.panel, collapsed && sx.collapsedPanel]}>
      {collapsible && collapsed && collapsedActions.length ? (
        <Stack spacing={0.75} sx={sx.collapsedActions}>
          {collapsedActions.map(action => (
            <Tooltip key={action.label} title={action.disabled && action.disabledReason ? action.disabledReason : action.label} placement='top'>
              <span>
                <IconButton
                  aria-label={action.label}
                  variant='outlined'
                  disabled={action.disabled}
                  onClick={action.onClick}
                  sx={sx.floatingActionButton}
                >
                  {iconUi({ id: action.iconId, size: 'sm' })}
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Stack>
      ) : null}
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
