import "./App.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import React, { useState, useEffect } from "react";
import WeatherDashboard from "./components/WeatherDashboard";
import EventsDashboard from "./components/EventsDashboard";
import CustomCalendar from "./components/Calendar";
import NewsFeed from "./components/NewsDashboard";
import { Container, MantineProvider, Paper, Button, Group, Loader } from "@mantine/core";
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

const colorPalette = {
   backgroundDark: ["rgb(24, 26, 29)"], 
   backgroundLight: ["rgba(73, 73, 73, 0.62)"],
   textPrimary: ["rgb(232, 232, 232)"], 
   textSecondary: ["rgb(225, 208, 196)"], 
   accentPrimary: ["rgb(90, 191, 207)"],
   accentSuccess: ["rgb(146, 68, 19)"], 
   accentInfo: ["rgba(122, 162, 247, 1)"],
   accentWarning: ["rgba(224, 175, 104, 1)"], 
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
      Card : {
         defaultProps: {
            shadow: "xs",
            radius: "lg",
            style: {
               backgroundColor: colorPalette.backgroundLight[0],
               margin: "0.5rem",
               padding: "0.5rem",
            },
         },
      },
      Loader: {
         defaultProps: {
            color: colorPalette.accentWarning[0],
            size: "xl",
            // type: "dots",
         },
         styles: {
            root: {
               position: 'absolute',
               top: '50%',
               left: '50%',
               transform: 'translate(-50%, -50%)',
            }
         }
      },
   },
   colors: colorPalette,
});

function App() {
   const displayComponents = [
   <WeatherDashboard key="weather" />,
   <CustomCalendar key="calendar" />,
   <EventsDashboard key="events" />,
   <NewsFeed key="news" />,
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