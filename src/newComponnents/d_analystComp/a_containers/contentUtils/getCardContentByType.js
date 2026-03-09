// 📁 contentUtils/getCardContentByType.js
import React from 'react';
import { typeBackground } from '../../../b_styleObjects/Colors.js'
import { getTeamColor } from '../../../x_utils/colorUtiles.js'
import { boxProps } from './X_Style'
import { Stack, Typography, Box, Divider, Chip } from '@mui/joy';

const chipProps = {
  size:"sm",
  variant:"soft",
  sx: {
    "--Chip-minHeight": "10px"
  }
}

export function getCardContentByType(type, item, formProps = {}, isMobile) {
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

  if (type === 'clubs') {
    const teams = formProps?.teams?.filter(t => t.clubId === item.id) || [];
    const players = formProps?.players?.filter(p => p.clubId === item.id) || [];
    const proMan =
      item.roles.find(p => p.type === 'sportingDirector') ||
      item.roles.find(p => p.type === 'administrator');

    const proManName = proMan?.fullName || 'ללא מנהל מקצועי';
    const proManPhone = proMan?.fullName ? proMan?.phone || '000-0000000' : '';

    const allPlayers = [...players]
    const projectPlayers = allPlayers.filter(i=>i.type === 'project')

    return (
      <Stack spacing={1}>
        {proManName ? (
          <Box {...boxProps}>
            <Typography level="body-sm" fontWeight="lg">
             👤 {proManName}
            </Typography>
             -
            <Typography level="body-sm" fontWeight="lg">
              📞 {proManPhone}
            </Typography>
          </Box>
        ) : (
          <Typography level="body-sm" fontWeight="lg"  sx={{ color: 'text.primary' }}>
            אין איש קשר מוגדר
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
          <Chip size="sm" color="primary" variant="soft">שחקני קבוצה: {players.length}</Chip>
          <Chip size="sm" color="success" variant="soft">שחקני פרוייקט: {projectPlayers.length}</Chip>
          <Chip size="sm" color="neutral" variant="soft">אנשי צוות: {item.roles.length}</Chip>
        </Box>
      </Stack>
    );
  }

  if (type === 'teams') {
    const teamPlayers = formProps?.players?.filter(p => p.teamId === item.id) || [];
    const projectPlayers = teamPlayers.filter(i=>i.type === 'project')
    const coach = item.roles.find(p => p.type === 'coach');
    const coachName = coach?.fullName || 'ללא מאמן';
    const coachPhone = coach?.phone || '000-0000000';
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
        <Chip color="primary" {...chipProps}>שחקני קבוצה: {teamPlayers.length}</Chip>
        <Chip color="success" {...chipProps}>פרוייקט: {projectPlayers.length}</Chip>
        <Chip color="neutral" {...chipProps}>אנשי צוות: {item.roles.length}</Chip>
        <Chip color='warning' {...chipProps}>ליגה: {item.league}</Chip>
        <Chip color="warning" {...chipProps}>מיקום בליגה: {item.position}</Chip>
      </Box>
    )
  }

  return null;
}
