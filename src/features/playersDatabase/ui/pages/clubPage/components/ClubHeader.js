import { Box, Typography } from '@mui/joy'

import ClubIdentity from '../../../components/club/ClubIdentity.js'

export default function ClubHeader({ model }) {
  return (
    <Box>
      <ClubIdentity club={model.club} />
      {model.club?.shortName ? (
        <Typography level='body-sm'>
          {model.club.shortName}
        </Typography>
      ) : null}
    </Box>
  )
}
