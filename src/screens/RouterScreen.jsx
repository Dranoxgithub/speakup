import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoginScreen from "./LoginScreen";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import DashBoardScreen from "./DashBoardScreen";
import { useAppDispatch } from "../redux/hooks";
import {
  setUserEmail,
  setUserId,
  setUserProfilePic,
  setUserDisplayName
} from "../redux/userSlice";
import WebFont from "webfontloader";
import SubscriptionScreen from "./SubscriptionScreen";
import PodcastEditScreen from "./PodcastEditScreen";
import PodcastResultScreen from "./PodcastResultScreen";

const RouterScreen = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    WebFont.load({
      google: {
        families: ["Poppins:400,500,700,800,900"],
      },
    });
  }, []);

  useEffect(() => {
    const app = initializeFirebaseApp();
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUserId(user.uid));
        dispatch(setUserEmail(user.email));
        dispatch(setUserProfilePic(user.photoURL));
        dispatch(setUserDisplayName(user.displayName));
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashBoardScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashBoardScreen />} />
        <Route path="/result" element={<PodcastResultScreen />} />
        <Route path="/edit" element={<PodcastEditScreen />} />
        <Route path="/subscription" element={<SubscriptionScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

export default RouterScreen;
