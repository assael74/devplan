// src/features/playersDatabase/ui/pages/teamPage/TeamPlayersSection.js

import PageContentPanel from '../../components/page/PageContentPanel.js'
import TeamPlayersTable from './TeamPlayersTable.js'

export default function TeamPlayersSection({
  players,
  team,
  seasonKey,
  onRoleOpen,
  onPlayerOpen,
  onPlayerUrlEdit,
  onFavoriteToggle,
}) {
  return (
    <PageContentPanel
      title='סגל שנתון'
      meta={`${players.length} שחקנים`}
    >
      <TeamPlayersTable
        players={players}
        team={team}
        seasonKey={seasonKey}
        onRoleOpen={onRoleOpen}
        onPlayerOpen={onPlayerOpen}
        onPlayerUrlEdit={onPlayerUrlEdit}
        onFavoriteToggle={onFavoriteToggle}
      />
    </PageContentPanel>
  )
}
