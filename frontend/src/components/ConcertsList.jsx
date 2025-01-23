import React from "react";
import { Paper, Stack, Title, Text, Group, Grid, useMantineTheme } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const ConcertCard = ({ event }) => {
   const theme = useMantineTheme();

   return (
      <Paper p="md" h="100%">
         <Stack spacing="xs" align="center">
            <Text size="lg" ta="center" fw={500} c={theme.colors.faluRed[0]}>
               {event.title}
            </Text>
            <Group gap={4}>
               <IconCalendar size={20} color={theme.colors.black} />
               <Text size="sm" tt="uppercase" c={theme.colors.faluRed[0]}>
                  {event.date}
               </Text>
            </Group>
            <Text size="sm" ta="center">
               {event.subtitle}
            </Text>
         </Stack>
      </Paper>
   );
};
const ConcertsList = ({ events }) => {
   return (
      <Grid gutter="xs">
         {events.map((event, index) => (
            <Grid.Col key={index} span={4}>
               <ConcertCard event={event} />
            </Grid.Col>
         ))}
      </Grid>
   );
};

export default ConcertsList;
