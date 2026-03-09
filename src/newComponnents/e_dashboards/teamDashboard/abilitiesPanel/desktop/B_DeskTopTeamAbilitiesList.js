// DeskTopTeamAbilitiesList.js
import React, { useRef } from 'react';
import { useTheme } from '@mui/joy/styles';
import { Box, Typography, Button, Grid, Chip, LinearProgress, Avatar } from '@mui/joy';
import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import { useReactToPrint } from 'react-to-print';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';

import { boxPanelProps, accordGroupProps } from './X_Style';
import { iconAbilitiesUi } from '../../../../b_styleObjects/icons/abilitiesIcons';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';

import { abilitiesList } from '../../../../x_utils/abilitiesList';
import { summarizePlayersByDomain, summarizePlayersByAbility } from '../../../../x_utils/abilitiesList';

const getColor = (v) => (v >= 4 ? 'success' : v >= 2 ? 'primary' : 'danger');
const weightById = Object.fromEntries(abilitiesList.map(a => [a.id, a.weight || 1]));

function TeamHeaderArea({ team, totalPlayers, ratedPlayers }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2 }}>
      <Avatar src={team?.photo || playerImage} sx={{ width: 36, height: 36 }} />
      <Typography level="title-lg" fontWeight="xl">
        יכולות קבוצתיות — {team?.teamName}
      </Typography>
      <Chip size="sm" variant="soft" color="primary">
        שחקנים בקבוצה: {totalPlayers}
      </Chip>
      <Chip size="sm" variant="soft" color="neutral">
        דירוגים פעילים (לפחות פריט אחד): {ratedPlayers}
      </Chip>
    </Box>
  );
}

