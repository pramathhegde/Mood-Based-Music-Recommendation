import React, { useState } from 'react';
import MoodInput from './components/MoodInput';
import MusicList from './components/MusicList';
import './App.css';
import FaceMoodDetector from './components/FaceMoodDetector';


const App = () => {
  const [songs, setSongs] = useState([]);
  const [detectedMood, setDetectedMood] = useState('');
  const [mode, setMode] = useState('manual');
  const [error, setError] = useState(null);

  const handleMoodSubmit = async (moodText) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/get-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodText }),
      });

      const data = await response.json();
      setDetectedMood(data.mood);
      setSongs(data.songs);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to get recommendations');
      setSongs([]);
    }
  };

  const handleMoodDetected = (mood) => {
    setDetectedMood(mood);
    handleMoodSubmit(mood);
  };

  return (
    <div className="app-container">
      <h1 className="app-header">🎧 Mood-Based Music Recommender</h1>

      <div className="mode-toggle-container">
        <label className={`mode-toggle-label ${mode === 'manual' ? 'active' : ''}`}>
          <input
            type="radio"
            value="manual"
            checked={mode === 'manual'}
            onChange={() => {
              setMode('manual');
              setSongs([]);
              setDetectedMood('');
            }}
          />
          Manual Mood Input
        </label>

        <label className={`mode-toggle-label ${mode === 'webcam' ? 'active' : ''}`}>
          <input
            type="radio"
            value="webcam"
            checked={mode === 'webcam'}
            onChange={() => {
              setMode('webcam');
              setSongs([]);
              setDetectedMood('');
            }}
          />
          Webcam Mood Detection
        </label>
      </div>

      {mode === 'manual' ? (
        <MoodInput onMoodSubmit={handleMoodSubmit} />
      ) : (
        <FaceMoodDetector onMoodDetected={handleMoodDetected} />
      )}


      <p className={`detected-mood ${detectedMood ? 'active' : ''}`}>
        Detected Mood: <strong>{detectedMood || 'None'}</strong>
      </p>

      {error && <p className="error-message">{error}</p>}

      <MusicList songs={songs} />
    </div>
  );
};

export default App;
