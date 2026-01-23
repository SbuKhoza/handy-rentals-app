import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Query for unread messages where the current user is the receiver
    const messagesRef = collection(db, "messages");
    const unreadQuery = query(
      messagesRef,
      where("receiverId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(
      unreadQuery,
      (snapshot) => {
        setUnreadCount(snapshot.size);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching unread messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { unreadCount, loading };
};
