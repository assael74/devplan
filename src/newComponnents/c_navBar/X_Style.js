
export const drawerProps = {
  sx: { display: { xs: 'inline-flex', sm: 'none' } }
}

export const listNavProps = {
  size: "sm",
  sx: { '--ListItem-radius': 'var(--joy-radius-sm)', '--List-gap': '4px' }
}

export const secondListProps = {
  'aria-labelledby': "nav-list-browse",
  sx: { '& .JoyListItemButton-root': { p: '8px' } }
}

export const menuButProps = {
  variant: "plain",
  size: "sm",
  sx: { maxWidth: '32px', maxHeight: '32px', borderRadius: '9999999px' }
}

export const avaProps = {
  sx: { maxWidth: '32px', maxHeight: '32px' }
}

export const menuProps = {
  placement:"bottom-end",
  size:"sm",
  sx: {
    zIndex: '99999',
    p: 1,
    gap: 1,
    '--ListItem-radius': 'var(--joy-radius-sm)',
  }
}

export const colorSchemeProps = {
  'data-screenshot': "toggle-mode",
  size: "sm",
  variant: "plain",
  color: "neutral",
  sx: { alignSelf: 'center' }
}

export const appLocationProps = {
  sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }
}
