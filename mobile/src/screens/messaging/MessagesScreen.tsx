import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Text, Title, Searchbar, Avatar, Badge, IconButton, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function MessagesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setConversations([
        {
          userId: '1',
          userName: 'John Smith',
          userAvatar: undefined,
          lastMessage: 'Is this property still available?',
          lastMessageTime: '2 min ago',
          unreadCount: 2,
          isOnline: true,
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          userAvatar: undefined,
          lastMessage: 'Thank you for the information!',
          lastMessageTime: '1 hour ago',
          unreadCount: 0,
          isOnline: false,
        },
        {
          userId: '3',
          userName: 'Michael Brown',
          userAvatar: undefined,
          lastMessage: 'Can we schedule a viewing?',
          lastMessageTime: '3 hours ago',
          unreadCount: 1,
          isOnline: true,
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredConversations = conversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationPress = (userId: string) => {
    navigation.navigate('Chat' as never, { userId } as never);
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.userId)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.userAvatar ? (
          <Avatar.Image size={56} source={{ uri: item.userAvatar }} />
        ) : (
          <Avatar.Text size={56} label={item.userName.charAt(0)} style={styles.avatar} />
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={styles.timestamp}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <Badge size={20} style={styles.unreadBadge}>
              {item.unreadCount}
            </Badge>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Messages</Title>
        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="message-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start chatting with property owners
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.userId}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    backgroundColor: '#fff',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    backgroundColor: '#6366f1',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#1a1a2e',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#6366f1',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
