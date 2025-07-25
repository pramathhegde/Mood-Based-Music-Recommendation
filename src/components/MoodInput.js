import React, { useState, useEffect, useRef } from 'react';
import './MoodInput.css'

const MoodInput = ({ onMoodSubmit }) => {
  const [moodText, setMoodText] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMoodText(transcript);
      onMoodSubmit(transcript);
      setListening(false);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };
  }, [onMoodSubmit]);

  const handleStartListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (moodText.trim() !== '') {
      onMoodSubmit(moodText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mood-form">
      <input
        type="text"
        value={moodText}
        onChange={(e) => setMoodText(e.target.value)}
        placeholder="Enter your mood"
        className="mood-input"
      />
      {/* Speak button right next to input */}
      <button
        type="button"
        className="submit-button voice-button"
        onClick={handleStartListening}
        disabled={listening}
      >
        {listening ? 'Listening...' : '🎤 Speak'}
      </button>

      {/* Submit button separate */}
      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
};

export default MoodInput;
