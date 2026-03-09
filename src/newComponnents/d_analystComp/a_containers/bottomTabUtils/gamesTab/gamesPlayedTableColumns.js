// 📁 bottomTabUtils/tables/meetingTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider, Tooltip } from '@mui/joy';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { typoCellProps, typoStatus, dateCellProps, typoDate, typoHeadDate, resultBox, typoRivel } from './X_Style'
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js'
import { gameTypeOptions, gameDifficultyOptions } from '../../../../x_utils/optionLists.js';
import { getFullDateIl, getDayName } from '../../../../x_utils/dateUtiles.js'
import { statusStats } from '../../../../x_utils/statsUtils.js'
import EditExpanGame from '../../../../g_quickForms/quickExpandForm/I_EditExpanGame.js'

const getColumnsForProfileTeam = (isMobile, newActions, formProps) => {
  // רוחב העמודות isMobile ? '20%' : '20%'
  const handleOpenDialog = newActions.handleOpenDialog;
  const getTeamName = (teamId) => {
    const team = formProps?.teams?.find(i => i.id === teamId);
    return team?.teamName || 'לא ידוע';
  };
  const getClubName = (clubId) => {
    const club = formProps?.clubs?.find(i => i.id === clubId);
    return club?.clubName || 'לא ידוע';
  };
  const typeItem = (item) => gameTypeOptions.find((p) => p.id === item.type) || {};
  const difficultyItem = (item) => gameDifficultyOptions.find((p) => p.id === item.difficulty) || {};
  const stStats = (item, params) => statusStats(item, params)

  if (isMobile) {
    return [
      {
        id: 'team',
        label: 'קבוצה',
        iconId: 'teams',
        render: (item) => {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography level='title-sm' sx={{ fontWeight: 'bold', fontSize: '10px' }}>
                {getTeamName(item.teamId) || '-'}
              </Typography>
              <Typography level='body-sm' sx={{ fontSize: '10px' }}>
                {getClubName(item.clubId) || '-'}
              </Typography>
            </Box>
          )
        },
        width: '20%',
      },
      {
        id: 'rivel',
        label: 'יריבה',
        iconId: 'rivel',
        render: (item) => {
          const diffToColor = { easy: 'success.600', hard: 'danger.600' };
          const color = diffToColor[item.difficulty];
          const base = typoRivel(isMobile, item.rivel);

          return (
            <Box sx={{ width: '100%', maxWidth: isMobile ? 90 : 160, mx: 'auto', minWidth: 0 }}>
              <Typography
                component="span"
                {...base}
                textColor={color}
                sx={{ ...(base?.sx || {}), ...(color ? { color } : {}) }}
                title={item.rivel || '-'}
              >
                {item.rivel || '-'}
              </Typography>
            </Box>
          );
        },
        width: '20%',
      },
      {
        id: 'date',
        label: 'תאריך',
        iconId: 'meeting',
        render: (item) => (
          <Box {...dateCellProps}>
            <Box>
              <Typography component="span" {...typoHeadDate(isMobile)}>
                {getFullDateIl(item.gameDate, isMobile)}
              </Typography>
            </Box>
            <Typography {...typoDate(isMobile)}>
             {isMobile ? item.gameHour : item.gameHour | ' '}
            </Typography>
          </Box>
        ),
        width: '20%',
      },
      {
        id: 'result',
        label: 'תוצאה',
        iconId: 'goals',
        render: (item) => {
          const color = item.result === 'win'  ? 'success.600' : item.result === 'loss' ? 'danger.600' : undefined;
          return (
            <Box {...resultBox(color)}>
              <Typography {...typoHeadDate(isMobile)}> {item.goalsFor} </Typography>
              -
              <Typography {...typoHeadDate(isMobile)}> {item.goalsAgainst} </Typography>
            </Box>
          )
        },
        width: '10%',
      },
      {
        id: 'home',
        label: 'בית / חוץ',
        iconId: 'home',
        render: (item) => {
          const color = item.home ? '#6aa84f' : '#f44336'
          return (
            <Box {...typoCellProps}>
              {iconUi({id: 'home', size: isMobile ? 'sm' : 'md', sx: { color: color } })}
            </Box>
          )
        },
        width: '10%',
      },
    ];
  }

  // Desktop
  return [
    {
      id: 'team',
      label: 'קבוצה',
      tooltip: '',
      iconId: 'teams',
      render: (item) => {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography level='title-sm' sx={{ fontWeight: 'bold', fontSize: '12px' }}>
              {getTeamName(item.teamId) || '-'}
            </Typography>
            <Typography level='body-sm' sx={{ fontSize: '12px' }}>
              {getClubName(item.clubId) || '-'}
            </Typography>
          </Box>
        )
      },
      width: '15%',
    },
    {
      id: 'rivel',
      label: 'יריבה',
      tooltip: '',
      iconId: 'rivel',
      render: (item) => item.rivel || '-',
      width: '15%',
    },
    {
      id: 'result',
      label: 'תוצאה',
      tooltip: '',
      iconId: 'goals',
      render: (item) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography> {item.goalsFor} </Typography>
            -
            <Typography component="span" sx={{ display: 'inline' }}> {item.goalsAgainst} </Typography>
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'date',
      label: 'תאריך',
      tooltip: '',
      iconId: 'meeting',
      render: (item) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>
              {getFullDateIl(item.gameDate, isMobile)}
            </Typography>
          </Box>
        )
      },
      width: '15%',
    },
    {
      id: 'home',
      label: 'בית / חוץ',
      tooltip: '',
      iconId: 'home',
      render: (item) => {
        const color = item.home ? '#6aa84f' : '#f44336'
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Typography {...typoStatus}>{item.home ? 'בית' : 'חוץ'}</Typography>
            {iconUi({id: 'home', size: isMobile ? 'sm' : 'md', sx: { color: color } })}
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'type',
      label: 'סוג',
      tooltip: '',
      iconId: 'cup',
      render: (item) => {
        const type = typeItem(item).labelH
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Typography {...typoStatus}>{type}</Typography>
            {iconUi({id: typeItem(item).idIcon, size: isMobile ? 'sm' : 'md' })}
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'difficulty',
      label: 'קושי',
      tooltip: '',
      iconId: 'hard',
      render: (item) => {
        const difficulty = difficultyItem(item).labelH
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Typography {...typoStatus}>{difficulty}</Typography>
            {iconUi({id: difficultyItem(item).idIcon, size: isMobile ? 'sm' : 'md' })}
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'stats',
      label: '',
      tooltip: '',
      iconId: 'stats',
      render: (item) => {
        const st = stStats(item, formProps.statsParm).status
        const statsColor = st === 'full' ? '#2e7d32' : st === 'partial' ? '#ed6c02' : '#9e9e9e';
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: statsColor }} />
          </Box>
        )
      },
      width: '5%',
    },
  ];
};

