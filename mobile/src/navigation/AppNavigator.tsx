import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainStackNavigator from './MainStackNavigator';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { useAuthStore } from '../store/slices/authSlice';
import {
  getHasSeenOnboarding,
  setHasSeenOnboarding,
  setOpenAuthAfterOnboarding,
  clearOpenAuthAfterOnboarding,
} from '../config/storage';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLoading: authLoading, initialize } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState<boolean | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    getHasSeenOnboarding().then(setHasSeenOnboardingState);
  }, []);

  const handleOnboardingFinish = async (openAuth?: 'Login' | 'Signup') => {
    await setHasSeenOnboarding(true);
    setHasSeenOnboardingState(true);
    if (openAuth) {
      await setOpenAuthAfterOnboarding(openAuth);
    } else {
      await clearOpenAuthAfterOnboarding();
    }
  };

  const appReady = hasSeenOnboarding !== null && !authLoading;

  if (!appReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // First launch: show onboarding. After that, everyone (guest + logged in) sees Main.
  if (!hasSeenOnboarding) {
    return (
      <View style={styles.fullScreen}>
        <OnboardingScreen onFinish={handleOnboardingFinish} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fullScreen: { flex: 1 },
});
