import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import ResultScreen from './ResultScreen';
import { initializeFirebaseApp } from '../util/firebaseUtils';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import DashBoardScreen from './DashBoardScreen';
import { useAppDispatch } from '../redux/hooks';
import { setUserEmail, setUserId, setUserProfilePic, setUserDisplayName, setUserIdToken } from '../redux/userSlice';
import WebFont from 'webfontloader'
import DetailedInputScreen from './DetailedInputScreen';

const RouterScreen = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
      WebFont.load({
          google: {
              families: ["Gloock"],
          },
      })
  }, [])

  useEffect(() => {
    const app = initializeFirebaseApp()
    const auth = getAuth(app)
    onAuthStateChanged(auth, user => {
      if (user) {
        dispatch(setUserId(user.uid))
        dispatch(setUserEmail(user.email))
        dispatch(setUserProfilePic(user.photoURL))
        dispatch(setUserDisplayName(user.displayName))
        dispatch(setUserIdToken(user.accessToken))
      }
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/detailedInput" element={<DetailedInputScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashBoardScreen />} />
        <Route path="/result" element={<ResultScreen />}/>
      </Routes>
    </BrowserRouter>
  );
};

export default RouterScreen;