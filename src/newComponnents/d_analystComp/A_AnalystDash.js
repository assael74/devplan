import * as React from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { typeBackground } from '../b_styleObjects/Colors.js'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js'
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Card, Typography, IconButton, Divider } from '@mui/joy';
import Layout from '../Layout.js';

const items = [
  {
    label: 'מועדונים',
    icon: iconUi({ id: 'clubs', size: 'lg' }),
    link: '/Clubs',
    bgColor: typeBackground['clubs'].bgc,
    textColor: typeBackground['clubs'].text,
  },
  {
    label: 'קבוצות',
    icon: iconUi({ id: 'teams', size: 'lg' }),
    link: '/Teams',
    bgColor: typeBackground['teams'].bgc,
    textColor: typeBackground['teams'].text,
  },
  {
    label: 'שחקנים',
    icon: iconUi({ id: 'players', size: 'lg' }),
    link: '/Players',
    bgColor: typeBackground['players'].bgc,
    textColor: typeBackground['players'].text,
  },
  {
    label: 'תשלומים',
    icon: iconUi({ id: 'payments', size: 'lg' }),
    link: '/Payments',
    bgColor: typeBackground['payments'].bgc,
    textColor: typeBackground['payments'].text,
  },
  {
    label: 'פגישות',
    icon: iconUi({ id: 'meetings', size: 'lg' }),
    link: '/Meetings',
    bgColor: typeBackground['meetings'].bgc,
    textColor: typeBackground['meetings'].text,
  },
  {
    label: 'משחקים',
    icon: iconUi({ id: 'games', size: 'lg' }),
    link: '/Games',
    bgColor: typeBackground['games'].bgc,
    textColor: typeBackground['games'].text,
  },
];

const itemsOprate = [
  {
    label: 'וידאו',
    icon: iconUi({ id: 'video', size: 'md' }),
    link: '/Videos',
    bgColor: typeBackground['videos'].bgc,
    textColor: typeBackground['videos'].text,
  },
  {
    label: 'תגים',
    icon: iconUi({ id: 'tags', size: 'md' }),
    link: '/Tags',
    bgColor: typeBackground['tags'].bgc,
    textColor: typeBackground['tags'].text,
  },
  {
    label: 'פרמטרים סטט',
    icon: iconUi({ id: 'statsParm', size: 'md' }),
    link: '/StatsParm',
    bgColor: typeBackground['statsParm'].bgc,
    textColor: typeBackground['statsParm'].text,
  },
  {
    label: 'אנשי מקצוע',
    icon: iconUi({ id: 'roles', size: 'md' }),
    link: '/Roles',
    bgColor: typeBackground['roles'].bgc,
    textColor: typeBackground['roles'].text,
  },
];

export default function AnalystDash(props) {
  const { actions } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleNavigation = (link) => {
    return () => {
      navigate(link);
    };
  };

  return (
    <Layout.Main sx={{ ml: -8 }}>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.label} xs={6} sm={6} md={6}>
            <Card
              variant="soft"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: { xs: 90, md: 120 },
                cursor: 'pointer',
                transition: '0.3s',
                bgcolor: item.bgColor,
                color: item.textColor,
                '&:hover': {
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                  filter: 'brightness(0.95)',
              },
              }}
              onClick={handleNavigation(item.link)}
            >
            <IconButton size="lg" className="icon" color={item.textColor} sx={{ mb: -1.5, mt: -1 }}>
              {item.icon}
            </IconButton>
            <Typography level="title-md">
              {item.label}
            </Typography>
            </Card>
          </Grid>
        ))}
        <Grid xs={12} sm={12} md={12} sx={{ my: 2 }}> <Divider />  </Grid>
        {itemsOprate.map((item) => (
          <Grid key={item.label} xs={4} sm={4} md={3}>
            <Card
              variant="soft"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: { xs: 70, md: 100 },
                cursor: 'pointer',
                transition: '0.3s',
                bgcolor: item.bgColor,
                color: item.textColor,
                '&:hover': {
                  boxShadow: 'lg',
                  transform: 'translateY(-4px)',
                  filter: 'brightness(0.95)',
              },
              }}
              onClick={handleNavigation(item.link)}
            >
            <IconButton size={isMobile ? 'sm' : 'md'} className="icon" color={item.textColor} sx={{ mb: -2 }}>
              {item.icon}
            </IconButton>
            <Typography fontSize={isMobile ? '10px' : '12px'} level="title-sm" textAlign='center'>
              {item.label}
            </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout.Main>
  );
}
