import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Avatar, List } from 'react-native-paper';
import { useAuthStore } from '../../store/slices/authSlice';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const displayName = user?.profile?.name || user?.email || 'User';
  const stackNav = navigation.getParent();

  return (
    <View style={styles.container}>
      <Avatar.Icon size={80} icon="account" style={styles.avatar} />
      <Title>{displayName}</Title>
      <List.Section>
        <List.Item title="Edit Profile" left={() => <List.Icon icon="account-edit" />} />
        <List.Item title="My Listings" left={() => <List.Icon icon="home" />} />
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
});
