import * as React from 'react';
import { Typography, Divider } from '@mui/joy';
import { List, ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { useNavigate, useLocation } from 'react-router-dom';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { typeBackground } from '../b_styleObjects/Colors.js'

function getMenuItems(pathname) {
  const isProfileView =
    pathname.startsWith('/Player/') ||
    pathname.startsWith('/Team/') ||
    pathname.startsWith('/Club/') ||
    pathname.startsWith('/Meeting/') ||
    pathname.startsWith('/Video/') ||
    pathname.startsWith('/Tag/') ||
    pathname.startsWith('/Scouting/') ||
    pathname.startsWith('/Role/');

  if (isProfileView) {
    const backItems = [];
    if (pathname.startsWith('/Player/'))
      backItems.push({
        id: 'back',
        title: 'חזרה לשחקנים',
        link: '/Players',
        icon: 'players',
        category: 'חזרה',
        color: typeBackground.players.bgc
      });
    if (pathname.startsWith('/Team/'))
      backItems.push({
        id: 'back',
        title: 'חזרה לקבוצות',
        link: '/Teams',
        icon: 'teams',
        category: 'חזרה',
        color: typeBackground.teams.bgc
      });
    if (pathname.startsWith('/Club/'))
      backItems.push({
        id: 'back',
        title: 'חזרה למועדונים',
        link: '/Clubs',
        icon: 'clubs',
        category: 'חזרה',
        color: typeBackground.clubs.bgc
      });
    if (pathname.startsWith('/Meeting/'))
      backItems.push({
        id: 'back',
        title: 'חזרה לפגישות',
        link: '/Meetings',
        icon: 'meetings',
        category: 'חזרה',
        color: typeBackground.meetings.bgc
      });

    // Always include main dashboard option
    backItems.push({
      id: 'analyst',
      title: 'מרכז שליטה',
      link: '/Analyst',
      icon: 'dashboard',
      category: 'ראשי',
      color: '#1976d2'
    });

    return backItems;
  }

  return [
    {
      id: 'clubs',
      title: 'מועדונים',
      link: '/Clubs',
      icon: 'clubs',
      category: 'ניהול',
      color: typeBackground.clubs.darkBg },
    {
      id: 'teams',
      title: 'קבוצות',
      link: '/Teams',
      icon: 'teams',
      category: 'ניהול',
      color: typeBackground.teams.darkBg
    },
    {
      id: 'players',
      title: 'שחקנים',
      link: '/Players',
      icon: 'players',
      category: 'ניהול',
      color: typeBackground.players.darkBg
    },
    {
      id: 'payments',
      title: 'תשלומים',
      link: '/Payments',
      icon: 'payments',
      category: 'ניהול',
      color: typeBackground.payments.darkBg
    },
    {
      id: 'meetings',
      title: 'פגישות',
      link: '/Meetings',
      icon: 'meetings',
      category: 'ניהול',
      color: typeBackground.meetings.darkBg
    },
    {
      id: 'games',
      title: 'משחקים',
      link: '/Games',
      icon: 'games',
      category: 'ניהול',
      color: typeBackground.games.darkBg
    },
    {
      id: 'scouting',
      title: 'מעקב',
      link: '/Scouting',
      icon: 'scouting',
      category: 'ניהול',
      color: typeBackground.scouting.darkBg
    },
    {
      id: 'videos',
      title: 'וידאו',
      link: '/Videos',
      icon: 'video',
      category: 'תפעול',
      color: typeBackground.videos.darkBg
    },
    {
      id: 'tags',
      title: 'ניהול תגים',
      link: '/Tags',
      icon: 'tag',
      category: 'תפעול',
      color: typeBackground.tags.darkBg
    },
    {
      id: 'statsParm',
      title: 'פרמטרים סטט',
      link: '/StatsParm',
      icon: 'statsParm',
      category: 'תפעול',
      color: typeBackground.statsParm.darkBg
    },
    {
      id: 'roles',
      title: 'אנשי מקצוע',
      link: '/Roles',
      icon: 'roles',
      category: 'תפעול',
      color: typeBackground.roles.darkBg
    },
  ];
}

export default function NavigationStatic() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = getMenuItems(pathname);

  const handleNavigation = (link) => {
    navigate(link);
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <List sx={{ bgcolor: 'background.surface', p: 1 }}>
      {Object.keys(groupedMenu).map((category, index) => (
        <React.Fragment key={category}>
          {index > 0 && <Divider sx={{ my: 1 }} />} {/* מפריד בין קטגוריות */}
          <ListSubheader>{category}</ListSubheader>
          {groupedMenu[category].map((item) => (
            <ListItem key={item.id}>
              <ListItemButton onClick={() => handleNavigation(item.link)} selected={pathname === item.link}>
                <ListItemDecorator>
                  {iconUi({ id: item.icon, style: { color: item.color } })}
                </ListItemDecorator>
                <Typography fontSize='12px'>
                  {item.title}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </React.Fragment>
      ))}
    </List>
  );
}
