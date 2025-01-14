import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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


// const getTemperatureColor = (temp) => {
//   // Use HSL color space for better color interpolation
//   // Hue: 240 (blue) to 0 (red)
//   const minTemp = 0;
//   const maxTemp = 35;
  
//   // Normalize temperature to 0-1 range
//   const normalizedTemp = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
  
//   // Calculate hue (240 = blue, 0 = red)
//   const hue = 240 - (normalizedTemp * 240);
  
//   // Use fixed saturation and lightness for better visibility
//   return `hsla(${hue}, 70%, 50%, 0.8)`;
// };


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
    ...chartDataTmr.map(data => data.feelsLike),
    ...chartDataTmr.map(data => data.feelsLike),

  ];
  
  const minTemp = Math.floor(Math.min(...allTemperatures));
  const maxTemp = Math.ceil(Math.max(...allTemperatures));

  const getTemperatureColor = (temp) => {
    // Normalize temperature to 0-1 range using actual min/max
    const normalizedTemp = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
    
    // Calculate hue (240 = blue, 0 = red)
    const hue = 240 - (normalizedTemp * 240);
    
    return `hsla(${hue}, 80%, 60%, 0.9)`;
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
        // grid: {
        //   display: true,
        //   drawOnChartArea: true,
        //   drawTicks: true,
        // },
        title: {
          display: true,
          text: 'temperatura (°C)'
        }
      },
    },
    plugins: {
      legend: {
        display: false,  // Hide legend
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

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div style={{ height: '400px', width: '800px', marginBottom: '50px' }}>
        <p className="temperature-text">
            Temperatura y sensación térmica
        </p>
          <Line data={temperatureData} options={temperatureOptions} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div style={{ height: '400px', width: '800px' }}>
          <Bar data={precipitationData} options={precipitationOptions} />
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;