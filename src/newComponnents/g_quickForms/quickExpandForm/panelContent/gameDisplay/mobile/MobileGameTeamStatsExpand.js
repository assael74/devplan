import React, { useState, useEffect, useMemo } from 'react';
import { boxStickyProps } from './X_Style';
import { iconUi } from '../../../../../b_styleObjects/icons/IconIndex.js';
import { Box, Typography, Grid } from '@mui/joy';

const completeTriplets = (statsList = [], statsParm = []) => {
  const listWithIds = [...statsList];
  const ids = listWithIds.map((item) => item.id);

  const tripletGroups = statsParm
    .filter((p) => p.statsParmFieldType === 'triplet' && p.tripletGroup)
    .reduce((acc, p) => {
      const group = p.tripletGroup;
      if (!acc[group]) acc[group] = [];
      acc[group].push(p);
      return acc;
    }, {});

  Object.values(tripletGroups).forEach((groupItems) => {
    const present = groupItems.filter((item) => ids.includes(item.id));
    if (present.length === 2) {
      const missing = groupItems.find((item) => !ids.includes(item.id));
      if (missing) {
        const lastIndex = Math.max(
          ...present.map((item) => listWithIds.findIndex((i) => i.id === item.id))
        );
        listWithIds.splice(lastIndex + 1, 0, missing);
      }
    }
  });

  return listWithIds;
};

const TripleStatBox = ({ label, total, success, percent }) => (
  <Box sx={{ p: 1, borderRadius: 'md', bgcolor: 'neutral.softBg', textAlign: 'center', dir: 'rtl' }}>
    <Typography fontSize='12px' level="body-xs" fontWeight="md" color="text.secondary" mb={1}>
      {label}
    </Typography>
    <Typography fontSize='12px' level="body-sm">
      <Typography>{`${total ?? '-'}`} / {`${success ?? '-'}`}</Typography>
      <Typography fontWeight="lg" ml={1}>({percent ?? '-'}%)</Typography>
    </Typography>
  </Box>
);

const StatBox = ({ label, value }) => (
  <Box sx={{ p: 1, borderRadius: 'md', bgcolor: 'neutral.softBg', textAlign: 'center', dir: 'rtl' }}>
    <Typography fontSize='12px' level="body-xs" fontWeight="md" color="text.secondary">
      {label}
    </Typography>
    <Typography fontSize='12px' level="body-md" fontWeight="lg">
      {value ?? '-'}
    </Typography>
  </Box>
);

export default function MobileGameTeamStatsExpand({ formProps, item, actions, isMobile, view }) {
  const statsParm = formProps.statsParm || [];
  const teamStats = item.teamStats || [];

  const teamStatsMap = useMemo(() => {
    return Object.fromEntries(teamStats.map(({ id, value }) => [id, value]));
  }, [teamStats]);

  const excludedKeys = ['goals', 'goalsAgainst', 'points', 'timePlay', 'totalPlayers', 'assists'];

  const dynamicStats = useMemo(() => {
    const rawStats = statsParm
      .filter((param) => !excludedKeys.includes(param.id))
      .filter((param) => {
        if (param.statsParmFieldType === 'triplet' && param.tripletGroup) {
          const total = teamStatsMap?.[`${param.tripletGroup}Total`];
          const success = teamStatsMap?.[`${param.tripletGroup}Success`];
          const percent = teamStatsMap?.[param.id]; // זה ה־Rate עצמו

          const hasValue = [total, success, percent].some((v) => v !== 0 && v !== undefined);
          const hasDefined = [total, success, percent].some((v) => v !== undefined);

          return hasValue;
        } else {
          const val = teamStatsMap?.[param.id];
          return val !== 0 && val !== undefined;
        }
      });

    return completeTriplets(rawStats, statsParm).sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [statsParm, teamStatsMap]);

  const getValueById = (id) => {
    const item = teamStats.find((el) => el.id === id);
    return item ? item.value : 0;
  };

  const isStats = teamStats.length > 0;

  return (
    <Box {...boxStickyProps}>
      <Typography fontSize='12px' level="title-sm" fontWeight="lg" sx={{ bgcolor: 'background.body' }}>
        {isStats ? 'סטטיסטיקה קבוצתית' : 'עדיין אין סטטיסטיקה למשחק זה'}
      </Typography>

      {isStats && (
        <Grid container spacing={1}>
          {[
            { id: 'points', label: 'נקודות' },
            { id: 'timePlay', label: 'דקות' },
            { id: 'totalPlayers', label: 'שחקנים' },
            { id: 'assists', label: 'בישולים' },
          ].map(({ id, label }) => (
            <Grid xs={3} md={4} key={id}>
              <StatBox label={label} value={getValueById(id)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
