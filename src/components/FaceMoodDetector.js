import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './FaceMoodDetector.css';

const FaceMoodDetector = ({ onMoodDetected }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };

    loadModels();

    return () => stopVideoStream();
  }, []);

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startVideo = () => {
    setLoading(true);
    setMessage('Starting webcam...');

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setMessage('Analyzing mood...');
            captureStableMood(); // Start detection once video is ready
          };
        }
      })
      .catch(err => {
        console.error('Error accessing webcam:', err);
        setMessage('Webcam error');
        setLoading(false);
      });
  };

  const captureStableMood = () => {
    const moodCounts = {};
    let count = 0;
    const interval = setInterval(async () => {
      if (videoRef.current) {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detection && detection.expressions) {
          const expressions = detection.expressions;
          const mood = Object.entries(expressions).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
          count++;
        }
      }

      if (count >= 5) { // After 5 readings (approx 5 seconds)
        clearInterval(interval);
        const finalMood = Object.entries(moodCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
        setMessage(`Detected mood: ${finalMood}`);
        onMoodDetected(finalMood.toLowerCase());
        stopVideoStream();
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
      {!loading ? (
        <button onClick={startVideo} disabled={!modelsLoaded} className='webcam_start'>
          {modelsLoaded ? 'Start Webcam' : 'Loading models...'}
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="320"
            height="240"
            style={{ borderRadius: '10px', border: '1px solid #ccc' }}
          />
          <p>{message}</p>
        </>
      )}
    </div>
  );
};

export default FaceMoodDetector;
