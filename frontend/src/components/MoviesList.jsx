import React from "react";
import { Paper, Stack, Title, Text, Group, Badge, Grid } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const MovieCard = ({ movie }) => (
  <Paper p="md">
    <Group align="flex-start" justify="space-between">
      <Stack gap="xs">
        <Title order={4}>{movie.title}</Title>
        <Text size="sm" color="dimmed">
          {movie.director}
        </Text>
      </Stack>
      
      <Stack gap={5}>
        {movie.sessions.map((session, idx) => (
          <Group key={idx} position="apart" align="center">
            <Group gap={10} align="center">
              <IconCalendar size={20} />
              <Text size="sm">{session.day},</Text>
              <Text size="sm">{session.date}</Text>
            </Group>
            <Badge variant="light" color="blue" radius="xl">
              {session.time}
            </Badge>
          </Group>
        ))}
      </Stack>
    </Group>
  </Paper>
);

const MoviesList = ({ movies }) => (
  <Grid gutter="md">
    {movies.map((movie, index) => (
      <Grid.Col key={index} span={6}>
        <MovieCard movie={movie} />
      </Grid.Col>
    ))}
  </Grid>
);
export default MoviesList;