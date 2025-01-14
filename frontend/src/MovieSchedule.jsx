import React, { useEffect, useState } from "react";
import { Grid, Card, Text, Title } from "@mantine/core";

const MovieSchedule = () => {
  const [movieData, setMovieData] = useState([]);
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
    fetchMovieData();
  }, []);

  if (isLoading) {
    return <div className="text-lg text-gray-500">Loading movie data...</div>;
  }

  if (error) {
    return <div className="text-red-800">{error}</div>;
  }

  return (
    <Grid>
      {movieData.map((movie, index) => (
        <Grid.Col span={4} key={index}>
          <Card shadow="sm" padding="lg">
            <Title order={3}>{movie.title}</Title>
            <Text>Director: {movie.director}</Text>
            {movie.sessions.length > 0 ? (
              movie.sessions.map((session, idx) => (
                <Text key={idx}>
                  {session.day}, {session.date} at {session.time}
                </Text>
              ))
            ) : (
              <Text>No sessions available</Text>
            )}
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default MovieSchedule;
