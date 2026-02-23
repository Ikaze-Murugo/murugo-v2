"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  message: string;
  images?: string[];
  isRead: boolean;
  createdAt: string;
}

interface UseRealTimeMessagesProps {
  token?: string;
  userId?: string;
  conversationId?: string;
}

export function useRealTimeMessages({
  token,
  userId,
  conversationId,
}: UseRealTimeMessagesProps) {
  const { socket, isConnected } = useSocket(token);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Join conversation room
  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    socket.emit("join_conversation", { conversationId });

    return () => {
      socket.emit("leave_conversation", { conversationId });
    };
  }, [socket, conversationId, isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      
      // Play notification sound
      if (message.senderId !== userId) {
        playNotificationSound();
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, userId]);

  // Listen for message read status
  useEffect(() => {
    if (!socket) return;

    const handleMessageRead = (data: { messageIds: string[] }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    };

    socket.on("messages_read", handleMessageRead);

    return () => {
      socket.off("messages_read", handleMessageRead);
    };
  }, [socket]);

  // Listen for typing status
  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = (data: { userId: string }) => {
      if (data.userId !== userId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      }
    };

    const handleTypingStop = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socket.on("user_typing", handleTypingStart);
    socket.on("user_stop_typing", handleTypingStop);

    return () => {
      socket.off("user_typing", handleTypingStart);
      socket.off("user_stop_typing", handleTypingStop);
    };
  }, [socket, userId]);

  // Listen for online status
  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [socket]);

  // Send message
  const sendMessage = useCallback(
    (data: {
      receiverId: string;
      message: string;
      propertyId?: string;
      images?: string[];
    }) => {
      if (!socket || !isConnected) {
        console.error("Socket not connected");
        return;
      }

      socket.emit("send_message", data);
    },
    [socket, isConnected]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!socket || !isConnected) return;

      socket.emit("mark_as_read", { messageIds });
    },
    [socket, isConnected]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !isConnected || !conversationId) return;

      socket.emit(isTyping ? "typing_start" : "typing_stop", {
        conversationId,
      });
    },
    [socket, isConnected, conversationId]
  );

  return {
    messages,
    typingUsers,
    onlineUsers,
    isConnected,
    sendMessage,
    markAsRead,
    sendTyping,
  };
}

// Helper function to play notification sound
function playNotificationSound() {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.log("Could not play sound:", err));
  } catch (err) {
    console.log("Notification sound error:", err);
  }
}
