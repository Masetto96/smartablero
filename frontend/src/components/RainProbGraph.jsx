import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js';

ChartJS.register(ChartDataLabels);

const formatPeriod = (periodo, fecha) => {
    const date = new Date(fecha);
    const formattedDate = date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short'
    });
    return `${formattedDate} (${periodo.slice(0, 2)}-${periodo.slice(2)})`;
  };

const RainProbGraph = ({ probData }) => {
    const data = {
        labels: probData.map(prob => formatPeriod(prob.periodo, prob.fecha)),
        datasets: [
            {
                label: 'Probabilidad de precipitación',
                data: probData.map(prob => prob.value),
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
            },
        ],
    };
  
    const options = {
      plugins: {
        legend: {
          position: 'bottom',
        },
        datalabels: {
          display: true,
          color: '#000',
          align: 'top',
          formatter: (value) => `${value}%`,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 4,
          padding: 2
        },
      },
      scales: {
        y: {
          display: false
        },
        x: {
          ticks: {
            maxRotation: 45
          }
        }
      }
    };

    return <Line data={data} options={options} />;
};

export default RainProbGraph;