const PrintableTeamAbilities = React.forwardRef(function PrintableTeamAbilities({ team, domainsSummary, abilitiesSummary }, ref) {
  return (
    <div ref={ref} id="print-root" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: 24 }}>
      <h2 style={{ margin: 0, marginBottom: 8 }}>דוח יכולות קבוצתי — {team?.teamName}</h2>

      {domainsSummary.map((dom) => {
        const abilitiesDom = abilitiesSummary.find(d => d.domain === dom.domain);
        const items = abilitiesDom?.items || [];
        return (
          <div key={dom.domain} style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '16px 0 8px' }}>
              {dom.domainLabel} — ממוצע משוקלל: {dom.avgWeighted ?? '-'}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>יכולת</th>
                  <th style={th}>ממוצע</th>
                  <th style={th}>מדורגים</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td style={td}>{it.label}</td>
                    <td style={td}>{it.avg ?? '-'}</td>
                    <td style={td}>{it.ratedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
});

const th = { border: '1px solid #ddd', padding: 8, textAlign: 'right', background: '#f7f7f7' };
const td = { border: '1px solid #ddd', padding: 8, textAlign: 'right' };

export default function DeskTopTeamAbilitiesList({
  formProps,
  allShorts,
  statsParm,
  actions,
  team,
  view
}) {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();

  const teamPlayers = (formProps?.players || []).filter(p => p.teamId === team?.id);

  const domainsSummary = summarizePlayersByDomain(teamPlayers);   // [{domain, domainLabel, avgWeighted, ratingsCount, playersRated}]
  const abilitiesSummary = summarizePlayersByAbility(teamPlayers); // [{domain, domainLabel, items:[{id,label,avg,ratedCount}]}]

  const teamAbilities = abilitiesSummary.map(d => ({
    domain: d.domain,
    domainLabel: d.domainLabel,
    items: d.items.map(it => ({
      id: it.id,
      label: it.label,
      weight: weightById[it.id] ?? 1,
      value: it.avg ?? 0,
      ratedCount: it.ratedCount,
    })),
  }));

  const printRef = useRef(null);
  const pageStyle = `
    @page { size: A4; margin: 12mm; }
    @media print {
      html, body { height: auto !important; overflow: visible !important; }
      #print-root { height: auto !important; overflow: visible !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .avoid-break { break-inside: avoid; page-break-inside: avoid; }
      .page-break { break-before: page; page-break-before: always; }
    }
  `;
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `team_abilities_${team?.teamName || ''}`,
    pageStyle
  });

  const hasAnyData = teamAbilities.some(d => d.items.some(it => (it.value ?? 0) > 0));

  if (!hasAnyData) {
    return (
      <Box {...boxPanelProps} sx={{ p: 2 }}>
        <TeamHeaderArea
          team={team}
          totalPlayers={teamPlayers.length}
          ratedPlayers={domainsSummary.reduce((m, d) => Math.max(m, d.playersRated || 0), 0)}
        />
        <Typography level="body-md" sx={{ px: 2, py: 3 }}>
          אין נתונים להצגה עדיין (אין ציונים גבוהים מ־0).
        </Typography>
      </Box>
    );
  }

  return (
    <Box {...boxPanelProps}>

      {/* כפתור PDF */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', my: 2, p: 1, px: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TeamHeaderArea
            team={team}
            totalPlayers={teamPlayers.length}
            ratedPlayers={domainsSummary.reduce((m, d) => Math.max(m, d.playersRated || 0), 0)}
          />
        </Box>

        <Button size="sm" variant="solid" color="primary" onClick={handlePrint}>
          PDF  - הדפס / שמור כ
        </Button>
      </Box>

      <Box sx={{ position: 'absolute', left: -9999, top: 0 }}>
        <PrintableTeamAbilities
          ref={printRef}
          team={team}
          domainsSummary={domainsSummary}
          abilitiesSummary={abilitiesSummary}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <AccordionGroup {...accordGroupProps(theme)}>
          {teamAbilities.map((domainGroup) => {
            const { items } = domainGroup;

            const totalW = items.reduce((s, i) => (i.value > 0 ? s + i.weight : s), 0);
            const sumW   = items.reduce((s, i) => (i.value > 0 ? s + i.value * i.weight : s), 0);
            const domainScore = totalW > 0 ? +(sumW / totalW).toFixed(1) : 0;
            const domainColor = getColor(domainScore);

            return (
              <Accordion key={domainGroup.domain}>
                <AccordionSummary>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography level="body-sm" fontWeight="lg" fontSize="14px" startDecorator={iconAbilitiesUi({ id: domainGroup.domain })}>
                      {domainGroup.domainLabel}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography fontSize="14px" level="body-xs" color={domainColor}>
                        ציון קטגוריה:{' '}
                        <Typography component="span" fontSize="14px" variant="outlined" sx={{ borderRadius: 'md', mr: 1, p: 0.3 }}>
                          {domainScore}
                        </Typography>
                      </Typography>

                      <Chip size="sm" variant="soft" color="neutral">
                        {items.filter(i => i.value > 0).length} / {items.length}
                      </Chip>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    {items.map(({ id, label, value, ratedCount }) => {
                      const color = getColor(value || 0);
                      const valuePct = Math.max(0, Math.min(100, ((value || 0) / 5) * 100));
                      return (
                        <Grid key={id} xs={12} sm={6} md={3}>
                          <Box sx={{ p: 1.2, borderRadius: 'md', bgcolor: 'neutral.softBg', boxShadow: 'sm' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography
                                fontSize="14px"
                                level="body-sm"
                                fontWeight="md"
                                sx={{ color: 'neutral.700' }}
                                startDecorator={iconAbilitiesUi({ id })}
                              >
                                {label}
                              </Typography>
                              <Chip size="sm" variant="outlined" color={color}>
                                {value ? value.toFixed(1) : '-'}
                              </Chip>
                            </Box>
                            <LinearProgress determinate size="sm" variant="plain" color={color} value={valuePct} />
                            <Typography level="body-xs" sx={{ mt: 0.5, color: 'neutral.600' }}>
                              מדורגים: {ratedCount}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </AccordionGroup>
      </Box>
    </Box>
  );
}
