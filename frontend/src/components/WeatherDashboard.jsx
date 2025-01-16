import React, { useEffect, useState } from "react";
import {
  Card,
  Paper,
  Group,
  Text,
  Grid,
  Container,
  Box,
  Stack,
  Center,
} from "@mantine/core";
import { Line, Bar } from "react-chartjs-2";
import RainProbGraph from "./RainProbGraph";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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


const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/weather");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWeatherData(data);
        console.log("Fetched data:", data);
      } catch (e) {
        setError(e.message || "Failed to fetch weather data");
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

  const rainProb = weatherData.data.flatMap((day) =>
    day.prob_precipitacion.map((data) => ({
      value: parseInt(data.value),
      periodo: data.periodo,
      fecha: day.fecha,
    }))
  );
  console.log("rainProb", rainProb);

  // Transform the weather data for the chart
  const chartData = weatherData.data[0].forecast_hourly.map((hourData) => ({
    hour: hourData.hour,
    temperature: parseInt(hourData.temp),
    feelsLike: parseInt(hourData.feels_like),
    rain: parseInt(hourData.rain),
  }));

  const chartDataTmr = weatherData.data[1].forecast_hourly.map((hourData) => ({
    hour: hourData.hour,
    temperature: parseInt(hourData.temp),
    feelsLike: parseInt(hourData.feels_like),
    rain: parseInt(hourData.rain),
  }));

  // TODO: fix this when it's 0 hour, there is a bug when comparing current hour with item.hour
  const getNext24HoursData = (currentDayData, nextDayData) => {
    const currentHour = new Date().getHours();
    console.log("currentHour", currentHour);
    const currentDayRemaining = currentDayData.filter(
      (item) => parseInt(item.hour) >= currentHour
    );
    console.log("currentDayRemaining", currentDayRemaining);
    const nextDayNeeded = nextDayData
      .filter((item) => item.hour <= currentHour)
      .map((item) => ({
        ...item,
        hour: item.hour,
      }));
    console.log("nextDayNeeded", nextDayNeeded);
    return [...currentDayRemaining, ...nextDayNeeded];
  };

  const todayTmrwData = getNext24HoursData(chartData, chartDataTmr);
  console.log("tmr", chartDataTmr);
  console.log("today", chartData);
  console.log("today and tmr", todayTmrwData);

  // TODO: all temperatures can be calculated from todayTmrwData
  // Feels like and temp shall have distinct color gradient
  const allTemperatures = [
    ...chartData.map((data) => data.temperature),
    ...chartData.map((data) => data.feelsLike),
    ...chartDataTmr.map((data) => data.temperature),
    ...chartDataTmr.map((data) => data.feelsLike),
  ];

  const minTemp = Math.floor(Math.min(...allTemperatures));
  const maxTemp = Math.ceil(Math.max(...allTemperatures));

  const getTemperatureColor = (temp) => {
    const normalizedTemp = Math.max(
      0,
      Math.min(1, (temp - minTemp) / (maxTemp - minTemp))
    );
    const hue = 240 - normalizedTemp * 240;
    return `hsla(${hue}, 80%, 60%, 0.9)`;
  };

  const getCurrentTemperature = () => {
    const currentHour = new Date().getHours();
    const currentData = todayTmrwData.find((data) => data.hour == currentHour);

    return currentData
      ? {
          temperature: currentData.temperature,
          feelsLike: currentData.feelsLike,
        }
      : null;
  };

  const temperatureGraphData = {
    labels: todayTmrwData.map((data) => `${data.hour}h`),
    datasets: [
      {
        label: "Temperatura",
        data: todayTmrwData.map((data) => data.temperature),
        segment: {
          borderColor: (ctx) => getTemperatureColor(ctx.p1.parsed.y),
        },
        borderWidth: 4,
        tension: 0.3,
      },
      {
        label: "Sensanción térmica",
        data: todayTmrwData.map((data) => data.feelsLike),
        segment: {
          borderColor: (ctx) => getTemperatureColor(ctx.p1.parsed.y),
        },
        borderDash: [5, 5],
        borderWidth: 4,
        tension: 0.3,
      },
    ],
  };

  const precipitationData = {
    labels: todayTmrwData.map((data) => `${data.hour}h`),
    datasets: [
      {
        label: "Lluvia",
        data: todayTmrwData.map((data) => data.rain),
        borderColor: "rgb(6, 146, 240)",
        backgroundColor: "rgba(6, 131, 214, 0.87)",
      },
    ],
  };

  const temperatureGraphOptions = {
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
          text: "temperatura (°C)",
        },
      },
    },
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
          text: "milímetros (mm)",
        },
      },
    },
  };

  const current = getCurrentTemperature();
  console.log("current", current);
  // TODO: how to add bloody margin?
  return (
    <Grid>
      <Grid.Col span={6}>
            <Line
              data={temperatureGraphData}
              options={temperatureGraphOptions}
            />
            <Bar data={precipitationData} options={precipitationOptions} />
            <Text ta="center" fw={500} fs="italic">
          ahorita la temperatura es {current.temperature}°C y la sensaciò termica es {current.feelsLike}°C
          </Text>
      </Grid.Col>
      <Grid.Col span={6}>
        <Center>
          <RainProbGraph probData={rainProb} />
          </Center>
      </Grid.Col>
    </Grid>
  );
};
export default WeatherDashboard;
