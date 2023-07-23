import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import ResultScreen from './ResultScreen';

const RouterScreen = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/result" element={<ResultScreen />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default RouterScreen;
