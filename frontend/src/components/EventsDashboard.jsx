import React, { useEffect, useState } from "react";
import { Grid, Text } from "@mantine/core";
import ConcertsList from './ConcertsList';
import MoviesList from './MoviesList';

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
    <Grid gutter="xl" type="container" justify="center">
      <Grid.Col span={6}>
        <h2 className="text-lg font-semibold">Marula Cafe</h2>
        <ConcertsList events={concertData} />
      </Grid.Col>
      <Grid.Col span={6}>
        <h2 className="text-lg font-semibold">Zumzeig</h2>
        <MoviesList movies={movieData} />
      </Grid.Col>
    </Grid>
  );
};

export default EventsDashboard;