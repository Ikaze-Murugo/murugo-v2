import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { theme, spacing } from '../../config/theme';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/slices/authSlice';

type Role = 'seeker' | 'lister';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('seeker');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSignup = async () => {
    if (!email.trim() || !phone.trim() || !password) {
      Alert.alert('Error', 'Please enter email, phone, and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register({
        email: email.trim(),
        phone: phone.trim(),
        password,
        name: name.trim() || undefined,
        role,
      });
      await setAuth(data.user, data.token);
      navigation.goBack();
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      Alert.alert('Sign up failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Title style={styles.title}>Create account</Title>
        <Text style={styles.subtitle}>Join Murugo Homes</Text>

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
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          placeholder="e.g. +250788123456"
          style={styles.input}
        />
        <TextInput
          label="Name (optional)"
          value={name}
          onChangeText={setName}
          mode="outlined"
          autoComplete="name"
          style={styles.input}
        />
        <TextInput
          label="Password (min 6 characters)"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          autoComplete="password-new"
          style={styles.input}
        />

        <Text style={styles.roleLabel}>I am</Text>
        <View style={styles.roleRow}>
          <Button
            mode={role === 'seeker' ? 'contained' : 'outlined'}
            onPress={() => setRole('seeker')}
            style={styles.roleButton}
          >
            Looking for a property
          </Button>
          <Button
            mode={role === 'lister' ? 'contained' : 'outlined'}
            onPress={() => setRole('lister')}
            style={styles.roleButton}
          >
            Listing properties
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign up
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
          disabled={loading}
        >
          Already have an account? Log in
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
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
  roleLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleButton: {
    flex: 1,
  },
  button: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkButton: {
    marginTop: spacing.md,
  },
});
