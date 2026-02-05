import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Text, Title, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../api/properties';
import { PropertyCard } from '../../components/PropertyCard';

export default function MyListingsScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['properties', 'my-listings', statusFilter],
    queryFn: () =>
      propertyApi.getMyListings({ page: 1, limit: 50, status: statusFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => propertyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', 'my-listings'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Could not delete listing.');
    },
  });

  const properties = data?.properties ?? [];

  const handlePropertyPress = (propertyId: string) => {
    navigation.getParent()?.navigate('PropertyDetail', { propertyId });
  };

  const handleDelete = (propertyId: string, title: string) => {
    Alert.alert(
      'Delete listing',
      `Remove "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(propertyId),
        },
      ]
    );
  };

  const handleAddProperty = () => {
    navigation.getParent()?.navigate('CreateProperty');
  };

  if (isLoading) {
    // Skeleton state for lister dashboard
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>
          <Title style={styles.title}>My Listings</Title>
          <View style={styles.addBtn} />
        </View>
        <View style={styles.skeletonList}>
          {[0, 1].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonLineLong} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Could not load your listings.</Text>
        <Button mode="outlined" onPress={() => refetch()} style={styles.retryBtn}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Title style={styles.title}>My Listings</Title>
        <TouchableOpacity onPress={handleAddProperty} style={styles.addBtn}>
          <Ionicons name="add" size={28} />
        </TouchableOpacity>
      </View>

      {properties.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="home-outline" size={64} color="#9CA3AF" />
          <Text variant="bodyLarge" style={styles.emptyText}>
            You have no listings yet.
          </Text>
          <Button mode="contained" onPress={handleAddProperty} style={styles.addPropertyBtn}>
            Add property
          </Button>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => handlePropertyPress(item.id)}
              onLongPress={() =>
                Alert.alert(item.title, 'View or delete this listing?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'View', onPress: () => handlePropertyPress(item.id) },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(item.id, item.title),
                  },
                ])
              }
            >
              <PropertyCard
                property={item}
                onPress={() => handlePropertyPress(item.id)}
                showStatus
                showLister={false}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        />
      )}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 8 },
  title: { flex: 1, marginLeft: 8 },
  addBtn: { padding: 8 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { color: '#6B7280', marginTop: 16, textAlign: 'center' },
  addPropertyBtn: { marginTop: 24 },
  listContent: { paddingBottom: 24 },
  retryBtn: { marginTop: 16 },
  skeletonList: { paddingHorizontal: 16, paddingTop: 8 },
  skeletonCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  skeletonLineShort: {
    height: 14,
    width: '40%',
    marginTop: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  skeletonLineLong: {
    height: 12,
    width: '70%',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
});
