// 📁 bottomTabUtils/tables/videoTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider, Tooltip } from '@mui/joy';
import JoyStarRating from '../../../../h_componnetsUtils/rating/JoyStarRating.js';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { optionTypePlayer, optionProjectStatus } from '../../../../x_utils/optionLists.js';
import { formatPhoneNumber } from '../../../../x_utils/contactUtiles.js'
import { wraperBoxProps } from './X_Style'

const getStatusMeta = (statusId) => {
  const meta = optionProjectStatus.find(o => o.id === statusId);
  return meta || { id: '', labelH: 'לא צוין', idIcon: 'info', color: 'neutral' };
};

const hasStatus = (item) => {
  if (!item || typeof item.projectStatus !== 'string') return false;
  const s = item.projectStatus.trim();
  return s !== '' && s !== 'approved';
};

const StatusBadge = ({ statusId, isMobile = false }) => {
  const meta = getStatusMeta(statusId);
  return (
    <Box
      sx={(theme) => {
        const p = theme.vars.palette[meta.color] || theme.vars.palette.neutral;
        const sz = isMobile ? 12 : 15;
        return {
          width: sz,
          height: sz,
          borderRadius: '50%',
          display: 'grid',
          backgroundColor: 'transparent',
          color: p.solidColor,
          border: '2px solid',
          borderColor: theme.vars.palette.background.surface,
        };
      }}
      aria-label={`סטטוס: ${meta.labelH}`}
    >
      {iconUi({ id: statusId, size: 'xs', sx: { backgroundColor: getStatusMeta(statusId).color, borderRadius: '50%' } })}
    </Box>
  );
};

const ProjectBadge = ({ isMobile = false }) => {
  return (
    <Box
      sx={(theme) => {
        const p = '#00ff00';
        const sz = isMobile ? 12 : 15;
        return {
          width: sz,
          height: sz,
          borderRadius: '50%',
          display: 'grid',
          backgroundColor: 'transparent',
          color: p.solidColor,
          border: '2px solid',
          borderColor: theme.vars.palette.background.surface,
        };
      }}
      aria-label={`סטטוס: project`}
    >
      {iconUi({ id: 'project', size: 'xs', sx: { backgroundColor: '#00ff00', borderRadius: '50%' } })}
    </Box>
  );
};

const photoCellMobile = (item) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <Avatar
      src={item.photo || playerImage}
      alt={item.playerFullName || 'ללא שם'}
      sx={{ width: 30, height: 30 }}
    />
    {hasStatus(item) && (
      <Box sx={{ position: 'absolute', bottom: -2, left: -3 }}>
        <StatusBadge statusId={item.projectStatus} isMobile />
      </Box>
    )}
  </Box>
);

const photoCellDesktop = (item) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <Avatar
      src={item.photo || playerImage}
      alt={item.playerFullName || 'ללא שם'}
      sx={{ width: 30, height: 30 }}
    />
    {hasStatus(item) && (
      <Tooltip title={getStatusMeta(item.projectStatus).labelH}>
        <Box sx={{ position: 'absolute', bottom: -3, left: -3 }}>
          <StatusBadge statusId={item.projectStatus} />
        </Box>
      </Tooltip>
    )}
    {item?.type === 'project' && (
      <Tooltip title={getStatusMeta(item.projectStatus).labelH}>
        <Box sx={{ position: 'absolute', bottom: -3, left: -3 }}>
          <ProjectBadge />
        </Box>
      </Tooltip>
    )}
  </Box>
);

export const getPlayersRowStructure = (isMobile, newActions, formProps, { type }) => {
  /// רוחב העמודות isMobile ? '20%' : '20%'
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const club = (clubId) => formProps.clubs.find(i=>i.id === clubId)
  const team = (teamId) => formProps.teams.find(i=>i.id === teamId)

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
          render: (item) => item.playerFullName || '-',
          width: '20%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          iconId: 'clubs',
          render: (item) => club(item.clubId).clubName || '-',
          width: '25%',
        },
        {
          id: 'teamName',
          label: 'קבוצה',
          iconId: 'teams',
          render: (item) => team(item.teamId).teamName || '-',
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
          label: 'שם שחקן',
          tooltip: 'שם השחקן',
          iconId: 'player',
          render: (item) => item.playerShortName !== '' ? item.playerShortName : item.playerFullName || '-',
          width: '10%',
        },
        {
          id: 'teamName',
          label: 'קבוצה',
          tooltip: 'שם הקבוצה',
          iconId: 'teams',
          render: (item) => team(item.teamId).teamName || '-',
          width: '10%',
        },
        {
          id: 'birth',
          label: 'שנתון',
          tooltip: 'שנתון',
          iconId: 'age',
          render: (item) => item.birth || '-',
          width: '10%',
        },
        {
          id: 'phone',
          label: 'נייד',
          tooltip: 'נייד',
          iconId: 'phone',
          render: (item) => {
            const isPhone = item.phone !== '000-0000000'
            return (
              <Typography level="title-xs" fontWeight={isPhone ? 'md' : 'sm'} >
                {formatPhoneNumber(item.phone)}
              </Typography>
            )
          },
          width: '10%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          tooltip: 'שם המועדון',
          iconId: 'clubs',
          render: (item) => club(item.clubId).clubName || '-',
          width: '10%',
        },
        {
          id: 'goals',
          label: '',
          tooltip: 'שערים שכבש',
          iconId: 'goals',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography level="body-xs" sx={{ mb: 0.5, color: 'neutral.500' }}>
                  {item.playerFullStats.goals}
                </Typography>
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
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography level="body-xs" sx={{ mb: 0.5, color: 'neutral.500' }}>
                  {item.playerFullStats.playTimeRate}%
                </Typography>
              </Box>
            )
          },
          width: '6%',
        },
        {
          id: 'level',
          label: 'יכולת',
          tooltip: 'יכולת',
          iconId: 'level',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <JoyStarRating value={item.level} size='sm' sx={{ direction: 'ltr' }} />
              </Box>
            )
          },
          width: '12%',
        },
        {
          id: 'potential',
          label: 'פוטנציאל',
          tooltip: 'פוטנציאל',
          iconId: 'level',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <JoyStarRating value={item.levelPotential} size='sm' sx={{ direction: 'ltr' }} />
              </Box>
            )
          },
          width: '12%',
        },
      ];

  const expandedRow = [
    {
      id: 'expandedForm',
      render: (item) => (
        <Box sx={{ px: 1 }}>
          <Box {...wraperBoxProps}>
            <Typography level="body-sm" fontWeight="lg" sx={{ mb: 1, textAlign: 'center' }}>
              פרטי יכולת שחקן
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
