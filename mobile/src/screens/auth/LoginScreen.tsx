import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { theme, spacing } from '../../config/theme';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/slices/authSlice';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login({ email: email.trim(), password });
      await setAuth(data.user, data.token);
      navigation.goBack();
    } catch (err: any) {
      const status = err.response?.status;
      let message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      if (status === 404) {
        message = 'Server not found (404). The app cannot reach the API. If you use a custom backend URL, set EXPO_PUBLIC_API_URL in EAS and rebuild the app.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Welcome Back</Title>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Signup')}
          style={styles.linkButton}
          disabled={loading}
        >
          Don&apos;t have an account? Sign up
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: theme.colors.placeholder,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkButton: {
    marginTop: spacing.md,
  },
});
