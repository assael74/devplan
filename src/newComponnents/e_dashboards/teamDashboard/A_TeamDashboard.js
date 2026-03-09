import React, { useState } from 'react';
import { useTheme } from '@mui/joy/styles';
import { deleteGame } from '../../a_firestore/actionData/deleteData/deleteGame';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useParams } from 'react-router-dom';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { getDefaultActions } from '../../f_forms/X_Actions';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js';
import { objectSections } from '../utils/objectSections.js'
import teamImage from '../../b_styleObjects/images/teamImage.png';
import Box from '@mui/joy/Box';
import Layout from './../../Layout.js';
import NavigationStatic from './../../c_navBar/NavigationStatic.js';
import TeamProfileLayout from './B_TeamProfileLayout';
import DesktopPanel from './C_DesktopPanel.js';
import EditImageDrawer from '../newContainers/EditImageDrawer.js';
import InfoViewController from './infoPanel/InfoPanelController.js';
import MobilePlayersPanel from './playersPanel/mobile/A_MobilePlayersPanel.js';
import MobileTeamPerformancePanel from './performancePanel/mobile/A_MobileTeamPerformancePanel.js';

export default function TeamDashboard(props) {
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { teamId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [editImageOpen, setEditImageOpen] = useState(false);

  const { showSnackbar } = useSnackbar();

  const team = teams?.find((t) => t.id === teamId);

  const editTeamActions = getDefaultQuickActions({ type: 'teams' });

  const addPlayerActions = getDefaultActions({ type: 'players' });
  const editPlayerActions = getDefaultQuickActions({ type: 'players' });

  const addGameActions = getDefaultActions({ type: 'games' });
  const editGameActions = getDefaultQuickActions({ type: 'games' });

  const addGameStatsActions = getDefaultActions({ type: 'gameStats' });
  const editGameStatsActions = getDefaultQuickActions({ type: 'gameStats' });

  const teamPlayers = players.filter((p) => p.teamId === team.id);
  const teamGames = games.filter(i=>i.teamId === team.id)
  
  const actions = {
    editTeam: editTeamActions,
    onAddPlayer: async (data, internalActions) => {
      await addPlayerActions.onAdd(data, internalActions);
      showSnackbar('שחקן נוסף לקבוצה');
    },
    onEditPlayer: async (data, internalActions) => {
      await editPlayerActions.onEdit(data, internalActions);
      showSnackbar('מידע על השחקן עודכן');
    },

    onAddGame: async (data, internalActions) => {
      await addGameActions.onAdd(data, internalActions);
      showSnackbar('משחק נוסף');
    },
    onEditGame: async (data, internalActions) => {
      await editGameActions.onEdit(data, internalActions);
      showSnackbar('מידע על המשחק עודכן');
    },
    onDeleteGame: async (game) => {
      await deleteGame(game, showSnackbar, allShorts);
    },

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
    team,
    statsParm,
    actions,
    tabValue,
    formProps,
    allShorts,
  };

  return (
    <React.Fragment>
      <Layout.SideNav>
        <NavigationStatic {...newProps} id="teamDashboard" />
      </Layout.SideNav>

      <Layout.Main>
        <TeamProfileLayout
          object={team}
          type="teams"
          view="profileTeam"
          isMobile={isMobile}
          name={team?.teamName}
          avatarSrc={team?.photo !== '' ? team.photo : teamImage}
          subTitle={team?.teamClub?.clubName}
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
                        team={team}
                        actions={actions}
                        isMobile={true}
                        formProps={formProps}
                        sections={objectSections.teams}
                      />
                    ),
                  },
                  {
                    label: 'שחקנים',
                    iconId: 'players',
                    content: (
                      <MobilePlayersPanel
                        {...newProps}
                        teamPlayers={teamPlayers}
                        view="profileTeam"
                      />
                    )
                  },
                  {
                    label: 'ביצועים',
                    iconId: 'performance',
                    content: (
                      <MobileTeamPerformancePanel
                        team={team}
                        actions={actions}
                        formProps={formProps}
                        statsParm={statsParm}
                        view="profileTeam"
                        allShorts={allShorts}
                        teamGames={team.teamGames}
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
                  {
                    label: 'וידאו',
                    iconId: 'video',
                    content: <Box>וידאו</Box>
                  },
                ],
              }
            : {
                tabs: [],
                children: (
                  <DesktopPanel
                    {...newProps}
                    view="profileTeam"
                    actions={actions}
                    teamGames={teamGames}
                    teamPlayers={teamPlayers}
                  />
                )
              })}
        />

        <EditImageDrawer
          open={editImageOpen}
          onClose={() => setEditImageOpen(false)}
          item={team}
          type="team"
          onEdit={actions.editTeam.onEdit}
        />
      </Layout.Main>
    </React.Fragment>
  );
}
