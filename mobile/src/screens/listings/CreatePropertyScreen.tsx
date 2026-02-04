import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Title,
  Button,
  TextInput,
  ActivityIndicator,
  Menu,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi, CreatePropertyPayload } from '../../api/properties';
import type { PropertyType, TransactionType } from '../../types/property.types';

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: 'House', value: 'house' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Office', value: 'office' },
  { label: 'Land', value: 'land' },
  { label: 'Studio', value: 'studio' },
  { label: 'Villa', value: 'villa' },
  { label: 'Commercial', value: 'commercial' },
];

const TRANSACTION_TYPES: { label: string; value: TransactionType }[] = [
  { label: 'Rent', value: 'rent' },
  { label: 'Sale', value: 'sale' },
  { label: 'Lease', value: 'lease' },
];

export default function CreatePropertyScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [transactionMenuVisible, setTransactionMenuVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [transactionType, setTransactionType] = useState<TransactionType>('sale');
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [sizeSqm, setSizeSqm] = useState('');
  const [amenitiesStr, setAmenitiesStr] = useState('');

  const createMutation = useMutation({
    mutationFn: (payload: CreatePropertyPayload) => propertyApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties', 'my-listings'] });
      navigation.getParent()?.navigate('MyListings');
    },
    onError: (err: any) => {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Could not create listing. Please try again.'
      );
    },
  });

  const handleSubmit = () => {
    const priceNum = parseFloat(price);
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please enter a description.');
      return;
    }
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Required', 'Please enter a valid price.');
      return;
    }
    if (!district.trim() || !sector.trim() || !address.trim()) {
      Alert.alert('Required', 'Please enter district, sector, and address.');
      return;
    }

    const amenities = amenitiesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CreatePropertyPayload = {
      title: title.trim(),
      description: description.trim(),
      propertyType,
      transactionType,
      price: priceNum,
      currency: 'RWF',
      location: {
        district: district.trim(),
        sector: sector.trim(),
        cell: cell.trim(),
        address: address.trim(),
        latitude: 0,
        longitude: 0,
      },
      amenities: amenities.length > 0 ? amenities : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
      sizeSqm: sizeSqm ? parseFloat(sizeSqm) : undefined,
    };

    createMutation.mutate(payload);
  };

  const typeLabel = PROPERTY_TYPES.find((t) => t.value === propertyType)?.label ?? 'House';
  const transactionLabel =
    TRANSACTION_TYPES.find((t) => t.value === transactionType)?.label ?? 'Sale';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Title style={styles.title}>Add property</Title>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Menu
          visible={typeMenuVisible}
          onDismiss={() => setTypeMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.pickerTouch}
              onPress={() => setTypeMenuVisible(true)}
            >
              <Text variant="bodyLarge">Property type: {typeLabel}</Text>
              <Ionicons name="chevron-down" size={20} />
            </TouchableOpacity>
          }
        >
          {PROPERTY_TYPES.map((t) => (
            <Menu.Item
              key={t.value}
              onPress={() => {
                setPropertyType(t.value);
                setTypeMenuVisible(false);
              }}
              title={t.label}
            />
          ))}
        </Menu>

        <Menu
          visible={transactionMenuVisible}
          onDismiss={() => setTransactionMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.pickerTouch}
              onPress={() => setTransactionMenuVisible(true)}
            >
              <Text variant="bodyLarge">Transaction: {transactionLabel}</Text>
              <Ionicons name="chevron-down" size={20} />
            </TouchableOpacity>
          }
        >
          {TRANSACTION_TYPES.map((t) => (
            <Menu.Item
              key={t.value}
              onPress={() => {
                setTransactionType(t.value);
                setTransactionMenuVisible(false);
              }}
              title={t.label}
            />
          ))}
        </Menu>

        <TextInput
          label="Price (RWF) *"
          value={price}
          onChangeText={setPrice}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Location *
        </Text>
        <TextInput
          label="District"
          value={district}
          onChangeText={setDistrict}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Sector"
          value={sector}
          onChangeText={setSector}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Cell (optional)"
          value={cell}
          onChangeText={setCell}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Details (optional)
        </Text>
        <TextInput
          label="Bedrooms"
          value={bedrooms}
          onChangeText={setBedrooms}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="Bathrooms"
          value={bathrooms}
          onChangeText={setBathrooms}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="Size (m²)"
          value={sizeSqm}
          onChangeText={setSizeSqm}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          label="Amenities (comma-separated)"
          value={amenitiesStr}
          onChangeText={setAmenitiesStr}
          mode="outlined"
          placeholder="e.g. Parking, Security, Garden"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createMutation.isPending}
          disabled={createMutation.isPending}
          style={styles.submitBtn}
        >
          Create listing
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 8 },
  title: { flex: 1, marginLeft: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  pickerTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  sectionLabel: { marginTop: 16, marginBottom: 8 },
  submitBtn: { marginTop: 24, paddingVertical: 8 },
});
