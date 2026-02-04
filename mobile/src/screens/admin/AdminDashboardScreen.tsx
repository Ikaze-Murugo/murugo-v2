import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, ActivityIndicator, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';

export default function AdminDashboardScreen({ navigation }: any) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
  });

  const handleOpenUsers = () => {
    navigation.getParent()?.navigate('AdminUsers');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text>Could not load admin stats.</Text>
        <Button mode="outlined" onPress={() => refetch()} style={styles.retryBtn}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Title style={styles.title}>Admin dashboard</Title>
      </View>

      <View style={styles.cardRow}>
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="people-outline" size={28} color="#2563EB" />
            <Text variant="titleLarge" style={styles.cardValue}>
              {data.totalUsers}
            </Text>
            <Text variant="bodySmall" style={styles.cardLabel}>
              Active users
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="home-outline" size={28} color="#10B981" />
            <Text variant="titleLarge" style={styles.cardValue}>
              {data.totalProperties}
            </Text>
            <Text variant="bodySmall" style={styles.cardLabel}>
              Total properties
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.cardRow}>
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="checkmark-done-outline" size={28} color="#10B981" />
            <Text variant="titleLarge" style={styles.cardValue}>
              {data.availableProperties}
            </Text>
            <Text variant="bodySmall" style={styles.cardLabel}>
              Available
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="time-outline" size={28} color="#F59E0B" />
            <Text variant="titleLarge" style={styles.cardValue}>
              {data.pendingApprovals}
            </Text>
            <Text variant="bodySmall" style={styles.cardLabel}>
              Pending approvals
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.fullCard}>
        <Card.Content>
          <Ionicons name="eye-outline" size={28} color="#2563EB" />
          <Text variant="titleLarge" style={styles.cardValue}>
            {data.totalViews}
          </Text>
          <Text variant="bodySmall" style={styles.cardLabel}>
            Total property views
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleOpenUsers}
        style={styles.usersBtn}
        icon="account-multiple-outline"
      >
        View users
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 16, paddingTop: 48 },
  title: { fontSize: 22 },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    paddingVertical: 8,
  },
  fullCard: {
    marginTop: 8,
    paddingVertical: 8,
  },
  cardValue: { marginTop: 8, marginBottom: 2 },
  cardLabel: { color: '#6B7280' },
  usersBtn: { marginTop: 24 },
  retryBtn: { marginTop: 16 },
});

