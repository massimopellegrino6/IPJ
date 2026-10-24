import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../firebase';
import { PropertyItem, DecisionTask, DecisionHistoryItem } from '../types/intelligence';
import { DecisionEventLog } from '../types/decision';
import { PROPERTIES_DATABASE, DECISION_CENTER_TASKS, DECISION_HISTORY_DATA } from '../data/mockIntelligenceDatabase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { sanitizeForFirestore } from '../utils/sanitizeForFirestore';

export type SyncState = 'connected' | 'syncing' | 'offline' | 'unauthenticated' | 'error';

interface FirebaseContextType {
  user: User | null;
  authLoading: boolean;
  isCloudConnected: boolean;
  syncState: SyncState;
  syncError: string | null;
  cloudProperties: PropertyItem[];
  cloudTasks: DecisionTask[];
  cloudHistory: DecisionHistoryItem[];
  cloudLogs: DecisionEventLog[];
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProperty: (prop: PropertyItem) => Promise<void>;
  updateProperty: (prop: PropertyItem) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  saveDecisionTask: (task: DecisionTask) => Promise<void>;
  saveDecisionHistoryItem: (item: DecisionHistoryItem) => Promise<void>;
  saveDecisionLog: (log: DecisionEventLog) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<SyncState>('unauthenticated');
  const [syncError, setSyncError] = useState<string | null>(null);

  const [cloudProperties, setCloudProperties] = useState<PropertyItem[]>(PROPERTIES_DATABASE);
  const [cloudTasks, setCloudTasks] = useState<DecisionTask[]>(DECISION_CENTER_TASKS);
  const [cloudHistory, setCloudHistory] = useState<DecisionHistoryItem[]>(DECISION_HISTORY_DATA);
  const [cloudLogs, setCloudLogs] = useState<DecisionEventLog[]>([]);

