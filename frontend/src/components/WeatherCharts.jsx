import { Line, Bar } from "react-chartjs-2";
import { Text, Stack, useMantineTheme, Container, Group, Paper, Center } from "@mantine/core";
import { IconSunrise, IconSunset, IconTemperature, IconThermometer } from '@tabler/icons-react';

import "../App.css";

const formatPeriod = (periodo, fecha) => {
  const date = new Date(fecha);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  return `${formattedDate}\n (${periodo.slice(0, 2)}-${periodo.slice(2)})`;
};

export const RainProbGraph = ({ probData }) => {
   const theme = useMantineTheme();

   const data = {
      labels: probData.map((prob) => formatPeriod(prob.periodo, prob.fecha)),
      datasets: [
         {
            label: "Probabilidad de precipitación",
            data: probData.map((prob) => prob.value),
            borderColor: "rgba(75, 192, 192, 0.53)",
            backgroundColor: "rgba(92, 173, 173, 0.21)", // Add this line to set the fill color
            fill: true,
            pointRadius: 1,
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
        color: theme.colors.textSecondary[0],
        align: "top",
        formatter: (value) => `${value}%`,
        backgroundColor: theme.colors.backgroundLight[0],
        borderRadius: 10,
        padding:5,
        pointRadius: 0,
         },
      },
      scales: {
         y: {
            display: false,
            beginAtZero: true,
            min:0,
            max:100,
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
      <Stack gap={0} >
         <Text>
            Probabilidad de Precipitación
         </Text>
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
              //  color: theme.colors.textPrimary[0],
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
            borderColor: "rgb(6, 146, 240)",
            backgroundColor: "rgba(6, 131, 214, 0.87)",
         },
      ],
   };

   return (
    <Stack gap={0}>
         <Text>
            Cantidad de Lluvia
         </Text>
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
              //  color: theme.colors.textPrimary[0],
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
            tension: 0.3,
            pointRadius: 0,
         },
         {
            data: todayTmrwData.map((data) => data.feels_like),
            segment: {
               borderColor: (ctx) => getTemperatureColor(ctx.p1.parsed.y),
            },
            borderDash: [5, 5],
            borderWidth: 4,
            tension: 0.3,
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

export const CurrentDayInfo = ({ current, weatherData }) => {
  return (
    <Container>
      <Group position="center" spacing="xl">
        <Paper shadow="lg" padding="md">
          <Center>
            <IconTemperature size={40} stroke={1} />
            <Text ta="center">
              {current.temperature}°C
            </Text>
          </Center>
          <Center>
            <IconThermometer size={40} stroke={1} />
            <Text ta="center">
              {current.feelsLike}°C
            </Text>
          </Center>
        </Paper>
        <Paper shadow="lg" padding="md">
          <Center>
            <IconSunrise size={40} stroke={1} />
            <Text ta="center">{weatherData[0].sunrise}</Text>
          </Center>
          <Center>
            <IconSunset size={40} stroke={1} />
            <Text ta="center">{weatherData[0].sunset}</Text>
          </Center>
        </Paper>
      </Group>
    </Container>
  );
};
