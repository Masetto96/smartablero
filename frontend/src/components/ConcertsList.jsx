import React from 'react';
import { Paper, Stack, Title, Text } from '@mantine/core';

const ConcertsList = ({ events }) => {
  return (
    <Stack spacing="md">
      {events.map((event, index) => (
        <Paper key={index} shadow="xs" p="md" withBorder>
          <Title order={4}>{event.title}</Title>
          <Text size="sm" color="dimmed">{event.date}</Text>
          <Text size="sm">{event.subtitle}</Text>
        </Paper>
      ))}
    </Stack>
  );
};

export default ConcertsList;