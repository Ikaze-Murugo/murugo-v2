import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title } from 'react-native-paper';

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <Title>Sign Up Screen</Title>
      <Text>Create your account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
