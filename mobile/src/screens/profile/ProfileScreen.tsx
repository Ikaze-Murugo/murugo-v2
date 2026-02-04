import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Avatar, List, Button, Text } from 'react-native-paper';
import { useAuthStore } from '../../store/slices/authSlice';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const stackNav = navigation.getParent();
  const isGuest = !user;
  const isListerOrAdmin = user?.role === 'lister' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  const displayName = user?.profile?.name || user?.email || 'User';

  if (isGuest) {
    return (
      <ScrollView contentContainerStyle={styles.guestContainer}>
        <Avatar.Icon size={80} icon="account-outline" style={styles.guestAvatar} />
        <Title style={styles.guestTitle}>Welcome</Title>
        <Text style={styles.guestSubtitle}>
          Sign in to save favorites, contact listers, and list your own properties.
        </Text>
        <Button
          mode="contained"
          onPress={() => stackNav?.navigate('Login')}
          style={styles.guestButton}
        >
          Sign in
        </Button>
        <Button
          mode="outlined"
          onPress={() => stackNav?.navigate('Signup')}
          style={styles.guestButton}
        >
          Create account
        </Button>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Avatar.Icon size={80} icon="account" style={styles.avatar} />
      <Title>{displayName}</Title>
      <List.Section>
        <List.Item title="Edit Profile" left={() => <List.Icon icon="account-edit" />} />
        {(isListerOrAdmin) && (
          <List.Item
            title="My Listings"
            left={() => <List.Icon icon="home" />}
            onPress={() => stackNav?.navigate('MyListings')}
          />
        )}
        {isAdmin && (
          <List.Item
            title="Admin"
            description="Platform stats and users"
            left={() => <List.Icon icon="shield-account" />}
            onPress={() => stackNav?.navigate('AdminDashboard')}
          />
        )}
        <List.Item
          title="Favorites"
          left={() => <List.Icon icon="heart" />}
          onPress={() => stackNav?.navigate('Favorites')}
        />
        <List.Item title="Settings" left={() => <List.Icon icon="cog" />} />
        <List.Item
          title="Log out"
          left={() => <List.Icon icon="logout" />}
          onPress={() => logout()}
          titleStyle={styles.logoutTitle}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  avatar: { alignSelf: 'center', marginVertical: 16 },
  logoutTitle: { color: '#EF4444' },
  guestContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  guestAvatar: { alignSelf: 'center', marginBottom: 16 },
  guestTitle: { marginBottom: 8, textAlign: 'center' },
  guestSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#6B7280',
    paddingHorizontal: 16,
  },
  guestButton: { marginTop: 12, width: '100%', maxWidth: 280 },
});
