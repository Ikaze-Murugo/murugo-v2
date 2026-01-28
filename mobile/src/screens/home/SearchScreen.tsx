import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search properties..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <Text>Search results will appear here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchbar: { marginBottom: 16 },
});
