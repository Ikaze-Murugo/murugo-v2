import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Title, ActivityIndicator, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '../../api/favorites';
import { PropertyCard } from '../../components/PropertyCard';
import { useAuthStore } from '../../store/slices/authSlice';
import type { Property } from '../../types/property.types';

export default function FavoritesScreen({ route, navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const isGuest = !user;
  const queryClient = useQueryClient();

  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getAll(),
    enabled: !isGuest,
  });

  const removeFavorite = useMutation({
    mutationFn: (propertyId: string) => favoriteApi.remove(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const properties = (favorites ?? []).map((f) => f.property).filter(Boolean) as Property[];
  const stackNav = navigation.getParent();

  const handlePropertyPress = (propertyId: string) => {
    stackNav?.navigate('PropertyDetail', { propertyId });
  };

  if (isLoading) {
    // Skeleton for favorites
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button mode="text" onPress={() => navigation.goBack()}>
            Back
          </Button>
          <Title style={styles.title}>My Favorites</Title>
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
        <Text>Could not load favorites.</Text>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backBtn}>
          Back
        </Button>
      </View>
    );
  }

  if (isGuest) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button mode="text" onPress={() => navigation.goBack()}>
            Back
          </Button>
          <Title style={styles.title}>My Favorites</Title>
        </View>
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Sign in to save favorites. Your saved properties will appear here.
          </Text>
          <Button
            mode="contained"
            onPress={() => stackNav?.navigate('Login')}
            style={styles.signInBtn}
          >
            Sign in
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={() => navigation.goBack()}>
          Back
        </Button>
        <Title style={styles.title}>My Favorites</Title>
      </View>
      {properties.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No favorites yet. Browse properties and tap the heart to save.
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
              isFavorite
              onFavoritePress={() => removeFavorite.mutate(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  backBtn: { marginTop: 16 },
  title: { marginTop: 8 },
  listContent: { paddingBottom: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#6B7280', textAlign: 'center' },
  signInBtn: { marginTop: 16 },
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
