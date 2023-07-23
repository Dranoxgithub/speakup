import { initializeApp } from "firebase/app";
import { getAuth } from "@firebase/auth";
import getFirebaseConfig from "./util/firebaseConfig";

const app = initializeApp(getFirebaseConfig());

export const firebaseAuth = getAuth(app);
