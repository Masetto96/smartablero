import React from "react";
import { Paper, Stack, Title, Text, Group, Badge, Grid, Divider } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const SessionsTable = ({ sessions }) => (
   <Stack gap="xs">
      {sessions.map((session, idx) => (
         <Group key={idx} position="left" gap="sm">
            <Text tt="uppercase" size="sm">
               {session.day} {session.date}
            </Text>
            <Badge variant="outline" color="rgba(97, 49, 7, 0.65)" radius="md">
               {session.time}
            </Badge>
         </Group>
      ))}
   </Stack>
);

const MovieCard = ({ movie }) => (
   <Paper p="md" h="100%">
      <Stack gap="md">
         <Stack gap="xs">
            <Title textWrap="wrap" order={4}>
               {movie.title}
            </Title>
            <Text size="sm" fs="italic">
               {movie.director}
            </Text>
         </Stack>
         <SessionsTable sessions={movie.sessions} />
      </Stack>
   </Paper>
);

const MoviesList = ({ movies }) => (
   <Grid gutter="sm">
      {movies.map((movie, index) => (
         <Grid.Col key={index} span={4}>
            <MovieCard movie={movie} />
         </Grid.Col>
      ))}
   </Grid>
);

export default MoviesList;
