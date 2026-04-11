// C:\projects\devplan\functions\src\services\abilities\submitPublicAbilitiesInvite.http.js

const { onRequest } = require('firebase-functions/v2/https')
const { clean } = require('../../shared/clean')
const { submitPublicAbilitiesInviteService } = require('../../services/abilities/submitPublicAbilitiesInvite.service')

const submitPublicAbilitiesInvite = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method not allowed' })
      }

      const payload = req.body || {}
      const result = await submitPublicAbilitiesInviteService(payload)

      return res.status(200).json(result)
    } catch (error) {
      console.error('submitPublicAbilitiesInvite failed', error)
      return res.status(500).json({
        error: clean(error?.message) || 'submit failed',
      })
    }
  }
)

module.exports = { submitPublicAbilitiesInvite }
