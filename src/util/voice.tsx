import { initializeFirebaseApp } from '../util/firebaseUtils';
import { getStorage, ref, getBlob } from '@firebase/storage';

export const AVAILABLE_VOICES = [
  { name: 'Alex', tags: ['american', 'male', 'young'], language: 'English' },
  { name: 'Brian', tags: ['american', 'male', 'middle-aged', 'deep'], language: 'English' },
  { name: 'Bruce', tags: ['american', 'male', 'middle-aged'], language: 'English' },
  { name: 'Callum', tags: ['american', 'hoarse', 'video games'], language: 'English' },
  { name: 'Charlie', tags: ['australian', 'casual', 'conversational'], language: 'English' },
  { name: 'Charlotte', tags: ['english-swedish', 'seductive', 'video games'], language: 'English' },
  { name: 'Daniel', tags: ['british', 'deep', 'news presenter'], language: 'English' },
  { name: 'Danny', tags: ['australian', 'relaxed', 'narrative'], language: 'English' },
  { name: 'Dave', tags: ['american', 'deep', 'advertisement'], language: 'English' },
  { name: 'Dorothy', tags: ['british', 'pleasant', "children's stories"], language: 'English' },
  { name: 'Fin', tags: ['irish', 'sailor', 'video games'], language: 'English' },
  { name: 'George', tags: ['british', 'raspy', 'narration'], language: 'English' },
  { name: 'Giovanni', tags: ['english-italian', 'foreigner', 'audio book'], language: 'English' },
  { name: 'Jeremy', tags: ['american-irish', 'excited', 'narration'], language: 'English' },
  { name: 'Joanne', tags: ['american', 'female', 'young'], language: 'English' },
  { name: 'Joseph', tags: ['british', 'ground reporter', 'news'], language: 'English' },
  { name: 'Lily', tags: ['british', 'raspy', 'narration'], language: 'English' },
  { name: 'Lizzy', tags: ['british', 'casual', 'conversational'], language: 'English' },
  { name: 'Matilda', tags: ['american', 'warm', 'audio book'], language: 'English' },
  { name: 'Michael', tags: ['american', 'orotund', 'audio book'], language: 'English' },
  { name: 'Mimi', tags: ['english-swedish', 'childish', 'animation'], language: 'English' },
  { name: 'Myriam', tags: ['american', 'childish', 'animation'], language: 'English' },
  { name: 'Nicole', tags: ['american', 'whisper', 'audio book'], language: 'English' },
  { name: 'Paul', tags: ['american', 'ground reporter', 'news'], language: 'English' },
  { name: 'Rani', tags: ['indian', 'calm', 'animation'], language: 'English' },
  { name: 'Sally', tags: ['american', 'relaxed', 'conversational'], language: 'English' },
  { name: 'Sanjay', tags: ['indian', 'pleasant', 'narrative'], language: 'English' },
  { name: 'Thomas', tags: ['american', 'calm', 'meditation'], language: 'English' },
  { name: 'Valley Girl', tags: ['american', 'female', 'young'], language: 'English' },
  { name: 'Victoria', tags: ['british', 'female', 'middle-aged'], language: 'English' },
  { name: 'Zeus', tags: ['british', 'male', 'middle-aged'], language: 'English' },
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
