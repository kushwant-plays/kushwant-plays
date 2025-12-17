import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './pages/Index';
import Home from './pages/Home';
import Games from './pages/Games';
import Game from './pages/Game';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import YouTube from './pages/YouTube';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Analytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<Home />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/youtube" element={<YouTube />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;