// src/services/taskService.ts

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Task, TaskStatus } from '../types';

const tasksCol = () => firestore().collection('tasks');

// ── Real-time listener for a worker's tasks ───────────────────────────────────
// Returns an unsubscribe function — call it in useEffect cleanup.
export const subscribeToMyTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: Error) => void,
) => {
  return tasksCol()
    .where('assignedToUserId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const tasks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate?.toDate() ?? null,
            createdAt: data.createdAt?.toDate() ?? new Date(),
            completedAt: data.completedAt?.toDate() ?? null,
          } as Task;
        });
        onUpdate(tasks);
      },
      error => {
        onError?.(error);
      },
    );
};

// ── Real-time listener for a single task (used in TaskDetails) ────────────────
export const subscribeToTask = (
  taskId: string,
  onUpdate: (task: Task) => void,
  onError?: (error: Error) => void,
) => {
  return tasksCol()
    .doc(taskId)
    .onSnapshot(
      doc => {
        if (doc.exists) {
          const data = doc.data()!;
          onUpdate({
            id: doc.id,
            ...data,
            dueDate: data.dueDate?.toDate() ?? null,
            createdAt: data.createdAt?.toDate() ?? new Date(),
            completedAt: data.completedAt?.toDate() ?? null,
          } as Task);
        }
      },
      error => onError?.(error),
    );
};

// ── Advance task status ───────────────────────────────────────────────────────
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus,
): Promise<void> => {
  const update: Record<string, unknown> = { status };
  if (status === 'done') {
    update.completedAt = firestore.FieldValue.serverTimestamp();
  }
  await tasksCol().doc(taskId).update(update);
};

// ── Save note and optionally upload photo ─────────────────────────────────────
export const updateTaskNoteAndPhoto = async (
  taskId: string,
  note: string,
  localPhotoUri: string | null,
): Promise<void> => {
  let photoUrl: string | null = null;

  if (localPhotoUri) {
    // Upload to Firebase Storage: tasks/{taskId}/{timestamp}.jpg
    const filename = `tasks/${taskId}/${Date.now()}.jpg`;
    const ref = storage().ref(filename);
    await ref.putFile(localPhotoUri);
    photoUrl = await ref.getDownloadURL();
  }

  const update: Record<string, unknown> = { note };
  if (photoUrl) {
    update.photoUrl = photoUrl;
  }

  await tasksCol().doc(taskId).update(update);
};

// ── Create a task (supervisor use) ───────────────────────────────────────────
export const createTask = async (
  data: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'priorityScore'>,
): Promise<string> => {
  const ref = await tasksCol().add({
    ...data,
    createdAt: firestore.FieldValue.serverTimestamp(),
    completedAt: null,
    priorityScore: null, // ML service will populate this later
  });
  return ref.id;
};
