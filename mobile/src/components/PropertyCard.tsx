import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Card, Text, useTheme, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { Property, PropertyStatus } from '../types/property.types';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  /** When true and user is logged in, show lister avatar + name below meta */
  showLister?: boolean;
  /** When true (e.g. My Listings), show status chip on card */
  showStatus?: boolean;
  /** When true (e.g. My Listings), show view count for listers */
  showViews?: boolean;
}

const STATUS_LABEL: Record<PropertyStatus, string> = {
  available: 'Available',
  pending: 'Pending',
  rented: 'Rented',
  sold: 'Sold',
};

export function PropertyCard({
  property,
  onPress,
  isFavorite,
  onFavoritePress,
  showLister = false,
  showStatus = false,
  showViews = false,
}: PropertyCardProps) {
  const { colors } = useTheme();
  const imageUrl = property.media?.[0]?.url;
  const locationStr = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(', ') || '—'
    : '—';

  const lister = property.lister;
  const listerName =
    lister?.profile?.companyName || lister?.profile?.name || lister?.email || null;
  const listerInitials = listerName
    ? listerName
        .split(/\s+/)
        .map((s) => s[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      elevation={2}
      theme={{ roundness: 12 }}
    >
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="home-outline" size={40} color={colors.placeholder} />
            </View>
          )}
          {onFavoritePress != null && (
            <TouchableOpacity
              style={styles.favButton}
              onPress={onFavoritePress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#EF4444' : '#fff'}
              />
            </TouchableOpacity>
          )}
          {property.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          {showStatus && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor(property.status) }]}>
              <Text style={styles.statusText}>{STATUS_LABEL[property.status]}</Text>
            </View>
          )}
        </View>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
            {property.title}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="titleLarge" style={styles.price}>
              {property.currency} {property.price.toLocaleString()}
            </Text>
            <Text variant="bodySmall" style={styles.transaction}>
              /{property.transactionType}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.placeholder} />
            <Text variant="bodySmall" numberOfLines={1} style={styles.location}>
              {locationStr}
            </Text>
          </View>
          {(property.bedrooms != null ||
            property.bathrooms != null ||
            (property.sizeSqm != null && property.sizeSqm > 0)) && (
            <View style={styles.metaRow}>
              {property.bedrooms != null && (
                <Text variant="bodySmall" style={styles.meta}>
                  {property.bedrooms} bed
                </Text>
              )}
              {property.bathrooms != null && (
                <Text variant="bodySmall" style={styles.meta}>
                  {property.bathrooms} bath
                </Text>
              )}
              {property.sizeSqm != null && property.sizeSqm > 0 && (
                <Text variant="bodySmall" style={styles.meta}>
                  {property.sizeSqm} m²
                </Text>
              )}
            </View>
          )}
          {showViews && (
            <View style={styles.viewsRow}>
              <Ionicons name="eye-outline" size={14} color={colors.placeholder} />
              <Text variant="bodySmall" style={styles.viewsText}>
                {property.viewsCount ?? 0} views
              </Text>
            </View>
          )}
          {showLister && lister && listerName && (
            <View style={styles.listerRow}>
              {lister.profile?.avatarUrl ? (
                <Image
                  source={{ uri: lister.profile.avatarUrl }}
                  style={styles.listerAvatar}
                />
              ) : (
                <Avatar.Text size={28} label={listerInitials} style={styles.listerAvatarWrap} />
              )}
              <Text variant="bodySmall" numberOfLines={1} style={styles.listerName}>
                {listerName}
              </Text>
            </View>
          )}
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
}

function statusColor(status: PropertyStatus): string {
  switch (status) {
    case 'available':
      return 'rgba(16, 185, 129, 0.9)';
    case 'pending':
      return 'rgba(245, 158, 11, 0.9)';
    case 'rented':
    case 'sold':
      return 'rgba(107, 114, 128, 0.9)';
    default:
      return 'rgba(107, 114, 128, 0.9)';
  }
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 12,
    ...(Platform.OS === 'android' ? { elevation: 2 } : {}),
  },
  imageWrap: {
    position: 'relative',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingTop: 14,
    paddingBottom: 14,
  },
  title: {
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  price: {
    color: '#2563EB',
    fontWeight: '700',
  },
  transaction: {
    marginLeft: 4,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  location: {
    flex: 1,
    color: '#6B7280',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    color: '#6B7280',
  },
  viewsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  viewsText: {
    color: '#6B7280',
  },
  listerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  listerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  listerAvatarWrap: {
    backgroundColor: '#9CA3AF',
  },
  listerName: {
    flex: 1,
    color: '#6B7280',
  },
});
