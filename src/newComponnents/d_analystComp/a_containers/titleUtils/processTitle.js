import React from 'react';
import { typeBackground } from '../../../b_styleObjects/Colors.js'
import { getTypographyProps } from '../../../b_styleObjects/typographyStyles.js'
import { getTeamColor } from '../../../x_utils/colorUtiles.js'
import { titleExtraProps, payContentProps, meetingTitleProps, meetingSubTitleProps } from './X_Style'
import { getMeetingDate } from '../../../x_utils/dateUtiles.js'
import { Box, Typography } from '@mui/joy';

export const getTitleSubtitleByType = ({type, item, formProps, isMobile, theme, onNavigate}) => {
   const defaultTex = (typeBackground?.[type]?.text) || '#000';
   const textColor = (() => {
     if (item?.color) {
       const c = String(item.color.tex ?? '').trim();
       if (c !== '') {
         return c;
       }

       const { tex: teamtex } = getTeamColor(item.id, formProps) || {};
       const teamColor = String(teamtex ?? '').trim();
       if (teamColor !== '') {
         return teamColor;
       }

       return defaultTex;
     }

     if (item?.teamId) {
       const { tex: teamTex } = getTeamColor(item.teamId, formProps);
       const c = String(teamTex ?? '').trim();
       return c !== '' ? c : defaultTex;
     }

     // 3) אין color ואין teamId → ברירת מחדל
     return defaultTex;
   })();

   switch (type) {
     case 'players': {
       const { level: titleLevel, sx: titleSx } = getTypographyProps('players', 'title', isMobile, theme);
       const { level: subtitleLevel, sx: subtitleSx } = getTypographyProps('players', 'subtitle', isMobile, theme);
       const teamName = formProps?.teams?.find(t => t.id === item.teamId)?.teamName || '';
       const plaName = item.playerShortName !== '' ? item.playerShortName : item.playerFullName
       const teamLink = `/Team/${item.teamId}`

       return {
         title: (
           <Box sx={{ width: '100%' }}>
             <Typography level={titleLevel} sx={{...titleSx, color: textColor, mb: 0.5}}>
               {plaName}
             </Typography>
           </Box>
         ),
         subtitle: (
           <Box
             role="link"
             tabIndex={0}
             onMouseDown={(e) => e.stopPropagation()}
             onClick={(e) => onNavigate(teamLink, e)}
             onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onNavigate?.(teamLink, e);
            }}
             sx={{ width: '100%', cursor: 'pointer', textDecoration: 'none' }}
           >
             <Typography level={subtitleLevel} sx={{...subtitleSx, color: textColor}}>
               {teamName}
             </Typography>
           </Box>
         )
       };
     }

     case 'teams': {
       const { level: titleLevel, sx: titleSx } = getTypographyProps('teams', 'title', isMobile, theme);
       const { level: subtitleLevel, sx: subtitleSx } = getTypographyProps('teams', 'subtitle', isMobile, theme);
       return {
         title: (
           <Box sx={{ width: '100%' }}>
             <Typography level={titleLevel} sx={{...titleSx, color: textColor}}>
               {item.teamName}
             </Typography>
           </Box>
         ),
         subtitle: (
           <Box sx={{ width: '100%' }}>
             <Typography level={subtitleLevel} sx={{...subtitleSx, color: textColor}}>
                {item.teamClub?.clubName}
             </Typography>
           </Box>
         )
       };
     }

     case 'clubs': {
       const { level: titleLevel, sx: titleSx } = getTypographyProps('clubs', 'title', isMobile, theme);
       const { level: subtitleLevel } = getTypographyProps('clubs', 'subtitle', isMobile, theme);
       return {
         title: (
           <Box sx={{ width: '100%' }}>
             <Typography level={titleLevel} sx={{...titleSx, color: textColor}}>
               {item.clubName}
             </Typography>
           </Box>
         ),
         subtitle: (
           <Box sx={{ width: '100%' }}>
             <Typography level={subtitleLevel} sx={{ display: 'inline', color: textColor }}>
               תחילת עבודה ב - {item.created}
             </Typography>
           </Box>
         )
       };
     }

     case 'payments': {
       const { level: titleLevel, sx: titleSx } = getTypographyProps('payments', 'title', isMobile, theme);
       return {
         title: (
           <Box sx={{ width: '100%', mr: isMobile ? 2 : 0, mt: isMobile ? 0 : -2 }}>
             <Typography level={titleLevel} sx={{...titleSx, color: textColor}}>
               {item.paymentFor}
             </Typography>
           </Box>
         ),
         subtitle: (
           <Box {...payContentProps(isMobile)}>
             <Typography sx={{ fontSize: isMobile ? '9px' : '14px', color: '#ffffff', pt: isMobile ? 0.3 : 0 }}>
             {item.price || '—'}
             </Typography>
             <Box sx={{ mx: 0.5, fontSize: '9px', mt: 0.5 }}>ש"ח</Box>
           </Box>
         )
       };
     }

     case 'meetings': {
       const { level: titleLevel, sx: titleSx } = getTypographyProps('meetings', 'title', isMobile, theme);
       const { level: subtitleLevel, sx: subtitleSx } = getTypographyProps('meetings', 'subtitle', isMobile, theme);
       return {
         title: (
           <Box sx={{ width: '100%' }}>
             <Typography level={titleLevel} sx={{...titleSx, color: textColor, mb: 0.5}}>
               {getMeetingDate(item).date.v2}
             </Typography>
           </Box>
         ),
         subtitle: (
           <Box sx={{ width: '100%' }}>
             <Typography level={subtitleLevel} sx={{...subtitleSx, color: textColor}}>
                {item.meetingHour}
             </Typography>
           </Box>
         )
       };
     }

     default: {
       return { title: '', subtitle: '' };
     }
   }
};
