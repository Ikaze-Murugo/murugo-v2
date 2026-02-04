import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';

type OnboardingScreenProps = {
  onFinish?: (openAuth?: 'Login' | 'Signup') => void;
  navigation?: any;
};

export default function OnboardingScreen({ onFinish, navigation }: OnboardingScreenProps) {
  const handleGetStarted = () => {
    onFinish?.(); // Continue as guest
  };

  const handleSignIn = () => {
    onFinish?.('Login');
  };

  const handleCreateAccount = () => {
    onFinish?.('Signup');
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome to Rwanda Real Estate</Title>
      <Text style={styles.subtitle}>Find your perfect property. Browse listings or sign in to save favorites and list your own.</Text>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.primaryButton}
        >
          Get started (browse as guest)
        </Button>
        <Button mode="outlined" onPress={handleSignIn} style={styles.button}>
          Sign in
        </Button>
        <Button mode="text" onPress={handleCreateAccount} style={styles.button}>
          Create account
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  primaryButton: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});
