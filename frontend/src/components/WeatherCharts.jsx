import { Line } from "react-chartjs-2";
import { Text, Stack, useMantineTheme, Container, Group, Paper, Center } from "@mantine/core";
import { IconSunrise, IconSunset, IconCloudRain } from "@tabler/icons-react";
import "../App.css";
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

const formatPeriod = (periodo, fecha) => {
   const date = new Date(fecha);
   const formattedDate = date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
   });
   return `${formattedDate} (h${periodo.slice(0, 2)}-${periodo.slice(2)})`;
};

export const RainProbGraph = ({ probData }) => {
   const theme = useMantineTheme();

   const data = {
      labels: probData.map((prob) => formatPeriod(prob.periodo, prob.fecha)),
      datasets: [
         {
            label: "Probabilidad de precipitación",
            data: probData.map((prob) => prob.value),
            borderColor: "rgba(135, 187, 162, 0.9)",
            backgroundColor: "rgba(201, 228, 202, 0.5)",
            fill: true,
            tension: 0.1,
         },
      ],
   };

   const options = {
      plugins: {
         legend: {
            display: false,
         },
         title: {
            display: true,
            text: "Probabilidad de precipitación",
            color: theme.colors.textPrimary[0],
            font: {
               size: 16,
               weight: "600",
            },
            padding: {
               bottom: 10,
            },
         },
         datalabels: {
            display: true,
            color: "rgba(54, 73, 88, 1)",
            align: "top",
            formatter: (value) => `${value}%`,
            backgroundColor: "rgba(201, 228, 202, 0.95)",
            borderRadius: 10,
            padding: 5,
         },
      },
      scales: {
         y: {
            display: false,
            beginAtZero: true,
            max: 110,
         },
         x: {
            ticks: {
               maxRotation: 45,
               color: theme.colors.textPrimary[0],
            },
         },
      },
   };

   return (
         <Line data={data} options={options} />
   );
};

export const TemperatureGraph = ({ todayTmrwData, getTemperatureColor }) => {
   const theme = useMantineTheme();

   const allTemps = [...todayTmrwData.map((d) => d.temp), ...todayTmrwData.map((d) => d.feels_like)];
   const maxTemp = Math.max(...allTemps);
   const minTemp = Math.min(...allTemps);

   const temperatureGraphOptions = {
      scales: {
         x: {
            ticks: {
               autoSkip: true,
               color: theme.colors.textPrimary[0],
            },
         },
         y: {
            display: false,
            beginAtZero: false,
            min: minTemp,
            max: maxTemp + 3,
         },
      },

      plugins: {
         legend: {
            display: false,
         },
         datalabels: {
            display: (context) => {
               return context.datasetIndex === 0 && context.dataIndex % 2 === 0;
            },
            align: "top",
            color: "rgba(54, 73, 88, 1)",
            formatter: (value) => `${value}°`,
            backgroundColor: "rgba(201, 228, 202, 0.95)",
            borderRadius: 10,
            padding: 5,
         },
      },
   };
   const data = {
      labels: todayTmrwData.map((data) => `${data.hour}h`),
      datasets: [
         {
            data: todayTmrwData.map((data) => data.temp),
            segment: {
               borderColor: (ctx) => getTemperatureColor(ctx.p1.parsed.y),
            },
            borderWidth: 4,
            tension: 0.1,
            pointRadius: 0,
         },
         {
            data: todayTmrwData.map((data) => data.feels_like),
            segment: {
               borderColor: (ctx) => getTemperatureColor(ctx.p1.parsed.y),
            },
            borderDash: [5, 5],
            borderWidth: 4,
            tension: 0.1,
            pointRadius: 0,
         },
      ],
   };

   return (
         <Line data={data} options={temperatureGraphOptions} />
   );
};

export const HumidityChart = ({ todayTmrwData }) => {
   const theme = useMantineTheme();
   const humidityOptions = {
      scales: {
         x: {
            ticks: {
               autoSkip: true,
               color: theme.colors.textPrimary[0],
            },
         },
         y: {
            min: 20,
            max: 110,
            display: false,
            ticks: {
               color: theme.colors.textPrimary[0],
            },
         },
      },
      plugins: {
         legend: {
            display: false,
         },
         title: {
            display: true,
            text: "Humedad",
            color: theme.colors.textPrimary[0],
            font: {
               size: 16,
               weight: "600",
            },
            padding: {
               bottom: 10,
            },
         },
         datalabels: {
            display: true,
            color: "rgba(54, 73, 88, 1)",
            align: "top",
            formatter: (value) => `${value}%`,
            backgroundColor: "rgba(201, 228, 202, 0.95)",
            borderRadius: 10,
            padding: 6,
         },
      },
   };

   const filteredData = todayTmrwData.filter((_, index) => index % 2 === 0);

   const data = {
      labels: filteredData.map((data) => `${data.hour}h`),
      datasets: [
         {
            data: filteredData.map((data) => data.humidity),
            borderColor: "rgba(135, 187, 162, 0.9)",
            backgroundColor: "rgba(201, 228, 202, 0.6)",
            fill: true,
            tension: 0.2,
         },
      ],
   };
   return (
         <Line data={data} options={humidityOptions} />
   );
};

