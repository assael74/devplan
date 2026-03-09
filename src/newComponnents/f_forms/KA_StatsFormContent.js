import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@mui/joy/styles';
import playerImage from '../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import {
  boxPlayerStatsProps,
  boxExraFieldsProps,
  clearButtProps,
  accordGroupProps,
  accordInnerProps,
  boxWraperAccordion,
  typoWraperAccordion,
  gridExtraProps,
  typoTimeText
} from './X_Style';
import { getGameStatsFieldLists } from './helpers/gameStatsFields';
import { getFullDateIl } from '../x_utils/dateUtiles.js'
import { sheetListDisplay } from './X_Style'
import { Box, Stack, Typography, Divider, Grid, Button, IconButton, Avatar, Checkbox, Tooltip, Sheet, Switch, Chip } from '@mui/joy';
import { FormControl, FormLabel, Input } from '@mui/joy';
import { AccordionGroup, Accordion, AccordionDetails, AccordionSummary } from '@mui/joy';
import CollapseBox from '../h_componnetsUtils/motions/CollapsBox';
import GenericInputField from './allFormInputs/inputUi/GenericInputField';
import GenericTripleInputField from './allFormInputs/inputUi/GenericTripleInputField';
import GenericCheckSelector from './allFormInputs/checkUi/GenericCheckSelector';
import StatsFieldSelectorDialog from './helpers/StatsFieldSelectorDialog';
import OnSquadSelector from './allFormInputs/checkUi/OnSquadSelector.js'
import OnSquadStart from './allFormInputs/checkUi/OnSquadStart.js'
import PlayerPositionsSimpleSelect from './allFormInputs/selectUi/PlayerPositionsSimpleSelect';

const PlayerInfoMini = React.memo(({ player, timePlayed = '0', fontSize }) => {
  const positionText = player?.position ? player.position : 'Pos.';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Typography fontSize={fontSize} level="title-sm" fontWeight="lg">{positionText}</Typography>
      <Typography fontSize={fontSize} level="title-sm" fontWeight="lg">({timePlayed})</Typography>
    </Box>
  );
});

