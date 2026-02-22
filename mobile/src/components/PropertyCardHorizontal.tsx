import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Property, PropertyStatus } from '../types';

interface PropertyCardHorizontalProps {
  property: Property;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

export function PropertyCardHorizontal({
  property,
  onPress,
  onFavoritePress,
  isFavorite = false,
}: PropertyCardHorizontalProps) {
  const { colors } = useTheme();

  const locationStr = [property.location?.sector, property.location?.district]
    .filter(Boolean)
    .join(', ') || 'Location TBD';

  const primaryImage = property.media?.[0]?.url;

  return (
    <Card style={styles.card} mode="elevated">
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.container}>
          {/* Image Section - Left Side */}
          <View style={styles.imageContainer}>
            {primaryImage ? (
              <Image source={{ uri: primaryImage }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="home-outline" size={32} color={colors.onSurfaceDisabled} />
              </View>
            )}

            {/* Favorite Button */}
            {onFavoritePress && (
              <TouchableOpacity
                onPress={onFavoritePress}
                style={styles.favButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorite ? '#EF4444' : '#fff'}
                />
              </TouchableOpacity>
            )}

            {/* Featured Badge */}
            {property.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color="#fff" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>

          {/* Details Section - Right Side */}
          <View style={styles.detailsContainer}>
            {/* Title */}
            <Text variant="titleSmall" numberOfLines={1} style={styles.title}>
              {property.title}
            </Text>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              {property.isFeatured && (
                <View style={[styles.badge, styles.featuredBadgeSmall]}>
                  <Text style={styles.badgeText}>Featured</Text>
                </View>
              )}
              <View
                style={[
                  styles.badge,
                  property.transactionType === 'rent' ? styles.rentBadge : styles.saleBadge,
                ]}
              >
                <Text style={styles.badgeText}>
                  For {property.transactionType === 'rent' ? 'Rent' : 'Sale'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusBgColor(property.status) }]}>
                <Text style={styles.badgeText}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={colors.onSurfaceVariant} />
              <Text variant="bodySmall" numberOfLines={1} style={styles.locationText}>
                {locationStr}
              </Text>
            </View>

            {/* Property Features */}
            <View style={styles.featuresRow}>
              {property.bedrooms != null && property.bedrooms > 0 && (
                <View style={styles.feature}>
                  <Ionicons name="bed-outline" size={14} color={colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.featureText}>
                    {property.bedrooms}
                  </Text>
                </View>
              )}
              {property.bathrooms != null && property.bathrooms > 0 && (
                <View style={styles.feature}>
                  <Ionicons name="water-outline" size={14} color={colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.featureText}>
                    {property.bathrooms}
                  </Text>
                </View>
              )}
              {property.sizeSqm != null && property.sizeSqm > 0 && (
                <View style={styles.feature}>
                  <Ionicons name="resize-outline" size={14} color={colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={styles.featureText}>
                    {property.sizeSqm} m²
                  </Text>
                </View>
              )}
            </View>

            {/* Property Type */}
            <Text variant="bodySmall" style={styles.propertyType}>
              {property.propertyType.replace(/_/g, ' ')}
            </Text>

            {/* Price - Bottom Right */}
            <View style={styles.priceContainer}>
              <Text variant="labelSmall" style={styles.priceLabel}>
                Price
              </Text>
              <View style={styles.priceRow}>
                <Text variant="titleMedium" style={styles.price}>
                  {property.currency} {property.price.toLocaleString()}
                </Text>
                {property.transactionType === 'rent' && (
                  <Text variant="bodySmall" style={styles.priceFrequency}>
                    /mo
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

function statusBgColor(status: PropertyStatus): string {
  switch (status) {
    case 'available':
      return '#10B981';
    case 'pending':
      return '#F59E0B';
    case 'rented':
    case 'sold':
      return '#6B7280';
    default:
      return '#6B7280';
  }
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...(Platform.OS === 'android' ? { elevation: 3 } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
  },
  container: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: '40%',
    height: 160,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featuredText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#111827',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredBadgeSmall: {
    backgroundColor: '#F59E0B',
  },
  rentBadge: {
    backgroundColor: '#3B82F6',
  },
  saleBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  locationText: {
    flex: 1,
    color: '#6B7280',
    fontSize: 10,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featureText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '500',
  },
  propertyType: {
    color: '#9CA3AF',
    fontSize: 9,
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    right: 12,
  },
  priceLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    marginBottom: 2,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
  },
  price: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 16,
  },
  priceFrequency: {
    color: '#6B7280',
    fontSize: 11,
    marginLeft: 2,
  },
});
