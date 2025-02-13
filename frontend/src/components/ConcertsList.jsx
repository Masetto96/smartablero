import React from "react";
import { Paper, Stack, Title, Text, Group, Grid, useMantineTheme } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";

const ConcertCard = ({ event }) => {
   const theme = useMantineTheme();

   return (
      <Paper p="md" h="100%">
         <Stack spacing="xs" align="center">
            <Text size="lg" c={theme.colors.textPrimary[0]}>
               {event.title}
            </Text>
            <Group gap={4}>
               <IconCalendar size={20} color={theme.colors.accentInfo[0]} />
               <Text size="sm" tt="uppercase" c={theme.colors.accentPrimary[0]}>
                  {event.date}
               </Text>
            </Group>
            <Text size="sm" c={theme.colors.textSecondary[0]}>
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
