import './App.css';
import '@mantine/core/styles.css';
import WeatherDashboard from './components/WeatherDashboard';
import EventsDashboard from './components/EventsDashboard';
import RotatingDisplay from './components/RotatingDisplay';
import { MantineProvider } from '@mantine/core';

function App() {
  const displayComponents = [
    <WeatherDashboard key="weather" />,
    <EventsDashboard key="events" />,
    // Add more components here as needed
  ];

  return (
    <MantineProvider>
      <RotatingDisplay components={displayComponents} />
    </MantineProvider>
  );
}

export default App;