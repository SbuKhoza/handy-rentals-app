'use client';

import React from "react"

import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Loader2,
  User,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  or,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  text: string;
  createdAt: Timestamp | null;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  listingId?: string;
  listingTitle?: string;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  createdAt: Timestamp | null;
}

interface UserProfile {
  id: string;
  userName?: string;
  displayName?: string;
  photoURL?: string;
}

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listing");
  const ownerId = searchParams.get("owner");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [userNamesCache, setUserNamesCache] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change - scroll within container only
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch user profile helper - checks both 'profiles' and 'users' collections
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // First try profiles collection
      const profileDoc = await getDoc(doc(db, "profiles", userId));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        // Check if we have a valid name
        if (data.userName || data.displayName) {
          return { id: profileDoc.id, ...data } as UserProfile;
        }
      }
      
      // Fallback to users collection
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return { 
          id: userDoc.id, 
          userName: data.userName,
          displayName: data.displayName,
          photoURL: data.photoURL 
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Fetch listing helper
  const fetchListing = async (listingId: string) => {
    try {
      const listingDoc = await getDoc(doc(db, "listings", listingId));
      if (listingDoc.exists()) {
        return { id: listingDoc.id, ...listingDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching listing:", error);
      return null;
    }
  };

  // Create or get existing conversation
  const getOrCreateConversation = async (
    otherUserId: string,
    listingId?: string
  ): Promise<Conversation | null> => {
    if (!user) return null;

    setCreatingConversation(true);
    try {
      // Check if conversation already exists between these two users for this listing
      const conversationsRef = collection(db, "conversations");
      const q = query(
        conversationsRef,
        where("participants", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);

      // Find existing conversation with the same participants and listing
      for (const docSnap of snapshot.docs) {
        const conv = { id: docSnap.id, ...docSnap.data() } as Conversation;
        if (
          conv.participants.includes(otherUserId) &&
          (!listingId || conv.listingId === listingId)
        ) {
          return conv;
        }
      }

      // Create new conversation
      const [currentUserProfile, otherUserProfile] = await Promise.all([
        fetchUserProfile(user.uid),
        fetchUserProfile(otherUserId),
      ]);

      let listingData = null;
      if (listingId) {
        listingData = await fetchListing(listingId);
      }

      const newConversation = {
        participants: [user.uid, otherUserId],
        participantNames: {
          [user.uid]: currentUserProfile?.userName || currentUserProfile?.displayName || user.displayName || "You",
          [otherUserId]: otherUserProfile?.userName || otherUserProfile?.displayName || "User",
        },
        participantAvatars: {
          [user.uid]: currentUserProfile?.photoURL || user.photoURL || "",
          [otherUserId]: otherUserProfile?.photoURL || "",
        },
        listingId: listingId || null,
        listingTitle: listingData?.title || null,
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      return {
        id: docRef.id,
        ...newConversation,
        lastMessageAt: null,
        createdAt: null,
      } as Conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    } finally {
      setCreatingConversation(false);
    }
  };

  // Real-time listener for conversations
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const convs: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          convs.push({ id: docSnap.id, ...data } as Conversation);
        });
        // Sort by lastMessageAt (most recent first)
        convs.sort((a, b) => {
          const aTime = a.lastMessageAt?.seconds || 0;
          const bTime = b.lastMessageAt?.seconds || 0;
          return bTime - aTime;
        });
        setConversations(convs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch actual user names for conversations (to fix "User" placeholder)
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!user || conversations.length === 0) return;
      
      const otherUserIds = conversations
        .map(conv => conv.participants.find(p => p !== user.uid))
        .filter((id): id is string => !!id);
      
      // Only fetch names we don't have cached yet
      const uncachedIds = otherUserIds.filter(id => !userNamesCache[id]);
      
      if (uncachedIds.length === 0) return;
      
      const newCache: Record<string, string> = {};
      
      await Promise.all(
        uncachedIds.map(async (userId) => {
          const profile = await fetchUserProfile(userId);
          if (profile) {
            newCache[userId] = profile.userName || profile.displayName || "User";
          }
        })
      );
      
      if (Object.keys(newCache).length > 0) {
        setUserNamesCache(prev => ({ ...prev, ...newCache }));
      }
    };
    
    fetchUserNames();
  }, [conversations, user]);

  // Handle URL params (when coming from listing page)
  useEffect(() => {
    const initializeFromParams = async () => {
      if (ownerId && user && user.uid !== ownerId) {
        const conversation = await getOrCreateConversation(ownerId, listingId || undefined);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
    };

    if (!loading && user) {
      initializeFromParams();
    }
  }, [ownerId, listingId, user, loading]);

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      const messagesRef = collection(db, "messages");
      const unreadQuery = query(
        messagesRef,
        where("conversationId", "==", conversationId),
        where("receiverId", "==", user.uid),
        where("read", "==", false)
      );

      const snapshot = await getDocs(unreadQuery);
      
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.update(docSnap.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Real-time listener for messages in selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "messages");
    // Query without orderBy first to avoid index issues, then sort client-side
    const q = query(
      messagesRef,
      where("conversationId", "==", selectedConversation.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...docSnap.data() } as Message);
        });
        // Sort client-side by createdAt
        msgs.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return aTime - bTime;
        });
        setMessages(msgs);

        // Mark messages as read when conversation is viewed
        markMessagesAsRead(selectedConversation.id);
      },
      (error) => {
        console.error("Error fetching messages:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, user]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const otherUserId = selectedConversation.participants.find(
        (p) => p !== user.uid
      );

      // Get current user's name from conversation participantNames (which uses userName/displayName)
      const currentUserName = selectedConversation.participantNames[user.uid] || user.displayName || "User";
      
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: user.uid,
        senderName: currentUserName,
        senderAvatar: user.photoURL || "",
        receiverId: otherUserId || "",
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
      };

      // Add message to messages collection
      await addDoc(collection(db, "messages"), messageData);

      // Update conversation with last message
      await updateDoc(doc(db, "conversations", selectedConversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipantName = (conversation: Conversation) => {
    if (!user) return "User";
    const otherUserId = conversation.participants.find((p) => p !== user.uid);
    if (!otherUserId) return "User";
    
    // First check cache (fetched from profiles/users collection)
    if (userNamesCache[otherUserId]) {
      return userNamesCache[otherUserId];
    }
    
    // Fallback to stored participantNames (might be "User" if not properly saved)
    const storedName = conversation.participantNames[otherUserId];
    return storedName && storedName !== "User" ? storedName : "User";
  };

  const getOtherParticipantAvatar = (conversation: Conversation) => {
    if (!user) return "";
    const otherUserId = conversation.participants.find((p) => p !== user.uid);
    return otherUserId ? conversation.participantAvatars[otherUserId] || "" : "";
  };

  const formatTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Not logged in state
  if (!user) {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Sign in to view messages
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                You need to be signed in to send and receive messages.
              </p>
              <Button asChild>
                <Link to="/login?redirect=/messages">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (loading || creatingConversation) {
    return (
      <Layout>
        <div className="pt-20 md:pt-24 min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {creatingConversation ? "Starting conversation..." : "Loading messages..."}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-16 md:pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] bg-card rounded-xl border border-border overflow-hidden">
            {/* Conversations List */}
            <div
              className={cn(
                "w-full md:w-80 border-r border-border flex flex-col",
                selectedConversation ? "hidden md:flex" : "flex"
              )}
            >
              <div className="p-4 border-b border-border">
                <h1 className="text-xl font-bold text-foreground">Messages</h1>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No messages yet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      When you contact a listing owner or receive inquiries, your
                      conversations will appear here.
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={cn(
                        "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border",
                        selectedConversation?.id === conversation.id && "bg-muted"
                      )}
                    >
                      {getOtherParticipantAvatar(conversation) ? (
                        <img
                          src={getOtherParticipantAvatar(conversation) || "/placeholder.svg"}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground truncate">
                            {getOtherParticipantName(conversation)}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        {conversation.listingTitle && (
                          <p className="text-xs text-primary truncate mb-1">
                            Re: {conversation.listingTitle}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={cn(
                "flex-1 flex flex-col",
                !selectedConversation ? "hidden md:flex" : "flex"
              )}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    {getOtherParticipantAvatar(selectedConversation) ? (
                      <img
                        src={getOtherParticipantAvatar(selectedConversation) || "/placeholder.svg"}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-foreground truncate">
                        {getOtherParticipantName(selectedConversation)}
                      </h2>
                      {selectedConversation.listingTitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          Re: {selectedConversation.listingTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-muted-foreground">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.senderId === user.uid;
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2",
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              )}
                            >
                              <p className="break-words">{message.text}</p>
                              <p
                                className={cn(
                                  "text-xs mt-1",
                                  isOwn
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sendingMessage}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        size="icon"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Select a conversation
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Choose a conversation from the list to start chatting, or
                    contact a listing owner from their listing page.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
