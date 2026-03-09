// 📁 bottomTabUtils/tables/videoTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider, Tooltip, Table } from '@mui/joy';
import JoyStarRating from '../../../../h_componnetsUtils/rating/JoyStarRating.js';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { optionTypePlayer, optionProjectStatus } from '../../../../x_utils/optionLists.js';
import { formatPhoneNumber } from '../../../../x_utils/contactUtiles.js'
import { wraperBoxProps, linkBoxProps, positionsBoxProp, tableProps } from './X_Style'

const photoCellMobile = (item) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <Avatar
      src={item.photo || playerImage}
      alt={item.playerFullName || 'ללא שם'}
      sx={{ width: 30, height: 30 }}
    />
  </Box>
);

const photoCellDesktop = (item) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <Avatar
      src={item.photo || playerImage}
      alt={item.playerFullName || 'ללא שם'}
      sx={{ width: 30, height: 30 }}
    />
  </Box>
);

const boxItem = (item) => {
  return (
    <Box component="span" sx={{ color: item ? 'success.500' : 'danger.500', fontWeight: 700 }}>
      {item ? '✓' : '✗'}
    </Box>
  )
};

function ScoutExpandedRow({ item }) {
  const games = [...(item.games || [])].sort((a, b) => (a.gameNum ?? 0) - (b.gameNum ?? 0));

  if (!games.length) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', opacity: 0.6 }}>
        אין נתוני משחק להצגה
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Table {...tableProps}>
        <thead>
          <tr>
            <th>מחזור</th>
            <th>יריבה</th>
            <th>דקות</th>
            <th>משך</th>
            <th>שערים</th>
            <th>בסגל</th>
            <th>פתח</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g, idx) => {
            return (
              <tr key={idx}>
                <td>{g.gameNum || '-'}</td>
                <td>{g.rivel || '-'}</td>
                <td>{g.timePlayed ?? '-'}</td>
                <td>{g.gameDuration ?? '-'}</td>
                <td>{g.scored ?? '-'}</td>
                <td>{boxItem(g.isSelected)}</td>
                <td>{boxItem(g.isStarting)}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      {/* טבלת סטטיסטיקה מצטברת */}
      <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
        <Box>
          <Typography level="body-sm">סה"כ משחקים:</Typography>
          <Typography>{item.scoutStats?.gamesCount ?? 0}</Typography>
        </Box>

        <Box>
          <Typography level="body-sm">סה"כ דקות:</Typography>
          <Typography>{item.scoutStats?.timePlayed ?? 0}</Typography>
        </Box>

        <Box>
          <Typography level="body-sm">אחוז משחק:</Typography>
          <Typography>{item.scoutStats?.playTimeRate ?? 0}%</Typography>
        </Box>

        <Box>
          <Typography level="body-sm">שערים:</Typography>
          <Typography>{item.scoutStats?.goals ?? 0}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export const getScoutingRowStructure = (isMobile, newActions, formProps, { type }) => {
  /// רוחב העמודות isMobile ? '20%' : '20%'
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog

  const mainRow = isMobile
    ? [
        {
          id: 'photo',
          label: 'תמונת שחקן',
          iconId: 'photo',
          render: (item) => photoCellMobile(item),
          width: '15%',
        },
        {
          id: 'name',
          label: 'שם שחקן',
          iconId: 'player',
          render: (item) => item.playerName || '-',
          width: '20%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          iconId: 'clubs',
          render: (item) => item.clubName || '-',
          width: '25%',
        },
        {
          id: 'teamName',
          label: 'קבוצה',
          iconId: 'teams',
          render: (item) => item.teamName || '-',
          width: '20%',
        },
      ]
    : [
        {
          id: 'photo',
          label: '',
          tooltip: '',
          iconId: 'photo',
          render: (item) => photoCellDesktop(item),
          width: '5%'
        },
        {
          id: 'name',
          label: '',
          tooltip: 'שם שחקן',
          iconId: 'player',
          render: (item) => item.playerName || '-',
          width: '10%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          tooltip: 'שם מועדון',
          iconId: 'clubs',
          render: (item) => item.clubName || '-',
          width: '10%',
        },
        {
          id: 'teamName',
          label: 'קבוצה',
          tooltip: 'שם קבוצה',
          iconId: 'teams',
          render: (item) => item.teamName || '-',
          width: '10%',
        },
        {
          id: 'birth',
          label: '',
          tooltip: 'שנתון',
          iconId: 'age',
          render: (item) => item.birth || '-',
          width: '5%',
        },
        {
          id: 'position',
          label: '',
          tooltip: 'עמדה',
          iconId: 'position',
          render: (item) => {
            const positions = Array.isArray(item.positions) ? item.positions : [];
            const text = positions.join(', ');
            return (
              <Box {...positionsBoxProp} title={text}>
                {text}
              </Box>
            )
          },
          width: '5%',
        },
        {
          id: 'goals',
          label: '',
          tooltip: 'שערים',
          iconId: 'goals',
          render: (item) => {
            const scored = item.scoutStats.goals
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {`${scored}`}
              </Box>
            )
          },
          width: '5%',
        },
        {
          id: 'min',
          label: '',
          tooltip: 'דקות משחק',
          iconId: 'time',
          render: (item) => {
            const stats = item.scoutStats.playTimeRate
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {`${stats}%`}
              </Box>
            )
          },
          width: '5%',
        },
        {
          id: 'isStart',
          label: '',
          tooltip: 'פתח בהרכב',
          iconId: 'isStart',
          render: (item) => {
            const starts = Number(item?.scoutStats?.isStarting) || 0;
            const games = Number(item?.scoutStats?.gamesCount) || 0;
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {`${games} / ${starts}`}
              </Box>
            )
          },
          width: '5%',
        },
        {
          id: 'league',
          label: 'ליגה',
          tooltip: 'ליגה',
          iconId: 'league',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {item.league}
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'link',
          label: '',
          tooltip: 'קישור',
          iconId: 'link',
          render: (item) => {
            const link = item.ifaLink;

            if (!link) {
              return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0.4 }}>
                  {iconUi({ id: 'link' })}
                </Box>
              );
            }

            return (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(link, '_blank', 'noopener,noreferrer');
                }}
                {...linkBoxProps}
              >
                {iconUi({ id: 'link' })}
              </Box>
            );
          },
          width: '5%',
        },
      ];

  const expandedRow = [
    {
      id: 'expandedForm',
      render: (item) => { return <ScoutExpandedRow item={item} /> },
    },
  ];

  return { mainRow, expandedRow };
};
