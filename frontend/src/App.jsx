import './App.css';
import '@mantine/core/styles.css';
import WeatherDashboard from './WeatherDashboard';
import MovieSchedule from './MovieSchedule';
import RotatingDisplay from './RotatingDisplay';
import { MantineProvider } from '@mantine/core';

function App() {
  const displayComponents = [
    <WeatherDashboard key="weather" />,
    <MovieSchedule key="movies" />,
    // Add more components here as needed
  ];

  return (
    <MantineProvider>
      <RotatingDisplay components={displayComponents} />
    </MantineProvider>
  );
}

export default App;