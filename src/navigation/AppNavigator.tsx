// src/navigation/AppNavigator.tsx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../hooks/useAuth';
import { profileExists } from '../services/userService';
import { colors } from '../config/theme';
import { RootStackParamList } from '../types';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // Check if logged-in user has completed profile setup
  useEffect(() => {
    if (!user) {
      setHasProfile(null);
      return;
    }
    profileExists(user.uid).then(exists => setHasProfile(exists));
  }, [user]);

  // Full-screen loader while Firebase checks auth state
  if (loading || (user && hasProfile === null)) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.greenDeep,
        }}>
        <ActivityIndicator size="large" color={colors.amber} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {!user ? (
          // ── Auth stack ──
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : !hasProfile ? (
          // ── Profile setup (first time only) ──
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          // ── Main app ──
          <>
            <Stack.Screen name="TaskList" component={TaskListScreen} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
