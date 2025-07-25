from flask import Flask, request, jsonify
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import requests

app = Flask(__name__)
CORS(app)

analyzer = SentimentIntensityAnalyzer()

@app.route('/api/get-music', methods=['POST'])
def get_music():
    data = request.get_json()
    input_mood = data.get('mood', '').strip().lower()

    if not input_mood:
        return jsonify({"error": "Empty mood text", "mood": None, "songs": []}), 400

    # Allow frontend-detected moods directly
    valid_moods = {'happy', 'sad', 'angry', 'neutral', 'surprised'}

    if input_mood in valid_moods:
        mood = input_mood
    else:
        # Fallback: VADER analysis if it's not a recognized mood
        scores = analyzer.polarity_scores(input_mood)
        compound = scores['compound']
        neg = scores['neg']
        pos = scores['pos']
        neu = scores['neu']

        if pos > 0.4 and compound > 0.3:
            mood = 'happy'
        elif neg > 0.4 and compound < -0.3:
            mood = 'sad'
        elif neg > 0.6 and compound <= -0.5:
            mood = 'angry'
        elif neu > 0.7:
            mood = 'neutral'
        else:
            mood = 'neutral'

    print(f"Detected mood: {mood}")

    # Call Node.js Spotify server
    try:
        node_response = requests.post('http://localhost:3001/api/search', json={'mood': mood})
        node_data = node_response.json()
        songs = node_data.get('songs', [])
    except Exception as e:
        print("Error contacting Spotify Node server:", e)
        songs = []

    return jsonify({"mood": mood, "songs": songs})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
