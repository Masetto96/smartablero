import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import React, { useState, useEffect } from "react";
import WeatherDashboard from "./components/WeatherDashboard";
import EventsDashboard from "./components/EventsDashboard";
import CustomCalendar from "./components/Calendar";
import { Container, MantineProvider, Paper, Button, Group } from "@mantine/core";
import { createTheme } from "@mantine/core";

const RotatingDisplay = ({ components }) => {
   const [currentIndex, setCurrentIndex] = useState(0);

   useEffect(() => {
      const handleKeyDown = (event) => {
         if (event.key === "ArrowRight") {
            handleNext();
         } else if (event.key === "ArrowLeft") {
            handlePrev();
         }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
      };
   }, [components.length]);

   const handleNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % components.length);
   };

   const handlePrev = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + components.length) % components.length);
   };

   return (
      <>
         {components[currentIndex]}
      </>
   );
};
// (43, 43, 43)
const colorPalette = {
   backgroundDark: ["rgb(32, 31, 26)"], // Charcoal
   backgroundLight: ["rgba(73, 73, 73, 0.62)"], // Slightly Lighter Grayish Blue
   textPrimary: ["rgba(234, 234, 234, 1)"], // Off-White
   textSecondary: ["rgba(166, 172, 200, 1)"], // Muted Blue Gray
   accentPrimary: ["rgb(207, 90, 90)"], // Soft orange
   accentSuccess: ["rgb(32, 59, 31)"], // Green
   accentInfo: ["rgba(122, 162, 247, 1)"], // Blue
   accentWarning: ["rgba(224, 175, 104, 1)"], // Warm Yellow
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
            c: colorPalette.textSecondary[0],
            ta: "center",
         },
      },
      Paper: {
         defaultProps: {
            radius: "md",
            shadow: "xs",
            style: {
               backgroundColor: colorPalette.backgroundLight[0],
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
   <CustomCalendar key="calendar" />,
   <EventsDashboard key="events" />
   ];

   return (
      <MantineProvider theme={theme}>
         <Container fluid h={1920} style={{ backgroundColor: theme.colors.backgroundDark[0] }}>
            <RotatingDisplay components={displayComponents} />
         </Container>
      </MantineProvider>
   );
}
export default App;