////teamDashboard/playersPanel/mobile/B_MobilePlayersList.js
import React, { useState } from 'react';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { boxListProps, openPaymentProps } from './X_Style'
import { playerMenuConfig } from '../../../../d_analystComp/a_layouts/X_menuConfig.js'
import { Box, Typography, Avatar, IconButton, Badge, Grid } from '@mui/joy';
import JoyStarRating from '../../../../h_componnetsUtils/rating/JoyStarRating.js';
import GenericEditMenu from '../../../../d_analystComp/a_containers/F_GenericEditMenu.js'

export default function MobilePlayersList({ view, player, onClick, allShorts, formProps, getInitialState, actions }) {
  const [updates, setUpdates] = React.useState({});
  const [open, setOpen] = React.useState(false);
  const [actionItem, setActionItem] = React.useState(null);
  const stats = player.playerFullStats

  const update = updates[player.id] || getInitialState?.(player);
  const setUpdate = (val) => setUpdates(prev => ({ ...prev, [player.id]: val }));

  const isProject = player.type === 'project';
  const position = player.positions?.[0] || '-';
  const hasMorePositions = player.positions?.length > 1;
  const levelColor = player.level > 0 ? '#fbc02d' : '#888'
  
  return (
    <Box onClick={(e) => onClick(e, player)} {...boxListProps(player)}>
      <Box sx={{ display: 'flex', width: '100%', alignItems: "center" }}>
        {/* אזור 1: אווטאר עם באדג פנימי */}
        <Box sx={{ width: '15%', ml: 1, position: 'relative' }}>
          {player.isOpenPayment && (
            <Box {...openPaymentProps} />
          )}
          <Avatar
            src={player.photo || playerImage}
            alt={player.playerFullName}
            sx={{ width: 30, height: 30 }}
          />
        </Box>

        {/* אזור 2: שם + תאריך לידה */}
        <Box sx={{ width: '35%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <Typography fontSize='12px' level="body-md" fontWeight="lg" noWrap>
              {player.playerFullName || 'שחקן ללא שם'}
            </Typography>
            <IconButton
              size='sm'
              onClick={(e) => {
                setOpen(!open);
                e.stopPropagation();
              }}
            >
            {iconUi({id: 'star', size: 'sm', sx:{ color: levelColor }})}
            </IconButton>
          </Box>
          <Typography fontSize='12px' level="body-sm" color="neutral">
            {player.birth || '00-0000'}
          </Typography>
        </Box>

        {/* אזור 4: דקות ושערים */}
        <Box sx={{ width: '40%' }}>
          <Typography fontSize='12px' level="body-xs" color="neutral" noWrap>
            דקות: {stats.timePlayed} / {stats.totalGameTime} ({stats.playTimeRate}%)
          </Typography>
          <Typography fontSize='12px' level="body-sm" color="neutral" noWrap>
            ⚽ {stats.goals || '0'} | 🎯 {stats.assists || '0'}
          </Typography>
        </Box>

        {/* אזור 5: תפריט */}
        <Box sx={{ width: '10%' }}>
          <GenericEditMenu
            type='players'
            item={player}
            view={view}
            update={update}
            isMobile={false}
            actions={actions}
            idDisplay='tableList'
            setUpdate={setUpdate}
            formProps={formProps}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: open ? 'block' : 'none',
          overflow: 'hidden',
          transition: `max-height ${300}ms ease-in-out, opacity ${300}ms ease-in-out`,
          transition: `opacity ${300}ms ease-in-out`,
          opacity: open ? 1 : 0,
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', alignItems: "center", gap: 2, mt: 1 }}>
          {/* יכולת כללית */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography level="body-xs" sx={{ color: 'neutral.500', ml: 1, fontWeight: 'bold' }}>
              יכולת:
            </Typography>
            <JoyStarRating value={player.level} size="xs" sx={{ direction: 'ltr' }} />
          </Box>
          {/* פוטנציאל יכולת */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Typography level="body-xs" sx={{ color: 'neutral.500', ml: 1, fontWeight: 'bold' }}>
              פוטנציאל:
            </Typography>
            <JoyStarRating value={player.levelPotential} size="xs" sx={{ direction: 'ltr' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
