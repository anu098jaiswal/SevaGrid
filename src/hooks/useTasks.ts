// src/hooks/useTasks.ts

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { subscribeToMyTasks } from '../services/taskService';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  // Grouped by status for easy rendering
  pending: Task[];
  inProgress: Task[];
  done: Task[];
}

export const useTasks = (userId: string | null): UseTasksResult => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToMyTasks(
      userId,
      updatedTasks => {
        setTasks(updatedTasks);
        setLoading(false);
        setError(null);
      },
      err => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe; // cleanup real-time listener on unmount
  }, [userId]);

  return {
    tasks,
    loading,
    error,
    pending: tasks.filter(t => t.status === 'pending'),
    inProgress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };
};
