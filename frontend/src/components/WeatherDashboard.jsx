import React, { useEffect, useState } from "react";
import { Text, Grid, Stack, Card, Group, Paper, Container, Center, Space, useMantineTheme } from "@mantine/core";
import {
   TemperatureGraph,
   CurrentDayInfo,
   RainProbGraph,
   PrecipitationGraph,
   HumidityChart,
} from "./WeatherCharts";
import ChartDataLabels from "chartjs-plugin-datalabels";
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
   Filler,
} from "chart.js";

ChartJS.register(
   Filler,
   Tooltip,
   ChartDataLabels,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   BarElement,
   Title,
   Legend
);

const WeatherDashboard = () => {
   const [weatherData, setWeatherData] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const theme = useMantineTheme();

   useEffect(() => {
      const fetchWeatherData = async () => {
         try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/weather`);
            // const response = await fetch("api/weather");

            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseText = await response.text();
            // console.log("Raw response text:", responseText);
            const data = JSON.parse(responseText);
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

   if (!weatherData || weatherData.length === 0) {
      return <div className="text-yellow-800">No weather data available</div>;
   }

   // Data for the rainProb graph
   const rainProb = weatherData.flatMap((day) =>
      day.prob_precipitacion.map((data) => ({
         value: parseInt(data.value),
         periodo: data.periodo,
         fecha: day.fecha,
      }))
   );
   console.log("rainProb", rainProb);

   const transformHourlyData = (hourData) => ({
      hour: parseInt(hourData.hour),
      temperature: parseInt(hourData.temp),
      feelsLike: parseInt(hourData.feels_like),
      rain: parseFloat(hourData.rain).toFixed(1),
   });

   // Transform weather data for charts
   const chartData = weatherData[0].forecast_hourly.map(transformHourlyData);
   const chartDataTmr = weatherData[1].forecast_hourly.map(transformHourlyData);

   const getCurrentDate = () => {
      const date = new Date();
      return date.toISOString().split("T")[0];
   };

   const currentDate = getCurrentDate();
   console.log("currentFecha", currentDate);

   const getNext24HoursData = (weatherData) => {
      const currentDate = getCurrentDate();
      const currentHour = new Date().getHours();

      let combinedData = [];

      for (let i = 0; i < 2; i++) {
         const dayData = weatherData[i];
         if (dayData.fecha === currentDate) {
            const currentDayRemaining = dayData.forecast_hourly.filter((item) => parseInt(item.hour) >= currentHour);
            combinedData = [...combinedData, ...currentDayRemaining];
         } else {
            const nextDayNeeded = dayData.forecast_hourly.filter((item) => parseInt(item.hour) < currentHour);
            combinedData = [...combinedData, ...nextDayNeeded];
         }
      }

      console.log("todayTmrwData", combinedData);
      return combinedData;
   };

   console.log("today", chartData);
   console.log("tmr", chartDataTmr);
   const todayTmrwData = getNext24HoursData(weatherData);

   const allTemperatures = [...todayTmrwData.map((data) => data.temp), ...todayTmrwData.map((data) => data.feels_like)];

   const minTemp = Math.floor(Math.min(...allTemperatures));
   const maxTemp = Math.ceil(Math.max(...allTemperatures));

   const getTemperatureColor = (temp) => {
      const normalizedTemp = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
      const hue = 240 - normalizedTemp * 240;
      return `hsla(${hue}, 80%, 60%, 0.9)`;
   };   

   const getCurrentTemperature = () => {
      const currentData = todayTmrwData[0];
      return currentData
         ? {
              temp: currentData.temp,
              feels_like: currentData.feels_like,
            }
         : null;
   };
   const current = getCurrentTemperature();
   console.log("current", current);
   return (
      <Grid>
         <Grid.Col span={6}>
            <Space h="xl" />
            <Stack gap="xl">
            <TemperatureGraph todayTmrwData={todayTmrwData} getTemperatureColor={getTemperatureColor} />
            <PrecipitationGraph todayTmrwData={todayTmrwData}/>
            <HumidityChart todayTmrwData={todayTmrwData} />
            </Stack>
         </Grid.Col>
         <Grid.Col span={6}>
            <Space h="xl" />
            <Stack gap="xl">
               <RainProbGraph probData={rainProb} plugins={ChartDataLabels} />
               {/* <Text>CIAOO</Text> */}
               {current && <CurrentDayInfo current={current} weatherData={weatherData} />}
            </Stack>
         </Grid.Col>
      </Grid>
   );
};
export default WeatherDashboard;