export default function StatsFormContent({
  refs,
  game,
  isMobile,
  onToggle,
  formProps,
  teamPlayers,
  playerStats,
  smartChange,
  extraFields,
  settingsOpen,
  videoTimeStats,
  setExtraFields,
  showExtraStats,
  setSettingsOpen,
  handleStatChange,
  setShowExtraStats,
  setVideoTimeStats,
  handleChangeVideoTime
}) {
  const [openExtraByPlayer, setOpenExtraByPlayer] = useState(() => new Set());
  const toggleExtraFor = (playerId) => {
    setOpenExtraByPlayer((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
 };
  const isExtraOpen = (playerId) => openExtraByPlayer.has(playerId);
  const [filterMode, setFilterMode] = useState('all');
  const { defaultList, extraList, availableExtraOptions } = getGameStatsFieldLists({
    statsParm: formProps?.statsParm || [],
    extraFields,                       // IDs שהמשתמש בחר ידנית
    playerStats: playerStats || [],    // ← כל מערך השורות המהודרות (state), או game.playerStats
    // includeUnknownSaved: true,      // הדלק אם יש שדות שמורים שלא מוגדרים ב-statsParm ואתה רוצה להציגם
  });
  const theme = useTheme();
  const fontSize = isMobile ? '12px' : '14px'
  const avatarSize = { width: isMobile ? 25 : 35, height: isMobile ? 25 : 35 }
  const isSelectedShadow = '0 0 10px 2px rgba(0, 255, 128, 0.25)'

  const existingExtraIds = React.useMemo(() => {
    const statsParm = formProps?.statsParm || [];
    const defaultIds = new Set(
      statsParm.filter((p) => p.isDefault).map((p) => p.id)
    );
    const EXCLUDED = new Set([
      'timeVideoStats',
      'playerId',
      'teamId',
      'gameId',
      'isStarting',
      'isSelected',
      'position',
    ]);

    const ids = new Set();
    for (const row of Array.isArray(playerStats) ? playerStats : []) {
      if (!row) continue;
      for (const k of Object.keys(row)) {
        if (EXCLUDED.has(k)) continue;
        if (defaultIds.has(k)) continue;
        ids.add(k);
      }
    }

    return [...ids];
  }, [playerStats, formProps?.statsParm]);

  const statFieldIds = React.useMemo(() => {
    const base = defaultList.map(f => f.id);
    const extra = extraList.map(f => f.id);
    return Array.from(new Set([...base, ...extra, 'timeVideoStats']));
  }, [defaultList, extraList]);

  const hasAnyStats = (player) => {
    // האם יש לפחות שדה סטטיסטי שמולא (מספר > 0 או מחרוזת לא ריקה)
    return statFieldIds.some((key) => {
      const v = player[key];
      if (v == null) return false;
      if (typeof v === 'number') return v > 0;
      const s = String(v).trim();
      if (s === '') return false;
      const n = Number(s);
      return Number.isFinite(n) ? n > 0 : true; // ערך טקסטואלי לא-מספרי נחשב כמולא
    });
  };

  const list = React.useMemo(() => {
    switch (filterMode) {
      case 'noStats':
        return playerStats.filter(p => !hasAnyStats(p));
      case 'squad':
        return playerStats.filter(p => p.isSelected);
      case 'starting':
        return playerStats.filter(p => p.isStarting);
      default:
        return playerStats; // 'all'
    }
  }, [playerStats, filterMode, hasAnyStats]);

  const filterChip = (mode, currentMode, text, color = 'neutral') => {
    return (
      <Chip
        key={mode}
        variant={currentMode === mode ? 'solid' : 'soft'}
        color={currentMode === mode ? color : 'neutral'}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setFilterMode(mode);
        }}
        sx={{ "--Chip-minHeight": "18px" }}
      >
        {text}
      </Chip>
    );
  };

  return (
    <Box >
      {/* כותרת */}
      <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', my: 1, px: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={0.5}>
            <Typography fontSize={fontSize} level="title-md" gutterBottom>
              סטטיסטיקה לפי שחקן
            </Typography>
            <Typography fontSize={fontSize} level="body-sm" sx={{ color: 'text.secondary' }}>
              {game?.home ? 'בית' : 'חוץ'} מול {game?.rivel || '---'}
              <Typography fontSize={fontSize} level="body-sm" fontWeight='lg' sx={{ color: 'text.secondary', mr: 1 }}>
                {getFullDateIl(game?.gameDate, isMobile) || 'תאריך לא ידוע'}
              </Typography>
            </Typography>
            <Typography fontSize={fontSize} level="body-sm" sx={{ color: 'text.secondary' }}>
              תוצאה: {game?.goalsFor ?? '-'} - {game?.goalsAgainst ?? '-'}
            </Typography>
          </Stack>
        </Box>
        {/* בורר סינון */}
        <Box display='flex' gap={1} sx={{ ml: 2 }}>
          <Box>{filterChip('noStats', filterMode, 'ללא סטטיסטיקה', 'warning')}</Box>
          <Box>{filterChip('squad', filterMode, 'בסגל', 'primary')}</Box>
          <Box>{filterChip('starting', filterMode, 'בהרכב', 'success')}</Box>
          <Box>{filterChip('all', filterMode, 'כולם')}</Box>
        </Box>

        <Box sx={{ mx: 1, width: 90, mt: -2 }}>
          <FormControl>
            <FormLabel required sx={{ fontSize: '8px' }}>דקות משחק מצולמות</FormLabel>
            <Input
              size='sm'
              type='number'
              placeholder='דקות מצולמות'
              value={videoTimeStats}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleChangeVideoTime(e.target.value)}
            />
          </FormControl>
        </Box>

        <StatsFieldSelectorDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          allFields={availableExtraOptions}
          selected={extraFields}
          existingIds={existingExtraIds}
          onApply={(ids) => {
            setExtraFields(ids);
            setShowExtraStats(ids.length > 0);
          }}
          actionIcon={
            <Tooltip title="הוספת שדות">
              <IconButton
                size={isMobile ? 'sm' : 'md'}
                variant="solid"
                onClick={(e) => { e.stopPropagation(); setSettingsOpen(true); }}  // ← למנוע סגירת/פתיחת אקורדיון
              >
                {iconUi({ id: 'moreStats', size: isMobile ? 'sm' : 'md' })}
              </IconButton>
            </Tooltip>
          }
        />

      </Box>

      <Divider sx={{ mb: 2 }} />
      {list.length === 0 ? (
        <Sheet {...sheetListDisplay}>
          <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1 }}>
          נמצאו {list.length} שחקנים בתצוגה ({playerStats.length} בסגל הכולל)
          </Typography>

          {/* כפתור עזר קטן כדי לחזור ל"כולם" */}
          {filterMode !== 'all' && (
            <Button
              size={isMobile ? 'sm' : 'md'}
              variant="soft"
              color="primary"
              onClick={() => setFilterMode('all')}
            >
              הצג כולם
            </Button>
          )}
        </Sheet>
      ) : (
        <AccordionGroup {...accordGroupProps(theme, isMobile)}>
          {list.map((player) => {
            const playerInfo = formProps.players.find((p) => p.id === player.playerId);
            return (
              <Accordion key={player.playerId} sx={{ boxShadow: player.isSelected ? isSelectedShadow : 'lg' }}>
                <AccordionSummary>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '100%' }}>

                    <Box sx={{ mr: 2, width: '50%' }}>
                      <Box {...boxWraperAccordion(isMobile)}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Avatar src={playerInfo.photo || playerImage} size={isMobile ? 'sm' : 'md'} />
                        </Box>
                        <Typography {...typoWraperAccordion(fontSize)}>
                          {playerInfo?.playerFullName || ''}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ width: '25%' }}>

                    </Box>

                    <Box sx={{ ml: 2, width: '25%' }}>
                      <PlayerInfoMini
                        player={player}
                        fontSize={fontSize}
                        position={player.position}
                        timePlayed={player.timePlayed}
                      />
                    </Box>

                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', p: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <OnSquadSelector
                        value={player.isSelected}
                        size={isMobile ? 'sm' : 'md'}
                        onChange={(e) => onToggle(player.playerId, e.target.checked, 'isSelected')}
                      />
                      <OnSquadStart
                        value={player.isStarting}
                        size={isMobile ? 'sm' : 'md'}
                        onChange={(e) => onToggle(player.playerId, e.target.checked, 'isStarting')}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1, mr: -1, ml: 4 }}>
                      <PlayerPositionsSimpleSelect
                        value={player.position || ''}
                        size={isMobile ? 'sm' : 'md'}
                        onChange={(val) => handleStatChange(player.playerId, 'position', val)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Grid container spacing={2}>
                    {defaultList.map(({ id, label, type }, index) => (
                      <Grid key={id} xs={4} md={type === 'triplet' ? 4 : 3}>
                        <GenericInputField
                          id={`input-${id}-${player.playerId}-${index}`}
                          type={type}
                          value={player[id] || ''}
                          label={label}
                          size={isMobile ? 'sm' : 'md'}
                          onChange={smartChange(player.playerId, id, type)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="plain"
                      size={isMobile ? 'sm' : 'md'}
                      onClick={(e) => { e.stopPropagation(); toggleExtraFor(player.playerId); }}
                      sx={{ p: 0, minWidth: 'auto', boxShadow: 'none', '&:hover': { backgroundColor: 'transparent' } }}
                    >
                      {isExtraOpen(player.playerId) ? 'הסתר שדות נוספים' : 'הצג שדות נוספים'}
                    </Button>

                    {isExtraOpen(player.playerId) && (
                      extraList.length > 0 ? (
                        <Sheet variant="soft" color="success" sx={{ borderRadius: 'lg', bgcolor: 'inherit' }}>
                          <Box {...boxExraFieldsProps}>
                          <Typography {...typoTimeText}>
                            הנתונים מתייחסים לפי זמן וידאו מצולם של:
                            <Typography fontWeight='md' component="span" sx={{ mr: 1 }}>{player.timeVideoStats || 0} דקות </Typography>
                          </Typography>
                            <Box sx={{ width: '20%', mb: 1 }}>
                              <GenericInputField
                                id={`input-timeVideoStats-${player.playerId}`}
                                type="number"
                                size='sm'
                                value={player.timeVideoStats ?? ''}
                                label={isMobile ? 'דקות מצולמות' : 'דקות מצולמות (שחקן)'}
                                onChange={smartChange(player.playerId, 'timeVideoStats', 'number')}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Box>
                            <Grid container spacing={1} sx={{ px: 0.5 }}>
                              {extraList
                                .sort((a, b) => {
                                  if (a.type === 'triplet' && b.type !== 'triplet') return -1;
                                  if (a.type !== 'triplet' && b.type === 'triplet') return 1;
                                  return (a.order ?? 0) - (b.order ?? 0);
                                })
                                .map(({ id, label, labelShort, type, tripletGroup }, index) => {
                                const fieldId = `input-${id}-${player.playerId}-${index}`;
                                const labelInput = isMobile ? labelShort : label;
                                const val = player[id];

                                return (
                                  <Grid key={id} {...gridExtraProps(type)}>
                                    <GenericInputField
                                      id={fieldId}
                                      type={type}
                                      size={isMobile ? 'sm' : 'md'}
                                      value={
                                        id.toLowerCase().includes('rate')
                                          ? (() => {
                                              const success = Number(player[`${tripletGroup}Success`] || 0);
                                              const total = Number(player[`${tripletGroup}Total`] || 0);
                                              return total > 0 ? `${Math.round((success / total) * 100)}%` : '0%';
                                            })()
                                          : (val ?? '')
                                      }
                                      label={labelInput}
                                      readOnly={id.toLowerCase().includes('rate')}
                                      onChange={(val) => smartChange(player.playerId, id, type)(val)}
                                    />
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                        </Sheet>
                      ) : (
                        <Typography fontSize={fontSize} sx={{ p: 0.5, mt: 1 }}>לא הוגדרו שדות נוספים</Typography>
                      )
                    )}
                  </Box>

                </AccordionDetails>

              </Accordion>
            );
          })}
        </AccordionGroup>
      )}

    </Box>
  );
}
