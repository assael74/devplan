// C:\projects\devplan\functions\src\services\share\buildAbilitiesInviteOgHtml.js

const { escapeHtml } = require('../../shared/escapeHtml')

function buildAbilitiesInviteOgHtml({
  title,
  description,
  image,
  pageUrl,
  redirectUrl,
}) {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImage = escapeHtml(image)
  const safePageUrl = escapeHtml(pageUrl)
  const safeRedirectUrl = escapeHtml(redirectUrl)

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <meta property="og:locale" content="he_IL" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safePageUrl}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:alt" content="${safeTitle}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />

  <meta http-equiv="refresh" content="0;url=${safeRedirectUrl}" />

  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: Arial, sans-serif; padding: 24px;">
  <div>מעביר לטופס...</div>
  <div style="margin-top:12px; direction:ltr;">${safeRedirectUrl}</div>
</body>
</html>`
}

module.exports = { buildAbilitiesInviteOgHtml }
