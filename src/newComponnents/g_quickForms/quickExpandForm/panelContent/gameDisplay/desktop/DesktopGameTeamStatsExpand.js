import React, { useState, useEffect, useMemo } from 'react';
import { buttSaveProps, buttEditProps, boxStatsExpandProps, boxStickyProps, gridContainerProps } from './X_Style'
import { iconUi } from '../../../../../b_styleObjects/icons/IconIndex.js'
import { Box, Typography, Stack, Button, Grid, IconButton } from '@mui/joy';
import GenericInputField from '../../../../../f_forms/allFormInputs/inputUi/GenericInputField';

const fieldHebrewLabel = (field) => {
  const map = {
    total: 'סה״כ',
    success: 'מוצלחות',
    percent: 'אחוז',
  };
  return map[field] || field;
};

const completeTriplets = (statsList = [], statsParm = []) => {
  const listWithIds = [...statsList];
  const ids = listWithIds.map((item) => item.id);

  const tripletGroups = statsParm
    .filter(p => p.statsParmFieldType === 'triplet' && p.tripletGroup)
    .reduce((acc, p) => {
      const group = p.tripletGroup;
      if (!acc[group]) acc[group] = [];
      acc[group].push(p);
      return acc;
    }, {});

  Object.values(tripletGroups).forEach((groupItems) => {
    const presentItems = groupItems.filter((item) => ids.includes(item.id));
    if (presentItems.length === 2) {
      const missingItem = groupItems.find((item) => !ids.includes(item.id));
      if (missingItem) {
        const lastIndex = Math.max(
          ...presentItems.map((item) => listWithIds.findIndex((i) => i.id === item.id))
        );
        listWithIds.splice(lastIndex + 1, 0, missingItem);
      }
    }
  });

  return listWithIds;
};

function StatBox({ label, value }) {
  return (
    <Box sx={{ p: 1, borderRadius: 'md', bgcolor: 'neutral.softBg', textAlign: 'center', dir: 'rtl' }}>
      <Typography fontSize='12px' level="body-xs" fontWeight="md" color="text.secondary">
        {label}
      </Typography>
      <Typography fontSize='12px' level="body-md" fontWeight="lg">
        {value ?? '-'}
      </Typography>
    </Box>
  );
}

