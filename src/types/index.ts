// src/types/index.ts

export type WorkerType = 'health' | 'sanitation' | 'education' | 'other';
export type UserRole = 'worker' | 'supervisor';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  workerType: WorkerType;
  designation: string;
  area: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToUserId: string;
  status: TaskStatus;
  area: string;
  dueDate: Date | null;
  photoUrl: string | null;
  note: string | null;
  createdByUserId: string;
  createdAt: Date;
  completedAt: Date | null;
  priorityScore: number | null; // Populated by ML service later
}

// Navigation param types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  ProfileSetup: undefined;
  TaskList: undefined;
  TaskDetails: { taskId: string };
};
