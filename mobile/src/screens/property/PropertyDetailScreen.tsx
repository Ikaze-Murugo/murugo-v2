import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Text, Title, Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../api/properties';
import { favoriteApi } from '../../api/favorites';
import { useAuthStore } from '../../store/slices/authSlice';

export default function PropertyDetailScreen({ route, navigation }: any) {
  const { propertyId } = route.params;
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyApi.getById(propertyId),
  });

  const { data: favoriteChecked } = useQuery({
    queryKey: ['favorite-check', propertyId],
    queryFn: () => favoriteApi.check(propertyId),
    enabled: isAuthenticated && !!propertyId,
  });

  useEffect(() => {
    if (favoriteChecked !== undefined) setIsFavorite(favoriteChecked);
  }, [favoriteChecked]);

  const addFavoriteMutation = useMutation({
    mutationFn: () => favoriteApi.add(propertyId),
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Could not add to favorites');
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: () => favoriteApi.remove(propertyId),
    onSuccess: () => {
      setIsFavorite(false);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const handleFavoritePress = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in', 'Sign in to save favorites.');
      return;
    }
    if (isFavorite) removeFavoriteMutation.mutate();
    else addFavoriteMutation.mutate();
  };

  const handleCall = () => {
    const phone = property?.lister?.phone || property?.lister?.whatsappNumber;
    if (!phone) {
      Alert.alert('No number', 'Contact number not available.');
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleWhatsApp = () => {
    const phone = property?.lister?.whatsappNumber || property?.lister?.phone;
    if (!phone) {
      Alert.alert('No number', 'WhatsApp number not available.');
      return;
    }
    const clean = phone.replace(/\D/g, '');
    const wa = clean.startsWith('250') ? clean : `250${clean}`;
    Linking.openURL(`https://wa.me/${wa}`);
  };

  if (isLoading || !property) {
    return (
      <View style={styles.centered}>
        {error ? (
          <Text>Failed to load property.</Text>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </View>
    );
  }

  const images = property.media?.map((m) => m.url) ?? [];
  const locationStr = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(', ') || '—'
    : '—';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        {isAuthenticated && (
          <TouchableOpacity onPress={handleFavoritePress} style={styles.favBtn}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#EF4444' : colors.onSurface}
            />
          </TouchableOpacity>
        )}
      </View>

      {images.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
        >
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.galleryPlaceholder, { backgroundColor: colors.surfaceDisabled }]}>
          <Ionicons name="home-outline" size={64} color={colors.placeholder} />
        </View>
      )}

      <View style={styles.body}>
        <Title style={styles.title}>{property.title}</Title>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={18} color={colors.placeholder} />
          <Text variant="bodyMedium" style={styles.location}>
            {locationStr}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text variant="headlineSmall" style={styles.price}>
            {property.currency} {property.price.toLocaleString()}
          </Text>
          <Text variant="bodyMedium" style={styles.transaction}>/{property.transactionType}</Text>
        </View>

        <View style={styles.metaGrid}>
          {property.bedrooms != null && (
            <View style={styles.metaItem}>
              <Ionicons name="bed-outline" size={20} color={colors.primary} />
              <Text>{property.bedrooms}</Text>
            </View>
          )}
          {property.bathrooms != null && (
            <View style={styles.metaItem}>
              <Ionicons name="water-outline" size={20} color={colors.primary} />
              <Text>{property.bathrooms}</Text>
            </View>
          )}
          {property.sizeSqm != null && property.sizeSqm > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="resize-outline" size={20} color={colors.primary} />
              <Text>{property.sizeSqm} m²</Text>
            </View>
          )}
        </View>

        {property.description ? (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {property.description}
            </Text>
          </>
        ) : null}

        {property.amenities && property.amenities.length > 0 && (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Amenities
            </Text>
            <View style={styles.amenities}>
              {property.amenities.map((a, i) => (
                <View key={i} style={styles.amenityChip}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <Text variant="bodySmall">{a}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text variant="titleSmall" style={styles.sectionTitle}>
          Contact
        </Text>
        <View style={styles.contactRow}>
          <Button
            mode="contained"
            onPress={handleCall}
            icon={() => <Ionicons name="call-outline" size={20} color="#fff" />}
            style={styles.contactBtn}
          >
            Call
          </Button>
          <Button
            mode="outlined"
            onPress={handleWhatsApp}
            icon={() => <Ionicons name="logo-whatsapp" size={20} color={colors.primary} />}
            style={styles.contactBtn}
          >
            WhatsApp
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backBtn: { padding: 8 },
  favBtn: { padding: 8 },
  gallery: { height: 260 },
  galleryImage: { width: Dimensions.get('window').width, height: 260 },
  galleryPlaceholder: { height: 260, justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16 },
  title: { marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  location: { color: '#6B7280' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 16 },
  price: { color: '#2563EB', fontWeight: '700' },
  transaction: { marginLeft: 4, color: '#6B7280' },
  metaGrid: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { marginBottom: 8, marginTop: 8 },
  description: { color: '#374151', lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  contactBtn: { flex: 1 },
});
