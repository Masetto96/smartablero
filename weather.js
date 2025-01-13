import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatHour = (hour) => {
  return `${hour}:00`;
};

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
        console.log(data);
      } catch (e) {
        setError(e.message || 'Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeatherData();
  }, []);

  if (isLoading) {
    return (
            <div className="text-lg text-gray-500">Loading weather data...</div>
    );
  }

  if (error) {
    return (
        <div className="text-red-800">{error}</div>
    );
  }

  if (!weatherData || !weatherData.data || weatherData.data.length === 0) {
    return (
        <div className="text-yellow-800">No weather data available</div>
    );
  }

// Transform the weather data for the chart
const chartData = weatherData.data[0].forecast_hourly.map((hourData) => ({
  hour: formatHour(hourData.hour),
  temperature: parseInt(hourData.temp),
  feelsLike: parseInt(hourData.feels_like),
  rain: parseInt(hourData.rain),
}));

return (
<div className="w-full max-w-4xl rounded-lg bg-white shadow-lg">
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6">
      Temperature Forecast - {weatherData.data[0].fecha}
    </h2>
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
          <XAxis 
            dataKey="hour" 
            tick={{ fill: '#666' }}
            tickMargin={10}
          />
          <YAxis 
            label={{ 
              value: 'Temperature (°C)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
            }}
            tick={{ fill: '#666' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#8884d8"
            strokeWidth={2}
            name="Actual Temperature"
            dot={{ fill: '#8884d8', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="feelsLike"
            stroke="#82ca9d"
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Feels Like"
            dot={{ fill: '#82ca9d', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
);

};

export default WeatherDashboard;