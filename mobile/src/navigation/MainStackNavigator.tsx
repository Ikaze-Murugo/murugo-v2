import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainNavigator from './MainNavigator';
import PropertyDetailScreen from '../screens/property/PropertyDetailScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import MyListingsScreen from '../screens/listings/MyListingsScreen';
import CreatePropertyScreen from '../screens/listings/CreatePropertyScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminPendingScreen from '../screens/admin/AdminPendingScreen';

export type MainStackParamList = {
  MainTabs: undefined;
  PropertyDetail: { propertyId: string };
  Favorites: undefined;
  Login: undefined;
  Signup: undefined;
  MyListings: undefined;
  CreateProperty: undefined;
  AdminDashboard: undefined;
  AdminUsers: undefined;
   AdminPending: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainNavigator} />
      <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} />
      <Stack.Screen name="CreateProperty" component={CreatePropertyScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminPending" component={AdminPendingScreen} />
    </Stack.Navigator>
  );
}
