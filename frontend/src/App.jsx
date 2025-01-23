import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import React, { useState, useEffect } from "react";
import WeatherDashboard from "./components/WeatherDashboard";
import EventsDashboard from "./components/EventsDashboard";
import { Container, MantineProvider, Paper } from "@mantine/core";
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

const colorPalette = {
   faluRed: ["rgba(114, 24, 23, 1)"],
   frenchGray: ["rgba(207, 199, 210, 1)"],
   prussianBlue: ["rgba(14, 39, 60, 1)"],
   khaki: ["rgba(158, 152, 133, 1)"],
};

const theme = createTheme({
   colorScheme: "dark",
   fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
   headings: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
   },
   components: {
      Text: {
         defaultProps: {
            c: colorPalette.khaki[0],
         },
      }, // <-- Added missing comma and closing brace
      Paper: {
         defaultProps: {
            radius: "md",
            shadow: "xs",
            style: {
               backgroundColor: "rgba(255, 255, 255, 0.1)",
               margin: "0.5rem",
               padding: "0.5rem",
            },
         },
      },
   },
   colors: colorPalette,
});

function App() {
   const displayComponents = [
      <WeatherDashboard key="weather" />,
      // <EventsDashboard key="events" />,
   ];

   return (
      <MantineProvider theme={theme}>
         <Container fluid h={1920} style={{ backgroundColor: theme.colors.prussianBlue[0]}}>
            <RotatingDisplay components={displayComponents} />
         </Container>
      </MantineProvider>
   );
}
export default App;
