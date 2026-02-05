import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Title, ActivityIndicator, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import type { Property } from '../../types/property.types';
import { PropertyStatus } from '../../types/property.types';

export default function AdminPendingScreen({ navigation }: any) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin', 'pending-properties'],
    queryFn: () => adminApi.getPendingProperties({ page: 1, limit: 50 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PropertyStatus }) =>
      adminApi.updatePropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });

  const properties: Property[] = data?.properties ?? [];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleViewProperty = (propertyId: string) => {
    navigation.getParent()?.navigate('PropertyDetail', { propertyId });
  };

  const handleApprove = (propertyId: string) => {
    updateStatus.mutate({ id: propertyId, status: PropertyStatus.AVAILABLE });
  };

  if (isLoading) {
    // Skeleton state for pending approvals
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button mode="text" onPress={handleBack} icon="arrow-left">
            Back
          </Button>
          <Title style={styles.title}>Pending approvals</Title>
        </View>
        <View style={styles.skeletonList}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonLineLong} />
              <View style={styles.skeletonLineMuted} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Could not load pending listings.</Text>
        <Button mode="outlined" onPress={() => refetch()} style={styles.retryBtn}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Title style={styles.title}>Pending approvals</Title>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-outline" size={48} color="#10B981" />
            <Text style={styles.emptyText}>No listings waiting for approval.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const listerName =
            item.lister?.profile?.name ||
            item.lister?.profile?.companyName ||
            item.lister?.email ||
            item.lister?.phone;

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.rowBetween}>
                  <Text variant="titleMedium" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.subText} numberOfLines={1}>
                  {item.location?.sector}, {item.location?.district}
                </Text>
                <Text style={styles.priceText}>
                  {item.currency} {item.price.toLocaleString()}
                </Text>
                {listerName && (
                  <Text style={styles.listerText}>Lister: {listerName}</Text>
                )}
                <View style={styles.pillsRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{item.propertyType}</Text>
                  </View>
                  <View style={styles.chipMuted}>
                    <Text style={styles.chipMutedText}>{item.transactionType}</Text>
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <Button
                    mode="outlined"
                    onPress={() => handleViewProperty(item.id)}
                    style={styles.actionBtn}
                    icon="eye-outline"
                  >
                    View
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleApprove(item.id)}
                    style={styles.actionBtn}
                    loading={updateStatus.isPending}
                    disabled={updateStatus.isPending}
                  >
                    Approve
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        }}
        ListFooterComponent={
          isFetching ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 8,
  },
  title: { marginLeft: 8 },
  listContent: { padding: 16, paddingBottom: 32 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { marginTop: 8, color: '#6B7280', textAlign: 'center' },
  retryBtn: { marginTop: 16 },
  card: { marginBottom: 12 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subText: { color: '#6B7280', marginBottom: 4 },
  priceText: { fontWeight: '600', marginBottom: 4 },
  listerText: { color: '#4B5563', marginBottom: 6 },
  pillsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  chipText: { fontSize: 12, color: '#1D4ED8' },
  chipMuted: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  chipMutedText: { fontSize: 12, color: '#4B5563' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: { flexShrink: 1 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },
  statusText: { fontSize: 11, textTransform: 'capitalize', color: '#92400E' },
  skeletonList: { padding: 16 },
  skeletonCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  skeletonLineShort: {
    height: 14,
    width: '60%',
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  skeletonLineLong: {
    height: 12,
    width: '80%',
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginBottom: 6,
  },
  skeletonLineMuted: {
    height: 10,
    width: '40%',
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
});

