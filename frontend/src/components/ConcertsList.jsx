import React from 'react';
import { Paper, Stack, Title, Text, Group, Grid } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';

const ConcertCard = ({ event }) => {
  return (
    <Paper p="md">
      <Group>
        <Title order={4}>{event.title}</Title>
        <IconCalendar size={18} color='grey'/>
        <Text size="sm" color="dimmed">{event.date}</Text>
      </Group>
      <Text size="sm">{event.subtitle}</Text>
    </Paper>
  );
};

const ConcertsList = ({ events }) => {
  return (
    <Grid gutter="md">
      {events.map((event, index) => (
        <Grid.Col key={index} span={6}>
          <ConcertCard event={event} />
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default ConcertsList;