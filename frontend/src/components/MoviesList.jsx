import React from "react";
import { Paper, Stack, Title, Text, Group, Badge, Grid, Divider, Center } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const SessionsTable = ({ sessions }) => (
   <Grid>
     {sessions.map((session, idx) => (
       <Grid.Col key={idx} span={4}>
         <Group justify="center" gap="sm">
           <Text tt="uppercase" size="sm">
             {session.day} {session.date}
           </Text>
           <Badge variant="outline" color="rgba(97, 49, 7, 0.65)" radius="md">
             {session.time}
           </Badge>
         </Group>
       </Grid.Col>
     ))}
   </Grid>
 );

const MovieCard = ({ movie }) => (
   <Paper p="md" h="100%">
         <Stack gap="md">
            <Title textWrap="wrap" order={4} ta="center">
               {movie.title}
            </Title>
            <Text size="sm" fs="italic" ta="center">
               {movie.director}
            </Text>
         <SessionsTable sessions={movie.sessions} />
      </Stack>
   </Paper>
);

const MoviesList = ({ movies }) => (
   <Grid gutter="xs">
      {movies.map((movie, index) => (
         <Grid.Col key={index} span={4}>
            <MovieCard movie={movie} />
         </Grid.Col>
      ))}
   </Grid>
);

export default MoviesList;
