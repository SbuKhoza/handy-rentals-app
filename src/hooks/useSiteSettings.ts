'use client';

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { SiteSettings } from "../types";

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "Rent4Hire",
  tagline: "Rent anything, anytime",
  heroTitle: "Rent What You Need, When You Need It",
  heroSubtitle: "Browse thousands of items and services available for rent in your area",
  contactEmail: "support@rent4hire.com",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, "settings", "site");

    // Ensure settings document exists
    const ensureSettingsExist = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            ...DEFAULT_SETTINGS,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      } catch (err) {
        console.error("Failed to ensure settings exist:", err);
      }
    };

    ensureSettingsExist();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings({
            id: snapshot.id,
            ...snapshot.data(),
          } as SiteSettings);
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching site settings:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
}
