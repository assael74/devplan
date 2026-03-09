export const shortsSchema = {
  "players.playersInfo": { required: ["id","birth","active"] },
  "players.playersNames": { required: ["id","playerLastName","playerFirstName"] },
  "players.playersParents": { required: ["id"] },
  "players.playersPaymentsId": { required: ["id"] },
  "players.playersTeam": { required: ["id","clubId","teamId"] },
  "players.playersProInfo": { required: ["id"] },
  "players.playersAbilities": { required: ["id"] },

  "teams.teamsInfo": { required: ["id","teamName","clubId","active","teamYear"] },
  "teams.teamsMeeting": { required: ["id"] },
  "teams.teamsTraining": { required: ["id"] },

  "clubs.clubsInfo": { required: ["id","active","clubName"] },
}
