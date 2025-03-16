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

export const PrecipitationGraph = ({ todayTmrwData }) => {
   const theme = useMantineTheme();
   const precipitationOptions = {
      plugins: {
         legend: {
            display: false,
            // datalabels: {
            //       display: true,
            //       color: "rgb(231, 0, 0)", // Set the color of the value labels to black
            //       align: "top",
            //       anchor: "end",
            //    },
         },
      },
      scales: {
         x: {
            ticks: {
               autoSkip: true,
               color: theme.colors.textPrimary[0],
            },
         },
         y: {
            ticks: {
               color: theme.colors.textPrimary[0],
            },
            beginAtZero: true,
            title: {
               display: true,
               text: "milímetros (mm)",
               color: theme.colors.textSecondary[0],
            },
         },
      },
   };

   const data = {
      labels: todayTmrwData.map((data) => `${data.hour}h`),
      datasets: [
         {
            data: todayTmrwData.map((data) => data.rain),
            // borderColor: "rgb(6, 146, 240)",
            backgroundColor: "rgba(11, 80, 126, 0.77)",
         },
      ],
   };

   return (
      <Stack gap={0}>
         <Text>Cantidad de Lluvia</Text>
         <Bar data={data} options={precipitationOptions} />
      </Stack>
   );
};

export const TemperatureGraph = ({ todayTmrwData, getTemperatureColor }) => {
   const theme = useMantineTheme();
   const temperatureGraphOptions = {
      scales: {
         x: {
            ticks: {
               autoSkip: true,
               color: theme.colors.textPrimary[0],
            },
         },
         y: {
            beginAtZero: false,
            ticks: {
               color: theme.colors.textPrimary[0],
               stepSize: 1,
            },
            title: {
               display: true,
               text: "temperatura (°C)",
               color: theme.colors.textSecondary[0],
            },
         },
      },

      plugins: {
         legend: {
            display: false,
         },
         datalabels: {
            display: false,
            align: "top",
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

export const WeatherCards = ({ weatherData }) => {
   const theme = useMantineTheme();
   const currentHour = new Date().getHours();

   return (
      <Group position="center" gap={0}>
         {weatherData.map((data, index) => {
            const IconComponent = WeatherIconsMapping[data.sky] || null;
            const isCurrentHour = data.hour === currentHour;

            return (
               <Paper
                  key={index}
                  shadow="md"
                  radius="md"
                  style={{
                     backgroundColor: isCurrentHour ? theme.colors.accentSuccess[0] : theme.colors.backgroundLight[0],
                     padding: "0.5rem",
                     margin: "0.5rem",
                  }}
               >
                  <Stack gap={2} align="center">
                     <Text>{`${data.hour}h`}</Text>
                     {IconComponent ? (
                        <IconComponent size={48} color={theme.colors.textSecondary[0]} />
                     ) : (
                        <Text>{data.sky}</Text>
                     )}
                     <Text>{data.feels_like}°</Text>
                  </Stack>
               </Paper>
            );
         })}
      </Group>
   );
};
