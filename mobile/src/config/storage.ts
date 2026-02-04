import AsyncStorage from '@react-native-async-storage/async-storage';

export const HAS_SEEN_ONBOARDING = 'hasSeenOnboarding';
export const OPEN_AUTH_AFTER_ONBOARDING = 'openAuthAfterOnboarding'; // 'Login' | 'Signup'

export async function getHasSeenOnboarding(): Promise<boolean> {
  const v = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING);
  return v === 'true';
}

export async function setHasSeenOnboarding(value: boolean): Promise<void> {
  await AsyncStorage.setItem(HAS_SEEN_ONBOARDING, value ? 'true' : 'false');
}

export async function getOpenAuthAfterOnboarding(): Promise<'Login' | 'Signup' | null> {
  const v = await AsyncStorage.getItem(OPEN_AUTH_AFTER_ONBOARDING);
  if (v === 'Login' || v === 'Signup') return v;
  return null;
}

export async function setOpenAuthAfterOnboarding(screen: 'Login' | 'Signup'): Promise<void> {
  await AsyncStorage.setItem(OPEN_AUTH_AFTER_ONBOARDING, screen);
}

export async function clearOpenAuthAfterOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(OPEN_AUTH_AFTER_ONBOARDING);
}
