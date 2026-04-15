// Legacy screen — redirects to game
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function MapScreen() {
  const router = useRouter();
  useEffect(() => { router.replace('/game'); }, []);
  return null;
}