const getColumnsForProfilePlayer = (isMobile, newActions, formProps) => {
  // רוחב העמודות isMobile ? '20%' : '20%'
  const handleOpenDialog = newActions.handleOpenDialog;
  const getTeamName = (teamId) => {
    const team = formProps?.teams?.find(i => i.id === teamId);
    return team?.teamName || 'לא ידוע';
  };
  const getClubName = (clubId) => {
    const club = formProps?.clubs?.find(i => i.id === clubId);
    return club?.clubName || 'לא ידוע';
  };
  const typeItem = (item) => gameTypeOptions.find((p) => p.id === item.type) || {};
  const difficultyItem = (item) => gameDifficultyOptions.find((p) => p.id === item.difficulty) || {};
  const stStats = (item, params) => statusStats(item, params)

  if (isMobile) {
    return [
      {
        id: 'team',
        label: 'קבוצה',
        iconId: 'teams',
        render: (item) => {
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography level='title-sm' sx={{ fontWeight: 'bold', fontSize: '10px' }}>
                {getTeamName(item.teamId) || '-'}
              </Typography>
              <Typography level='body-sm' sx={{ fontSize: '10px' }}>
                {getClubName(item.clubId) || '-'}
              </Typography>
            </Box>
          )
        },
        width: '20%',
      },
      {
        id: 'rivel',
        label: 'יריבה',
        iconId: 'rivel',
        render: (item) => {
          const diffToColor = { easy: 'success.600', hard: 'danger.600' };
          const color = diffToColor[item.difficulty];
          const base = typoRivel(isMobile, item.rivel);

          return (
            <Box sx={{ width: '100%', maxWidth: isMobile ? 90 : 160, mx: 'auto', minWidth: 0 }}>
              <Typography
                component="span"
                {...base}
                textColor={color}
                sx={{ ...(base?.sx || {}), ...(color ? { color } : {}) }}
                title={item.rivel || '-'}
              >
                {item.rivel || '-'}
              </Typography>
            </Box>
          );
        },
        width: '20%',
      },
      {
        id: 'date',
        label: 'תאריך',
        iconId: 'meeting',
        render: (item) => (
          <Box {...dateCellProps}>
            <Box>
              <Typography component="span" {...typoHeadDate(isMobile)}>
                {getFullDateIl(item.gameDate, isMobile)}
              </Typography>
            </Box>
            <Typography {...typoDate(isMobile)}>
             {isMobile ? item.gameHour : item.gameHour | ' '}
            </Typography>
          </Box>
        ),
        width: '20%',
      },
      {
        id: 'result',
        label: 'תוצאה',
        iconId: 'goals',
        render: (item) => {
          const color = item.result === 'win'  ? 'success.600' : item.result === 'loss' ? 'danger.600' : undefined;
          return (
            <Box {...resultBox(color)}>
              <Typography {...typoHeadDate(isMobile)}> {item.goalsFor} </Typography>
              -
              <Typography {...typoHeadDate(isMobile)}> {item.goalsAgainst} </Typography>
            </Box>
          )
        },
        width: '10%',
      },
      {
        id: 'home',
        label: 'בית / חוץ',
        iconId: 'home',
        render: (item) => {
          const color = item.home ? '#6aa84f' : '#f44336'
          return (
            <Box {...typoCellProps}>
              {iconUi({id: 'home', size: isMobile ? 'sm' : 'md', sx: { color: color } })}
            </Box>
          )
        },
        width: '10%',
      },
    ];
  }

  // Desktop
  return [
    {
      id: 'team',
      label: 'קבוצה',
      tooltip: 'שם הקבוצה',
      iconId: 'teams',
      render: (item) => {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography level='title-sm' sx={{ fontWeight: 'bold', fontSize: '12px' }}>
              {getTeamName(item.teamId) || '-'}
            </Typography>
            <Typography level='body-sm' sx={{ fontSize: '12px' }}>
              {getClubName(item.clubId) || '-'}
            </Typography>
          </Box>
        )
      },
      width: '15%',
    },
    {
      id: 'rivel',
      label: 'יריבה',
      tooltip: 'שם היריבה',
      iconId: 'rivel',
      render: (item) => item.rivel || '-',
      width: '15%',
    },
    {
      id: 'result',
      label: 'תוצאה',
      tooltip: 'תוצאת המשחק',
      iconId: 'goals',
      render: (item) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography> {item.goalsFor} </Typography>
            -
            <Typography component="span" sx={{ display: 'inline' }}> {item.goalsAgainst} </Typography>
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'date',
      label: 'תאריך',
      tooltip: 'תאריך המשחק',
      iconId: 'meeting',
      render: (item) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Typography component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>
              {getFullDateIl(item.gameDate, isMobile)}
            </Typography>
          </Box>
        )
      },
      width: '15%',
    },
    {
      id: 'home',
      label: 'בית / חוץ',
      tooltip: 'משחק בית או חוץ',
      iconId: 'home',
      render: (item) => {
        const color = item.home ? '#6aa84f' : '#f44336'
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Typography {...typoStatus}>{item.home ? 'בית' : 'חוץ'}</Typography>
            {iconUi({id: 'home', size: isMobile ? 'sm' : 'md', sx: { color: color } })}
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'type',
      label: 'סוג',
      tooltip: 'סוג המשחק',
      iconId: 'cup',
      render: (item) => {
        const type = typeItem(item).labelH
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Typography {...typoStatus}>{type}</Typography>
            {iconUi({id: typeItem(item).idIcon, size: isMobile ? 'sm' : 'md' })}
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'difficulty',
      label: 'קושי',
      tooltip: 'קושי היריבה',
      iconId: 'hard',
      render: (item) => {
        const difficulty = difficultyItem(item).labelH
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Typography {...typoStatus}>{difficulty}</Typography>
            {iconUi({id: difficultyItem(item).idIcon, size: isMobile ? 'sm' : 'md' })}
          </Box>
        )
      },
      width: '10%',
    },
    {
      id: 'stats',
      label: '',
      tooltip: 'האם יש סטטיסטיקה',
      iconId: 'stats',
      render: (item) => {
        const st = stStats(item, formProps.statsParm).status
        const statsColor = st === 'full' ? '#2e7d32' : st === 'partial' ? '#ed6c02' : '#9e9e9e';
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: statsColor }} />
          </Box>
        )
      },
      width: '5%',
    },
  ];
};

