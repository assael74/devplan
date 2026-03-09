import * as React from 'react';
import { useMediaQuery } from '@mui/material';
import { useAuth } from '../AuthContext.js'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import MenuButton from '@mui/joy/MenuButton';
import Dropdown from '@mui/joy/Dropdown';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

import PageLocationHeader from '../PageLocationHeader';
import NavigationDrawer from './Navigation';

export default function Header(props) {
  const { pathname } = props;
  const isMobile = useMediaQuery('(max-width:600px)');
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }}>
      <NavigationDrawer {...props} />

      <PageLocationHeader />

      {/* תפריט משתמש בצד ימין */}
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: {
              variant: 'soft',
              color: 'neutral',
              size: 'sm',
            },
          }}
        >
          <Avatar src="/avatar.png" size="sm" />
        </MenuButton>
        <Menu placement="bottom-end" size="sm" sx={{ zIndex: 1300 }}>
          <MenuItem>
            <SettingsRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            הגדרות
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
            התנתקות
          </MenuItem>
        </Menu>
      </Dropdown>
    </Box>
  );
}
