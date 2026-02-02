import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Title, ActivityIndicator, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { favoriteApi } from '../../api/favorites';
import { PropertyCard } from '../../components/PropertyCard';
import type { Property } from '../../types/property.types';

export default function FavoritesScreen({ route, navigation }: any) {
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getAll(),
  });

  const properties = (favorites ?? []).map((f) => f.property).filter(Boolean) as Property[];
  const stackNav = navigation.getParent();

  const handlePropertyPress = (propertyId: string) => {
    stackNav?.navigate('PropertyDetail', { propertyId });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
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
            <PropertyCard property={item} onPress={() => handlePropertyPress(item.id)} />
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
});