export default function DesktopGameTeamStatsExpand({
  handleTeamStatChange,
  formProps,
  item,
  view
}) {
  const teamStats = item.teamStats || [];
  const [localStats, setLocalStats] = useState(teamStats);
  const statsParm = formProps.statsParm || [];
  
  useEffect(() => {
    setLocalStats(teamStats);
  }, [teamStats]);

  const teamStatsMap = useMemo(
    () => Object.fromEntries(localStats.map(({ id, value }) => [id, value])),
    [localStats]
  );

  const isStats = localStats.length > 0;

  const fixedKeys = ['points', 'timePlay', 'totalPlayers', 'assists'];
  const excludedKeys = ['position', 'goals', 'goalsAgainst', ...fixedKeys];

  const rawStats = statsParm
    .filter((param) => !excludedKeys.includes(param.id))
    .filter((param) => {
      if (param.statsParmFieldType === 'triplet' && param.tripletFields) {
        const { total, success, percent } = param.tripletFields || {};
        const hasDefinedField = [total, success, percent].some(
          (key) => key && teamStatsMap?.[key] !== undefined
        );
        return hasDefinedField;
      } else {
        const val = teamStatsMap?.[param.id];
        return val !== undefined;
      }
    });

  const dynamicStats = completeTriplets(rawStats, statsParm).sort((a, b) => {
    const aOrder = a.order ?? 999;
    const bOrder = b.order ?? 999;
    return aOrder - bOrder;
  });

  const getValueById = (arr, id) => {
    const item = arr.find((el) => el.id === id);
    return item ? item.value : 0;
  };

  return (
    <Box {...boxStatsExpandProps}>
      <Box gap={2} sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
          <Box {...boxStickyProps}>
            {isStats ? (
              <Typography fontSize='14px' level="title-sm" fontWeight="lg" sx={{ bgcolor: 'background.body' }}>
                סטטיסטיקה קבוצתית
              </Typography>
            ) : (
              <Typography fontSize='14px' level="title-xs" fontWeight="lg" color="danger">
                עדיין אין סטטיסטיקה למשחק זה
              </Typography>
            )}
          </Box>
        </Box>

        {isStats && (
          <Grid container spacing={1}>
            <Grid xs={3} md={1}>
              <StatBox label="נקודות" value={getValueById(localStats, 'points')} />
            </Grid>
            <Grid xs={3} md={1}>
              <StatBox label="דקות" value={getValueById(localStats, 'timePlay')} />
            </Grid>
            <Grid xs={3} md={1}>
              <StatBox label="שחקנים" value={getValueById(localStats, 'totalPlayers')} />
            </Grid>
            {view === 'profilePlayer' && (
              <Grid xs={3} md={1}>
                <StatBox label="בישולים" value={getValueById(localStats, 'assists')} />
              </Grid>
            )}
          </Grid>
        )}

        {isStats && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {dynamicStats.map((param, index) => {
              const key = param.id;
              const label = param.statsParmName || key;
              const isTriplet = param.statsParmFieldType === 'triplet';
              const groupId = param.tripletGroup;

              if (isTriplet && groupId) {
                const groupMembers = dynamicStats.filter(
                  (p) => p.tripletGroup === groupId && p.statsParmFieldType === 'triplet'
                );

                const totalItem = groupMembers.find((p) => /Total$/.test(p.id));
                const successItem = groupMembers.find((p) => /Success$/.test(p.id));

                const total = totalItem ? teamStatsMap[totalItem.id] : undefined;
                const success = successItem ? teamStatsMap[successItem.id] : undefined;
                const isNumber = (val) => typeof val === 'number' && !isNaN(val);
                const percent =
                  isNumber(total) && total > 0 && isNumber(success)
                    ? `${Math.round((success / total) * 100)}%`
                    : total === 0
                    ? '0%'
                    : '-';

                const isFirstInGroup = param.id === (totalItem?.id || '');
                if (!isFirstInGroup) return null;

                return (
                  <Grid container spacing={1} key={groupId} {...gridContainerProps}>
                    <Grid md={3}>
                      <Box sx={{ '& input': { textAlign: 'center', fontWeight: 600, fontSize: '11px' }}}>
                        <GenericInputField
                          id={`teamStats-${totalItem.id}`}
                          label={label}
                          variant='outlined'
                          value={teamStatsMap[totalItem.id] ?? ''}
                          onChange={(val) => handleTeamStatChange(totalItem.id, val)}
                        />
                      </Box>
                    </Grid>
                    <Grid md={3}>
                      <Box sx={{ '& input': { textAlign: 'center', fontWeight: 600, fontSize: '11px' }}}>
                        <GenericInputField
                          id={`teamStats-${successItem.id}`}
                          label="מוצלחות"
                          variant='outlined'
                          value={teamStatsMap[successItem.id] ?? ''}
                          onChange={(val) => handleTeamStatChange(successItem.id, val)}
                        />
                      </Box>
                    </Grid>
                    <Grid md={3}>
                      <Box sx={{ '& input': { textAlign: 'center', fontWeight: 600, fontSize: '11px' }}}>
                        <GenericInputField
                          id={`teamStats-${groupId}-percent`}
                          label="אחוזים"
                          variant='outlined'
                          value={percent}
                          readOnly
                        />
                      </Box>
                    </Grid>
                  </Grid>
                );
              }

              return (
                <Grid item md={1} key={key}>
                  <GenericInputField
                    id={`teamStats-${key}-${index}`}
                    label={label}
                    value={teamStatsMap[key] ?? ''}
                    onChange={(val) => handleTeamStatChange(key, val)}
                    autoFocus={false}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
