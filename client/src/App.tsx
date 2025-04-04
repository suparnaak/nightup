import React from 'react';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';


function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
