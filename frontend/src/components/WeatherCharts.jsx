import { Line } from "react-chartjs-2";

const formatPeriod = (periodo, fecha) => {
  const date = new Date(fecha);
  const formattedDate = date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
  return `${formattedDate} (${periodo.slice(0, 2)}-${periodo.slice(2)})`;
};

export const RainProbGraph = ({ probData }) => {
  const data = {
    labels: probData.map((prob) => formatPeriod(prob.periodo, prob.fecha)),
    datasets: [
      {
        label: "Probabilidad de precipitación",
        data: probData.map((prob) => prob.value),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      datalabels: {
        display: true,
        color: "rgba(0, 0, 0, 0.7)",
        align: "top",
        formatter: (value) => `${value}%`,
        backgroundColor: "rgba(98, 199, 224, 0.57)",
        borderRadius: 4,
        padding: 2,
        pointRadius: 0,
      },
    },
    scales: {
      y: {
        display: false,
      },
      x: {
        ticks: {
          maxRotation: 45,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export const getTemperatureGraphData = (todayTmrwData, getTemperatureColor) => ({
  labels: todayTmrwData.map((data) => `${data.hour}h`),
  datasets: [
    {
      label: "Temperatura",
      data: todayTmrwData.map((data) => data.temp),
      segment: {
        borderColor: (ctx) => getTemperatureColor(ctx.p1.parsed.y),
      },
      borderWidth: 4,
      tension: 0.3,
      pointRadius: 0,
    },  
    {
      label: "Sensanción térmica",
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
});

export const temperatureGraphOptions = {
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        color: "rgba(255, 255, 255, 0.3)",
      },
    },
    y: {
      beginAtZero: false,
      ticks: {
        color: "rgba(255, 255, 255, 0.3)",
        stepSize: 1,
      },
      title: {
        display: true,
        text: "temperatura (°C)",
      },
    },
  },
  plugins: {
    datalabels: {
      display: false,
    },
  },
};

export const getPrecipitationData = (todayTmrwData) => ({
  labels: todayTmrwData.map((data) => `${data.hour}h`),
  datasets: [
    {
      label: "Lluvia",
      data: todayTmrwData.map((data) => data.rain),
      borderColor: "rgb(6, 146, 240)",
      backgroundColor: "rgba(6, 131, 214, 0.87)",
    },
  ],
});

export const precipitationOptions = {
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        color: "rgba(255, 255, 255, 0.3)",
      },
    },
    y: {
      ticks: {
        color: "rgba(255, 255, 255, 0.3)",
      },
      beginAtZero: true,
      title: {
        display: true,
        text: "milímetros (mm)",
      },
    },
  },
};
