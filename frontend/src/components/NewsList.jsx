import React, { useState, useEffect } from "react";
import "./NewsList.css";

const NewsCard = ({ article, index }) => {
   // Cycle through vintage colors for different cards
   const colors = [
      // { name: "moss", value: "#606c38" },
      { name: "earth", value: "#dda15e" },
      { name: "tiger", value: "#bc6c25" },
      { name: "cornsilk", value: "#f4e285" },
   ];

   const colorScheme = colors[index % colors.length];
   const color = colorScheme.value;

   const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
      });
   };

   return (
      <div
         className={`news-card vintage-border news-card-${colorScheme.name}`}
         style={{
            "--card-color": color,
            border: `3px solid ${color}`,
            backgroundColor: "rgba(254, 250, 224, 0.05)",
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
                  {article.section?.toUpperCase() || "NEWS"}
               </div>
               {article.published_date && (
                  <div className="news-date" style={{ color: color }}>
                     {formatDate(article.published_date)}
                  </div>
               )}
            </div>

            <h3 className="news-title vintage-text" style={{ color: color }}>
               {article.title}
            </h3>

            {article.summary && (
               <p className="news-summary" style={{ color: "#fefae0" }}>
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
                  background: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, transparent 6px, transparent 12px)`,
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
               <NewsCard key={`${article.url}-${index}`} article={article} index={index} />
            ))}
         </div>
      </div>
   );
};

const NewsList = () => {
   const [allArticles, setAllArticles] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedSections] = useState([
      "education",
      "culture",
      "politics",
      "society",
      "world",
      "environment",
      "science",
      "technology",
   ]);
   const [activeSection, setActiveSection] = useState(null); // null means show overview
   const trackRef = React.useRef(null);

   useEffect(() => {
      const fetchNews = async () => {
         try {
            setLoading(true);
            const articles = [];

            // Fetch news for each section and combine
            for (const section of selectedSections) {
               const response = await fetch(`http://localhost:8000/news?section=${section}&page_size=15`);

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



   if (loading) {
      return (
         <div className="news-loading vintage-paper">
            <div className="loading-spinner" style={{ color: "#dda15e" }}>
               <div className="typewriter">Loading news...</div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="news-error vintage-paper" style={{ borderColor: "#bc6c25" }}>
            <h2 style={{ color: "#bc6c25" }}>ERROR</h2>
            <p style={{ color: "#fefae0" }}>{error}</p>
         </div>
      );
   }

   // Group articles by section
   const articlesBySection = {};
   allArticles.forEach((article) => {
      const section = article.section || "Other";
      if (!articlesBySection[section]) {
         articlesBySection[section] = [];
      }
      articlesBySection[section].push(article);
   });

   const colors = [
      // { name: "moss", value: "#606c38" },
      { name: "earth", value: "#dda15e" },
      { name: "tiger", value: "#bc6c25" },
      { name: "cornsilk", value: "#e0d07fff" },

   ];

   // If a section is selected, show static grid view
   if (activeSection) {
      const sectionArticles = articlesBySection[activeSection] || [];
      const colorIndex = Object.keys(articlesBySection).indexOf(activeSection) % colors.length;
      const color = colors[colorIndex].value;

      return (
         <div className="news-container">
            <div className="news-section-header">
               <button
                  className="news-back-button"
                  onClick={() => setActiveSection(null)}
                  style={{ borderColor: color, color: color }}
               >
                  ← BACK TO SECTIONS
               </button>
               <h2 className="news-section-title" style={{ color: color }}>
                  {activeSection.toUpperCase()}
               </h2>
            </div>

            <div className="news-section-detail-grid">
               {sectionArticles.map((article, index) => (
                  <NewsCard key={`article-${index}`} article={article} index={index} />
               ))}
            </div>
         </div>
      );
   }

   // Show section overview
   return (
      <div className="news-container" style={{ height: '100%', width: '100%', overflow: 'auto', padding: '1rem', boxSizing: 'border-box' }}>
         <div className="news-sections-grid">
            {Object.entries(articlesBySection).map(([section, articles], index) => {
               const colorScheme = colors[index % colors.length];
               const color = colorScheme.value;

               return (
                  <div
                     key={section}
                     className={`news-section-card news-section-card-${colorScheme.name}`}
                     style={{
                        border: `3px solid ${color}`,
                        backgroundColor: "rgba(254, 250, 224, 0.05)",
                     }}
                     onClick={() => setActiveSection(section)}
                  >
                     <div className="news-section-card-content">
                        <h2 className="news-section-card-title" style={{ color: color }}>
                           {section.toUpperCase()}
                        </h2>
                        <div className="news-section-card-preview" style={{ color: "#fefae0" }}>
                           {articles.slice(0, 3).map((article, i) => (
                              <div key={i} className="news-section-preview-item">
                                 • {article.title}
                              </div>
                           ))}
                        </div>
                        <div className="news-section-card-arrow" style={{ color: color }}>
                           VIEW ALL →
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default NewsList;
