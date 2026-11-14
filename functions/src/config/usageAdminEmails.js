// functions/src/config/usageAdminEmails.js
function getUsageAdminEmails() {
  return new Set(String(process.env.FIRESTORE_USAGE_ADMIN_EMAILS || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean))
}

module.exports = { getUsageAdminEmails }