export const getGamesPlayedRowStructure = (isMobile, newActions, formProps, { type }, view) => {
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const getTeamName = (teamId) => {
    const team = formProps?.teams?.find(i => i.id === teamId);
    return team?.teamName || 'לא ידוע';
  };
  const getClubName = (clubId) => {
    const club = formProps?.clubs?.find(i => i.id === clubId);
    return club?.clubName || 'לא ידוע';
  };
  const typeItem = (item) => gameTypeOptions.find((p) => p.id === item.type) || {};
  const difficultyItem = (item) => gameDifficultyOptions.find((p) => p.id === item.difficulty) || {};
  const stStats = (item, params) => statusStats(item, params)

  const mainRow = view === 'profilePlayer'
  ? getColumnsForProfilePlayer(isMobile, newActions, formProps)
  : isMobile
    ? [
        {
          id: 'team',
          label: 'קבוצה',
          iconId: 'teams',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography level='title-sm' sx={{ fontWeight: 'bold', fontSize: '10px' }}>
                  {getTeamName(item.teamId) || '-'}
                </Typography>
                <Typography level='body-sm' sx={{ fontSize: '10px' }}>
                  {getClubName(item.clubId) || '-'}
                </Typography>
              </Box>
            )
          },
          width: '25%',
        },
        {
          id: 'rivel',
          label: 'יריבה',
          iconId: 'rivel',
          render: (item) => {
            const diffToColor = { easy: 'success.600', hard: 'danger.600' };
            const color = diffToColor[item.difficulty];
            const base = typoRivel(isMobile, item.rivel);

            return (
              <Box sx={{ width: '100%', maxWidth: isMobile ? 90 : 160, mx: 'auto', minWidth: 0 }}>
                <Typography
                  component="span"
                  {...base}
                  textColor={color}
                  sx={{ ...(base?.sx || {}), ...(color ? { color } : {}) }}
                  title={item.rivel || '-'}
                >
                  {item.rivel || '-'}
                </Typography>
              </Box>
            );
          },
          width: '25%',
        },
        {
          id: 'date',
          label: 'תאריך',
          iconId: 'meeting',
          render: (item) => (
            <Box {...dateCellProps}>
              <Box>
                <Typography component="span" {...typoHeadDate(isMobile)}>
                  {getFullDateIl(item.gameDate, isMobile)}
                </Typography>
              </Box>
              <Typography {...typoDate(isMobile)}>
               {isMobile ? item.gameHour : item.gameHour | ' '}
              </Typography>
            </Box>
          ),
          width: '20%',
        },
        {
          id: 'result',
          label: 'תוצאה',
          iconId: 'goals',
          render: (item) => {
            const color = item.result === 'win'  ? 'success.600' : item.result === 'loss' ? 'danger.600' : undefined;
            return (
              <Box {...resultBox(color)}>
                <Typography {...typoHeadDate(isMobile)}> {item.goalsFor} </Typography>
                -
                <Typography {...typoHeadDate(isMobile)}> {item.goalsAgainst} </Typography>
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'home',
          label: 'בית / חוץ',
          iconId: 'home',
          render: (item) => {
            const color = item.home ? '#6aa84f' : '#f44336'
            return (
              <Box {...typoCellProps}>
                {iconUi({id: 'home', size: isMobile ? 'sm' : 'md', sx: { color: color } })}
              </Box>
            )
          },
          width: '10%',
        },
      ]
    : [
        {
          id: 'team',
          label: 'קבוצה',
          tooltip: 'שם הקבוצה',
          iconId: 'teams',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography level='title-sm' sx={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {getTeamName(item.teamId) || '-'}
                </Typography>
                <Typography level='body-sm' sx={{ fontSize: '12px' }}>
                  {getClubName(item.clubId) || '-'}
                </Typography>
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'rivel',
          label: 'יריבה',
          tooltip: 'שם היריבה',
          iconId: 'rivel',
          render: (item) => item.rivel || '-',
          width: '10%',
        },
        {
          id: 'result',
          label: 'תוצאה',
          tooltip: 'תוצאת המשחק',
          iconId: 'goals',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Typography> {item.goalsFor} </Typography>
                -
                <Typography component="span" sx={{ display: 'inline' }}> {item.goalsAgainst} </Typography>
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'date',
          label: 'תאריך',
          tooltip: 'תאריך המשחק',
          iconId: 'meeting',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Typography component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>
                  {getFullDateIl(item.gameDate, isMobile)}
                </Typography>
              </Box>
            )
          },
          width: '15%',
        },
        {
          id: 'home',
          label: 'בית / חוץ',
          tooltip: 'משחק בית או חוץ',
          iconId: 'home',
          render: (item) => {
            const color = item.home ? '#6aa84f' : '#f44336'
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Typography {...typoStatus}>{item.home ? 'בית' : 'חוץ'}</Typography>
                {iconUi({id: 'home', size: isMobile ? 'sm' : 'md', sx: { color: color } })}
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'type',
          label: 'סוג',
          tooltip: 'סוג המשחק',
          iconId: 'cup',
          render: (item) => {
            const type = typeItem(item).labelH
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Typography {...typoStatus}>{type}</Typography>
                {iconUi({id: typeItem(item).idIcon, size: isMobile ? 'sm' : 'md' })}
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'difficulty',
          label: 'קושי',
          tooltip: 'קושי היריבה',
          iconId: 'hard',
          render: (item) => {
            const difficulty = difficultyItem(item).labelH
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Typography {...typoStatus}>{difficulty}</Typography>
                {iconUi({id: difficultyItem(item).idIcon, size: isMobile ? 'sm' : 'md' })}
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'stats',
          label: '',
          tooltip: 'האם קיימת סטטיסטיקה',
          iconId: 'stats',
          render: (item) => {
            const st = stStats(item, formProps.statsParm).status
            const statsColor = st === 'full' ? '#2e7d32' : st === 'partial' ? '#ed6c02' : '#9e9e9e';
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: statsColor }} />
              </Box>
            )
          },
          width: '5%',
        },
      ];

      const expandedRow = [
        {
          id: 'expandedForm',
          render: (item) => (
            <EditExpanGame
              item={item}
              formProps={formProps}
              actions={newActions}
              type="games"
              view={view}
            />
          )
        },
      ];

  return { mainRow, expandedRow };
};