export const SunSetandSunRise = ({ sunSet, sunRise }) => {
   const theme = useMantineTheme();
   return (
      <Container>
         <Group position="center" spacing="xl">
            <Center>
               <IconSunrise size={40} stroke={1} color={theme.colors.accentWarning[0]} />
               <Text ta="center">{sunRise}</Text>
            </Center>
            <Center>
               <IconSunset size={40} stroke={1} color={theme.colors.accentInfo[0]} />
               <Text ta="center">{sunSet}</Text>
            </Center>
         </Group>
      </Container>
   );
};

export const CurrentWeatherCard = ({ currentWeather }) => {
   // const theme = useMantineTheme();

   if (!currentWeather) return null;

   const IconComponent = WeatherIconsMapping[currentWeather.sky] || WiDaySunny;

   return (
      <Paper
         shadow="xl"
         radius="xl"
         p="xl"
         style={{
            background: "linear-gradient(135deg, rgba(201, 228, 202, 1) 0%, rgba(135, 187, 162, 1) 100%)",
            border: `3px solid rgba(85, 130, 139, 1)`,
            minWidth: "280px",
            maxWidth: "350px",
         }}
      >
         <Stack gap="md">
            <Group position="apart" align="flex-start">
               <Stack gap={4}>
                  <Text size="4rem" fw={700} lh={1} c="rgba(54, 73, 88, 1)">
                     {currentWeather.feels_like}°
                  </Text>
               </Stack>
               <Stack gap={0} align="center">
                  <IconComponent size={80} color="rgba(59, 96, 100, 1)" />
                  <Text size="sm" c="rgba(54, 73, 88, 1)" fw={500}>
                     {currentWeather.hour}h
                  </Text>
               </Stack>
            </Group>

            <Group position="apart" mt="md">
               <Stack gap={4} align="center" style={{ flex: 1 }}>
                  <IconSunrise size={32} stroke={1.5} color="rgba(85, 130, 139, 1)" />
                  <Text size="sm" fw={600} c="rgba(54, 73, 88, 1)">
                     {currentWeather.sunrise}
                  </Text>
               </Stack>

               <Stack gap={4} align="center" style={{ flex: 1 }}>
                  <Text size="2xl" fw={600}>
                     💧
                  </Text>
                  <Text size="sm" fw={600} c="rgba(54, 73, 88, 1)">
                     {currentWeather.humidity}%
                  </Text>
               </Stack>

               <Stack gap={4} align="center" style={{ flex: 1 }}>
                  <IconSunset size={32} stroke={1.5} color="rgba(85, 130, 139, 1)" />
                  <Text size="sm" fw={600} c="rgba(54, 73, 88, 1)">
                     {currentWeather.sunset}
                  </Text>
               </Stack>
            </Group>
         </Stack>
      </Paper>
   );
};

export const WeatherCards = ({ weatherData }) => {
   const theme = useMantineTheme();
   const currentHour = new Date().getHours();

   return (
      <Container fluid p={0} style={{ marginBottom: "1rem" }}>
         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               gap: "0.6rem",
               justifyContent: "flex-start",
            }}
         >
            {weatherData.map((data, index) => {
               const IconComponent = WeatherIconsMapping[data.sky] || null;
               const isCurrentHour = data.hour === currentHour;
               const hasRain = parseFloat(data.rain) > 0;

               return (
                  <Paper
                     key={index}
                     shadow={isCurrentHour ? "xl" : "sm"}
                     radius="md"
                     p="sm"
                     style={{
                        background: isCurrentHour
                           ? "linear-gradient(135deg, rgba(85, 130, 139, 1) 0%, rgba(59, 96, 100, 1) 100%)"
                           : "linear-gradient(135deg, rgba(201, 228, 202, 1) 0%, rgba(135, 187, 162, 1) 100%)",
                        border: isCurrentHour ? `3px solid rgba(54, 73, 88, 1)` : `2px solid rgba(85, 130, 139, 1)`,
                        transition: "all 0.3s ease",
                        minHeight: "120px",
                        minWidth: "90px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                     }}
                  >
                     <Stack gap={6} align="center">
                        <Text fw={isCurrentHour ? 700 : 600} size="md" c={isCurrentHour ? "rgba(201, 228, 202, 1)" : "rgba(54, 73, 88, 1)"}>
                           {`${data.hour}h`}
                        </Text>
                        {IconComponent ? (
                           <IconComponent size={48} color={isCurrentHour ? "rgba(201, 228, 202, 1)" : "rgba(59, 96, 100, 1)"} />
                        ) : (
                           <Text size="xs" c={isCurrentHour ? "rgba(201, 228, 202, 1)" : "rgba(54, 73, 88, 1)"}>
                              {data.sky}
                           </Text>
                        )}
                        <Text fw={600} size="lg" c={isCurrentHour ? "rgba(201, 228, 202, 1)" : "rgba(54, 73, 88, 1)"}>
                           {data.feels_like}°
                        </Text>
                        {hasRain && (
                           <Group gap={3} align="center">
                              <IconCloudRain size={16} stroke={2} color={isCurrentHour ? "rgba(201, 228, 202, 1)" : "rgba(85, 130, 139, 1)"} />
                              <Text size="xs" fw={500} c={isCurrentHour ? "rgba(201, 228, 202, 1)" : "rgba(54, 73, 88, 1)"}>
                                 {data.rain} mm
                              </Text>
                           </Group>
                        )}
                     </Stack>
                  </Paper>
               );
            })}
         </div>
      </Container>
   );
};
