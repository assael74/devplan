// src/features/playersDatabase/services/write/roster/writeRosterClubsCenter.js

import { writeClubsCenter } from '../league/writeClubsCenter.js'

export const writeRosterClubsCenter = ({ approvedState = {} } = {}) => writeClubsCenter({ approvedState })

export default writeRosterClubsCenter
