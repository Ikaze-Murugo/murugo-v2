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
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi, CreatePropertyPayload } from '../../api/properties';
import type { PropertyType, TransactionType } from '../../types/property.types';

const STEPS = [
  { id: 1, title: 'Basic info', short: 'Basic', desc: 'Title, type, price' },
  { id: 2, title: 'Location', short: 'Location', desc: 'District, sector, address' },
  { id: 3, title: 'Details & amenities', short: 'Details', desc: 'Beds, baths, amenities' },
];

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

const AMENITY_OPTIONS: { id: string; label: string }[] = [
  { id: 'parking_1', label: 'Parking' },
  { id: 'security_24_7', label: 'Security' },
  { id: 'garden', label: 'Garden' },
  { id: 'wifi_ready', label: 'WiFi' },
  { id: '24_7_water', label: '24/7 Water' },
  { id: 'electricity', label: 'Electricity' },
  { id: 'generator', label: 'Generator' },
  { id: 'backup_water_tank', label: 'Backup Water' },
  { id: 'fully_furnished', label: 'Furnished' },
  { id: 'gated', label: 'Gated' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'air_conditioning', label: 'A/C' },
  { id: 'cctv', label: 'CCTV' },
  { id: 'modern_kitchen', label: 'Modern Kitchen' },
  { id: 'elevator', label: 'Elevator' },
  { id: 'pet_friendly', label: 'Pet Friendly' },
];

export default function CreatePropertyScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

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

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canProceedFromStep = () => {
    if (step === 1) {
      const p = parseFloat(price);
      return (
        title.trim().length >= 5 &&
        description.trim().length >= 20 &&
        !isNaN(p) &&
        p > 0
      );
    }
    if (step === 2) {
      return district.trim().length >= 2 && sector.trim().length >= 2 && address.trim().length >= 5;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !canProceedFromStep()) {
      Alert.alert(
        'Required fields',
        'Please enter a title (min 5 characters), description (min 20 characters), and a valid price.'
      );
      return;
    }
    if (step === 2 && !canProceedFromStep()) {
      Alert.alert(
        'Required fields',
        'Please enter district, sector, and address (min 5 characters).'
      );
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleSubmit = () => {
    const priceNum = parseFloat(price);
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }
    if (title.trim().length < 5) {
      Alert.alert('Title', 'Title must be at least 5 characters.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      Alert.alert('Required', 'Please enter a description (at least 20 characters).');
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
    if (address.trim().length < 5) {
      Alert.alert('Address', 'Address must be at least 5 characters.');
      return;
    }

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
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
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
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Title style={styles.title}>Add property</Title>
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, index) => (
          <React.Fragment key={s.id}>
            <View
              style={[styles.stepDot, step === s.id && styles.stepDotActive]}
            >
              <Text style={[styles.stepNum, step === s.id && styles.stepNumActive]}>
                {s.id}
              </Text>
            </View>
            {index < STEPS.length - 1 ? <View style={styles.stepLine} /> : null}
          </React.Fragment>
        ))}
      </View>
      <Text variant="bodySmall" style={styles.stepLabel}>
        Step {step} of 3 · {STEPS.find((s) => s.id === step)?.desc}
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <>
            <TextInput
              label="Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              placeholder="e.g. 2-bedroom apartment in Kicukiro"
              style={styles.input}
            />
            <TextInput
              label="Description *"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Describe the property (min 20 characters)"
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
              placeholder="e.g. 250000"
              style={styles.input}
            />
          </>
        )}

        {step === 2 && (
          <>
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
              placeholder="Street and number or landmark"
              style={styles.input}
            />
          </>
        )}

        {step === 3 && (
          <>
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
            <Text variant="titleSmall" style={[styles.sectionLabel, { marginTop: 8 }]}>
              Amenities (tap to select)
            </Text>
            <View style={styles.chipsRow}>
              {AMENITY_OPTIONS.map((a) => (
                <Chip
                  key={a.id}
                  selected={selectedAmenities.includes(a.id)}
                  onPress={() => toggleAmenity(a.id)}
                  style={[
                    styles.amenityChip,
                    selectedAmenities.includes(a.id) && styles.amenityChipSelected,
                  ]}
                  selectedColor="#fff"
                >
                  {a.label}
                </Chip>
              ))}
            </View>
          </>
        )}

        <View style={styles.footerBtns}>
          {step < 3 ? (
            <Button mode="contained" onPress={handleNext} style={styles.nextBtn}>
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={createMutation.isPending}
              disabled={createMutation.isPending}
              style={styles.nextBtn}
            >
              Create listing
            </Button>
          )}
        </View>
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#949DDB' },
  stepNum: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  stepNumActive: { color: '#fff' },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLabel: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 8,
  },
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
    borderRadius: 8,
  },
  sectionLabel: { marginTop: 16, marginBottom: 8, color: '#374151' },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amenityChip: { marginBottom: 0 },
  amenityChipSelected: { backgroundColor: '#949DDB' },
  footerBtns: { marginTop: 24 },
  nextBtn: { paddingVertical: 8 },
});
