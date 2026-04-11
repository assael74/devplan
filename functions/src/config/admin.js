// C:\projects\devplan\functions\src\config\admin.js

const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

module.exports = {
  admin,
  db,
}
