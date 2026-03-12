// src/screens/TaskDetailsScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { Task, TaskStatus, RootStackParamList } from '../types';
import { subscribeToTask, updateTaskStatus, updateTaskNoteAndPhoto } from '../services/taskService';
import { colors, spacing, radius } from '../config/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

const STATUS_FLOW: TaskStatus[] = ['pending', 'in_progress', 'done'];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: colors.statusPendingText, bg: colors.statusPendingBg },
  in_progress: { label: 'In Progress', color: colors.statusProgressText, bg: colors.statusProgressBg },
  done: { label: 'Done', color: colors.statusDoneText, bg: colors.statusDoneBg },
};

const NEXT_ACTION_LABEL: Record<TaskStatus, string | null> = {
  pending: 'Mark as In Progress',
  in_progress: 'Mark as Done ✓',
  done: null,
};

export default function TaskDetailsScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [note, setNote] = useState('');
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Real-time listener for this specific task
  useEffect(() => {
    const unsubscribe = subscribeToTask(
      taskId,
      updatedTask => {
        setTask(updatedTask);
        // Only pre-fill note on first load
        setNote(prev => (prev === '' ? updatedTask.note ?? '' : prev));
      },
      err => Alert.alert('Error loading task', err.message),
    );
    return unsubscribe;
  }, [taskId]);

  const handlePickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.assets?.[0]?.uri) {
        setLocalPhotoUri(response.assets[0].uri);
      }
    });
  };

  const handleAdvanceStatus = async () => {
    if (!task) return;
    const idx = STATUS_FLOW.indexOf(task.status);
    if (idx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    try {
      await updateTaskStatus(taskId, nextStatus);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTaskNoteAndPhoto(taskId, note, localPhotoUri);
      setLocalPhotoUri(null); // clear after upload
      Alert.alert('Saved!', 'Note and photo updated.');
    } catch (e: any) {
      Alert.alert('Error saving', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.amber} />
      </View>
    );
  }

  const cfg = STATUS_CONFIG[task.status];
  const currentIdx = STATUS_FLOW.indexOf(task.status);
  const nextLabel = NEXT_ACTION_LABEL[task.status];
  const photoToShow = localPhotoUri ?? task.photoUrl;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Task Details</Text>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.badgeText}>{cfg.label}</Text>
          </View>
          {task.dueDate && (
            <Text style={styles.dueText}>
              📅 Due{' '}
              {task.dueDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          )}
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskArea}>📍 {task.area}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* ML Priority Score */}
        {task.priorityScore !== null && (
          <View style={styles.mlCard}>
            <Text style={styles.mlScore}>{task.priorityScore.toFixed(1)}</Text>
            <View>
              <Text style={styles.mlTitle}>ML Priority Score</Text>
              <Text style={styles.mlSub}>
                AI-assigned urgency based on area risk factors
              </Text>
            </View>
          </View>
        )}

        {/* Status Stepper */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Progress</Text>
          <View style={styles.stepper}>
            {STATUS_FLOW.map((s, idx) => {
              const isCompleted = currentIdx > idx;
              const isActive = currentIdx === idx;
              return (
                <React.Fragment key={s}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleDone,
                        isActive && styles.stepCircleActive,
                      ]}>
                      <Text style={styles.stepCircleText}>
                        {isCompleted ? '✓' : idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLbl,
                        isActive && { color: colors.amberDark, fontWeight: '700' },
                      ]}>
                      {STATUS_CONFIG[s].label}
                    </Text>
                  </View>
                  {idx < STATUS_FLOW.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        currentIdx > idx && styles.stepLineDone,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Description</Text>
          <Text style={styles.infoValue}>{task.description}</Text>
        </View>

        {/* Photo */}
        <Text style={styles.sectionLabel}>Photo Evidence</Text>
        {photoToShow ? (
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.9}>
            <View style={styles.photoWrap}>
              <Image source={{ uri: photoToShow }} style={styles.photo} />
              <View style={styles.photoTag}>
                <Text style={styles.photoTagText}>
                  {localPhotoUri ? '📷 New photo (not saved)' : '📷 Saved photo'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.uploadZone} onPress={handlePickPhoto}>
            <Text style={styles.uploadEmoji}>📷</Text>
            <Text style={styles.uploadText}>Tap to upload photo evidence</Text>
          </TouchableOpacity>
        )}

        {/* Note */}
        <Text style={styles.sectionLabel}>Add Note</Text>
        <TextInput
          style={styles.noteInput}
          multiline
          placeholder="What did you observe or do during this task?"
          placeholderTextColor={colors.textLight}
          value={note}
          onChangeText={setNote}
        />

        {/* Action buttons */}
        {nextLabel && (
          <TouchableOpacity style={styles.btnAdvance} onPress={handleAdvanceStatus} activeOpacity={0.85}>
            <Text style={styles.btnAdvanceText}>{nextLabel}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btnSave, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}>
          {saving ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.btnSaveText}>Save Note & Photo</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.greenDeep,
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  backBtn: {
    width: 36, height: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: colors.white, fontSize: 18 },
  headerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.white },
  dueText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 28,
  },
  taskArea: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6 },
  body: { flex: 1 },
  bodyContent: { padding: spacing.md, paddingBottom: 48 },
  mlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.greenDeep,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
  },
  mlScore: {
    fontWeight: '800',
    fontSize: 36,
    color: colors.amber,
    lineHeight: 40,
  },
  mlTitle: { fontSize: 14, fontWeight: '700', color: colors.white },
  mlSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  infoValue: { fontSize: 14, color: colors.textDark, lineHeight: 21 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.warmGray,
    marginTop: 15,
  },
  stepLineDone: { backgroundColor: colors.greenLight },
  stepCircle: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: colors.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: colors.greenLight },
  stepCircleActive: { backgroundColor: colors.amber },
  stepCircleText: { fontSize: 13, fontWeight: '700', color: colors.white },
  stepLbl: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 60,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 2,
  },
  uploadZone: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.warmGray,
    borderRadius: radius.md,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  uploadEmoji: { fontSize: 28 },
  uploadText: { fontSize: 13, color: colors.textLight },
  photoWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  photo: { width: '100%', height: 150 },
  photoTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoTagText: { fontSize: 11, color: colors.white },
  noteInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.warmGray,
    borderRadius: radius.md,
    padding: 14,
    fontSize: 14,
    color: colors.textDark,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  btnAdvance: {
    backgroundColor: colors.amber,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnAdvanceText: {
    color: colors.greenDeep,
    fontSize: 16,
    fontWeight: '800',
  },
  btnSave: {
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  btnSaveText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
