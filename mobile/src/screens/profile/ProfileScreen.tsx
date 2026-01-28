import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Title, Avatar, List } from 'react-native-paper';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Avatar.Icon size={80} icon="account" style={styles.avatar} />
      <Title>User Profile</Title>
      <List.Section>
        <List.Item title="Edit Profile" left={() => <List.Icon icon="account-edit" />} />
        <List.Item title="My Listings" left={() => <List.Icon icon="home" />} />
        <List.Item title="Favorites" left={() => <List.Icon icon="heart" />} />
        <List.Item title="Settings" left={() => <List.Icon icon="cog" />} />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  avatar: { alignSelf: 'center', marginVertical: 16 },
});
