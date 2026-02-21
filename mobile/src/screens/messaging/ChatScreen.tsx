import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text, Avatar, IconButton, Appbar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  };
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userName, setUserName] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    setUserName('John Smith');
    setIsOnline(true);
    setMessages([
      {
        id: '1',
        senderId: userId,
        receiverId: 'current-user',
        messageText: "Hi, I'm interested in the property at 123 Main St.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        sender: {
          id: userId,
          name: 'John Smith',
        },
      },
      {
        id: '2',
        senderId: 'current-user',
        receiverId: userId,
        messageText:
          'Hello! Yes, that property is still available. Would you like to schedule a viewing?',
        isRead: true,
        createdAt: new Date(Date.now() - 3000000).toISOString(),
        sender: {
          id: 'current-user',
          name: 'You',
        },
      },
      {
        id: '3',
        senderId: userId,
        receiverId: 'current-user',
        messageText: 'Is this property still available?',
        isRead: false,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        sender: {
          id: userId,
          name: 'John Smith',
        },
      },
    ]);
  }, [userId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: userId,
      messageText: messageText.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: 'current-user',
        name: 'You',
      },
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === 'current-user';

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
          ]}
        >
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          )}
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.messageTextRight : styles.messageTextLeft,
            ]}
          >
            {item.messageText}
          </Text>
        </View>
        <View style={[styles.messageFooter, isCurrentUser && styles.messageFooterRight]}>
          <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
          {isCurrentUser && (
            <Icon
              name={item.isRead ? 'check-all' : 'check'}
              size={14}
              color={item.isRead ? '#3b82f6' : '#999'}
              style={styles.checkIcon}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <View style={styles.headerContent}>
          <Avatar.Text size={40} label={userName.charAt(0)} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerStatus}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <IconButton
            icon="image"
            size={24}
            iconColor="#666"
            onPress={() => {}}
            style={styles.iconButton}
          />
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            activeOpacity={0.7}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f5',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#6366f1',
  },
  headerText: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '75%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: '#1a1a2e',
  },
  messageTextRight: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  messageFooterRight: {
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  checkIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iconButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 14,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
