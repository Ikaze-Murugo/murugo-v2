"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, ArrowLeft, Circle, Check, CheckCheck } from "lucide-react";
import { useRealTimeMessages } from "@/lib/hooks/useRealTimeMessages";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  images?: string[];
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId] = useState("current-user"); // TODO: Get from auth context
  const [authToken] = useState<string | undefined>(undefined); // TODO: Get from auth context
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time messaging hook
  const {
    messages: realtimeMessages,
    typingUsers,
    onlineUsers,
    isConnected,
    sendMessage,
    markAsRead,
    sendTyping,
  } = useRealTimeMessages({
    token: authToken,
    userId: currentUserId,
    conversationId: selectedConversation || undefined,
  });

  // Mock data for demonstration (replace with actual API call)
  useEffect(() => {
    setTimeout(() => {
      setConversations([
        {
          userId: "1",
          userName: "John Smith",
          userAvatar: undefined,
          lastMessage: "Is this property still available?",
          lastMessageTime: "2 min ago",
          unreadCount: 2,
          isOnline: true,
        },
        {
          userId: "2",
          userName: "Sarah Johnson",
          userAvatar: undefined,
          lastMessage: "Thank you for the information!",
          lastMessageTime: "1 hour ago",
          unreadCount: 0,
          isOnline: false,
        },
        {
          userId: "3",
          userName: "Michael Brown",
          userAvatar: undefined,
          lastMessage: "Can we schedule a viewing?",
          lastMessageTime: "3 hours ago",
          unreadCount: 1,
          isOnline: true,
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  // Update online status from real-time data
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        isOnline: onlineUsers.has(conv.userId),
      }))
    );
  }, [onlineUsers]);

  // Merge real-time messages with local messages
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      setLocalMessages((prev) => {
        const merged = [...prev];
        realtimeMessages.forEach((rtMsg) => {
          if (!merged.find((m) => m.id === rtMsg.id)) {
            merged.push(rtMsg);
          }
        });
        return merged.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    }
  }, [realtimeMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && localMessages.length > 0) {
      const unreadMessageIds = localMessages
        .filter((msg) => !msg.isRead && msg.senderId !== currentUserId)
        .map((msg) => msg.id);

      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [selectedConversation, localMessages, currentUserId, markAsRead]);

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    // TODO: Fetch messages from API
    setLocalMessages([
      {
        id: "1",
        senderId: userId,
        receiverId: currentUserId,
        message: "Hi, I'm interested in the property at 123 Main St.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sender: {
          id: userId,
          name: conversations.find((c) => c.userId === userId)?.userName || "",
        },
      },
      {
        id: "2",
        senderId: currentUserId,
        receiverId: userId,
        message:
          "Hello! Yes, that property is still available. Would you like to schedule a viewing?",
        isRead: true,
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        sender: {
          id: currentUserId,
          name: "You",
        },
      },
      {
        id: "3",
        senderId: userId,
        receiverId: currentUserId,
        message: "Is this property still available?",
        isRead: false,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        sender: {
          id: userId,
          name: conversations.find((c) => c.userId === userId)?.userName || "",
        },
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    // Send via Socket.IO if connected, otherwise fallback to API
    if (isConnected) {
      sendMessage({
        receiverId: selectedConversation,
        message: messageText.trim(),
      });
    } else {
      // Fallback: Add to local state (would normally call API)
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: currentUserId,
        receiverId: selectedConversation,
        message: messageText.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUserId,
          name: "You",
        },
      };
      setLocalMessages([...localMessages, newMessage]);
    }

    setMessageText("");
    sendTyping(false);
  };

  const handleTyping = (value: string) => {
    setMessageText(value);

    // Send typing indicator
    if (value.trim()) {
      sendTyping(true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 3000);
    } else {
      sendTyping(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUser = conversations.find(
    (c) => c.userId === selectedConversation
  );

  const isUserTyping = selectedConversation && typingUsers.has(selectedConversation);

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14 md:pt-0">
      {/* Connection Status Indicator */}
      {authToken && (
        <div className="fixed top-16 right-4 z-50 md:top-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <Circle
              className={`h-2 w-2 ${
                isConnected ? "fill-emerald-500" : "fill-amber-500"
              }`}
            />
            {isConnected ? "Connected" : "Connecting..."}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto h-[calc(100vh-3.5rem)] md:h-screen md:p-6">
        <div className="h-full bg-white rounded-none md:rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
          {/* Conversations List */}
          <div
            className={`${
              selectedConversation ? "hidden md:flex" : "flex"
            } w-full md:w-80 border-r flex-col`}
          >
            {/* Header */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">
                Messages
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-neutral-500">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => handleSelectConversation(conv.userId)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b ${
                      selectedConversation === conv.userId
                        ? "bg-primary/5"
                        : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {conv.userName.charAt(0)}
                        </span>
                      </div>
                      {conv.isOnline && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-emerald-500 text-emerald-500 ring-2 ring-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm text-neutral-900 truncate">
                          {conv.userName}
                        </h3>
                        <span className="text-xs text-neutral-500 flex-shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`${
              selectedConversation ? "flex" : "hidden md:flex"
            } flex-1 flex-col`}
          >
            {selectedConversation && selectedUser ? (
              <>
                {/* Chat Header - Fixed */}
                <div className="p-4 border-b flex items-center gap-3 bg-white">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="text-base font-semibold text-primary">
                        {selectedUser.userName.charAt(0)}
                      </span>
                    </div>
                    {selectedUser.isOnline && (
                      <Circle className="absolute bottom-0 right-0 h-2.5 w-2.5 fill-emerald-500 text-emerald-500 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900">
                      {selectedUser.userName}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {selectedUser.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {localMessages.map((msg) => {
                    const isSent = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isSent
                              ? "bg-gradient-to-r from-primary to-[#7c85d8] text-white"
                              : "bg-white border border-neutral-200 text-neutral-900"
                          } rounded-2xl px-4 py-2.5 shadow-sm`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              isSent ? "text-white/70" : "text-neutral-500"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isSent && (
                              <>
                                {msg.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isUserTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-2.5 shadow-sm">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input - Fixed */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-primary to-[#7c85d8] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">
                    Choose a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
