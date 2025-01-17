import React, { useEffect, useState } from "react";
import { Text, Grid, Stack } from "@mantine/core";
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

   if (!weatherData || !weatherData.data || weatherData.data.length === 0) {
      return <div className="text-yellow-800">No weather data available</div>;
   }

   // Data for the rainProb graph
   const rainProb = weatherData.data.flatMap((day) =>
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
   const chartData = weatherData.data[0].forecast_hourly.map(transformHourlyData);
   const chartDataTmr = weatherData.data[1].forecast_hourly.map(transformHourlyData);

   const getNext24HoursData = (currentDayData, nextDayData) => {
      const currentHour = new Date().getHours();

      // Handle midnight case specially
      const currentDayRemaining = currentDayData.filter((item) =>
         currentHour === 0 ? true : parseInt(item.hour) >= currentHour
      );

      const nextDayNeeded =
         currentHour === 0
            ? []
            : nextDayData
                 .filter((item) => parseInt(item.hour) < currentHour)
                 .map((item) => ({
                    ...item,
                    hour: parseInt(item.hour),
                 }));

      return [...currentDayRemaining, ...nextDayNeeded];
   };

   const todayTmrwData = getNext24HoursData(chartData, chartDataTmr);
   console.log("tmr", chartDataTmr);
   console.log("today", chartData);
   console.log("today and tmr", todayTmrwData);

   const allTemperatures = [
      ...chartData.map((data) => data.temperature),
      ...chartData.map((data) => data.feelsLike),
      ...chartDataTmr.map((data) => data.temperature),
      ...chartDataTmr.map((data) => data.feelsLike),
   ];

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
      const currentData = todayTmrwData.find((data) => data.hour == currentHour);

      return currentData
         ? {
              temperature: currentData.temperature,
              feelsLike: currentData.feelsLike,
           }
         : null;
   };

   const current = getCurrentTemperature();
   console.log("current", current);
   // TODO: how to add bloody margin?
   return (
      <Grid>
         <Grid.Col span={6}>
            <Stack gap="md">
               <Line data={temperatureGraphData} options={temperatureGraphOptions} />
               <Bar data={precipitationData} options={precipitationOptions} />
            </Stack>
         </Grid.Col>
         <Grid.Col span={6}>
            <Stack>
               <RainProbGraph probData={rainProb} plugins={ChartDataLabels} />
               <Text ta="center" fw={500} fs="italic">
                  ahorita la temperatura es {current.temperature}°C y la sensaciò termica es {current.feelsLike}°C
               </Text>
            </Stack>
         </Grid.Col>
      </Grid>
   );
};
export default WeatherDashboard;
