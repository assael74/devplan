// 📁 bottomTabUtils/tables/videoTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider } from '@mui/joy';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import EditExpanClub from '../../../../g_quickForms/quickExpandForm/B_EditExpanClub.js'

export const getClubsRowStructure = (isMobile, newActions, formProps, { type }) => {
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const clubPlayers = (clubId) => formProps.players.filter(p=>p.clubId === clubId)
  const clubTeams = (clubId) => formProps.teams.filter(p=>p.clubId === clubId)
  const mainRow = isMobile
    ? [
        {
          id: 'photo',
          label: 'תמונת מועדון',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={item.photo || clubImage}
                alt={item.clubName || 'ללא שם'}
              />
            </Box>
          ),
          width: '20%',
        },
        {
          id: 'name',
          label: 'שם מועדון',
          iconId: 'clubs',
          render: (item) => item.clubName || '-',
          width: '30%',
        },
        {
          id: 'teams',
          label: 'Teams',
          iconId: 'teams',
          render: (item) => clubTeams(item.id).length,
          width: '10%'
        },
        {
          id: 'players',
          label: 'Players',
          iconId: 'players',
          render: (item) => clubPlayers(item.id).length,
          width: '10%',
        },
      ]
    : [
        {
          id: 'photo',
          label: 'תמונת מועדון',
          tooltip: '',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={item.photo || clubImage}
                alt={item.clubName || 'ללא שם'}
              />
            </Box>
          ),
          width: '15%',
        },
        {
          id: 'name',
          label: 'שם מועדון',
          tooltip: 'שם המועדון',
          iconId: 'clubs',
          render: (item) => item.clubName || '-',
          width: '35%',
        },
        {
          id: 'teams',
          label: 'קבוצות',
          tooltip: 'מספר הקבוצות',
          iconId: 'teams',
          render: (item) => clubTeams(item.id).length,
          width: '15%'
        },
        {
          id: 'players',
          label: 'שחקנים',
          tooltip: 'מספר השחקנים',
          iconId: 'players',
          render: (item) => clubPlayers(item.id).length,
          width: '15%',
        },
      ];

      const expandedRow = [
        {
          id: 'expandedForm',
          render: (item) => (
            <EditExpanClub
              item={item}
              formProps={formProps}
              actions={newActions}
              type="clubs"
            />
          )
        },
      ];

  return { mainRow, expandedRow };
};
