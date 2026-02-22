"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, ArrowLeft, Circle } from "lucide-react";

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
    <div className="h-screen bg-neutral-50 flex flex-col">
      <div className="flex-1 flex flex-col md:max-w-7xl md:mx-auto md:px-6 md:py-6 overflow-hidden">
        <div className="flex-1 bg-white md:rounded-xl border border-neutral-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
          {/* Conversations List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col ${selectedConversation && "hidden md:flex"}`}>
            {/* Header */}
            <div className="p-5 border-b border-neutral-100">
              <h1 className="text-xl font-semibold text-neutral-900 mb-4">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 bg-neutral-50 text-neutral-900 transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-transparent"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-6">
                  <MessageCircle className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => handleSelectConversation(conv.userId)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${
                      selectedConversation === conv.userId ? "bg-neutral-50" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center text-white font-medium text-sm">
                        {conv.userName.charAt(0)}
                      </div>
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm text-neutral-900 truncate">{conv.userName}</h3>
                        <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-600 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
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
          <div className={`flex-1 flex flex-col ${!selectedConversation && "hidden md:flex"}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-neutral-700" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-500 flex items-center justify-center text-white font-medium">
                      {conversations.find(c => c.userId === selectedConversation)?.userName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm text-neutral-900">
                        {conversations.find(c => c.userId === selectedConversation)?.userName}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Circle className={`h-2 w-2 ${conversations.find(c => c.userId === selectedConversation)?.isOnline ? "fill-green-500 text-green-500" : "fill-neutral-400 text-neutral-400"}`} />
                        <span>{conversations.find(c => c.userId === selectedConversation)?.isOnline ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50">
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === "current-user";
                    return (
                      <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] md:max-w-[60%]`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 ${
                              isCurrentUser
                                ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                                : "bg-white border border-neutral-200 text-neutral-900"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.messageText}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1.5 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                            <span className="text-xs text-neutral-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-neutral-100 bg-white">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
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
                        className="w-full px-4 py-3 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 bg-neutral-50 resize-none transition-all"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 hover:brightness-110 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-neutral-50">
                <div className="text-center max-w-sm px-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                    <MessageCircle className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Choose a conversation from the list to start messaging
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
