import { initializeFirebaseApp } from "../util/firebaseUtils";
import { getStorage, ref, getBlob } from "@firebase/storage";

export const AVAILABLE_VOICES = [
  { name: "Alex", tags: ["american", "male", "young"] },
  { name: "Bruce", tags: ["american", "male", "middle-aged"] },
  { name: "Joanne", tags: ["american", "female", "young"] },
  { name: "Valley Girl", tags: ["american", "female", "young"] },
  { name: "Victoria", tags: ["british", "female", "middle-aged"] },
  { name: "Zeus", tags: ["british", "male", "middle-aged"] },
];

export const getUserVoicePreviewAudio = async (userId: string) => {
  const app = initializeFirebaseApp();
  const storage = getStorage(app);
  const userVoicePreviewUrl = `demo/voice_preview/${userId}`;
  let userVoicePreviewAudio;
  try {
    const audioRef = ref(storage, userVoicePreviewUrl);
    const blob = await getBlob(audioRef);
    userVoicePreviewAudio = URL.createObjectURL(blob);
    console.log(`got user voice preview audio ${userVoicePreviewUrl}`);
  } catch {}

  console.log(`returning user voice preview ${userVoicePreviewAudio}`);
  return userVoicePreviewAudio;
};
