import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { colors, spacing, radius, typography } from '../../theme/tokens';
import { MotiView } from 'moti';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
}

export default function ChatRoomScreen() {
  const { id: activeThread } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('creator');
  const [partnerName, setPartnerName] = useState<string>('Chat');
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
        if (profile) setUserRole(profile.role);
        // Try to get partner name
        const { data: partnerProfile } = await supabase.from('profiles').select('full_name,first_name,last_name').eq('user_id', activeThread).maybeSingle();
        if (partnerProfile) {
          setPartnerName(partnerProfile.full_name || `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim() || 'Chat');
        }
        loadMessages(user.id);
      } else {
        setUserId('mock_user_id');
        loadMessages('mock_user_id');
      }
    };
    init();
  }, [activeThread]);

  const loadMessages = async (uid: string) => {
    if (!activeThread) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${uid},receiver_id.eq.${activeThread}),and(sender_id.eq.${activeThread},receiver_id.eq.${uid})`)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setMessages(data as Message[]);
      } else {
        throw new Error(error?.message || 'Missing table');
      }
    } catch (e) {
      console.log('Error loading messages, using mock state');
      setMessages([]); // Start empty if missing table
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeThread || !userId) return;
    setSending(true);
    
    const tempMsg: Message = {
      id: `msg_mock_${Date.now()}`,
      sender_id: userId,
      receiver_id: activeThread,
      message: newMsg.trim(),
      created_at: new Date().toISOString(),
      is_read: true,
      sender_name: userRole === 'brand' ? 'Brand' : 'Creator',
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: userId, receiver_id: activeThread, message: newMsg.trim() })
        .select('*')
        .single();
        
      if (error) {
        console.log('Insert failed, falling back to local state:', error.message);
        setMessages(prev => [...prev, tempMsg]);
      } else {
        setMessages(prev => [...prev, data as Message]);
      }
    } catch (e) {
      console.log('Error inserting message, using local state');
      setMessages(prev => [...prev, tempMsg]);
    }
    
    setNewMsg('');
    setSending(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === userId;
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
        <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable accessibilityLabel="back" onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{partnerName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={40} color={colors.border} />
              <Text style={styles.emptyText}>Send a message to start chatting</Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMsg}
            onChangeText={setNewMsg}
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Pressable style={styles.sendBtn} onPress={sendMessage} disabled={sending || !newMsg.trim()}>
            <Feather name="send" size={20} color={!newMsg.trim() ? 'rgba(0,0,0,0.3)' : '#0a0a0a'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  messageBubble: {
    maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: spacing.md,
  },
  messageMe: {
    alignSelf: 'flex-end', backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  messageThem: {
    alignSelf: 'flex-start', backgroundColor: colors.surfaceMuted,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextMe: { color: '#ffffff' },
  messageTextThem: { color: colors.textPrimary },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: colors.textMuted, marginTop: spacing.md },
  inputContainer: {
    flexDirection: 'row', padding: spacing.md, borderTopWidth: 1,
    borderTopColor: colors.border, backgroundColor: colors.background, alignItems: 'flex-end',
  },
  input: {
    flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radius.pill,
    paddingHorizontal: spacing.md, paddingTop: 12, paddingBottom: 12,
    minHeight: 44, maxHeight: 100, color: colors.textPrimary,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff',
    justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm,
  },
});
