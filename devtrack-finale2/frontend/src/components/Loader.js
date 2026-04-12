// frontend/src/components/Loader.js
import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-page">
      <div className="loader-ring" />
      <p className="loader-text">{message}</p>
    </div>
  );
};

export default Loader;
