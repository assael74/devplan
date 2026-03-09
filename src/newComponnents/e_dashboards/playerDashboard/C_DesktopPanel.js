// teamDashboard/playersList/deskTop/A_DesktopPanel.js
import React from 'react';
import playerImage from '../../b_styleObjects/images/playerImage.jpg';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { objectSections } from '../utils/objectSections.js'
import { motion } from 'framer-motion';
import {
  boxPanelProps,
  sheetPanelProps,
  panelHeaderProps,
  drawerProps,
  avatarProps,
  motionBoxProps
} from './X_Style'
import { Box, Sheet, Typography, Stack, IconButton, Drawer, Avatar, Chip } from '@mui/joy';
import InfoViewController from './infoPanel/InfoPanelController.js'
import DesktopPaymentPanel from './paymentPanel/desktop/A_DesktopPaymentPanel.js'
import DesktopAbilitiesPanel from './abilitiesPanel/desktop/A_DesktopAbilitiesPanel.js'
import DesktopPerformancePanel from './performancePanel/desktop/A_DesktopPerformancePanel.js'
import DesktopPlayerMeetingsPanel from './meetingsPanel/desktop/A_DesktopPlayerMeetingsPanel.js'

const panelColors = {
  info: typeBackground.players.bgc,
  payments: typeBackground.payments.bgc,
  meetings: typeBackground.meetings.bgc,
  performance: typeBackground.performance.bgc,
  abilities: typeBackground.abilities.bgc,
};

function PanelHeader({ title, onClose, panelId, player }) {
  const bgColor = panelColors[panelId] || 'transparent';
  const icon = iconUi({ id: panelId, size: 'lg', sx: { mr: 3, ml: 1 } });
  const avatarSrc = player?.photo || playerImage;
  const name = player.playerFullName

  return (
    <Box {...panelHeaderProps(bgColor)}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <Avatar src={avatarSrc} alt={player?.playerFullName || 'שחקן'} {...avatarProps} />
        <Typography level="h4" fontWeight="lg">
          <Chip size="md" color="primary" variant="soft" sx={{ mx: 1 }}>{name}</Chip>
          {title}
        </Typography>
      </Box>
      <IconButton onClick={onClose} variant="solid" color="neutral">
        {iconUi({ id: 'close' })}
      </IconButton>
    </Box>
  );
}

export default function DesktopPanel({ player, teamPlayers = [], formProps, statsParm, actions, allShorts, view }) {
  const [activePanel, setActivePanel] = React.useState(null);
  const MotionBox = motion(Box);
  const panels = [
    {
      label: 'מידע',
      description: 'פרטי השחקן וההורה',
      iconId: 'info',
      onClick: () => setActivePanel('info'),
      color: typeBackground.players.bgc,
    },
    {
      label: 'תשלומים',
      description: 'צפייה ועריכה בכל תשלומי השחקן.',
      iconId: 'payments',
      onClick: () => setActivePanel('payments'),
      color: typeBackground.payments.bgc,
    },
    {
      label: 'מפגשים',
      description: 'כל מפגשי השחקן כולל קישורים לוידאו.',
      iconId: 'meetings',
      onClick: () => setActivePanel('meetings'),
      color: typeBackground.meetings.bgc,
    },
    {
      label: 'ביצועים',
      description: 'כל ביצועי השחקן',
      iconId: 'performance',
      onClick: () => setActivePanel('performance'),
      color: typeBackground.performance.bgc,
    },
    {
      label: 'יכולות',
      description: 'כל יכולות השחקן',
      iconId: 'abilities',
      onClick: () => setActivePanel('abilities'),
      color: typeBackground.abilities.bgc,
    },
  ];

  return (
    <Box {...boxPanelProps}>
      {panels.map((panel, index) => (
        <Sheet key={index} onClick={panel.onClick} {...sheetPanelProps(panel)}>
          <Stack spacing={1}>
            <Typography level="h5" fontWeight="lg" startDecorator={iconUi({ id: panel.iconId, sx: { ml: 1 } })}>
              {panel.label}
            </Typography>
            <Typography level="body-sm" color="neutral" >
              {panel.description}
            </Typography>
          </Stack>
        </Sheet>
      ))}
      <Drawer {...drawerProps} open={Boolean(activePanel)} onClose={() => setActivePanel(null)} anchor="bottom">
        <Box {...motionBoxProps}>
          {activePanel === 'info' && (
            <>
              <PanelHeader
                title=':מידע על'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                player={player}
              />
              <InfoViewController
                player={player}
                actions={actions}
                isMobile={false}
                formProps={formProps}
                sections={objectSections.players}
              />
            </>
          )}
          {activePanel === 'payments' && (
            <>
              <PanelHeader
                title=':פירוט תשלומים של'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                player={player}
              />
              <DesktopPaymentPanel
                player={player}
                actions={actions}
                allShorts={allShorts}
                formProps={formProps}
                isMobile={false}
                view={view}
              />
            </>
          )}
          {activePanel === 'meetings' && (
            <>
              <PanelHeader
                title=':פירוט מפגשים של'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                player={player}
              />
              <DesktopPlayerMeetingsPanel
                player={player}
                actions={actions}
                allShorts={allShorts}
                formProps={formProps}
                isMobile={false}
                view={view}
              />
            </>
          )}
          {activePanel === 'performance' && (
            <>
              <PanelHeader
                title=':פירוט ביצועים של'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                player={player}
              />
              <DesktopPerformancePanel
                view={view}
                player={player}
                isMobile={false}
                actions={actions}
                statsParm={statsParm}
                allShorts={allShorts}
                formProps={formProps}
                playerGames={player.playerGames}
              />
            </>
          )}
          {activePanel === 'abilities' && (
            <>
              <PanelHeader
                title=':פירוט יכולות של'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                player={player}
              />
              <DesktopAbilitiesPanel
                view={view}
                player={player}
                isMobile={false}
                actions={actions}
                statsParm={statsParm}
                allShorts={allShorts}
                formProps={formProps}
                playerGames={player.playerGames}
              />
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
