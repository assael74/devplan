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
  console.log(label, value)
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

export default function DesktopGamePlayerStatsExpand({
  handlePlayerStatChange,
  formProps,
  item,
  view
}) {
  const gameStats = item.gameStats || {};
  const [localStats, setLocalStats] = useState(gameStats);
  const statsParm = formProps.statsParm || [];

  const fixedKeys = ['points', 'timePlayed', 'assists', 'isStarting'];
  const excludedKeys = ['position', 'goals', 'goalsAgainst', ...fixedKeys];

  const playerStatsMap = Object.entries(gameStats || {}).reduce((acc, [id, value]) => {
    acc[id] = value;
    return acc;
  }, {});

  const rawStats = statsParm
    .filter(param => !excludedKeys.includes(param.id))
    .filter(param => {
      if (param.statsParmFieldType === 'triplet' && param.tripletFields) {
        const keys = Object.values(param.tripletFields);
        return keys.some((key) => key && playerStatsMap?.[key] !== undefined);
      }

      return playerStatsMap?.[param.id] !== undefined;
    });

  const dynamicStats = completeTriplets(rawStats, statsParm).sort((a, b) => {
    const aOrder = a.order ?? 999;
    const bOrder = b.order ?? 999;
    return aOrder - bOrder;
  });

  const getValueById = (obj, id) => {
    return obj?.[id] ?? 0;
  };
  //console.log(item.isSelected)
  return (
    <Box {...boxStatsExpandProps}>
      <Box gap={2} sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
          <Box {...boxStickyProps}>
            <Typography fontSize='14px' level="title-sm" fontWeight="lg" sx={{ bgcolor: 'background.body' }}>
              סטטיסטיקה קבוצתית
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid xs={3} md={1}>
            <StatBox label="דקות" value={getValueById(item.gameStats, 'timePlayed')} />
          </Grid>
          <Grid xs={3} md={1}>
            <StatBox label="שערים" value={getValueById(item.gameStats, 'goals')} />
          </Grid>
          {view === 'profilePlayer' && (
            <>
              <Grid xs={3} md={1}>
                <StatBox label="בישולים" value={getValueById(item.gameStats, 'assists')} />
              </Grid>
              <Grid xs={3} md={1}>
                <StatBox label="בסגל" value={item?.isSelected ? '❌' : '✔️'} />
              </Grid>
              <Grid xs={3} md={1}>
                <StatBox label="בהרכב" value={item?.isStarting ? '❌' : '✔️'} />
              </Grid>
              <Grid xs={3} md={1}>
                <StatBox label="עמדה" value={item?.position || '-'} />
              </Grid>
            </>
          )}
        </Grid>

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

              const total = totalItem ? playerStatsMap[totalItem.id] : undefined;
              const success = successItem ? playerStatsMap[successItem.id] : undefined;
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
                        value={playerStatsMap[totalItem.id] ?? 0}
                        onChange={(val) => handlePlayerStatChange(totalItem.id, val)}
                      />
                    </Box>
                  </Grid>
                  <Grid md={3}>
                    <Box sx={{ '& input': { textAlign: 'center', fontWeight: 600, fontSize: '11px' }}}>
                      <GenericInputField
                        id={`teamStats-${successItem.id}`}
                        label="מוצלחות"
                        variant='outlined'
                        value={playerStatsMap[successItem.id] ?? 0}
                        onChange={(val) => handlePlayerStatChange(successItem.id, val)}
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
                  value={playerStatsMap[key] ?? 0}
                  onChange={(val) => handlePlayerStatChange(key, val)}
                  autoFocus={false}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
