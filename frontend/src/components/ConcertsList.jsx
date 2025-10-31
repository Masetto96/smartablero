import React, { useState, useEffect } from "react";
import "../components/ConcertsList.css";

const ConcertCard = ({ date, description, venue, index }) => {
  // Alternate colors between cyan, magenta, and lime for visual variety
  const colors = [
    { var: '--retro-cyan', name: 'cyan' },
    { var: '--retro-magenta', name: 'magenta' },
    { var: '--retro-lime', name: 'lime' },
  ];
  
  const colorScheme = colors[index % colors.length];
  const color = `hsl(var(${colorScheme.var}))`;
  
  return (
    <div 
      className={`concert-card scanlines pixel-border concert-card-${colorScheme.name}`}
      style={{
        '--card-color': color,
        position: 'relative',
        padding: '1.5rem',
        border: `4px solid ${color}`,
        backgroundColor: `hsl(var(${colorScheme.var}) / 0.1)`,
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ position: 'relative', zIndex: 20 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '1rem' 
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            padding: '0.25rem 0.5rem',
            border: `2px solid ${color}`,
            color: color,
          }}>
            {venue.toUpperCase()}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: color,
          }}>{date}</div>
        </div>
        
        <h3 className="retro-glow" style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: color,
        }}>
          {description}
        </h3>
        
        <div style={{ 
          marginTop: '1rem',
          height: '4px',
          background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 4px, transparent 4px, transparent 8px)` 
        }} />
      </div>
    </div>
  );
};

const ConcertsList = () => {
  const [venuesData, setVenuesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/concerts');
        if (!response.ok) {
          throw new Error('Failed to fetch concerts');
        }
        const data = await response.json();
        setVenuesData(data.venues);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div className="retro-glow" style={{
          color: 'hsl(var(--retro-cyan))',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}>
          LOADING CONCERTS...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div className="pixel-border" style={{
          color: 'hsl(var(--destructive))',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          border: '4px solid hsl(var(--destructive))',
          padding: '2rem',
        }}>
          ERROR: {error}
        </div>
      </div>
    );
  }

  // Check if there are any events across all venues
  const hasEvents = Object.values(venuesData).some(venue => venue.events && venue.events.length > 0);

  if (!hasEvents) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          color: 'hsl(var(--muted-foreground))',
          fontSize: '1.25rem',
          fontWeight: 'bold',
        }}>
          NO CONCERTS SCHEDULED
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 className="retro-glow" style={{
        fontSize: '2.25rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: 'hsl(var(--retro-cyan))',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign: 'center',
      }}>
        VAMOS A BAILAR
      </h2>
      
      {Object.entries(venuesData).map(([venueName, venueData]) => (
        venueData.events && venueData.events.length > 0 && (
          <div key={venueName} style={{ marginBottom: '3rem' }}>
            <h3 className="retro-glow" style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              color: 'hsl(var(--retro-magenta))',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {venueName}
            </h3>
            <div className="concerts-grid">
              {venueData.events.map((concert, index) => (
                <ConcertCard 
                  key={`${venueName}-${index}`}
                  date={concert.date}
                  description={concert.description}
                  venue={venueName}
                  index={index}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default ConcertsList;
