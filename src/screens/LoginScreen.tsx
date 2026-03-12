// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signInWithEmail, signUpWithEmail } from '../services/authService';
import { RootStackParamList } from '../types';
import { colors, spacing, radius } from '../config/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen(_props: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      // AppNavigator auto-handles navigation via onAuthStateChanged
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
      {/* Green header */}
      <View style={styles.header}>
        <View style={styles.logoSm}>
          <Text style={{ fontSize: 22 }}>🌿</Text>
        </View>
        <Text style={styles.headerTitle}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={styles.headerSub}>
          {isSignUp
            ? 'Join your team on Community Workers'
            : 'Sign in to access your tasks'}
        </Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnPrimaryText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}  →
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.btnSecondaryText}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          {'📝 Dev mode: Email/Password auth\nSwap for Phone Auth before release'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.greenDeep,
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 28,
  },
  logoSm: {
    width: 48,
    height: 48,
    backgroundColor: colors.amber,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  body: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  bodyContent: {
    padding: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.warmGray,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 20,
  },
  btnPrimary: {
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.warmGray,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textLight,
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: colors.greenPale,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: colors.greenMid,
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textLight,
    marginTop: 28,
    lineHeight: 18,
  },
});
