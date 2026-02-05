import React, { useEffect, useState } from "react";
import { Grid, Stack, Space, useMantineTheme, Loader, Text, Alert, Button } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import {
   TemperatureGraph,
   RainProbGraph,
   HumidityChart,
   WeatherCards,
   CurrentWeatherCard,
} from "./WeatherCharts";
import { DailyWeatherCards } from "./DailyWeatherCards";
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
   const [currentWeather, setCurrentWeather] = useState(null);
   const [dailyWeather, setDailyWeather] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const theme = useMantineTheme();

   const fetchWeatherData = async () => {
      setIsLoading(true);
      setError(null);
      try {
         // Fetch all three endpoints in parallel for efficiency
         const [weatherResponse, currentResponse, dailyResponse] = await Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_URL}/weather`),
            fetch(`${import.meta.env.VITE_BACKEND_URL}/weather/current`),
            fetch(`${import.meta.env.VITE_BACKEND_URL}/weather/daily`)
         ]);

         if (!weatherResponse.ok) {
            throw new Error(`Weather service temporarily unavailable (${weatherResponse.status}). Please try again in a moment.`);
         }
         
         if (!currentResponse.ok) {
            throw new Error(`Current weather service temporarily unavailable (${currentResponse.status}). Please try again in a moment.`);
         }
         
         if (!dailyResponse.ok) {
            throw new Error(`Daily weather service temporarily unavailable (${dailyResponse.status}). Please try again in a moment.`);
         }
         
         const [weatherData, currentData, dailyData] = await Promise.all([
            weatherResponse.json(),
            currentResponse.json(),
            dailyResponse.json()
         ]);
         
         setWeatherData(weatherData);
         setCurrentWeather(currentData);
         setDailyWeather(dailyData);
         console.log("Fetched data:", weatherData, currentData, dailyData);
      } catch (e) {
         console.error("Error fetching weather:", e);
         setError(e.message || "Failed to fetch weather data. The weather service might be temporarily unavailable.");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchWeatherData();
   }, []);

   if (isLoading) {
      return (
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
            <Loader size="lg" type="bars" />
            <Text size="lg" c="dimmed">Loading weather data...</Text>
         </div>
      );
   }

   if (error) {
      return (
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', maxWidth: '600px', margin: '0 auto' }}>
            <Alert 
               variant="light" 
               color="red" 
               title="Weather Service Unavailable" 
               icon={<IconAlertCircle />}
               style={{ width: '100%' }}
            >
               <Text size="sm" mb="md">{error}</Text>
               <Button 
                  leftSection={<IconRefresh size={16} />} 
                  onClick={fetchWeatherData}
                  variant="light"
                  color="red"
               >
                  Retry
               </Button>
            </Alert>
         </div>
      );
   }

   if (!weatherData || weatherData.length === 0) {
      return (
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <Alert variant="light" color="yellow" title="No Data Available">
               <Text size="sm">No weather data available at the moment.</Text>
            </Alert>
         </div>
      );
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

   return (
      <div style={{ height: '100vh', width: '100vw', padding: '1rem', boxSizing: 'border-box', overflow: 'hidden' }}>
         <Space h="xs" />
         <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem", flexWrap: 'nowrap' }}>
            <CurrentWeatherCard currentWeather={currentWeather} />
            <WeatherCards weatherData={todayTmrwData} />
         </div>
         <Stack gap="md">
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
               <div style={{ flex: "0 0 auto" }}>
                  <DailyWeatherCards dailyData={dailyWeather} />
               </div>
               <div style={{ flex: "1 1 auto" }}>
                  <TemperatureGraph todayTmrwData={todayTmrwData} getTemperatureColor={getTemperatureColor} />
               </div>
            </div>
            <Grid gutter="md">
               <Grid.Col span={6}>
                  <RainProbGraph probData={rainProb} plugins={ChartDataLabels} />
               </Grid.Col>
               <Grid.Col span={6}>
                  <HumidityChart todayTmrwData={todayTmrwData} />
               </Grid.Col>
            </Grid>
         </Stack>
      </div>
   );
};
export default WeatherDashboard;
