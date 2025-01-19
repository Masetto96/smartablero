import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import React, { useState, useEffect } from "react";
import WeatherDashboard from "./components/WeatherDashboard";
import EventsDashboard from "./components/EventsDashboard";
import { MantineProvider, Paper } from "@mantine/core";
import { createTheme } from "@mantine/core";

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

const theme = createTheme({
   fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
   headings: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
   },
   components: {
      Paper: {
         defaultProps: {
            radius: "md",
            shadow: "xs",
            style: { 
               backgroundColor: "rgba(255, 255, 255, 0.44)",
               margin: "0.5rem",
               padding: "0.5rem"
            },
         },
      },
   },
   colors: {
      background: ["rgba(69, 99, 95, 0.8)"],
   },
});

function App() {
   const displayComponents = [
      <WeatherDashboard key="weather" />,
      // <EventsDashboard key="events" />,
      // Add more components here as needed
   ];

   return (
      <MantineProvider theme={theme}>
         <div style={{ 
            backgroundColor: theme.colors.background[0],
            margin: '2rem',
            padding: '2rem',
            minHeight: 'calc(100vh - 4rem)',
            borderRadius: '1rem'
         }}>
            <RotatingDisplay components={displayComponents} />
         </div>
      </MantineProvider>
   );
}
export default App;
