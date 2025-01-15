import React, { useState, useEffect } from 'react';

const RotatingDisplay = ({ components, intervalMs = 90000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % components.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [components.length, intervalMs]);

  return <>{components[currentIndex]}</>;
};

export default RotatingDisplay;