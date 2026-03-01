import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </>
  );
}
