// src/screens/TaskListScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskStatus, RootStackParamList } from '../types';
import { colors, spacing, radius } from '../config/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;
type FilterTab = 'all' | TaskStatus;

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: colors.statusPendingText, bg: colors.statusPendingBg, dot: '#F59E0B' },
  in_progress: { label: 'In Progress', color: colors.statusProgressText, bg: colors.statusProgressBg, dot: '#3B82F6' },
  done: { label: 'Done', color: colors.statusDoneText, bg: colors.statusDoneBg, dot: colors.greenLight },
};

function TaskCard({
  task,
  onPress,
}: {
  task: Task;
  onPress: () => void;
}) {
  const cfg = STATUS_CONFIG[task.status];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.metaItem}>📍 {task.area}</Text>
        {task.dueDate && (
          <Text style={styles.metaItem}>
            📅 {task.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        )}
      </View>
      {task.priorityScore !== null && (
        <>
          <View style={styles.priorityTrack}>
            <View
              style={[
                styles.priorityFill,
                { width: `${(task.priorityScore / 10) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.priorityLabel}>
            ⚡ ML Priority: {task.priorityScore.toFixed(1)} / 10
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function TaskListScreen({ navigation }: Props) {
  const uid = auth().currentUser?.uid ?? null;
  const { tasks, loading, pending, inProgress, done } = useTasks(uid);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const user = auth().currentUser;
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'Worker';

  const filteredTasks: Task[] =
    activeFilter === 'all'
      ? tasks
      : activeFilter === 'in_progress'
      ? inProgress
      : activeFilter === 'pending'
      ? pending
      : done;

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${tasks.length})` },
    { key: 'pending', label: `Pending (${pending.length})` },
    { key: 'in_progress', label: `In Progress (${inProgress.length})` },
    { key: 'done', label: `Done (${done.length})` },
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.amber} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.headerName}>{displayName}</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('ProfileSetup')}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { num: pending.length, lbl: 'Pending' },
            { num: inProgress.length, lbl: 'In Progress' },
            { num: done.length, lbl: 'Done' },
          ].map(s => (
            <View key={s.lbl} style={styles.statChip}>
              <Text style={styles.statNum}>{s.num}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Filter tabs */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <FlatList
              data={filters}
              horizontal
              keyExtractor={f => f.key}
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              renderItem={({ item: f }) => (
                <TouchableOpacity
                  style={[
                    styles.filterTab,
                    activeFilter === f.key && styles.filterTabActive,
                  ]}
                  onPress={() => setActiveFilter(f.key)}>
                  <Text
                    style={[
                      styles.filterTabText,
                      activeFilter === f.key && styles.filterTabTextActive,
                    ]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No tasks here yet</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor={colors.greenLight}
            colors={[colors.greenLight]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.offWhite },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.greenDeep,
  },
  header: {
    backgroundColor: colors.greenDeep,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 18,
    color: colors.greenDeep,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  filterRow: {
    paddingVertical: 14,
  },
  filterTab: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.warmGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.greenDeep,
    borderColor: colors.greenDeep,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMid,
    whiteSpace: 'nowrap',
  },
  filterTabTextActive: { color: colors.white, fontWeight: '700' },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
    flex: 1,
    paddingRight: 8,
    lineHeight: 21,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: { fontSize: 12, color: colors.textLight },
  priorityTrack: {
    height: 3,
    backgroundColor: colors.warmGray,
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  priorityFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.amber,
  },
  priorityLabel: {
    fontSize: 11,
    color: colors.amberDark,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 16, color: colors.textLight },
});
