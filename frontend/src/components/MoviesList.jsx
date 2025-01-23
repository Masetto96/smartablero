import React from "react";
import {
   Paper,
   Stack,
   Title,
   Text,
   Group,
   Badge,
   Grid,
   Divider,
   Center,
   ThemeIcon,
   useMantineTheme,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const SessionsTable = ({ sessions }) => {
   const theme = useMantineTheme();

   return (
      <Grid>
         {sessions.map((session, idx) => (
            <Grid.Col key={idx} span={4}>
               <Group justify="center" gap="sm">
                  <Text tt="uppercase" size="sm" c={theme.colors.frenchGray[0]}>
                     {session.day} {session.date}
                  </Text>
                  <Badge variant="outline" radius="md" color={theme.colors.khaki[0]}>
                     {session.time}
                  </Badge>
               </Group>
            </Grid.Col>
         ))}
      </Grid>
   );
};

const MovieCard = ({ movie }) => (
   <Paper p="md" h="100%">
      <Stack gap="md">
         <Text size="lg" ta="center">
            {movie.title}
         </Text>
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
