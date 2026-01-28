import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Card } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Featured Properties</Title>
      <Card style={styles.card}>
        <Card.Content>
          <Text>Property listings will appear here</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16 },
  card: { marginBottom: 16 },
});
