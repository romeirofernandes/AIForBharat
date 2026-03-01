import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<div className="flex h-screen items-center justify-center font-display text-2xl font-semibold">Login Page Demo</div>} />
    </Routes>
  );
}
