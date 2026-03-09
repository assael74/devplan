import React, { useState } from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { objectSections } from '../utils/objectSections.js'
import playerImage from '../../b_styleObjects/images/playerImage.jpg';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js'
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { Navigate, useParams } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Layout from './../../Layout.js';
import NavigationStatic from './../../c_navBar/NavigationStatic.js';
import PlayerProfileLayout from './B_PlayerProfileLayout'
import InfoViewController from './infoPanel/InfoPanelController.js';
import DesktopPanel from './C_DesktopPanel.js';
import MobilePlayerPaymentPanel from './paymentPanel/mobile/A_MobilePlayerPaymentPanel.js'
import MobilePlayerPerformancePanel from './performancePanel/mobile/A_MobilePlayerPerformancePanel.js'
import MobilePlayerMeetingsPanel from './meetingsPanel/mobile/A_MobilePlayerMeetingsPanel.js'
import EditImageDrawer from '../newContainers/EditImageDrawer.js';

export default function PlayerDashboard(props) {
  const {
    clubs,
    teams,
    games,
    roles,
    videos,
    players,
    payments,
    meetings,
    allShorts,
    statsParm,
    gameStats,
    videoAnalysis,
  } = props;
  const [tabValue, setTabValue] = useState(0);
  const [editImageOpen, setEditImageOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { playerId } = useParams();

  const player = players?.find((t) => t.id === playerId);
  const editPlayerActions = getDefaultQuickActions({ type: 'players' });

  const editGameActions = getDefaultQuickActions({ type: 'games' });

  const addGameStatsActions = getDefaultActions({ type: 'gameStats' });
  const editGameStatsActions = getDefaultQuickActions({ type: 'gameStats' });

  const playerTeam = teams?.find((t) => t.id === player.teamId);
  const playerClub = clubs?.find((t) => t.id === player.clubId);

  const actions = {
    editPlayer: editPlayerActions,
    onAddStats: async (data, internalActions) => {
      await addGameStatsActions.onAdd(data, internalActions);
      showSnackbar('נוספה סטטיסטיקה חדשה');
    },
    onEditStats: async (data, internalActions) => {
      await editGameStatsActions.onEdit(data, internalActions);
      showSnackbar('סטטיסטיקה עודכנה');
    },
  };

  const formProps = {
    videoAnalysis,
    gameStats,
    statsParm,
    playerId,
    payments,
    meetings,
    players,
    videos,
    roles,
    clubs,
    teams,
    games,
  };

  const newProps = {
    ...props,
    isMobile,
    player,
    actions,
    tabValue,
    formProps,
    allShorts,
    view: "profilePlayer"
  };

  return (
    <React.Fragment>
      <Layout.SideNav>
        <NavigationStatic {...newProps} id='playerDashboard' />
      </Layout.SideNav>
      <Layout.Main>
        <PlayerProfileLayout
          object={player}
          type="players"
          view="profilePlayer"
          isMobile={isMobile}
          name={player?.playerFullName}
          avatarSrc={player?.photo !== '' ? player.photo : playerImage}
          subTitle={`${playerTeam?.teamName} - ${playerClub?.clubName}`}
          onAvatarClick={() => setEditImageOpen(true)}
          actionsMenu={null}
          {...(isMobile
            ? {
                tabs: [
                  {
                    label: 'מידע',
                    iconId: 'info',
                    content: (
                      <InfoViewController
                        player={player}
                        actions={actions}
                        isMobile={true}
                        formProps={formProps}
                        sections={objectSections.players}
                      />
                    ),
                  },
                  {
                    label: 'תשלומים',
                    iconId: 'payments',
                    content: (
                      <MobilePlayerPaymentPanel
                        {...newProps}
                        type='payments'
                        icon='payments'
                        isMobile={true}
                        view="profilePlayer"
                      />
                    )
                  },
                  {
                    label: 'מפגשים',
                    iconId: 'meetings',
                    content: (
                      <MobilePlayerMeetingsPanel
                        {...newProps}
                        type='meetings'
                        icon='meetings'
                        isMobile={true}
                        view="profilePlayer"
                      />
                    )
                  },
                  {
                    label: 'ביצועים',
                    iconId: 'performance',
                    content: (
                      <MobilePlayerPerformancePanel
                        player={player}
                        actions={actions}
                        formProps={formProps}
                        statsParm={statsParm}
                        view="profilePlayer"
                        allShorts={allShorts}
                        playerGames={player.playerGames}
                      />
                    )
                  },
                  {
                    label: 'יכולות',
                    iconId: 'abilities',
                    content: (
                      null
                    )
                  },
                ],
              }
            : {
                tabs: [],
                children: (
                  <DesktopPanel
                    {...newProps}
                    actions={actions}
                    view="profilePlayer"
                    statsParm={statsParm}
                  />
                ),
              })}
        />
        <EditImageDrawer
          open={editImageOpen}
          onClose={() => setEditImageOpen(false)}
          item={player}
          type="player"
          onEdit={actions.editPlayer.onEdit}
        />
      </Layout.Main>
    </React.Fragment>
  );
}
