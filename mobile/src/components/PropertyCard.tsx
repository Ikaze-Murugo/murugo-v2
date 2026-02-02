import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { Property } from '../types/property.types';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export function PropertyCard({ property, onPress, isFavorite, onFavoritePress }: PropertyCardProps) {
  const { colors } = useTheme();
  const imageUrl = property.media?.[0]?.url;
  const locationStr = property.location
    ? [property.location.sector, property.location.district].filter(Boolean).join(', ') || '—'
    : '—';

  return (
    <Card style={styles.card} onPress={onPress}>
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="home-outline" size={40} color={colors.placeholder} />
            </View>
          )}
          {onFavoritePress && (
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
          {(property.bedrooms != null || property.bathrooms != null || property.sizeSqm != null) && (
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
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageWrap: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingTop: 12,
  },
  title: {
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
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
    marginBottom: 4,
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
});
