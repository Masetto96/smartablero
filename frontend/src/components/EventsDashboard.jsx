import React, { useEffect, useState } from "react";
import { Grid, Text, Stack, Box, Group, Center } from "@mantine/core";
import ConcertsList from "./ConcertsList";
import MoviesList from "./MoviesList";
import marulaCafeLogo from "../assets/Logo-Marula-Cafe.png";
import zumzeigLogo from "../assets/zumzeig.png";

const EventsDashboard = () => {
   const [movieData, setMovieData] = useState([]);
   const [concertData, setConcertData] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchMovieData = async () => {
         try {
            const response = await fetch("http://127.0.0.1:8000/movies");
            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMovieData(data.data);
         } catch (e) {
            setError(e.message || "Failed to fetch movie data");
         } finally {
            setIsLoading(false);
         }
      };

      const fetchConcertData = async () => {
         try {
            const response = await fetch("http://127.0.0.1:8000/events");
            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setConcertData(data.data);
         } catch (e) {
            setError(e.message || "Failed to fetch concert data");
         } finally {
            setIsLoading(false);
         }
      };

      fetchMovieData();
      fetchConcertData();
   }, []);

   if (isLoading) {
      return <div className="text-lg text-gray-500">Loading data...</div>;
   }

   if (error) {
      return <div className="text-red-800">{error}</div>;
   }

   return (
      <Grid
         gutter="xl"
         p="md"
         h="100vh"
         style={{
            maxHeight: "1080px",
            overflow: "hidden",
         }}
      >
         <Grid.Col span={6}>
            <Stack h="100%">
               <Center>
                  <img src={marulaCafeLogo} alt="marula" style={{ maxHeight: "65px" }} />
               </Center>

               <Box
                  style={{
                     // overflowY: "auto",
                     maxHeight: "calc(1080px - 4rem)", // Account for header and padding
                  }}
               >
                  <ConcertsList events={concertData} />
               </Box>
            </Stack>
         </Grid.Col>

         <Grid.Col span={6}>
            <Stack h="100%">
               <Center>
                  <img src={zumzeigLogo} alt="zumzeig" style={{ maxHeight: "65px", borderRadius: "20%" }} />
               </Center>
               <Box
                  style={{
                     // overflowY: "auto",
                     maxHeight: "calc(1080px - 4rem)", // Account for header and padding
                  }}
               >
                  <MoviesList movies={movieData} />
               </Box>
            </Stack>
         </Grid.Col>
      </Grid>
   );
};

export default EventsDashboard;
