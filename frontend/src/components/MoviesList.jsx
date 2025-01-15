import React from "react";
import { Paper, Grid, Stack, Title, Text, Group, Badge, Divider } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const MoviesList = ({ movies }) => {
  return (
    <>
      {movies.map((movie, index) => (
        <Paper key={index} p="md">
          <Grid>
            <Grid.Col span={6}>
              <Stack gap="xs">
                <Title order={4}>{movie.title}</Title>
                <Text size="sm" color="dimmed">
                  {movie.director}
                </Text>

              </Stack>
            </Grid.Col>
            <Grid.Col span={6}>
              <Stack gap={5}>
                {movie.sessions.map((session, idx) => (
                  <Group key={idx} position="apart" align="center" justify-content='true'>
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
            </Grid.Col>
          </Grid>
          <Divider my="sm" />
        </Paper>
      ))}
    </>
  );
};

export default MoviesList;
