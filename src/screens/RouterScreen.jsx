import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import ResultScreen from './ResultScreen';
import { initializeFirebaseApp } from '../util/firebaseUtils';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import DashBoardScreen from './DashBoardScreen';
import { useAppDispatch } from '../redux/hooks';
import { setUserEmail, setUserId } from '../redux/userSlice';

const RouterScreen = () => {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const app = initializeFirebaseApp()
    const auth = getAuth(app)
    onAuthStateChanged(auth, user => {
      console.log(`current user id: ${user.uid}`)
      dispatch(setUserId(user.uid))
      dispatch(setUserEmail(user.email))
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashBoardScreen />} />
        <Route path="/result" element={<ResultScreen />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default RouterScreen;
