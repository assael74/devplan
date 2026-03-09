//// / playerDashboard\abilitiesPanel\desktop\C_DeskTopPlayerReportList.js
import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { abilitiesShortsCollectionRef } from '../../../../a_firestore/readData/FirestoreReadData.js'
import { useTheme } from '@mui/joy/styles';
import { boxHeaderProps } from './X_Style';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { iconAbilitiesUi } from '../../../../b_styleObjects/icons/abilitiesIcons';
import { getFullDateIl } from '../../../../x_utils/dateUtiles.js'
import { STAFF_ROLE_OPTIONS } from '../../../../x_utils/optionLists.js'
import { Card, Typography, Box, Avatar, Button, LinearProgress, Sheet, Chip, Grid } from '@mui/joy';
import JoyStarRatingStatic from '../../../../h_componnetsUtils/rating/JoyStarRating';
import AbilitiesDoc from './D_AbilitiesDoc'

function HeaderArea({ player }) {
  const { level, levelPotential } = player;

  return (
    <Box {...boxHeaderProps}>
      <Typography level="title-sm" fontWeight="lg">
        דירוג יכולת / פוטנציאל
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography fontSize='14px' level="body-xs" color="neutral">יכולת נוכחית</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontSize='14px' level="body-xs" color="neutral">{level?.toFixed(1)}</Typography>
            <JoyStarRatingStatic value={level} size="lg" />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography fontSize='14px' level="body-xs" color="neutral">פוטנציאל</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontSize='14px' level="body-xs" color="neutral">{levelPotential?.toFixed(1)}</Typography>
            <JoyStarRatingStatic value={levelPotential} size="lg" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function DeskTopPlayerReportList({
  formProps,
  allShorts,
  statsParm,
  actions,
  player,
  view
}) {
  const [playerReports, setPlayerReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [openAbilitiesDoc, setOpenAbilitiesDoc] = useState('');
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchPlayerReports = async () => {
      if (!player?.id) return;

      try {
        setLoadingReports(true);
        const docRef = doc(abilitiesShortsCollectionRef, player.docAbilitiesId); // abilitiesShortsCollectionRef = collection ref
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const formsAbilitiesObj = data.formsAbilities || {};

          // המר לאובייקטים ברשימה מסודרת
          const reportsArray = Object.entries(formsAbilitiesObj).map(([id, val]) => ({
            docId: id,
            ...val,
          }));

          setPlayerReports(reportsArray);
        } else {
          setPlayerReports([]);
        }

      } catch (error) {
        console.error('שגיאה בטעינת הדיווחים:', error);
        showSnackbar('שגיאה בטעינת הדיווחים', 'danger');
      } finally {
        setLoadingReports(false);
      }
    };

    fetchPlayerReports();
  }, [player?.id]);

  const selectedReport = useMemo(() => {
    if (!openAbilitiesDoc) return null;
    return playerReports.find(r => (r.formId || r.docId) === openAbilitiesDoc) || null;
  }, [openAbilitiesDoc, playerReports]);

  if (loadingReports) return <Typography level="body-sm">טוען דיווחים...</Typography>;
  if (!playerReports?.length) return <Typography level="body-sm">אין עדיין דיווחים על שחקן זה.</Typography>;

  return (
    <Box sx={{ overflowX: 'auto', width: '100%', px: 4 }}>
      <HeaderArea
        view={view}
        player={player}
        actions={actions}
        formProps={formProps}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
        {playerReports.map((report) => {
          const role = formProps.roles.find(i=>i.id === report.evaluatorId)
          const roleId = STAFF_ROLE_OPTIONS.find(i=> i.id === report.evaluatorRole)
          const reportKey = report.formId || report.docId;
          const dateStr = getFullDateIl?.(report.reportDate) || '—';
          const evaluatorName = role.fullName || 'לא צוין מעריך';
          const evaluatorRole = roleId.labelH || 'לא צוין תפקיד';
          const hasNote = !!(report.note && String(report.note).trim());
          return (
            <React.Fragment key={reportKey}>
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography level="body-sm" fontWeight="lg">{dateStr}</Typography>
                </Box>

                <Typography startDecorator={<Avatar src={playerImage} sx={{ width: 20, height: 20 }} />} level="body-sm" sx={{ mt: 0.5 }}>
                <b>{evaluatorName}</b> <Typography sx={{ ml: 1 }}> :מעריך  </Typography>
                </Typography>

                <Chip startDecorator={iconUi({id: roleId.idIcon})} size="sm" variant="soft" color="neutral" sx={{ mt: 0.5 }}>
                  {evaluatorRole}
                </Chip>

                {hasNote && (
                  <Typography
                    level="body-xs"
                    sx={{
                      mt: 1,
                      color: 'neutral.600',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={String(report.note)} // tooltip לטקסט מלא
                  >
                    {report.note}
                  </Typography>
                )}

                <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() => setOpenAbilitiesDoc(reportKey)}
                  >
                    צפייה בטופס
                  </Button>
                </Box>
              </Card>
            </React.Fragment>
          )
        })}
        {selectedReport && (
          <AbilitiesDoc
            open={openAbilitiesDoc !== ''}
            setOpen={(v) => setOpenAbilitiesDoc(v ? String(v) : '')}
            formProps={formProps}
            actions={actions}
            player={player}
            report={selectedReport}
            view={view}
          />
        )}
      </Box>
    </Box>
  );
}
