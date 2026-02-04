import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Title,
  ActivityIndicator,
  Button,
  Searchbar,
  Chip,
  Avatar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';

const ROLES: { label: string; value?: 'seeker' | 'lister' | 'admin' }[] = [
  { label: 'All', value: undefined },
  { label: 'Seekers', value: 'seeker' },
  { label: 'Listers', value: 'lister' },
  { label: 'Admins', value: 'admin' },
];

export default function AdminUsersScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'seeker' | 'lister' | 'admin' | undefined>(undefined);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'users', { search, role }],
    queryFn: () =>
      adminApi.getUsers({
        search: search.trim() || undefined,
        role,
        page: 1,
        limit: 50,
      }),
  });

  const users = data?.users ?? [];

  const handleBack = () => {
    navigation.goBack();
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
        <Text>Could not load users.</Text>
        <Button mode="outlined" onPress={() => refetch()} style={styles.retryBtn}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button mode="text" onPress={handleBack} icon="arrow-left">
          Back
        </Button>
        <Title style={styles.title}>Users</Title>
      </View>

      <Searchbar
        placeholder="Search by email, phone, name, company..."
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={refetch}
        style={styles.searchbar}
      />

      <View style={styles.rolesRow}>
        {ROLES.map((r) => (
          <Chip
            key={r.label}
            selected={role === r.value}
            onPress={() => setRole(r.value)}
            style={styles.roleChip}
          >
            {r.label}
          </Chip>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No users found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const name =
            item.profile?.name || item.profile?.companyName || item.email || item.phone;
          const initials = name
            .split(/\s+/)
            .map((s) => s[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <View style={styles.userRow}>
              {item.profile?.name || item.profile?.companyName ? (
                <Avatar.Text size={40} label={initials} style={styles.avatar} />
              ) : (
                <Avatar.Icon size={40} icon="account" style={styles.avatar} />
              )}
              <View style={styles.userInfo}>
                <Text variant="titleSmall" numberOfLines={1}>
                  {name}
                </Text>
                <Text variant="bodySmall" style={styles.userSub}>
                  {item.email} · {item.phone}
                </Text>
                <View style={styles.tagsRow}>
                  <View style={styles.tagPill}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#2563EB" />
                    <Text variant="bodySmall" style={styles.tagText}>
                      {item.role}
                    </Text>
                  </View>
                  {item.profileType && (
                    <View style={styles.tagPillMuted}>
                      <Text variant="bodySmall" style={styles.tagTextMuted}>
                        {item.profileType}
                      </Text>
                    </View>
                  )}
                  {item.propertiesCount != null && (
                    <View style={styles.tagPillMuted}>
                      <Text variant="bodySmall" style={styles.tagTextMuted}>
                        {item.propertiesCount} listings
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={isFetching ? <ActivityIndicator style={{ marginVertical: 12 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 8,
  },
  title: { marginLeft: 8 },
  searchbar: { marginHorizontal: 16, marginBottom: 8 },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  roleChip: {},
  listContent: { padding: 16, paddingBottom: 32 },
  empty: { padding: 24, alignItems: 'center' },
  userRow: { flexDirection: 'row', marginBottom: 16 },
  avatar: { marginRight: 12 },
  userInfo: { flex: 1 },
  userSub: { color: '#6B7280', marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
  },
  tagPillMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  tagText: { color: '#1D4ED8' },
  tagTextMuted: { color: '#4B5563' },
  retryBtn: { marginTop: 16 },
});

