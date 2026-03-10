// src/services/firestore/shorts/shorts.refs.js

export const shortsRefs = {
 clubs: {
   clubsInfo: { collection: 'clubsShorts', docId: '7gQMJVni7QDVabieoGsm' },
 },

 teams: {
   teamsInfo: { collection: 'teamsShorts', docId: 'Fx1rytOdDJee4DtesHSj' },
   teamsMeeting: { collection: 'teamsShorts', docId: 'ZDCrkDSK0UZB65pB7JHU' },
   teamsTraining: { collection: 'teamsShorts', docId: 'dCCoNIsyQBiVCrHpTRbH' },
 },

 players: {
   playersTeam: { collection: 'playersShorts', docId: '2alnt6Ibw5mozoYdk65j' },
   playersInfo: { collection: 'playersShorts', docId: '93YWbxDb9uV7YprEukhg' },
   playersPaymentsId: { collection: 'playersShorts', docId: 'hBXi4ncY2Cskka7mKhn5' },
   playersNames: { collection: 'playersShorts', docId: 'hZ8i5PK5TqPRMYIveg4a' },
   playersProInfo: { collection: 'playersShorts', docId: 'kq1KXaHpIy4Trp7tuCFB' },
   playersParents: { collection: 'playersShorts', docId: 'pr4alU7a1c2MxTivUXEb' },
   playersAbilities: { collection: 'playersShorts', docId: 'CxI3w6ztc9KfTxJLP8zS' },
 },

 payments: {
   paymentOperative: { collection: 'playerPaymentsShorts', docId: 'gmgxFJa9xI1wc28JvE1X' },
   paymentProfit: { collection: 'playerPaymentsShorts', docId: 'pQoiqVKSc94FsAqpCYlT' },
 },

 meetings: {
   meetingDate: { collection: 'meetingShorts', docId: '8V1UmfUSpQwdx9LdWzeD' },
   meetingVideo: { collection: 'meetingShorts', docId: 'Kc1fm8c1RdrBQhAuavuK' },
   meetingPlayer: { collection: 'meetingShorts', docId: 'ZTSPHFV9uAfYNxw33I0b' },
   meetingNotes: { collection: 'meetingShorts', docId: 'osfDQ7rWAKa3dwpey6zE' },
 },

 games: {
   gameInfo: { collection: 'gamesShorts', docId: 'N7XGvQajspQjInGeic5H' },
   gameTime: { collection: 'gamesShorts', docId: 'ieMXdjDAkhbe0W2DlJw8' },
   gameResult: { collection: 'gamesShorts', docId: 'xrSqD98vpvQOMwB9cp4b' },
   gamePlayers: { collection: 'gamesShorts', docId: '41kNZj14UWekfr8KBBK8' },
 },

 videos: {
   videoInfo: { collection: 'videosShorts', docId: 'TaNSHspuCBvjlKTHd6Zf' },
   videoNotes: { collection: 'videosShorts', docId: 'pmxOHtxpLArFok7ddtYR' },
   videoTags: { collection: 'videosShorts', docId: 'tiKWGR2Wsv1miNaVbfGi' },
 },

 roles: {
   rolesInfo: { collection: 'rolesShorts', docId: 'pDOcZnt5THXwyYtp7ddh' },
   rolesContact: { collection: 'rolesShorts', docId: 'ZasRKFOBG1VOhSAKfwa5' },
 },

 videoAnalysis: {
   analysisNotes: { collection: 'videoAnalysisShorts', docId: '06MoPvl9f9ZFSAlDP4Yu' },
   analysisInfo: { collection: 'videoAnalysisShorts', docId: 'BVL0OvaOA0OmZFoZmLEN' },
   analysisTags: { collection: 'videoAnalysisShorts', docId: 'T9e0yEehpXk5SUcpj6Fj' },
 },

 scouting: {
   playersInfo: { collection: 'scoutingShorts', docId: 'P2qROYuW7zveaJKah3xA' },
   playersGames: { collection: 'scoutingShorts', docId: 'SfAIsZkn1XtMYNrsY5HN' },
 },

 tags: {
   tagInfo: { collection: 'tagsShorts', docId: 'LkifVVOk7xhkjB8wYEBz' },
 }
}
