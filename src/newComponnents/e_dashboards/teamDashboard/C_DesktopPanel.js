// teamDashboard/playersList/deskTop/A_DesktopPanel.js
import React from 'react';
import teamImage from '../../b_styleObjects/images/teamImage.png';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { objectSections } from '../utils/objectSections.js'
import { boxPanelProps, sheetPanelProps, motionBoxProps, panelHeaderProps, drawerProps, avatarProps } from './X_Style'
import { Box, Sheet, Typography, Stack, IconButton, Drawer, Avatar, Chip } from '@mui/joy';
import DeskTopPlayersList from './playersPanel/deskTop/A_DeskTopPlayersList.js'
import InfoViewController from './infoPanel/InfoPanelController.js'
import DesktopAbilitiesPanel from './abilitiesPanel/desktop/A_DesktopAbilitiesPanel.js'
import DesktopPerformancePanel from './performancePanel/desktop/A_DesktopPerformancePanel.js'

const panelColors = {
  info: '#ede7f6',
  players: typeBackground.players.bgc,
  payments: typeBackground.payments.bgc,
  meetings: typeBackground.meetings.bgc,
  performance: typeBackground.performance.bgc,
  abilities: typeBackground.abilities.bgc,
};

function PanelHeader({ title, onClose, panelId, team }) {
  const bgColor = panelColors[panelId] || 'transparent';
  const icon = iconUi({ id: panelId, size: 'lg', sx: { mr: 3, ml: 1 } });
  const avatarSrc = team?.photo || teamImage;
  const name = team.teamName

  return (
    <Box {...panelHeaderProps(bgColor)}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <Avatar src={avatarSrc} alt={team?.teamName || 'שחקן'} {...avatarProps} />
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

export default function DesktopPanel({
  view,
  team,
  actions,
  formProps,
  statsParm,
  allShorts,
  teamPlayers = [],
  teamGames = [],
}) {
  const [activePanel, setActivePanel] = React.useState(null);

  const panels = [
    {
      label: 'מידע',
      description: 'פרטי הקבוצה וצוות מקצועי.',
      iconId: 'info',
      onClick: () => setActivePanel('info'),
      color: '#ede7f6',
    },
    {
      label: 'שחקנים',
      description: 'צפייה ועריכה של שחקני הקבוצה.',
      iconId: 'players',
      onClick: () => setActivePanel('players'),
      color: typeBackground.players.bgc,
    },
    {
      label: 'ביצוע',
      description: 'כל ביצועי הקבוצה',
      iconId: 'performance',
      onClick: () => setActivePanel('performance'),
      color: typeBackground.performance.bgc,
    },
    {
      label: 'יכולות',
      description: 'כל יכולות הקבוצה',
      iconId: 'performance',
      onClick: () => setActivePanel('abilities'),
      color: typeBackground.gameStats.bgc,
    },
    {
      label: 'וידאו',
      description: 'קטעי וידאו הקשורים לקבוצה ולשחקנים.',
      iconId: 'video',
      onClick: () => setActivePanel(null),
      color: '#999999',
    },
  ];

  return (
    <Box {...boxPanelProps}>
      {panels.map((panel, index) => (
        <Sheet key={index} onClick={panel.onClick} {...sheetPanelProps(panel)}>
          <Stack spacing={1}>
            <Typography level="h5" fontWeight="lg">
              {iconUi({ id: panel.iconId, sx: { mr: 1 } })} {panel.label}
            </Typography>
            <Typography level="body-sm" color="neutral">
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
                team={team}
              />
              <InfoViewController
                team={team}
                actions={actions}
                isMobile={false}
                formProps={formProps}
                sections={objectSections.teams}
              />
            </>
          )}
          {activePanel === 'players' && (
            <>
              <PanelHeader
                title=':פירוט שחקני קבוצת'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                team={team}
              />
              <DeskTopPlayersList
                teamPlayers={teamPlayers}
                formProps={formProps}
                actions={actions}
                team={team}
                view={view}
              />
            </>
          )}
          {activePanel === 'performance' && (
            <>
              <PanelHeader
                title=':פירוט ביצועי קבוצת'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                team={team}
              />
              <DesktopPerformancePanel
                statsParm={statsParm}
                formProps={formProps}
                teamGames={teamGames}
                actions={actions}
                team={team}
                view={view}
              />
            </>
          )}
          {activePanel === 'abilities' && (
            <>
              <PanelHeader
                title=':פירוט יכולות קבוצת'
                onClose={() => setActivePanel(null)}
                panelId={activePanel}
                team={team}
              />
              <DesktopAbilitiesPanel
                statsParm={statsParm}
                formProps={formProps}
                actions={actions}
                team={team}
                view={view}
              />
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
