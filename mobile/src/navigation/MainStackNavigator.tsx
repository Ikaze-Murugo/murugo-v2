import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigator from './MainNavigator';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';

export type MainStackParamList = {
  MainTabs: undefined;
  PropertyDetail: { propertyId: string };
  Favorites: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
    </Stack.Navigator>
  );
}
