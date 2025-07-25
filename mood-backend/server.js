const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = '0cb4a85d0d26456597b3014f27c65bf6';
const CLIENT_SECRET = '12f4bbab033c4a35b05831a4892cad4e';

let accessToken = '';

// Function to retrieve access token from Spotify
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  accessToken = data.access_token;
}

// Define mood-to-query mapping
const moodToQuery = {
  happy: "happy upbeat pop dance feel-good cheerful",
  sad: "sad emotional acoustic piano mellow heartbroken",
  angry: "angry rock metal aggressive intense rebellious rage",
  neutral: "chill instrumental ambient background calm relax lo-fi",
  surprised: "surprise energetic exciting edm unexpected funky hype",
};

// API endpoint to handle mood-based song search
app.post('/api/search', async (req, res) => {
  const { mood } = req.body;

  if (!accessToken) await getAccessToken();

  const query = moodToQuery[mood] || mood;

  // 🎲 Generate random offset (up to 50)
  const offset = Math.floor(Math.random() * 50);

  try {
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Spotify API error: ${searchResponse.status}`);
    }

    const data = await searchResponse.json();

    const songs = (data.tracks?.items || []).map((track) => ({
      title: track?.name || 'Unknown',
      artist: track?.artists?.[0]?.name || 'Unknown',
      url: track?.external_urls?.spotify || '#',
    }));

    res.json({ songs });
  } catch (error) {
    console.error('Error fetching from Spotify:', error);
    res.status(500).json({
      error: 'Failed to fetch songs',
      details: error.message,
    });
  }
});


app.listen(3001, () => {
  console.log('Spotify server listening on port 3001');
});
