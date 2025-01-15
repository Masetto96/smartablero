import React from 'react';
import { Paper, Grid, Stack, Title, Text, Group } from '@mantine/core';

const MoviesList = ({ movies }) => {
    return (
        <>
          {movies.map((movie, index) => (
            <Paper key={index} shadow="xs" p="md" withBorder>
              <Grid>
                <Grid.Col span={6}>
                  <Stack spacing="xs">
                    <Title order={4}>{movie.title}</Title>
                    <Text size="sm" color="dimmed">Director: {movie.director}</Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  {movie.sessions && movie.sessions.length > 0 ? (
                    <Stack spacing={5}>
                      {movie.sessions.map((session, idx) => (
                        <Group key={idx} spacing={5} noWrap>
                          <Text size="sm">{session.day},</Text>
                          <Text size="sm">{session.date}</Text>
                          <Text size="sm">at {session.time}</Text>
                        </Group>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="sm" color="dimmed">No sessions available</Text>
                  )}
                </Grid.Col>
              </Grid>
            </Paper>
          ))}
        </>
      );
    };
    
    export default MoviesList;