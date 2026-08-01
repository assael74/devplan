import { publishPublicReport } from '../../service/index.js'

export async function publishDbSearchReport(input = {}) {
  const result = await publishPublicReport(input)

  return {
    input,
    result,
  }
}
