import React, { useState } from 'react';
import { Box } from '@mui/joy';
import { teamMenuConfig, clubMenuConfig, playerMenuConfig, paymentMenuConfig, scoutingMenuConfig } from '../a_layouts/X_menuConfig.js'
import { meetingMenuConfig, gameMenuConfig, videoMenuConfig, roleMenuConfig, tagMenuConfig } from '../a_layouts/X_menuConfig.js'
import { menuCardBoxProps, menuTableBoxProps } from './containersStyle/F_GenericEditMenuStyle.js';
import EditClubCard from '../../g_quickForms/A_EditClubCard.js'
import EditTeamCard from '../../g_quickForms/B_EditTeamCard.js'
import EditPlayerCard from '../../g_quickForms/C_EditPlayerCard.js'
import EditPaymentCard from '../../g_quickForms/D_EditPaymentCard.js'
import EditMeetingCard from '../../g_quickForms/E_EditMeetingCard.js'
import EditGameCard from '../../g_quickForms/I_EditGameCard.js'
import EditVideoCard from '../../g_quickForms/G_EditVideoCard.js'
import EditRoleCard from '../../g_quickForms/L_EditRoleCard.js'
import EditTagCard from '../../g_quickForms/H_EditTagCard.js'
import EditScoutingCard from '../../g_quickForms/M_EditScoutingCard.js'

export default function GenericEditMenu({
  type,
  item,
  view,
  update,
  actions,
  isMobile,
  columns,
  setUpdate,
  formProps,
  flexBasis,
  idDisplay,
  allShorts,
}) {
  const editComponentsMap = {
    clubs: EditClubCard,
    teams: EditTeamCard,
    players: EditPlayerCard,
    payments: EditPaymentCard,
    meetings: EditMeetingCard,
    games: EditGameCard,
    videos: EditVideoCard,
    roles: EditRoleCard,
    tags: EditTagCard,
    scouting: EditScoutingCard
  };

  const menuConfigFns = {
    clubs: clubMenuConfig,
    teams: teamMenuConfig,
    players: playerMenuConfig,
    payments: paymentMenuConfig,
    meetings: meetingMenuConfig,
    games: gameMenuConfig,
    videos: videoMenuConfig,
    roles: roleMenuConfig,
    tags: tagMenuConfig,
    scouting: scoutingMenuConfig
  };

  const DynamicEditComponent = editComponentsMap[type] || null;
  const menuConfigFn = menuConfigFns[type] || (() => []);

  if (!DynamicEditComponent) return null;

  return (
    <Box
      {...(idDisplay === 'cardList'
        ? menuCardBoxProps({ isMobile, flexBasis, columns })
        : null
      )}
    >
      <DynamicEditComponent
        type={type}
        item={item}
        view={view}
        update={update}
        columns={columns}
        actions={actions}
        isMobile={isMobile}
        allShorts={allShorts}
        formProps={formProps}
        onChange={setUpdate}
        idDisplay={idDisplay}
        menuConfig={menuConfigFn(item)}
        onSubmit={({ oldItem, newItem }) => {
          const addOld = { ...oldItem, id: item.id };
          const addNew = { ...newItem, id: item.id };
          const derivedType = type === 'videos' ? item.type : type;

          const isProfilePlayer = view === 'profilePlayer';
          const isPlayersEdit   = derivedType === 'players';
          const isGamesEdit     = derivedType === 'games';
          const isPersonalStatsEdit = isGamesEdit && isProfilePlayer

          if (isPersonalStatsEdit) {
            actions.onEditStats({
              oldItem: addOld,
              newItem: addNew,
              type: 'playerGameStats',
            });
            return;
          }

          actions.onEdit?.({
            oldItem: addOld,
            newItem: addNew,
            type: derivedType,
          });
        }}
      />
    </Box>
  );
}
