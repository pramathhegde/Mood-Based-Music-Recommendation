// spotify.js

const axios = require('axios');
const qs = require('qs');

const clientId = '0cb4a85d0d26456597b3014f27c65bf6';
const clientSecret = '12f4bbab033c4a35b05831a4892cad4e';

async function getSpotifyAccessToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';

  try {
    const response = await axios.post(tokenUrl, qs.stringify({ grant_type: 'client_credentials' }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error.response.data);
    throw error;
  }
}

module.exports = { getSpotifyAccessToken };
