import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ErrorBoundary from './components/ErrorBoundary';
import Index from './pages/Index';
import Home from './pages/Home';
import Game from './pages/Game';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import YouTube from './pages/YouTube';
import RequestGame from './pages/RequestGame';
import About from './pages/About';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <Analytics />
          <VercelAnalytics />
          <SpeedInsights />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/games" element={<Home />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/youtube" element={<YouTube />} />
            <Route path="/request-game" element={<RequestGame />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;