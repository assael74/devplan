import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider } from '@mui/joy';

import { boxContentWraperProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import { generateTeamStats, getSaveErrors, emptyPlayerRow } from './helpers/calcultor';
import { statusStats } from '../x_utils/statsUtils.js'
import { normalizePlayerStatsList } from './helpers/useSmartStatChange';

import GameSelectField from './allFormInputs/selectUi/GameSelectField.js';
import StatsFormContent from './KA_StatsFormContent';

export default function NewGameStatsForm({
  open,
  setOpen,
  formProps,
  initialStats = [],
  onAdd,
  onEdit,
  view,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [gameId, setGameId] = useState(null);
  const [filters, setFilters] = React.useState({
    played: 'all',
    teamId: '',
    typeId: '',
    stats: 'all',
  });
  const game = useMemo(
    () => formProps?.games?.find((g) => g.id === gameId) || null,
    [formProps?.games, gameId]
  );

  const teamPlayers = useMemo(
    () => (game ? (formProps?.players || []).filter((p) => p.teamId === game.teamId) : []),
    [game, formProps?.players]
  );

  const [videoTimeStats, setVideoTimeStats] = useState('');
  const [playerStats, setPlayerStats] = useState(initialStats);
  const [extraFields, setExtraFields] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showExtraStats, setShowExtraStats] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const formStatus = React.useMemo(
    () => statusStats(game, formProps?.statsParm || []),
    [game, formProps?.statsParm]
  );

  const initialSnapshotRef = useRef(null);

  const prevTeamVideoRef = useRef('');

  useEffect(() => {
    if (!game) return;

    const statsParm = formProps?.statsParm || [];
    const defaultIds = new Set(statsParm.filter(p => p.isDefault).map(p => p.id));
    const EXCLUDED = new Set([
      'playerId','teamId','gameId','isStarting','isSelected','timeVideoStats','position',
    ]);

    const teamVideoTimeRaw = game?.teamStats?.find((t) => t.id === 'teamVideoTime')?.value;
    const teamVideoTime = teamVideoTimeRaw == null ? '' : String(teamVideoTimeRaw);

    // === הידרציית רשומות שחקנים ===
    let hydrated;
    if (game.hasStats && Array.isArray(game.playerStats)) {
      const byId = new Map(game.playerStats.map((s) => [s.playerId, s]));
      hydrated = teamPlayers.map((p) => {
        const saved = byId.get(p.id) || {};
        return {
          ...emptyPlayerRow(p.id),
          ...saved,
          isSelected: !!saved.playerId,
          timeVideoStats:
            saved.timeVideoStats != null ? String(saved.timeVideoStats) : teamVideoTime,
        };
      });
    } else {
      hydrated = teamPlayers.map((p) => ({
        ...emptyPlayerRow(p.id),
        timeVideoStats: teamVideoTime,
      }));
    }

    // === חילוץ extraFromSaved מתוך המפתחות הקיימים בנתונים ===
    const extraIds = new Set();
    if (Array.isArray(game.playerStats)) {
      for (const row of game.playerStats) {
        if (!row) continue;
        for (const k of Object.keys(row)) {
          if (EXCLUDED.has(k)) continue;
          if (defaultIds.has(k)) continue; // דיפולטים לא נחשבים extra
          // אם יש ערך כלשהו – נחשב אותו כשדה קיים
          if (row[k] !== null && row[k] !== undefined && row[k] !== '') {
            extraIds.add(k);
          }
        }
      }
    }
    const extraFromSaved = Array.from(extraIds); // ← זה מה שהיה חסר לך

    // === עדכון סטייטים ===
    setVideoTimeStats(teamVideoTime);
    prevTeamVideoRef.current = teamVideoTime;
    setPlayerStats(hydrated);
    setExtraFields(extraFromSaved);
    setShowExtraStats(extraFromSaved.length > 0);

    // === שמירת snapshot מלא לאיפוס עתידי ===
    initialSnapshotRef.current = {
      gameId,
      videoTimeStats: teamVideoTime,
      playerStats: hydrated,
      extraFields: extraFromSaved,
    };

    setIsDirty(false);
  }, [gameId, game, teamPlayers.length, formProps?.statsParm]);

  useEffect(() => {
    const prevTeam = prevTeamVideoRef.current;
    const currTeam = videoTimeStats;
    if (prevTeam === currTeam) return;

    setPlayerStats((prevList) =>
      prevList.map((p) => {
        const pv = p.timeVideoStats ?? '';
        const isInherited = pv === '' || pv === prevTeam;
        return isInherited ? { ...p, timeVideoStats: currTeam } : p;
      })
    );

    prevTeamVideoRef.current = currTeam;
  }, [videoTimeStats]);

  const smartChange = (playerId, fieldId, type) => (val) => {
    setPlayerStats((prev) =>
      prev.map((p) => {
        if (p.playerId !== playerId) return p;

        const nextVal =
          type === 'number'
            ? (val === '' || val == null ? '' : String(val))
            : val;

        if (p[fieldId] === nextVal) return p;

        const initialPlayer = initialSnapshotRef.current?.playerStats.find(
          (ip) => ip.playerId === playerId
        );
        const initialVal = initialPlayer ? initialPlayer[fieldId] : undefined;

        if (nextVal === initialVal) {

          const newStats = prev.map((pp) =>
            pp.playerId === playerId ? { ...pp, [fieldId]: nextVal } : pp
          );
          const isEqual = JSON.stringify(initialSnapshotRef.current.playerStats) === JSON.stringify(newStats);
          setIsDirty(!isEqual);
        } else {
          setIsDirty(true);
        }

        return { ...p, [fieldId]: nextVal };
      })
    );
  };

  const handleToggleSelect = (playerId, checked, id = 'isSelected') => {
    setPlayerStats((prev) =>
      prev.map((p) => {
        if (p.playerId !== playerId) return p;
        if (p[id] === checked) return p;
        setIsDirty(true);
        return { ...p, [id]: checked };
      })
    );
  };

  const handleChangeVideoTime = (raw) => {
    const v = raw === '' || raw === '0' ? '' : raw;
    if (v !== videoTimeStats) setIsDirty(true);
    setVideoTimeStats(v);
  };

  const handleReset = () => {
    const snap = initialSnapshotRef.current;
    if (!snap) return;
    setVideoTimeStats(snap.videoTimeStats ?? '');
    prevTeamVideoRef.current = snap.videoTimeStats ?? '';
    setPlayerStats(snap.playerStats || []);
    setExtraFields(snap.extraFields || []);
    setIsDirty(false);
  };

  const handleClose = () => {
    setExtraFields([]);
    setShowExtraStats(false);
    setSettingsOpen(false);
    setIsDirty(false);
    setOpen(false);
    setGameId(null)
    setFilters({
      played: 'all',
      teamId: '',
      typeId: '',
      stats: 'all',
    })
  };

  const handleCreateStats = () => {
    const selected = playerStats.filter((p) => p.isSelected);
    if (!game || !selected.length) return;

    const teamVideoTimeNum = videoTimeStats === '' ? null : Number(videoTimeStats);

    const statsList = selected.map(({ playerId, isStarting, ...rest }) => ({
      gameId: game.id,
      teamId: game.teamId,
      playerId,
      isStarting,
      timeVideoStats: rest.timeVideoStats === '' ? null : Number(rest.timeVideoStats),
      ...rest,
    }));

    const cleanedStats = normalizePlayerStatsList(statsList, formProps.statsParm);

    const finalData = {
      id: `${game.id}_${game.rivel}`,
      gameId: game.id,
      teamId: game.teamId,
      playerStats: cleanedStats,
      teamStats: generateTeamStats(statsList, game, teamVideoTimeNum),
      rivelStats: []
    };

    const isEdit =
      !!game?.hasStats ||
      (Array.isArray(game?.playerStats) && game.playerStats.length > 0);

    const newItem = {
      id: finalData.id,
      playerStats: finalData.playerStats,
      teamStats: finalData.teamStats,
      rivelStats: [],
    };

    if (isEdit) {
      onEdit({ newItem, type: 'gameStats' } || {});
    } else {
      onAdd(finalData);
    }

    setOpen(false);
  };

  const { errors: saveErrors, message: saveErrorsMsg } = useMemo(
    () =>
      getSaveErrors({
        gameId,
        isDirty,
        playerStats,
        extraFields,
        videoTimeStats, // string
      }),
    [gameId, isDirty, playerStats, extraFields, videoTimeStats]
  );
  const disableSave = saveErrors.length > 0;

  return (
    <Drawer {...drawerConsProps(open, setOpen)}>
      <Sheet {...sheetWraperProps}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography level="h5" fontWeight="lg">טופס סטטיסטיקה חדש</Typography>
          </Box>
          <IconButton size={isMobile ? 'sm' : 'md'} onClick={handleClose}>
            {iconUi({ id: 'close' })}
          </IconButton>
        </Box>
        <Divider sx={{ mt: 'auto' }} />

        {/* Content */}
        <Box {...boxContentWraperProps('gamesStats', isMobile)}>
          <Box className="content-inner">
            <Box sx={{ px: 2 }}>
              <GameSelectField
                filterable
                value={gameId}
                filters={filters}
                isMobile={isMobile}
                onChange={setGameId}
                formProps={formProps}
                options={formProps?.games || []}
                size={isMobile ? 'sm' : 'md'}
                getStatsStatus={(g) => {
                  const res = statusStats(g, formProps?.statsParm || []);
                  const st = typeof res === 'string' ? res : res?.status || 'empty';
                  return st === 'empty' ? 'none' : st; // none | partial | full
                }}
                onFiltersChange={(patch) => setFilters(prev => ({ ...prev, ...patch }))}
              />
            </Box>

            {game && (
              <StatsFormContent
                game={game}
                refs={{}}
                view={view}
                isMobile={isMobile}
                formProps={formProps}
                playerStats={playerStats}
                teamPlayers={teamPlayers}
                extraFields={extraFields}
                smartChange={smartChange}
                settingsOpen={settingsOpen}
                onToggle={handleToggleSelect}
                videoTimeStats={videoTimeStats}
                setExtraFields={setExtraFields}
                setPlayerStats={setPlayerStats}
                showExtraStats={showExtraStats}
                setSettingsOpen={setSettingsOpen}
                setShowExtraStats={setShowExtraStats}
                handleChangeVideoTime={handleChangeVideoTime} // ← להשתמש בזה בשדה הקבוצתי
                handleStatChange={(playerId, field, value) => {
                  setPlayerStats((prev) =>
                    prev.map((p) => (p.playerId === playerId ? { ...p, [field]: value } : p))
                  );
                }}
              />
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box {...footerBoxProps}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1.2}
          >
            <Stack direction="row" spacing={0.8}>
              <Button
                variant="soft"
                color="neutral"
                size={isMobile ? 'sm' : 'md'}
                onClick={handleClose}
                startDecorator={iconUi({ id: 'close', size: isMobile ? 'sm' : 'md' })}
              >
                בטל
              </Button>
              <Tooltip title="אפס לסטטיסטיקה שמורה">
                <IconButton
                  variant="plain"
                  size={isMobile ? 'sm' : 'md'}
                  color="neutral"
                  onClick={handleReset}
                  sx={{ borderRadius: 'xl' }}
                >
                  {iconUi({ id: 'clear', size: isMobile ? 'sm' : 'md' })}
                </IconButton>
              </Tooltip>
            </Stack>

            <Tooltip title={saveErrorsMsg}>
              <span>
                <Button
                  color="success"
                  variant="solid"
                  size={isMobile ? 'sm' : 'md'}
                  onClick={handleCreateStats}
                  startDecorator={iconUi({ id: 'check', size: isMobile ? 'sm' : 'md' })}
                  sx={{ minWidth: { xs: '100%', sm: 160 }, borderRadius: 'lg' }}
                  disabled={disableSave}
                >
                  שמור סטטיסטיקה
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </Sheet>
    </Drawer>
  );
}