  // 1. Initial connection verification
  useEffect(() => {
    let isMounted = true;
    testConnection().then((connected) => {
      if (isMounted) {
        setIsCloudConnected(connected);
      }
    }).catch((err) => {
      console.warn('Initial connection probe warning:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setSyncState('unauthenticated');
      } else {
        setSyncState('syncing');
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Realtime Cloud Data Synchronization when user is authenticated
  useEffect(() => {
    if (!user) {
      setCloudProperties(PROPERTIES_DATABASE);
      setCloudTasks(DECISION_CENTER_TASKS);
      setCloudHistory(DECISION_HISTORY_DATA);
      return;
    }

    setSyncState('syncing');
    const isAdmin = user.email === 'infositopellegrino@gmail.com';

    // Properties listener
    const propPath = 'properties';
    const propQuery = isAdmin 
      ? collection(db, propPath) 
      : query(collection(db, propPath), where('ownerId', '==', user.uid));

    const unsubProps = onSnapshot(propQuery, async (snapshot) => {
      if (snapshot.empty) {
        // First-time seed for this user: populate their portfolio with rich initial data
        try {
          console.log('Seeding initial properties to Cloud Firestore for user:', user.email);
          for (const item of PROPERTIES_DATABASE) {
            const sanitized = sanitizeForFirestore({
              ...item,
              ownerId: user.uid
            });
            await setDoc(doc(db, propPath, item.id), sanitized);
          }
          setSyncState('connected');
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, propPath, auth);
        }
      } else {
        const loadedProps = snapshot.docs.map(d => d.data() as PropertyItem);
        setCloudProperties(loadedProps);
        setSyncState('connected');
      }
    }, (error) => {
      setSyncState('error');
      setSyncError(error.message);
      handleFirestoreError(error, OperationType.LIST, propPath, auth);
    });

    // Decision tasks listener
    const taskPath = 'decision_tasks';
    const taskQuery = isAdmin
      ? collection(db, taskPath)
      : query(collection(db, taskPath), where('ownerId', '==', user.uid));

    const unsubTasks = onSnapshot(taskQuery, async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const task of DECISION_CENTER_TASKS) {
            const sanitized = sanitizeForFirestore({
              ...task,
              ownerId: user.uid
            });
            await setDoc(doc(db, taskPath, task.id), sanitized);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, taskPath, auth);
        }
      } else {
        setCloudTasks(snapshot.docs.map(d => d.data() as DecisionTask));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, taskPath, auth);
    });

    // Decision history listener
    const histPath = 'decision_history';
    const histQuery = isAdmin
      ? collection(db, histPath)
      : query(collection(db, histPath), where('ownerId', '==', user.uid));

    const unsubHist = onSnapshot(histQuery, async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const hist of DECISION_HISTORY_DATA) {
            const sanitized = sanitizeForFirestore({
              ...hist,
              ownerId: user.uid
            });
            await setDoc(doc(db, histPath, hist.id), sanitized);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, histPath, auth);
        }
      } else {
        setCloudHistory(snapshot.docs.map(d => d.data() as DecisionHistoryItem));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, histPath, auth);
    });

    // Decision logs listener
    const logPath = 'decision_logs';
    const logQuery = isAdmin
      ? collection(db, logPath)
      : query(collection(db, logPath), where('ownerId', '==', user.uid));

    const unsubLogs = onSnapshot(logQuery, (snapshot) => {
      setCloudLogs(snapshot.docs.map(d => d.data() as DecisionEventLog));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, logPath, auth);
    });

    return () => {
      unsubProps();
      unsubTasks();
      unsubHist();
      unsubLogs();
    };
  }, [user]);

  // Sign In with Google popup
  const signInWithGoogle = useCallback(async () => {
    try {
      setSyncState('syncing');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setSyncError(err?.message || 'Login con Google non riuscito');
      setSyncState('error');
    }
  }, []);

  // Sign Out
  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      setSyncState('unauthenticated');
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  }, []);

  // Save new property to Cloud Firestore
  const saveProperty = useCallback(async (prop: PropertyItem) => {
    const path = `properties/${prop.id}`;
    const ownerId = user?.uid || 'anonymous_user';
    const sanitized = sanitizeForFirestore({
      ...prop,
      ownerId
    });

    // Optimistic local update
    setCloudProperties(prev => [prop, ...prev.filter(p => p.id !== prop.id)]);

    if (user) {
      try {
        await setDoc(doc(db, 'properties', prop.id), sanitized);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path, auth);
      }
    }
  }, [user]);

  // Update existing property in Cloud Firestore
  const updateProperty = useCallback(async (prop: PropertyItem) => {
    const path = `properties/${prop.id}`;
    const ownerId = user?.uid || 'anonymous_user';
    const sanitized = sanitizeForFirestore({
      ...prop,
      ownerId
    });

    // Optimistic local update
    setCloudProperties(prev => prev.map(p => p.id === prop.id ? prop : p));

    if (user) {
      try {
        await setDoc(doc(db, 'properties', prop.id), sanitized);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path, auth);
      }
    }
  }, [user]);

  // Delete property from Cloud Firestore
  const deleteProperty = useCallback(async (propertyId: string) => {
    const path = `properties/${propertyId}`;
    setCloudProperties(prev => prev.filter(p => p.id !== propertyId));

    if (user) {
      try {
        await deleteDoc(doc(db, 'properties', propertyId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path, auth);
      }
    }
  }, [user]);

  // Save or update decision task in Cloud Firestore
  const saveDecisionTask = useCallback(async (task: DecisionTask) => {
    const path = `decision_tasks/${task.id}`;
    const ownerId = user?.uid || 'anonymous_user';
    const sanitized = sanitizeForFirestore({
      ...task,
      ownerId
    });

    setCloudTasks(prev => prev.map(t => t.id === task.id ? task : t));

    if (user) {
      try {
        await setDoc(doc(db, 'decision_tasks', task.id), sanitized);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path, auth);
      }
    }
  }, [user]);

  // Save decision history item in Cloud Firestore
  const saveDecisionHistoryItem = useCallback(async (item: DecisionHistoryItem) => {
    const path = `decision_history/${item.id}`;
    const ownerId = user?.uid || 'anonymous_user';
    const sanitized = sanitizeForFirestore({
      ...item,
      ownerId
    });

    setCloudHistory(prev => [item, ...prev]);

    if (user) {
      try {
        await setDoc(doc(db, 'decision_history', item.id), sanitized);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path, auth);
      }
    }
  }, [user]);

  // Save decision event log in Cloud Firestore
  const saveDecisionLog = useCallback(async (log: DecisionEventLog) => {
    const path = `decision_logs/${log.eventId}`;
    const ownerId = user?.uid || 'anonymous_user';
    const sanitized = sanitizeForFirestore({
      ...log,
      ownerId
    });

    setCloudLogs(prev => [log, ...prev]);

    if (user) {
      try {
        await setDoc(doc(db, 'decision_logs', log.eventId), sanitized);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path, auth);
      }
    }
  }, [user]);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        isCloudConnected,
        syncState,
        syncError,
        cloudProperties,
        cloudTasks,
        cloudHistory,
        cloudLogs,
        signInWithGoogle,
        signOutUser,
        saveProperty,
        updateProperty,
        deleteProperty,
        saveDecisionTask,
        saveDecisionHistoryItem,
        saveDecisionLog,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
