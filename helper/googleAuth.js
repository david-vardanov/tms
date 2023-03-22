// agd/helpers/googleAuth.js
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

async function getAccessToken() {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Redirect URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();
  return accessToken;
}

module.exports = getAccessToken;
