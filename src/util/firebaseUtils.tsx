import getFirebaseConfig from "./firebaseConfig";
import firebase from "firebase/compat/app";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";

export async function createUserDocument(uid: string) {
  try {
    // console.log(`calling create user document with uid: ${uid}`);

    const app = initializeFirebaseApp();
    const db = getFirestore(app);
    console.log(`got firestore`);
    const docRef = doc(db, "users", uid);
    const user = (await getDoc(docRef)).data();

    if (user === undefined) {
      // console.log(`Creating a new user document for uid ${uid}.`);
      await setDoc(docRef, { 
        id: uid, 
        quota: 10
      });
      return true;
    }
    return false;
  } catch (error) {
    console.log(`createUserDocument error: ${error}`);
  }
}

export async function getDocument(collectionName: string, id: string) {
  const app = initializeFirebaseApp();
  const db = getFirestore(app);
  try {
    return (await getDoc(doc(db, collectionName, id))).data();
  } catch {
    return null
  }
}

export async function updateDocument(
  collectionName: string,
  id: string,
  newDocument: any
) {
  const app = initializeFirebaseApp();
  const db = getFirestore(app);
  try {
    await setDoc(doc(db, collectionName, id), newDocument, { merge: true });
  } catch {

  }
}

export function initializeFirebaseApp() {
  try {
    return firebase.app("firestore");
  } catch (error) {
    return firebase.initializeApp(getFirebaseConfig(), "firestore");
  }
}
