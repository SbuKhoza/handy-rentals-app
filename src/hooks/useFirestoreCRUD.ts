import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  QueryConstraint,
  orderBy as firestoreOrderBy,
  where as firestoreWhere,
  limit as firestoreLimit,
  DocumentData,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Re-export query helpers for convenience
export const orderBy = firestoreOrderBy;
export const where = firestoreWhere;
export const limit = firestoreLimit;

interface UseFirestoreCRUDOptions {
  collectionName: string;
}

interface BaseDocument {
  id?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export function useFirestoreCRUD<T extends BaseDocument>({
  collectionName,
}: UseFirestoreCRUDOptions) {
  const collectionRef = collection(db, collectionName);

  // Get all documents with optional query constraints
  const getAll = async (constraints: QueryConstraint[] = []): Promise<T[]> => {
    const q =
      constraints.length > 0
        ? query(collectionRef, ...constraints)
        : query(collectionRef);

    const snapshot = await getDocs(q);
    return snapshot.docs
      .filter((doc) => doc.id !== "_metadata")
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
  };

  // Get single document by ID
  const getById = async (id: string): Promise<T | null> => {
    const docRef = doc(db, collectionName, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as T;
  };

  // Create new document
  const create = async (data: Omit<T, "id">): Promise<string> => {
    const docData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collectionRef, docData);
    return docRef.id;
  };

  // Update existing document
  const update = async (id: string, data: Partial<T>): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    } as DocumentData);
  };

  // Delete document
  const remove = async (id: string): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  };

  // Set document with specific ID (creates or overwrites)
  const set = async (
    id: string,
    data: Omit<T, "id">,
    options?: { merge?: boolean }
  ): Promise<void> => {
    const docRef = doc(db, collectionName, id);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists() && options?.merge !== false) {
      // Update existing document, preserve createdAt
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } else {
      // Create new document
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  };

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    set,
  };
}
