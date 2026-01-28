import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Button } from 'react-native-paper';

export default function OnboardingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Title>Welcome to Rwanda Real Estate</Title>
      <Text>Find your perfect property</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
