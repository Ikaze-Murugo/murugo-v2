import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Text, ActivityIndicator, Menu, Button } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../api/properties';
import { favoriteApi } from '../../api/favorites';
import { PropertyCard } from '../../components/PropertyCard';
import { useAuthStore } from '../../store/slices/authSlice';
import type { Property, PropertyFilters, PropertyType, TransactionType } from '../../types/property.types';

const PROPERTY_TYPES: { label: string; value: PropertyType | '' }[] = [
  { label: 'All types', value: '' },
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Office', value: 'office' },
  { label: 'Land', value: 'land' },
  { label: 'Studio', value: 'studio' },
  { label: 'Villa', value: 'villa' },
  { label: 'Commercial', value: 'commercial' },
];

const TRANSACTION_TYPES: { label: string; value: TransactionType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Rent', value: 'rent' },
  { label: 'Sale', value: 'sale' },
  { label: 'Lease', value: 'lease' },
];

export default function SearchScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [transactionType, setTransactionType] = useState<TransactionType | ''>('');
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [transactionMenuVisible, setTransactionMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

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
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, propertyType, transactionType]);

  const filters: PropertyFilters = {
    page,
    limit,
    search: searchQuery.trim() || undefined,
    propertyType: propertyType || undefined,
    transactionType: transactionType || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['properties', 'search', filters],
    queryFn: () => propertyApi.getAll(filters),
  });

  const properties = data?.properties ?? [];
  const pagination = data?.pagination;
  const hasMore = pagination ? page < pagination.totalPages : false;
  const stackNav = navigation.getParent();

  const handlePropertyPress = (propertyId: string) => {
    stackNav?.navigate('PropertyDetail', { propertyId });
  };

  const loadMore = () => {
    if (hasMore && !isFetching) setPage((p) => p + 1);
  };

  const typeLabel = PROPERTY_TYPES.find((t) => t.value === propertyType)?.label ?? 'All types';
  const transactionLabel =
    TRANSACTION_TYPES.find((t) => t.value === transactionType)?.label ?? 'All';

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by title or location..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <View style={styles.filterRow}>
        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setTypeMenuVisible(true)} style={styles.filterBtn}>
              {typeLabel}
            </Button>
          }
        >
          {PROPERTY_TYPES.map((t) => (
            <Menu.Item
              key={t.value || 'all'}
              onPress={() => {
                setPropertyType(t.value);
                setTypeMenuVisible(false);
                setPage(1);
              }}
              title={t.label}
            />
          ))}
        </Menu>
        <Menu
          visible={transactionMenuVisible}
          onDismiss={() => setTransactionMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setTransactionMenuVisible(true)}
              style={styles.filterBtn}
            >
              {transactionLabel}
            </Button>
          }
        >
          {TRANSACTION_TYPES.map((t) => (
            <Menu.Item
              key={t.value || 'all'}
              onPress={() => {
                setTransactionType(t.value);
                setTransactionMenuVisible(false);
                setPage(1);
              }}
              title={t.label}
            />
          ))}
        </Menu>
      </View>

      {isLoading ? (
        // Skeleton list while first page loads
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonLineLong} />
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text>Could not load properties. Try again.</Text>
        </View>
      ) : properties.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No properties match your search.
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchbar: { margin: 16, marginBottom: 8 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#6B7280' },
  footer: { padding: 16, alignItems: 'center' },
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
