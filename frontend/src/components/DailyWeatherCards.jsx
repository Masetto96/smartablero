import React from "react";
import { Paper, Stack, Text, Group, useMantineTheme, Divider } from "@mantine/core";
import { IconUmbrella } from "@tabler/icons-react";
import {
   WiDaySunny,
   WiNightClear,
   WiDayCloudy,
   WiNightAltCloudy,
   WiCloud,
   WiCloudy,
   WiDayShowers,
   WiNightAltShowers,
   WiDayRain,
   WiNightAltRain,
   WiDaySnow,
   WiNightAltSnow,
   WiDayThunderstorm,
   WiNightAltThunderstorm,
   WiFog,
   WiDust,
} from "weather-icons-react";

const WeatherIconsMapping = {
   WiDaySunny: WiDaySunny,
   WiNightClear: WiNightClear,
   WiDayCloudy: WiDayCloudy,
   WiNightAltCloudy: WiNightAltCloudy,
   WiCloud: WiCloud,
   WiCloudy: WiCloudy,
   WiDayShowers: WiDayShowers,
   WiNightAltShowers: WiNightAltShowers,
   WiDayRain: WiDayRain,
   WiNightAltRain: WiNightAltRain,
   WiDaySnow: WiDaySnow,
   WiNightAltSnow: WiNightAltSnow,
   WiDayThunderstorm: WiDayThunderstorm,
   WiNightAltThunderstorm: WiNightAltThunderstorm,
   WiFog: WiFog,
   WiDust: WiDust,
};

const getDayName = (dateString) => {
   const date = new Date(dateString);
   const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
   return daysOfWeek[date.getDay()];
};

const DailyWeatherCard = ({ dayData }) => {
   const theme = useMantineTheme();

   // Group data by period
   const groupedByPeriod = {};

   // Group estadoCielo by period
   dayData.estadoCielo?.forEach((cielo) => {
      const periodo = cielo.periodo || "default";
      if (!groupedByPeriod[periodo]) {
         groupedByPeriod[periodo] = {};
      }
      groupedByPeriod[periodo].cielo = cielo;
   });

   // Group probPrecipitacion by period
   dayData.probPrecipitacion?.forEach((prob) => {
      const periodo = prob.periodo || "default";
      if (!groupedByPeriod[periodo]) {
         groupedByPeriod[periodo] = {};
      }
      groupedByPeriod[periodo].precip = prob.value;
   });

   // Add sensTermica datos if present
   const hasSensTermicaDatos = dayData.sensTermica?.dato && dayData.sensTermica.dato.length > 0;

   return (
      <Paper
         shadow="sm"
         radius="md"
         p="md"
         style={{
            background: "linear-gradient(135deg, rgba(135, 187, 162, 1) 0%, rgba(201, 228, 202, 1) 100%)",
            border: "2px solid rgba(59, 96, 100, 1)",
            minWidth: "160px",
         }}
      >
         <Stack gap={8}>
            <Group position="apart" mb={4}>
               <Text fw={700} size="md" c="rgba(54, 73, 88, 1)">
                  {getDayName(dayData.fecha)}
               </Text>
               <Group gap={8}>
                  <Text size="sm" c="rgba(54, 73, 88, 1)" fw={600}>
                     {dayData.sensTermica?.maxima}°
                  </Text>
                  <Text size="sm" c="rgba(54, 73, 88, 1)">
                     /
                  </Text>
                  <Text size="sm" c="rgba(54, 73, 88, 1)" fw={500}>
                     {dayData.sensTermica?.minima}°
                  </Text>
               </Group>
            </Group>

            <Divider size="xs" color="rgba(59, 96, 100, 1)" />

            {/* Display sensTermica datos if present */}
            {hasSensTermicaDatos && (
               <Group position="apart" style={{ paddingTop: 2, paddingBottom: 2 }}>
                  {dayData.sensTermica.dato.map((item, idx) => (
                     <Text key={idx} size="xs" c="rgba(54, 73, 88, 1)" fw={500}>
                        {item.hora}h: {item.value}°
                     </Text>
                  ))}
               </Group>
            )}

            {hasSensTermicaDatos && <Divider size="xs" color="rgba(59, 96, 100, 1)" />}

            <div
               style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "6px",
               }}
            >
               {Object.entries(groupedByPeriod).map(([periodo, data]) => {
                  const IconComponent = data.cielo?.icon ? WeatherIconsMapping[data.cielo.icon] : null;

                  return (
                     <Stack key={periodo} gap={2} align="center">
                        {periodo !== "default" && periodo !== "" && (
                           <Text size="xs" c="rgba(54, 73, 88, 1)" fw={500}>
                              {periodo}h
                           </Text>
                        )}
                        {IconComponent && <IconComponent size={28} color="rgba(59, 96, 100, 1)" />}
                        {data.precip !== undefined && data.precip > 0 && (
                           <Group gap={2} align="center">
                              <IconUmbrella size={12} color="rgba(59, 96, 100, 1)" stroke={2} />
                              <Text size="xs" c="rgba(54, 73, 88, 1)" fw={600}>
                                 {data.precip}%
                              </Text>
                           </Group>
                        )}
                     </Stack>
                  );
               })}
            </div>
         </Stack>
      </Paper>
   );
};

export const DailyWeatherCards = ({ dailyData }) => {
   if (!dailyData || dailyData.length === 0) {
      return null;
   }

   return (
      <div
         style={{
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
            flexWrap: "wrap",
         }}
      >
         {dailyData.map((dayData, index) => (
            <DailyWeatherCard key={dayData.fecha || index} dayData={dayData} />
         ))}
      </div>
   );
};

export default DailyWeatherCards;
