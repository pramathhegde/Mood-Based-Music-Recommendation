// src/components/MusicList.js
import React from 'react';
import './MusicList.css';

const MusicList = ({ songs }) => {
  return (
    <div className="music-list">
      <h2>Recommended Songs</h2>
      <ul>
        {songs.map((song, index) => (
          <li key={index}>
            <a href={song.url} target="_blank" rel="noopener noreferrer">
              🎵 {song.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MusicList;
