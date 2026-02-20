import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  Share,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, useTheme, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../api/properties';
import { favoriteApi } from '../../api/favorites';
import { useAuthStore } from '../../store/slices/authSlice';
import { WEB_APP_URL } from '../../config/env';

const GALLERY_HEIGHT = 280;
const DESCRIPTION_TRUNCATE_LENGTH = 120;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PROFILE_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  commissioner: 'Commissioner',
  company: 'Company',
};

export default function PropertyDetailScreen({ route, navigation }: any) {
  const { propertyId } = route.params;
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);

  const [isFavorite, setIsFavorite] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState<number | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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

  // Record view when property is loaded (backend counts once per user, skips owner)
  React.useEffect(() => {
    if (!property?.id || !isAuthenticated) return;
    if (userId && property.listerId === userId) return;
    propertyApi.recordView(property.id).catch(() => {});
  }, [property?.id, isAuthenticated, userId, property?.listerId]);

  const addFavoriteMutation = useMutation({
    mutationFn: () => favoriteApi.add(propertyId),
    onSuccess: () => {
      setIsFavorite(true);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-check', propertyId] });
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
      queryClient.invalidateQueries({ queryKey: ['favorite-check', propertyId] });
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

  const handleSend = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in', 'Sign in to contact the property owner.');
      return;
    }
    const phone = property?.lister?.whatsappNumber || property?.lister?.phone;
    if (!phone) {
      Alert.alert('No number', 'WhatsApp number not available.');
      return;
    }
    const clean = String(phone).replace(/\D/g, '');
    const wa = clean.startsWith('250') ? clean : `250${clean}`;
    const message = encodeURIComponent(
      `Hi, I'm interested in your property: ${property?.title}\n` +
      `Location: ${property?.location?.sector}, ${property?.location?.district}\n` +
      `Price: ${property?.currency} ${property?.price?.toLocaleString()}\n` +
      `Property ID: ${property?.id}`
    );
    Linking.openURL(`https://wa.me/${wa}?text=${message}`);
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
    // Skeleton layout while detail loads
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.skeletonContent}>
        <View style={styles.skeletonHero} />
        <View style={styles.skeletonBody}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '70%' }]} />
        </View>
      </ScrollView>
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

  const insets = useSafeAreaInsets();
  const profileTypeLabel = lister?.profileType ? PROFILE_TYPE_LABELS[lister.profileType] ?? lister.profileType : null;
  const description = property.description || '';
  const needsTruncate = description.length > DESCRIPTION_TRUNCATE_LENGTH;
  const showDescription = descriptionExpanded || !needsTruncate ? description : description.slice(0, DESCRIPTION_TRUNCATE_LENGTH) + '...';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: 80 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {/* Back button - overlay on top */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { top: insets.top + 8 }]}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>

        {/* 1. Profile header – lister avatar, name, title */}
        {lister && (
          <View style={styles.profileHeader}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Linking.openURL(`${WEB_APP_URL}/listers/${property.listerId}`)}
              style={styles.profileHeaderInner}
            >
              {lister.profile?.avatarUrl ? (
                <Image source={{ uri: lister.profile.avatarUrl }} style={styles.profileAvatar} />
              ) : (
                <Avatar.Text size={44} label={listerInitials} style={styles.profileAvatarPlaceholder} />
              )}
              <View style={styles.profileText}>
                <Text variant="titleMedium" numberOfLines={1} style={styles.profileName}>
                  {listerName}
                </Text>
                {profileTypeLabel && (
                  <Text variant="bodySmall" style={styles.profileType}>
                    {profileTypeLabel}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Image carousel */}
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

        {/* 3. Expandable description */}
        {description ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDescriptionExpanded((e) => !e)}
            style={styles.descriptionBlock}
          >
            <Text variant="bodyMedium" style={styles.description}>
              {showDescription}
            </Text>
            {needsTruncate && (
              <Text variant="bodySmall" style={styles.moreLess}>
                {descriptionExpanded ? 'Show less' : 'more...'}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}

        {/* 4. Details – price, location, meta, amenities, etc. */}
        <View style={styles.body}>
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
          <View style={styles.listerCard}>
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
            <Button
              mode="text"
              compact
              onPress={() => Linking.openURL(`${WEB_APP_URL}/listers/${property.listerId}`)}
              icon={() => <Ionicons name="open-outline" size={18} color={colors.primary} />}
              style={styles.viewListerBtn}
            >
              View full profile & more listings
            </Button>
          </View>
        )}
      </View>

      {/* 5. Bottom action bar – Like, Share, Send */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          onPress={handleFavoritePress}
          disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
          style={styles.bottomBarItem}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={26}
            color={isFavorite ? '#EF4444' : colors.onSurface}
          />
          <Text variant="bodySmall" style={styles.bottomBarLabel}>
            {isFavorite ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.bottomBarItem}>
          <Ionicons name="share-outline" size={26} color={colors.onSurface} />
          <Text variant="bodySmall" style={styles.bottomBarLabel}>
            Share
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSend} style={styles.bottomBarItem}>
          <Ionicons name="send-outline" size={26} color={colors.primary} />
          <Text variant="bodySmall" style={[styles.bottomBarLabel, { color: colors.primary }]}>
            Send
          </Text>
        </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { paddingTop: 8 },
  backBtn: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 52,
  },
  profileHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileAvatar: { width: 44, height: 44, borderRadius: 22 },
  profileAvatarPlaceholder: { backgroundColor: '#9CA3AF' },
  profileText: { flex: 1, minWidth: 0 },
  profileName: { fontWeight: '600' },
  profileType: { color: '#6B7280', marginTop: 2 },
  descriptionBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
  },
  moreLess: { color: '#2563EB', marginTop: 4, fontWeight: '500' },
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
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  contactRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  contactBtn: { flex: 1 },
  viewListerBtn: { alignSelf: 'flex-start' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  bottomBarLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
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
  skeletonContent: { paddingBottom: 32 },
  skeletonHero: {
    height: GALLERY_HEIGHT,
    backgroundColor: '#E5E7EB',
  },
  skeletonBody: { padding: 16 },
  skeletonTitle: {
    height: 20,
    width: '60%',
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  skeletonPrice: {
    height: 18,
    width: '40%',
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  skeletonLine: {
    height: 12,
    width: '90%',
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
});
