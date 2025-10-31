import React, { useState, useEffect } from "react";
import "./NewsList.css";

const NewsCard = ({ article, index }) => {
  // Cycle through vintage colors for different cards
  const colors = [
    { name: 'moss', value: '#606c38' },
    { name: 'earth', value: '#dda15e' },
    { name: 'tiger', value: '#bc6c25' },
  ];
  
  const colorScheme = colors[index % colors.length];
  const color = colorScheme.value;
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`news-card vintage-border news-card-${colorScheme.name}`}
      style={{
        '--card-color': color,
        border: `3px solid ${color}`,
        backgroundColor: 'rgba(254, 250, 224, 0.05)',
      }}
    >
      <div className="news-card-content">
        <div className="news-card-header">
          <div 
            className="news-section-tag"
            style={{
              borderColor: color,
              color: color,
            }}
          >
            {article.section?.toUpperCase() || 'NEWS'}
          </div>
          {article.published_date && (
            <div 
              className="news-date"
              style={{ color: color }}
            >
              {formatDate(article.published_date)}
            </div>
          )}
        </div>
        
        <h3 
          className="news-title vintage-text"
          style={{ color: color }}
        >
          {article.title}
        </h3>
        
        {article.summary && (
          <p 
            className="news-summary"
            style={{ color: '#fefae0' }}
          >
            {article.summary}
          </p>
        )}
        
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-read-more"
          style={{
            color: color,
            borderColor: color,
          }}
        >
          READ MORE →
        </a>
        
        <div 
          className="news-card-divider"
          style={{ 
            background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, transparent 6px, transparent 12px)` 
          }} 
        />
      </div>
    </div>
  );
};

const SectionGroup = ({ section, articles }) => {
  return (
    <div className="section-group">
      <div className="news-grid">
        {articles.map((article, index) => (
          <NewsCard 
            key={`${article.url}-${index}`} 
            article={article} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

const NewsList = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSections] = useState(['culture', 'politics', 'society']);
  const trackRef = React.useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const articles = [];
        
        // Fetch news for each section and combine
        for (const section of selectedSections) {
          const response = await fetch(
            `http://localhost:8000/news?section=${section}&page_size=10`
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch news for ${section}`);
          }
          
          const data = await response.json();
          articles.push(...data.articles);
        }
        
        setAllArticles(articles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedSections]);

  useEffect(() => {
    if (!trackRef.current || allArticles.length === 0) return;

    const track = trackRef.current;
    let animationId;
    let position = 0;
    const speed = 0.2; // pixels per frame - lower = slower (try 0.1 - 1.0)

    const animate = () => {
      position -= speed;
      
      // Calculate the width of one complete set of articles
      const firstChild = track.firstElementChild;
      if (firstChild) {
        const itemWidth = firstChild.offsetWidth;
        const gap = 24; // 1.5rem = 24px
        const totalWidth = (itemWidth + gap) * allArticles.length;
        
        // Reset position when we've scrolled past one full set
        if (Math.abs(position) >= totalWidth) {
          position = 0;
        }
      }
      
      track.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [allArticles]);

  if (loading) {
    return (
      <div className="news-loading vintage-paper">
        <div className="loading-spinner" style={{ color: '#dda15e' }}>
          <div className="typewriter">Loading news...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-error vintage-paper" style={{ borderColor: '#bc6c25' }}>
        <h2 style={{ color: '#bc6c25' }}>ERROR</h2>
        <p style={{ color: '#fefae0' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-rolling-container">
        <div className="news-rolling-track" ref={trackRef}>
          {allArticles.map((article, index) => (
            <div key={`article-${index}`} className="news-rolling-item">
              <NewsCard article={article} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsList;
