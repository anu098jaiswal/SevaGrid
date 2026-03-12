// src/services/userService.ts

import firestore from '@react-native-firebase/firestore';
import { UserProfile } from '../types';

const usersCol = () => firestore().collection('users');

export const createUserProfile = async (
  uid: string,
  data: Omit<UserProfile, 'id' | 'createdAt'>,
): Promise<void> => {
  await usersCol()
    .doc(uid)
    .set({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const doc = await usersCol().doc(uid).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data()!;
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
  } as UserProfile;
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>,
): Promise<void> => {
  await usersCol().doc(uid).update(data);
};

// Check if a profile exists (used to decide whether to show ProfileSetup)
export const profileExists = async (uid: string): Promise<boolean> => {
  const doc = await usersCol().doc(uid).get();
  return doc.exists;
};
