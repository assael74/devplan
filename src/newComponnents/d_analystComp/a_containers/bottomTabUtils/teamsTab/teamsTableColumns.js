// 📁 bottomTabUtils/tables/videoTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider } from '@mui/joy';
import JoyStarRating from '../../../../h_componnetsUtils/rating/JoyStarRating.js';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { wraperBoxProps } from './X_Style'

export const getTeamsRowStructure = (isMobile, newActions, formProps, { type }) => {
  /// רוחב העמודות isMobile ? '20%' : '20%'
  const onEdit = newActions.onEdit || (() => {});
  const club = (clubId) => formProps.clubs.find(i=>i.id === clubId)
  const teamPlayers = (teamId) => formProps.players.filter(p=>p.teamId === teamId)
  const player = (playerId) => formProps.players.find(i=>i.id === playerId)
  const handleOpenDialog = newActions.handleOpenDialog
  const mainRow = isMobile
    ? [
        {
          id: 'photo',
          label: 'תמונת קבוצה',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={item.photo || teamImage}
                alt={item.teamName || 'ללא שם'}
              />
            </Box>
          ),
          width: '20%',
      },
        {
          id: 'name',
          label: 'שם קבוצה',
          iconId: 'teams',
          render: (item) => item.teamName || '-',
          width: '25%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          iconId: 'clubs',
          render: (item) => club(item.clubId).clubName || '-',
          width: '25%',
        },
        {
          id: 'players',
          label: 'שחקנים',
          iconId: 'players',
          render: (item) => teamPlayers(item.id).length,
          width: '10%'
        }
      ]
    : [
        {
          id: 'photo',
          label: 'תמונת קבוצה',
          tooltip: '',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={item.photo || teamImage}
                alt={item.teamName || 'ללא שם'}
              />
            </Box>
          ),
          width: '15%'
        },
        {
          id: 'name',
          label: 'שם קבוצה',
          tooltip: 'שם הקבוצה',
          iconId: 'teams',
          render: (item) => item.teamName || '-',
          width: '25%'
        },
        {
          id: 'clubName',
          label: 'מועדון',
          tooltip: 'שם המועדון',
          iconId: 'clubs',
          render: (item) => club(item.clubId).clubName || '-',
          width: '25%',
        },
        {
          id: 'players',
          label: 'שחקנים',
          tooltip: 'מספר שחקנים',
          iconId: 'players',
          render: (item) => teamPlayers(item.id).length,
          width: '15%'
        }
      ];

  const expandedRow = [
    {
      id: 'expandedForm',
      render: (item) => (
        <Box sx={{ px: 1 }}>
          <Box {...wraperBoxProps}>
            <Typography level="body-sm" fontWeight="lg" sx={{ mb: 1, textAlign: 'center' }}>
              פרטי יכולת הקבוצה
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
              {/* יכולת כללית */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography level="body-xs" sx={{ mb: 0.5, color: 'neutral.500' }}>
                  יכולת כללית
                </Typography>
                <JoyStarRating value={item.level} size="sm" sx={{ direction: 'ltr' }} />
              </Box>

              {/* פוטנציאל יכולת */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography level="body-xs" sx={{ mb: 0.5, color: 'neutral.500' }}>
                  פוטנציאל יכולת
                </Typography>
                <JoyStarRating value={item.levelPotential} size="sm" sx={{ direction: 'ltr' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      ),
    },
  ];

  return { mainRow, expandedRow };
};
