import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title } from 'react-native-paper';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Title>Messages</Title>
      <Text>Your conversations will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
