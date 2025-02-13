import { useMantineTheme, Grid, Group, Text, Badge, Paper, Stack } from '@mantine/core';

const SessionsTable = ({ sessions }) => {
   const theme = useMantineTheme();
   const colors = [theme.colors.accentInfo[0], theme.colors.accentPrimary[0]]; // only 2 colors are possible

   return (
      <Grid>
         {sessions.map((session, idx) => (
            <Grid.Col key={idx} span={4}>
               <Group justify="center" gap="sm">
                  <Text tt="uppercase" size="sm" c={colors[idx % 2]}>
                     {session.day}
                  </Text>
                  <Badge variant="outline" radius="md" color={colors[idx % 2]}>
                     {session.time}
                  </Badge>
               </Group>
            </Grid.Col>
         ))}
      </Grid>
   );
};

const MovieCard = ({ movie }) => {
   const theme = useMantineTheme();
   
   return (
      <Paper p="md" h="100%">
         <Stack gap="md">
            <Text size="lg" c={theme.colors.textPrimary[0]}>
               {movie.title}
            </Text>
            <Text fs="italic" c={theme.colors.textSecondary[0]}>
               {movie.director}
            </Text>
            <SessionsTable sessions={movie.sessions} />
         </Stack>
      </Paper>
   );
};

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