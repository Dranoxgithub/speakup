import getFirebaseConfig from "./firebaseConfig";
import firebase from "firebase/compat/app";
import { getFirestore, getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createUserDocument(uid: string) {
  try {
    const app = initializeFirebaseApp();
    const db = getFirestore(app);
    console.log(`got firestore`);
    const docRef = doc(db, "users", uid);
    const user = (await getDoc(docRef)).data();

    if (user === undefined) {
      const demos = [
        {
          content_id: 'bZMp8rqMZcs7gZQDWSrg',
          status: 'audio_success'
        },
        {
          content_id: 'Rfg4OgKngtJ6eSmrD17Q',
          status: 'audio_success'
        },
      ]
      // console.log(`Creating a new user document for uid ${uid}.`);
      await setDoc(docRef, { 
        id: uid, 
        quota: 10,
        user_saved: demos,
        subscription: 'Free',
        acceptEmailNotification: true,
        created_at: serverTimestamp(),
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
