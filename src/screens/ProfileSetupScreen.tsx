// src/screens/ProfileSetupScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { createUserProfile } from '../services/userService';
import { WorkerType, RootStackParamList } from '../types';
import { colors, spacing, radius } from '../config/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

const WORKER_TYPES: { label: string; value: WorkerType; emoji: string }[] = [
  { label: 'Health Worker', value: 'health', emoji: '🏥' },
  { label: 'Sanitation', value: 'sanitation', emoji: '🧹' },
  { label: 'Education', value: 'education', emoji: '📚' },
  { label: 'Other', value: 'other', emoji: '🤝' },
];

export default function ProfileSetupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [workerType, setWorkerType] = useState<WorkerType>('health');
  const [designation, setDesignation] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !designation.trim() || !area.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'Not logged in. Please restart the app.');
      return;
    }

    setLoading(true);
    try {
      await createUserProfile(user.uid, {
        name: name.trim(),
        phone: user.phoneNumber ?? user.email ?? '',
        role: 'worker',
        workerType,
        designation: designation.trim(),
        area: area.trim(),
      });
      // AppNavigator will auto-redirect after profileExists returns true
      navigation.replace('TaskList');
    } catch (e: any) {
      Alert.alert('Error saving profile', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Set Up Your Profile</Text>
        <Text style={styles.headerSub}>
          This helps supervisors assign the right tasks to you
        </Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, styles.stepDone]} />
        <View style={[styles.stepDot, styles.stepActive]} />
        <View style={[styles.stepDot]} />
      </View>

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Meera Sharma"
        placeholderTextColor={colors.textLight}
        value={name}
        onChangeText={setName}
      />

      {/* Worker Type */}
      <Text style={styles.label}>Worker Type</Text>
      <View style={styles.typeGrid}>
        {WORKER_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeCard, workerType === t.value && styles.typeCardSelected]}
            onPress={() => setWorkerType(t.value)}
            activeOpacity={0.8}>
            <Text style={styles.typeEmoji}>{t.emoji}</Text>
            <Text
              style={[
                styles.typeLabel,
                workerType === t.value && styles.typeLabelSelected,
              ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Designation */}
      <Text style={styles.label}>Designation</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. ASHA Worker, ANM, NGO Field Staff"
        placeholderTextColor={colors.textLight}
        value={designation}
        onChangeText={setDesignation}
      />

      {/* Area */}
      <Text style={styles.label}>Area / Zone</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Ward 12, Bengaluru"
        placeholderTextColor={colors.textLight}
        value={area}
        onChangeText={setArea}
      />

      {/* Save button */}
      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.85}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.btnText}>Save & Continue  →</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  content: { padding: spacing.lg, paddingBottom: 48 },
  header: { marginBottom: 24, marginTop: 16 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
  },
  headerSub: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.warmGray,
  },
  stepDone: { backgroundColor: colors.greenLight },
  stepActive: { backgroundColor: colors.amber },
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.warmGray,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  typeCardSelected: {
    borderColor: colors.greenLight,
    backgroundColor: colors.greenPale,
  },
  typeEmoji: { fontSize: 28 },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMid,
    textAlign: 'center',
  },
  typeLabelSelected: { color: colors.greenDeep },
  btn: {
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
