import React, { useEffect, useState } from "react";
import { Grid, Stack, Center, Space } from "@mantine/core";
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
            // const response = await fetch("api/movies");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/movies`);
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
            // const response = await fetch("api/events");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/events`);
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
      <Grid overflow="hidden">
         <Grid.Col span={6}>
            <Stack>
               <Space h="xs" />
               <Center>
                  <img src={marulaCafeLogo} alt="marula" style={{ maxHeight: "65px" }} />
               </Center>
               <ConcertsList events={concertData} />
            </Stack>
         </Grid.Col>
         <Grid.Col span={6}>
            <Stack>
               <Space h="xs" />
               <Center>
                  <img src={zumzeigLogo} alt="zumzeig" style={{ maxHeight: "65px", borderRadius: "20%" }} />
               </Center>
               <MoviesList movies={movieData} />
            </Stack>
         </Grid.Col>
      </Grid>
   );
};

export default EventsDashboard;
