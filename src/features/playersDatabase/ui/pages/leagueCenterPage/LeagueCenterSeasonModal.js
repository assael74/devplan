// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterSeasonModal.js

import { CreateSeasonModal } from '../../components/modals/index.js'

export default function LeagueCenterSeasonModal({ controller, defaultSeasonKey }) {
  return (
    <CreateSeasonModal
      open={Boolean(controller.league)}
      league={controller.league}
      defaultSeasonKey={defaultSeasonKey}
      lockSeason
      lockTarget
      busy={controller.busy}
      onClose={controller.close}
      onConfirm={controller.confirm}
    />
  )
}
