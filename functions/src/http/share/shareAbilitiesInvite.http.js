// C:\projects\devplan\functions\src\http\share\shareAbilitiesInvite.http.js

const { onRequest } = require('firebase-functions/v2/https')
const { clean } = require('../../shared/clean')
const { buildAppUrl } = require('../../shared/buildAppUrl')
const { extractLastPathPart } = require('../../shared/extractLastPathPart')
const { getAbilitiesInviteByTokenAdmin } = require('../../repositories/abilities/abilitiesInvites.repo')
const { buildAbilitiesInviteOgHtml } = require('../../services/share/buildAbilitiesInviteOgHtml')

const shareAbilitiesInvite = onRequest({ region: 'europe-west1' }, async (req, res) => {
  try {
    const token = extractLastPathPart(req)

    if (!token) {
      return res.status(400).send('missing token')
    }

    const invite = await getAbilitiesInviteByTokenAdmin(token)

    const pageUrl = buildAppUrl(`/share/abilities/${token}`)
    const redirectUrl = buildAppUrl(`/forms/abilities/${token}`)
    const fallbackImage = buildAppUrl('/playerImage.jpg')

    if (!invite) {
      const html = buildAbilitiesInviteOgHtml({
        title: 'טופס הערכת יכולות לשחקן',
        description: 'קישור לטופס הערכת יכולות לשחקן',
        image: fallbackImage,
        pageUrl,
        redirectUrl,
      })

      res.set('Cache-Control', 'public, max-age=60')
      return res.status(200).send(html)
    }

    const playerName = clean(invite?.player?.fullName) || 'שחקן'
    const teamName = clean(invite?.team?.teamName)
    const evaluatorName =
      clean(invite?.evaluator?.fullName) ||
      clean(invite?.evaluator?.type)

    const title = `טופס הערכת יכולות · ${playerName}`

    const descriptionParts = []
    if (teamName) descriptionParts.push(`קבוצה: ${teamName}`)
    if (evaluatorName) descriptionParts.push(`מעריך: ${evaluatorName}`)
    descriptionParts.push('מילוי קצר בנייד, ללא צורך בהתחברות.')

    const description = descriptionParts.join(' · ')
    const image = clean(invite?.player?.photo) || fallbackImage

    const html = buildAbilitiesInviteOgHtml({
      title,
      description,
      image,
      pageUrl,
      redirectUrl,
    })

    res.set('Cache-Control', 'public, max-age=300')
    return res.status(200).send(html)
  } catch (error) {
    console.error('shareAbilitiesInvite failed', error)
    return res.status(500).send('internal error')
  }
})

module.exports = { shareAbilitiesInvite }
