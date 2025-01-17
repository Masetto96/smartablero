import React from "react";
import { Paper, Stack, Title, Text, Group, Grid } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const ConcertCard = ({ event }) => {
   return (
      <Paper p="md" h="100%">
         <Stack spacing="xs">
            <Title order={4}>{event.title}</Title>
            <Group gap={4}>
               <IconCalendar size={20} color="black" />
               <Text size="sm" tt="uppercase" color="sec">
                  {event.date}
               </Text>
            </Group>
            <Text size="sm">{event.subtitle}</Text>
         </Stack>
      </Paper>
   );
};

const ConcertsList = ({ events }) => {
   return (
      <Grid gutter="md" h="100%">
         {events.map((event, index) => (
            <Grid.Col key={index} span={4}>
               <ConcertCard event={event} />
            </Grid.Col>
         ))}
      </Grid>
   );
};

export default ConcertsList;
