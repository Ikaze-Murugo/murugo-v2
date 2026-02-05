import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Title, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../api/properties';
import { favoriteApi } from '../../api/favorites';
import { PropertyCard } from '../../components/PropertyCard';
import { useAuthStore } from '../../store/slices/authSlice';
import { getOpenAuthAfterOnboarding, clearOpenAuthAfterOnboarding } from '../../config/storage';
import type { Property } from '../../types/property.types';

export default function HomeScreen({ navigation }: any) {
  const stackNav = navigation.getParent();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getAll(),
    enabled: !!user,
  });
  const favoriteIds = new Set(favorites.map((f) => f.property?.id).filter(Boolean));

  const toggleFavorite = useMutation({
    mutationFn: async ({ propertyId, isFav }: { propertyId: string; isFav: boolean }) => {
      if (isFav) await favoriteApi.remove(propertyId);
      else await favoriteApi.add(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['properties', 'latest'] });
    },
  });

  useFocusEffect(
    useCallback(() => {
      getOpenAuthAfterOnboarding().then((openAuth) => {
        if (openAuth && stackNav) {
          clearOpenAuthAfterOnboarding();
          stackNav.navigate(openAuth);
        }
      });
    }, [stackNav])
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', 'latest'],
    queryFn: () =>
      propertyApi.getAll({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const properties = data?.properties ?? [];

  const handlePropertyPress = (propertyId: string) => {
    stackNav?.navigate('PropertyDetail', { propertyId });
  };

  if (isLoading) {
    // Skeleton: 3 grey cards to indicate loading list
    return (
      <View style={styles.container}>
        <Title style={styles.title}>Latest properties</Title>
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
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
        <Text>Could not load properties. Pull to retry.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Latest properties</Title>
      {properties.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No properties yet. Check back soon.
          </Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => handlePropertyPress(item.id)}
              showLister={!!user}
              isFavorite={favoriteIds.has(item.id)}
              onFavoritePress={
                user
                  ? () =>
                      toggleFavorite.mutate({
                        propertyId: item.id,
                        isFav: favoriteIds.has(item.id),
                      })
                  : undefined
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  listContent: { paddingBottom: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#6B7280' },
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
