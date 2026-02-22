"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Image as ImageIcon, Search, ArrowLeft, MoreVertical, Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  imageUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    // Simulate loading messages
    setMessages([
      {
        id: "1",
        senderId: userId,
        receiverId: "current-user",
        messageText: "Hi, I'm interested in the property at 123 Main St.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sender: {
          id: userId,
          name: conversations.find(c => c.userId === userId)?.userName || "",
        },
      },
      {
        id: "2",
        senderId: "current-user",
        receiverId: userId,
        messageText: "Hello! Yes, that property is still available. Would you like to schedule a viewing?",
        isRead: true,
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        sender: {
          id: "current-user",
          name: "You",
        },
      },
      {
        id: "3",
        senderId: userId,
        receiverId: "current-user",
        messageText: "Is this property still available?",
        isRead: false,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        sender: {
          id: userId,
          name: conversations.find(c => c.userId === userId)?.userName || "",
        },
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      receiverId: selectedConversation,
      messageText: messageText.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: "current-user",
        name: "You",
      },
    };

    setMessages([...messages, newMessage]);
    setMessageText("");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-[#f8f8f5] dark:bg-[#1a1a2e]">
      <div className="h-full md:max-w-7xl md:mx-auto md:px-4 md:py-6">
        <div className="bg-white dark:bg-gray-800 md:rounded-lg md:shadow-sm overflow-hidden h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className={`border-r border-gray-200 dark:border-gray-700 flex flex-col ${selectedConversation && "hidden md:flex"}`}>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
                    <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => handleSelectConversation(conv.userId)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        selectedConversation === conv.userId ? "bg-gray-50 dark:bg-gray-700/50" : ""
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                          {conv.userName.charAt(0)}
                        </div>
                        {conv.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{conv.userName}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{conv.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <span className="flex-shrink-0 ml-2 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`md:col-span-2 flex flex-col ${!selectedConversation && "hidden md:flex"}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold">
                        {conversations.find(c => c.userId === selectedConversation)?.userName.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {conversations.find(c => c.userId === selectedConversation)?.userName}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {conversations.find(c => c.userId === selectedConversation)?.isOnline ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.senderId === "current-user";
                      return (
                        <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] ${isCurrentUser ? "order-2" : "order-1"}`}>
                            <div
                              className={`rounded-2xl px-4 py-2.5 ${
                                isCurrentUser
                                  ? "bg-gradient-to-r from-primary to-blue-600 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              {message.imageUrl && (
                                <img src={message.imageUrl} alt="Attachment" className="rounded-lg mb-2 max-w-full" />
                              )}
                              <p className="text-sm">{message.messageText}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.createdAt)}</span>
                              {isCurrentUser && (
                                message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-end gap-2">
                      <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                          style={{ minHeight: "42px", maxHeight: "120px" }}
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="p-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8">
                  <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm text-center">Choose a conversation from the list to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
