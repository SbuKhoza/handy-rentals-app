"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  QueryConstraint,
  setDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseFirestoreCollectionOptions {
  collectionName: string;
  constraints?: QueryConstraint[];
  realtime?: boolean;
}

interface CollectionState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestoreCollection<T extends { id?: string }>({
  collectionName,
  constraints = [],
  realtime = true,
}: UseFirestoreCollectionOptions) {
  const [state, setState] = useState<CollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  // Ensure collection exists
  const ensureCollectionExists = useCallback(async () => {
    try {
      const metaDocRef = doc(db, collectionName, "_metadata");
      const metaDoc = await getDoc(metaDocRef);

      if (!metaDoc.exists()) {
        await setDoc(metaDocRef, {
          createdAt: Timestamp.now(),
          collectionName,
          description: `Auto-created collection for ${collectionName}`,
        });
      }
    } catch (error) {
      console.error(`Failed to ensure collection ${collectionName} exists:`, error);
    }
  }, [collectionName]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      await ensureCollectionExists();

      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0
        ? query(collectionRef, ...constraints)
        : query(collectionRef);

      if (realtime) {
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs = snapshot.docs
              .filter((doc) => doc.id !== "_metadata")
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as T[];

            setState({
              data: docs,
              loading: false,
              error: null,
            });
          },
          (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
            setState((prev) => ({
              ...prev,
              loading: false,
              error: error as Error,
            }));
          }
        );
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, realtime, ensureCollectionExists]);

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await ensureCollectionExists();
  }, [ensureCollectionExists]);

  return {
    ...state,
    refetch,
  };
}
