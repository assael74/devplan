import { Typography } from '@mui/joy'

import { TransferSummary } from '../../../components/club/ClubInsightPrimitives.js'

export default function ClubTransfers({ model }) {
  if (model.status === 'NOT_LOADED') {
    return (
      <Typography level='body-sm'>
        אין נתוני העברות
      </Typography>
    )
  }

  return <TransferSummary model={model} />
}
