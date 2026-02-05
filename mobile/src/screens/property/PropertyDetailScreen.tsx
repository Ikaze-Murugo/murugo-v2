import React, { useState } from 'react';
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
  Share,
  Modal,
  FlatList,
} from 'react-native';
import { Text, Title, Button, useTheme, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../api/properties';
import { favoriteApi } from '../../api/favorites';
import { useAuthStore } from '../../store/slices/authSlice';

const GALLERY_HEIGHT = 280;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PropertyDetailScreen({ route, navigation }: any) {
  const { propertyId } = route.params;
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);

  const [isFavorite, setIsFavorite] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<number | null>(null);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyApi.getById(propertyId),
  });

  const { data: favoriteChecked } = useQuery({
    queryKey: ['favorite-check', propertyId],
    queryFn: () => favoriteApi.check(propertyId),
    enabled: isAuthenticated && !!propertyId,
  });

  React.useEffect(() => {
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
    Linking.openURL(`tel:${String(phone).replace(/\s/g, '')}`);
  };

  const handleWhatsApp = () => {
    const phone = property?.lister?.whatsappNumber || property?.lister?.phone;
    if (!phone) {
      Alert.alert('No number', 'WhatsApp number not available.');
      return;
    }
    const clean = String(phone).replace(/\D/g, '');
    const wa = clean.startsWith('250') ? clean : `250${clean}`;
    Linking.openURL(`https://wa.me/${wa}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: property?.title ?? 'Property',
        message: `${property?.title ?? 'Property'} - ${property?.currency} ${property?.price?.toLocaleString() ?? ''} / ${property?.transactionType ?? ''}. View on Murugo Homes.`,
        url: undefined,
      });
    } catch (_) {}
  };

  const handleOpenMap = () => {
    const lat = property?.location?.latitude;
    const lon = property?.location?.longitude;
    if (lat == null || lon == null) {
      Alert.alert('No location', 'Map location is not available for this property.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    Linking.openURL(url);
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

  // Backend currently stores only image media for properties, and uses a "mediaType" field.
  // To avoid mismatches between "type" and "mediaType", treat all media entries as images here
  // and just sort by their "order".
  const imageMedia = (property.media ?? []).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const imageUrls = imageMedia.map((m) => m.url);
  const hasMultipleImages = imageUrls.length > 1;
  const locationStr = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(', ') || '—'
    : '—';
  const hasMapLocation =
    property.location &&
    property.location.latitude != null &&
    property.location.longitude != null;

  const isLister = !!userId && property.listerId === userId;
  const lister = property.lister;
  const listerName =
    lister?.profile?.companyName || lister?.profile?.name || lister?.email || 'Lister';
  const listerInitials = listerName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const onGalleryScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    setGalleryIndex(Math.min(index, imageUrls.length - 1));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
            <Ionicons name="share-outline" size={24} color="#fff" />
          </TouchableOpacity>
          {isAuthenticated && (
            <TouchableOpacity onPress={handleFavoritePress} style={styles.iconBtn}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#EF4444' : '#fff'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {imageUrls.length > 0 ? (
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
            onMomentumScrollEnd={onGalleryScroll}
          >
            {imageUrls.map((uri, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={1}
                onPress={() => setFullScreenImageIndex(i)}
              >
                <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
          {hasMultipleImages && (
            <View style={styles.galleryIndicator}>
              <Text style={styles.galleryIndicatorText}>
                {galleryIndex + 1} / {imageUrls.length}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.galleryPlaceholder, { backgroundColor: colors.surfaceDisabled }]}>
          <Ionicons name="home-outline" size={64} color={colors.placeholder} />
        </View>
      )}

      <View style={styles.body}>
        <Title style={styles.title}>{property.title}</Title>
        <View style={styles.priceRow}>
          <Text variant="headlineSmall" style={styles.price}>
            {property.currency} {property.price.toLocaleString()}
          </Text>
          <Text variant="bodyMedium" style={styles.transaction}>
            /{property.transactionType}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={18} color={colors.placeholder} />
          <Text variant="bodyMedium" style={styles.location}>
            {locationStr}
          </Text>
          {hasMapLocation && (
            <TouchableOpacity onPress={handleOpenMap} style={styles.mapLink}>
              <Text variant="bodySmall" style={styles.mapLinkText}>
                View on map
              </Text>
              <Ionicons name="open-outline" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaGrid}>
          {property.bedrooms != null && (
            <View style={styles.metaItem}>
              <Ionicons name="bed-outline" size={20} color={colors.primary} />
              <Text variant="bodyMedium">{property.bedrooms} bed</Text>
            </View>
          )}
          {property.bathrooms != null && (
            <View style={styles.metaItem}>
              <Ionicons name="water-outline" size={20} color={colors.primary} />
              <Text variant="bodyMedium">{property.bathrooms} bath</Text>
            </View>
          )}
          {property.sizeSqm != null && property.sizeSqm > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="resize-outline" size={20} color={colors.primary} />
              <Text variant="bodyMedium">{property.sizeSqm} m²</Text>
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

        {isLister && (
          <View style={styles.statsCard}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Your listing stats
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={24} color={colors.primary} />
                <Text variant="titleMedium">{property.viewsCount ?? 0}</Text>
                <Text variant="bodySmall">Views</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="call-outline" size={24} color={colors.primary} />
                <Text variant="titleMedium">{property.contactCount ?? 0}</Text>
                <Text variant="bodySmall">Contacts</Text>
              </View>
            </View>
          </View>
        )}

        {lister && (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Listed by
            </Text>
            <View style={styles.listerCard}>
              {lister.profile?.avatarUrl ? (
                <Image
                  source={{ uri: lister.profile.avatarUrl }}
                  style={styles.listerAvatar}
                />
              ) : (
                <Avatar.Text size={48} label={listerInitials} style={styles.listerAvatarWrap} />
              )}
              <View style={styles.listerInfo}>
                <Text variant="titleSmall" numberOfLines={1}>
                  {listerName}
                </Text>
                <View style={styles.contactRow}>
                  <Button
                    mode="contained"
                    compact
                    onPress={handleCall}
                    icon={() => <Ionicons name="call-outline" size={18} color="#fff" />}
                    style={styles.contactBtn}
                  >
                    Call
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    onPress={handleWhatsApp}
                    icon={() => <Ionicons name="logo-whatsapp" size={18} color={colors.primary} />}
                    style={styles.contactBtn}
                  >
                    WhatsApp
                  </Button>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      <Modal
        visible={fullScreenImageIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImageIndex(null)}
      >
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.fullScreenClose}
            onPress={() => setFullScreenImageIndex(null)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {fullScreenImageIndex !== null && imageUrls.length > 0 && (
            <FlatList
              data={imageUrls}
              horizontal
              pagingEnabled
              initialScrollIndex={fullScreenImageIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={styles.fullScreenImageWrap}>
                  <Image source={{ uri: item }} style={styles.fullScreenImage} resizeMode="contain" />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
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
    alignItems: 'center',
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 8 },
  galleryWrap: { position: 'relative' },
  gallery: { height: GALLERY_HEIGHT },
  galleryImage: { width: SCREEN_WIDTH, height: GALLERY_HEIGHT },
  galleryPlaceholder: {
    height: GALLERY_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  galleryIndicatorText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  body: { padding: 16 },
  title: { marginBottom: 8 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  location: { color: '#6B7280', flex: 1 },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapLinkText: { color: '#2563EB' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  price: { color: '#2563EB', fontWeight: '700' },
  transaction: { marginLeft: 4, color: '#6B7280' },
  metaGrid: { flexDirection: 'row', gap: 24, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { marginBottom: 8, marginTop: 16 },
  description: { color: '#374151', lineHeight: 22 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statsCard: {
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    marginBottom: 8,
  },
  statsRow: { flexDirection: 'row', gap: 32, marginTop: 8 },
  statItem: { alignItems: 'center', gap: 4 },
  listerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  listerAvatar: { width: 48, height: 48, borderRadius: 24 },
  listerAvatarWrap: { backgroundColor: '#9CA3AF' },
  listerInfo: { flex: 1 },
  contactRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  contactBtn: { flex: 1 },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImageWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
