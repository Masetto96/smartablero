import React, { useEffect, useState } from 'react';
import { Card, Paper, Group, Text, Grid, MantineProvider, Container, Box, Stack } from '@mantine/core';
import { IconCloudRain, IconClock, IconCalendar } from '@tabler/icons-react';
import { Line, Bar } from 'react-chartjs-2';
import './App.css'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { WiThermometer, WiRaindrops } from "react-icons/wi";
// import { BiTime } from "react-icons/bi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatPeriod = (periodo) => {
  return `${periodo.slice(0, 2)}:00 - ${periodo.slice(2)}:00`;
};

const formatHour = (hour) => `${hour}`;

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/weather');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWeatherData(data);
        console.log('Fetched data:', data);
      } catch (e) {
        setError(e.message || 'Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeatherData();
  }, []);

  if (isLoading) {
    return <div className="text-lg text-gray-500">Loading weather data...</div>;
  }

  if (error) {
    return <div className="text-red-800">{error}</div>;
  }

  if (!weatherData || !weatherData.data || weatherData.data.length === 0) {
    return <div className="text-yellow-800">No weather data available</div>;
  }
  const RainProbCards = ({ probData }) => (
    <Grid gutter="xs">
      {probData.map((prob, index) => (
        <Grid.Col key={index} span={12}>
          <Paper p="xs" radius="md" withBorder>
            <Group position="apart" spacing="xs">
              <Group spacing="xs">
                <IconClock size={16} />
                <Text size="sm">{formatPeriod(prob.periodo)}</Text>
              </Group>
              <Group spacing="xs">
                <IconCloudRain size={16} />
                <Text fw={500}>{prob.value}%</Text>
              </Group>
              <Group spacing="xs">
                <IconCalendar size={16} />
                <Text size="sm">{prob.fecha}</Text>
              </Group>
            </Group>
          </Paper>
        </Grid.Col>
      ))}
    </Grid>
  );
  // Transform the weather data for the chart
  const chartData = weatherData.data[0].forecast_hourly.map((hourData) => ({
    hour: formatHour(hourData.hour),
    temperature: parseInt(hourData.temp),
    feelsLike: parseInt(hourData.feels_like),
    rain: parseInt(hourData.rain),
  }));

  const chartDataTmr = weatherData.data[1].forecast_hourly.map((hourData) => ({
    hour: formatHour(hourData.hour),
    temperature: parseInt(hourData.temp),
    feelsLike: parseInt(hourData.feels_like),
    rain: parseInt(hourData.rain),
  }));

  const allTemperatures = [
    ...chartData.map(data => data.temperature),
    ...chartData.map(data => data.feelsLike),
    ...chartDataTmr.map(data => data.temperature),
    ...chartDataTmr.map(data => data.feelsLike),

  ];

  const minTemp = Math.floor(Math.min(...allTemperatures));
  const maxTemp = Math.ceil(Math.max(...allTemperatures));

  const getTemperatureColor = (temp) => {
    const normalizedTemp = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
    const hue = 240 - (normalizedTemp * 240);
    return `hsla(${hue}, 80%, 60%, 0.9)`;
  };

  const getCurrentWeather = () => {
    const currentHour = new Date().getHours();
    const currentData = chartData.find(data => data.hour == currentHour) || chartDataTmr.find(data => data.hour == currentHour);

    return currentData ? {
      temperature: currentData.temperature,
      feelsLike: currentData.feelsLike
    } : null;
  };

  const temperatureData = {
    labels: [...chartData.map((data) => data.hour), ...chartDataTmr.map((data) => data.hour)],
    datasets: [
      {
        label: 'Temperature',
        data: [...chartData.map((data) => data.temperature), ...chartDataTmr.map((data) => data.temperature)],
        segment: {
          borderColor: ctx => getTemperatureColor(ctx.p1.parsed.y),
        },
        borderWidth: 3,
        tension: 0.4,
      },
      {
        label: 'Feels Like',
        data: [...chartData.map((data) => data.feelsLike), ...chartDataTmr.map((data) => data.feelsLike)],
        segment: {
          borderColor: ctx => getTemperatureColor(ctx.p1.parsed.y),
        },
        borderDash: [5, 5],
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const precipitationData = {
    labels: [...chartData.map((data) => data.hour), ...chartDataTmr.map((data) => data.hour)],
    datasets: [
      {
        label: 'Lluvia',
        data: [...chartData.map((data) => data.rain), ...chartDataTmr.map((data) => data.rain)],
        borderColor: 'rgb(6, 146, 240)',
        backgroundColor: 'rgba(6, 131, 214, 0.87)',
      },
    ],
  };

  const temperatureOptions = {
    scales: {
      x: {
        ticks: {
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          stepSize: 1, // Show every degree
        },
        title: {
          display: true,
          text: 'temperatura (°C)'
        }
      },
    },
    plugins: {
      legend: {
        display: true,  // Hide legend
      }
    },
    responsive: true,
    maintainAspectRatio: true,
  };

  const precipitationOptions = {
    scales: {
      x: {
        ticks: {
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'milímetros (mm)'
        }
      },
    },
    plugins: {
      legend: {
        display: true,  // Hide legend
      }
    },
    responsive: true,
    maintainAspectRatio: true,

  };
  const current = getCurrentWeather();
  console.log("current", current);
  const rainProb = weatherData.data
    .slice(0, 3)
    .flatMap(day => day.prob_precipitacion.map(data => ({
      value: parseInt(data.value),
      periodo: data.periodo,
      fecha: day.fecha
    })));

  return (
    <Container fluid>
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <h5>Current Temperature: {current.temperature}°C</h5>
          <h5>Feels Like: {current.feelsLike}°C</h5>
          <Line data={temperatureData} options={temperatureOptions} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Grid>
            <Grid.Col span={12}>
            </Grid.Col>
            <Grid.Col span={8} md={2} style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{ flex: '1 0 auto' }}>
                <RainProbCards probData={rainProb} />
              </Box>
            </Grid.Col>
            <Grid.Col span={16} md={10} style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{ flex: '1 0 auto' }}>
                <Bar
                  data={precipitationData}
                  options={precipitationOptions}
                  style={{ height: '100%' }}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
export default WeatherDashboard;