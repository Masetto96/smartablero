import React, { useEffect, useState } from "react";
import { Text, Grid, Stack, Card, Group, Paper, Container, Center, Space } from "@mantine/core";
import { Line, Bar } from "react-chartjs-2";
import {
   getTemperatureGraphData,
   temperatureGraphOptions,
   getPrecipitationData,
   precipitationOptions,
   RainProbGraph,
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
import { IconSunset, IconSunrise } from "@tabler/icons-react";

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

   const temperatureGraphData = getTemperatureGraphData(todayTmrwData, getTemperatureColor);
   const precipitationData = getPrecipitationData(todayTmrwData);

   const getCurrentTemperature = () => {
      const currentHour = new Date().getHours();
      console.log("currentHour", currentHour);
      const currentData = todayTmrwData.find((data) => data.hour === currentHour);
      return currentData
         ? {
              temperature: currentData.temp,
              feelsLike: currentData.feels_like,
           }
         : null;
   };

   const current = getCurrentTemperature();
   console.log("current", current);
   return (
      <Grid>
         <Grid.Col span={6}>
            <Space h="sm" />
            <Stack gap="md">
               <Line data={temperatureGraphData} options={temperatureGraphOptions} />
               <Bar data={precipitationData} options={precipitationOptions} />
            </Stack>
         </Grid.Col>
         <Grid.Col span={6}>
            <Space h="sm" />
            <Stack>
               <RainProbGraph probData={rainProb} plugins={ChartDataLabels} />
               <Text ta="center" fs="italic">
                  ahorita la temperatura es {current.temperature}°C y la sensaciò termica es {current.feelsLike}°C
               </Text>
               <Container>
                  <Group>
                     <Paper shadow="lg">
                        <Center>
                           <IconSunrise size={40} stroke={1} />
                           <Text>{weatherData[0].sunrise}</Text>
                        </Center>
                     </Paper>
                     <Paper shadow="lg">
                        <Center>
                           <IconSunset size={40} stroke={1} />
                           <Text>{weatherData[0].sunset}</Text>
                        </Center>
                     </Paper>
                  </Group>
               </Container>
            </Stack>
         </Grid.Col>
      </Grid>
   );
};
export default WeatherDashboard;
