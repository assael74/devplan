import React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { typeBackground } from '../../../b_styleObjects/Colors.js'
import { avatarBoxProps, chipAvatarProps } from './X_Style'
import { optionProjectStatus } from '../../../x_utils/optionLists.js';
import clubImage from '../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../b_styleObjects/images/teamImage.png';
import { Box, Chip, Avatar, Tooltip, useTheme } from '@mui/joy';

const getStatusMeta = (statusId) => {
  const meta = optionProjectStatus.find(o => o.id === statusId);
  return meta || { id: '', labelH: 'לא צוין', idIcon: 'info', color: 'neutral' };
};

export const getAvatarWithChip = (type, item, flexBasis, isMobile, formProps, opts = {}) => {
  const { statusPlacement = 'avatar', showWhenEmpty = false } = opts;

  const StatusBadge = ({ statusId }) => {
    const meta = getStatusMeta(statusId);
    return (
      <Box
        sx={(theme) => {
          const sz = isMobile ? 16 : 16;
          return {
            width: sz,
            height: sz,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            border: '2px solid',
            borderColor: theme.vars.palette.background.surface,
          };
        }}
      >
        {iconUi({ id: statusId, size: 'xs', sx: { backgroundColor: meta.color, color: meta.icCol, borderRadius: '50%' } })}
      </Box>
    );
  }

  switch (type) {
    case 'players': {
      const birthYear =
        item.birth?.length === 4 ? item.birth : item.birth?.split('-')[1] || '';
      const playerPhoto = item.photo !== '' ? item.photo : playerImage;

      const hasStatus = (item) => {
        if (!item || typeof item.projectStatus !== 'string') return false;
        const s = item.projectStatus.trim();
        return s !== '' && s !== 'approved';
      };
      const shouldShow = showWhenEmpty ? true : hasStatus(item);

      return (
        <Box {...avatarBoxProps(flexBasis)} sx={{ position: 'relative' }}>
          <Avatar
            src={playerPhoto}
            sx={{ width: isMobile ? 30 : 35, height: isMobile ? 30 : 35 }}
          />

          {/* באדג' על האווטאר */}
          {shouldShow && (statusPlacement === 'avatar' || statusPlacement === 'both') && (
            <Tooltip title={getStatusMeta(item.projectStatus).labelH}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 15,
                  left: -8,
                  insetInlineEnd: -2,
                }}
                aria-label={`סטטוס: ${getStatusMeta(item.projectStatus).labelH}`}
              >
                <StatusBadge statusId={item.projectStatus} />
              </Box>
            </Tooltip>
          )}

          {/* Chip של שנתון + אינדיקציה בתוך ה-Chip */}
          <Chip
            variant="outlined"
            size='sm'
            sx={{
              mt: -2.5,
              '--Chip-minHeight': '16px',
              fontSize: isMobile ? '0.55rem' : '0.75rem',
              px: 0.5,
              borderRadius: 'md',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}
            endDecorator={
              shouldShow && (statusPlacement === 'chip' || statusPlacement === 'both') ? (
                <Tooltip title={getStatusMeta(item.projectStatus).labelH}>
                  <StatusBadge statusId={item.projectStatus} />
                </Tooltip>
              ) : null
            }
          >
            {birthYear}
          </Chip>
        </Box>
      );
    }

    case 'teams': {
      const teamYear = item.teamYear || '';
      const teamPhoto = item.photo !== '' ? item.photo : teamImage;
      return (
        <Box {...avatarBoxProps(flexBasis)}>
          <Avatar
            src={teamPhoto}
            sx={{ width: isMobile ? 30 : 35, height: isMobile ? 30 : 35 }}
          />
          <Chip
            variant="outlined"
            size='sm'
            sx={{
              mt: -1,
              px: 0.5,
              borderRadius: 'md',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {teamYear}
          </Chip>
        </Box>
      );
    }

    case 'clubs': {
      const clubPhoto = item.photo !== '' ? item.photo : clubImage;
      return (
        <Box {...avatarBoxProps(flexBasis)}>
          <Avatar src={clubPhoto} size="md" />
        </Box>
      );
    }

    case 'payments': {
      const playerFullName =
        formProps?.players?.find(t => t.id === item.playerId)?.playerFullName || '';
      const paymentPhoto =
        formProps?.players?.find(t => t.id === item.playerId)?.photo || playerImage;
      const playerShortName =
        formProps?.players?.find(t => t.id === item.playerId)?.playerShortName || '';
      return (
        <Box {...avatarBoxProps(flexBasis)}>
          <Avatar src={paymentPhoto} sx={{ width: isMobile ? 30 : 35, height: isMobile ? 30 : 35 }} />
          <Chip   {...chipAvatarProps(isMobile)} >
            {playerShortName !== '' ? playerShortName : playerFullName}
          </Chip>
        </Box>
      );
    }

    case 'meetings': {
      const playerName =
        formProps?.players?.find(t => t.id === item.playerId)?.playerFullName || '';
      const meetingPhoto =
        formProps?.players?.find(t => t.id === item.playerId)?.photo || playerImage;
      const playerShortName =
        formProps?.players?.find(t => t.id === item.playerId)?.playerShortName || '';
      return (
        <Box {...avatarBoxProps(flexBasis)}>
          <Avatar src={meetingPhoto} sx={{ width: isMobile ? 30 : 35, height: isMobile ? 30 : 35 }} />
          <Chip {...chipAvatarProps(isMobile)}>{playerShortName !== '' ? playerShortName : playerName}</Chip>
        </Box>
      );
    }

    default:
      return null;
  }
};
