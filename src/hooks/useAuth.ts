// src/hooks/useAuth.ts

import { useState, useEffect } from 'react';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged fires immediately with current user (or null)
    const unsubscribe = auth().onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // cleanup listener on unmount
  }, []);

  return { user, loading };
};
