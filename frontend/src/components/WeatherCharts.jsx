import { Line, Bar } from "react-chartjs-2";
import { Text, Stack, useMantineTheme, Container, Group, Paper, Center } from "@mantine/core";
import { IconSunrise, IconSunset } from "@tabler/icons-react";
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
            borderColor: "rgba(75, 192, 192, 0.26)",
            backgroundColor: "rgba(56, 138, 138, 0.16)",
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
         datalabels: {
            display: true,
            color: theme.colors.textPrimary[0],
            align: "top",
            formatter: (value) => `${value}%`,
            backgroundColor: "rgba(34, 65, 65, 0.95)",
            // backgroundColor: theme.colors.backgroundLight[0],
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
      <Stack gap={0}>
         <Text>Probabilidad de Precipitación</Text>
         <Line data={data} options={options} />
      </Stack>
   );
};



export const TemperatureGraph = ({ todayTmrwData, getTemperatureColor }) => {
   const theme = useMantineTheme();
   
   const allTemps = [...todayTmrwData.map(d => d.temp), ...todayTmrwData.map(d => d.feels_like)];
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
            color: theme.colors.textPrimary[0],
            formatter: (value) => `${value}°`,
            backgroundColor: "rgba(34, 65, 65, 0.38)",
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
      <Stack gap={0}>
         <Text>
            Temperatura y <span className="dotted-underline">Sensación Térmica</span>
         </Text>
         <Line data={data} options={temperatureGraphOptions} />
      </Stack>
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
         datalabels: {
            display: true,
            color: theme.colors.textPrimary[0],
            align: "top",
            formatter: (value) => `${value}%`,
            backgroundColor: "rgba(25, 32, 88, 0.48)",
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
            borderColor: "rgba(55, 62, 114, 0.43)",
            backgroundColor: "rgba(26, 31, 104, 0.27)",
            fill: true,
            tension: 0.2,
         },
      ],
   };
   return (
      <Stack gap={0}>
         <Text>Humedad</Text>
         <Line data={data} options={humidityOptions} />
      </Stack>
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
            background: "linear-gradient(135deg, #936639 0%, #a68a64 100%)",
            border: `3px solid #7f4f24`,
            minWidth: "300px",
            maxWidth: "400px",
         }}
      >
         <Stack gap="md">
            <Group position="apart" align="flex-start">
               <Stack gap={4}>
                  <Text size="4rem" fw={700} lh={1} c="#333d29">
                     {currentWeather.feels_like}°
                  </Text>
               </Stack>
               <Stack gap={0} align="center">
                  <IconComponent size={80} color="#582f0e" />
                  <Text size="sm" c="#333d29" fw={500}>
                     {currentWeather.hour}h
                  </Text>
               </Stack>
            </Group>
            
            <Group position="apart" mt="md">
               <Stack gap={4} align="center" style={{ flex: 1 }}>
                  <IconSunrise size={32} stroke={1.5} color="#582f0e" />
                  <Text size="sm" fw={600} c="#333d29">
                     {currentWeather.sunrise}
                  </Text>
               </Stack>
               
               <Stack gap={4} align="center" style={{ flex: 1 }}>
                  <Text size="2xl" fw={600}>
                     💧
                  </Text>
                  <Text size="sm" fw={600} c="#333d29">
                     {currentWeather.humidity}%
                  </Text>
               </Stack>
               
               <Stack gap={4} align="center" style={{ flex: 1 }}>
                  <IconSunset size={32} stroke={1.5} color="#582f0e" />
                  <Text size="sm" fw={600} c="#333d29">
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
      <Container fluid p={0} style={{ marginBottom: "2rem" }}>
         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               gap: "1rem",
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
                     shadow={isCurrentHour ? "xl" : "md"}
                     radius="lg"
                     p="md"
                     style={{
                        background: isCurrentHour 
                           ? "linear-gradient(135deg, #656d4a 0%, #a4ac86 100%)"
                           : "linear-gradient(135deg, #b6ad90 0%, #c2c5aa 100%)",
                        border: isCurrentHour ? `3px solid #414833` : `2px solid #a68a64`,
                        transition: "all 0.3s ease",
                        minHeight: "140px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                     }}
                  >
                     <Stack gap={8} align="center">
                        <Text
                           fw={isCurrentHour ? 700 : 600}
                           size="lg"
                           c={isCurrentHour ? "#333d29" : "#582f0e"}
                        >
                           {`${data.hour}h`}
                        </Text>
                        {IconComponent ? (
                           <IconComponent 
                              size={56} 
                              color={isCurrentHour ? "#333d29" : "#582f0e"} 
                           />
                        ) : (
                           <Text size="sm" c={isCurrentHour ? "#333d29" : "#582f0e"}>
                              {data.sky}
                           </Text>
                        )}
                        <Text 
                           fw={600} 
                           size="xl" 
                           c={isCurrentHour ? "#333d29" : "#582f0e"}
                        >
                           {data.feels_like}°
                        </Text>
                        {hasRain && (
                           <Text
                              size="sm"
                              fw={500}
                              c={isCurrentHour ? "#333d29" : "#582f0e"}
                              style={{
                                 backgroundColor: isCurrentHour ? "rgba(51, 61, 41, 0.4)" : "rgba(88, 47, 14, 0.3)",
                                 padding: "2px 8px",
                                 borderRadius: "8px",
                              }}
                           >
                              💧 {data.rain} mm
                           </Text>
                        )}
                     </Stack>
                  </Paper>
               );
            })}
         </div>
      </Container>
   );
};
