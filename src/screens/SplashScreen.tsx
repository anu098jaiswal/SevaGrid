// src/screens/SplashScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../config/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const loaderWidth = new Animated.Value(0);

  useEffect(() => {
    // Fade + scale in logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Loader bar animation
    Animated.timing(loaderWidth, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    // Navigate to Login after 2.2s
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2200);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>

        <Text style={styles.title}>Community{'\n'}Workers</Text>
        <Text style={styles.subtitle}>FIELD WORK MADE SIMPLE</Text>
      </Animated.View>

      {/* Loader bar */}
      <View style={styles.loaderTrack}>
        <Animated.View
          style={[
            styles.loaderFill,
            {
              width: loaderWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowTop: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.greenLight,
    opacity: 0.15,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -80,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.amber,
    opacity: 0.08,
  },
  content: {
    alignItems: 'center',
  },
  logoBox: {
    width: 88,
    height: 88,
    backgroundColor: colors.amber,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 3,
    marginTop: 12,
  },
  loaderTrack: {
    position: 'absolute',
    bottom: 60,
    width: 48,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: colors.amber,
    borderRadius: 2,
  },
});
