import { Box, Table, Typography } from '@mui/joy'

import { clubPageSx as sx } from '../sx/clubPage.sx.js'

const displayValue = value => (
  value === null || value === undefined ? '-' : value
)

export default function ClubSeasons({ model, onOpenTeam }) {
  return (
    <Box sx={sx.sections}>
      {model.map(season => (
        <Box key={season.seasonKey}>
          <Typography level='title-sm'>
            {season.seasonKey}
          </Typography>

          <Table size='sm' sx={sx.seasonTable}>
            <thead>
              <tr>
                <th>קבוצת גיל</th>
                <th>שנתון</th>
                <th>slot</th>
                <th>רמה</th>
                <th>מיקום</th>
                <th>ביצוע</th>
                <th>התקפה</th>
                <th>כבשו</th>
                <th>ספגו</th>
              </tr>
            </thead>
            <tbody>
              {season.teams.map(team => (
                <tr
                  key={team.teamId}
                  onClick={() => onOpenTeam(team)}
                  style={sx.seasonRow(Boolean(team.leagueId))}
                >
                  <td>{team.ageGroupLabel || '-'}</td>
                  <td>{team.birthYear || '-'}</td>
                  <td>{team.slot}</td>
                  <td>{team.leagueLevelLabel}</td>
                  <td>{team.tableRank || '-'}</td>
                  <td>{team.teamPerformance}</td>
                  <td>{team.attackPerformance}</td>
                  <td>{displayValue(team.goalsFor)}</td>
                  <td>{displayValue(team.goalsAgainst)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      ))}
    </Box>
  )
}
