// e_dashboards\newContainers/ObjectTopBar.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ifaImage from '../../b_styleObjects/images/ifaImage.png'
import { boxWraperProps, boxContProps, boxStarProps } from './X_Style';
import { typeBackground } from '../../b_styleObjects/Colors.js';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { Box, Typography, IconButton, Avatar, Chip, Tooltip, Button } from '@mui/joy';
import JoyStarRating from '../../h_componnetsUtils/rating/JoyStarRating.js';

export default function ObjectTopBar(props) {
  const {
    objectType = 'teams',
    objectLevelPotential,
    onAvatarClick,
    actionsMenu,
    objectLevel,
    objectName,
    objectLink,
    avatarSrc,
    isProject,
    subTitle,
    isMobile,
    onBack,
  } = props;

  const bgc = typeBackground[objectType]?.bgc || '#f5f5f5';
  const textColor = typeBackground[objectType]?.text || '#000';
  const objectTypeTitle = objectType === 'teams' ? 'קבוצה' : 'שחקן';
  const openInNewTab = (url, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      {...boxWraperProps(bgc, textColor)}
      dir="rtl"
      sx={{
        ...(boxWraperProps(bgc, textColor)?.sx || {}),
        direction: 'rtl',
        textAlign: 'right',
      }}
    >
      {/* Back Button */}
      {onBack && (
        <IconButton variant="plain" onClick={onBack} sx={{ marginInlineStart: 1 }}>
          {iconUi({ id: 'back', size: 'md' })}
        </IconButton>
      )}

      {/* תוכן מרכזי – כותרת ויכולות */}
      <Box {...boxContProps(isMobile)}>
        {/* אזור מידע: אווטאר + שם + סאבטייטל */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box display="flex" flexDirection="row-reverse" gap={2} alignItems="center">
            <Avatar
              src={avatarSrc}
              onClick={onAvatarClick}
              sx={{
                width: isMobile ? 40 : 56,
                height: isMobile ? 40 : 56,
                cursor: onAvatarClick ? 'pointer' : 'default',
              }}
            />
            <Box>
              <Box>
                <Typography level={isMobile ? 'body-sm' : 'title-lg'} fontWeight="lg">
                  {objectName || 'ללא שם'}
                </Typography>
              </Box>

              {subTitle && (
                <Typography
                  level="body-xs"
                  sx={{ color: textColor, opacity: 0.85, fontSize: isMobile ? '0.7rem' : 'inherit' }}
                >
                  {subTitle}
                </Typography>
              )}

            </Box>
            {isProject && (
              <Box sx={{ ml: 2 }}>
                <Chip color="success" variant="soft" endDecorator={iconUi({id: 'project'})}>
                  פרויקט
                </Chip>
              </Box>
            )}
            <Box sx={{ ml: 2 }}>
              <Chip
                variant="soft"
                clickable
                size={isMobile ? 'sm' : 'md'}
                endDecorator={ <Avatar variant="outlined" fontSize={isMobile ? 'sm' : 'md'} src={ifaImage} /> }
                startDecorator={iconUi({id: 'link'})}
                disabled={objectLink === ''}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => openInNewTab(objectLink, e)}
                sx={{ "--Chip-paddingInline": "5px" }}
              >
                קישור לאתר ההתאחדות
              </Chip>
            </Box>
          </Box>
        </Box>

        {/* אזור יכולות + פוטנציאל */}
        <Box
          {...boxStarProps(isMobile)}
          sx={{ ...(boxStarProps(isMobile)?.sx || {}), textAlign: 'center' }}
        >
          <Box>
            <Typography fontSize={isMobile ? '9px' : '14px'} level="body-xs" fontWeight="lg">
              יכולות {objectTypeTitle}
            </Typography>
            <JoyStarRating value={objectLevel} size={isMobile ? 'xs' : 'lg'} />
          </Box>

          <Box>
            <Typography fontSize={isMobile ? '9px' : '14px'} level="body-xs" fontWeight="lg">
              פוטנציאל יכולות
            </Typography>
            <JoyStarRating value={objectLevelPotential} size={isMobile ? 'xs' : 'lg'} />
          </Box>
        </Box>
      </Box>

      {/* Actions Menu */}
      {actionsMenu ?? <Box width={40} />}
    </Box>
  );
}
