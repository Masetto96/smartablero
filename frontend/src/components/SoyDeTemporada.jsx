import React from 'react';

const SoyDeTemporada = () => {
  const handleWheel = (e) => {
    const iframe = e.currentTarget.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      // Forward scroll to iframe
      iframe.contentWindow.scrollBy(0, e.deltaY);
    }
  };

  return (
    <div 
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgb(32, 31, 26)',
        padding: '1rem',
        overflow: 'hidden',
        position: 'relative',
      }}
      onWheel={handleWheel}
    >
      <iframe 
        src="https://soydetemporada.es/"
        width="100%"
        style={{
          flex: 1,
          border: '3px solid #606c38',
          borderRadius: '8px',
          backgroundColor: '#fefae0',
          transform: 'scale(1.3) translateY(-400px)',
          transformOrigin: 'top center',
          minHeight: 'calc(100% + 300px)',
        }}
        title="Soy de Temporada - Seasonal Food"
      />
      {/* Transparent overlay to prevent clicks but allow scrolling */}
      <div 
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          bottom: '1rem',
          backgroundColor: 'transparent',
          cursor: 'default',
        }}
      />
    </div>
  );
};

export default SoyDeTemporada;
