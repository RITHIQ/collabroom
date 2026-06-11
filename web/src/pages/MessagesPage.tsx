/**
 * MessagesPage.tsx
 * Messages page — real conversations UI using Supabase with mock data fallback.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAppSelector } from '../store';
import toast from 'react-hot-toast';
import { shouldUseMockCatalog } from '../lib/mockAuth';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
  receiver_name?: string;
}

interface Thread {
  otherId: string;
  otherName: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

// ─── Mock Messages Data ───────────────────────────────────────────────────────
const MOCK_MESSAGES: Message[] = [
  { id: 'msg_1', sender_id: 'brand_mamaearth', receiver_id: 'creator_demo', message: 'Hi! We loved your recent content. Would you be interested in collaborating with us?', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), is_read: true },
  { id: 'msg_2', sender_id: 'creator_demo', receiver_id: 'brand_mamaearth', message: 'Thank you so much! I\'m definitely interested. Can you tell me more about the campaign?', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(), is_read: true },
  { id: 'msg_3', sender_id: 'brand_mamaearth', receiver_id: 'creator_demo', message: 'Great! We\'re launching a new sustainable skincare line. Budget is ₹80K-₹120K for 4 reels and 2 stories.', created_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(), is_read: true },
  { id: 'msg_4', sender_id: 'creator_demo', receiver_id: 'brand_mamaearth', message: 'Sounds perfect! That aligns with my brand values. When would the campaign start?', created_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), is_read: true },

  { id: 'msg_5', sender_id: 'brand_boat', receiver_id: 'creator_demo', message: 'Your audio reviews are amazing! Interested in featuring our new wireless earbuds?', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), is_read: true },
  { id: 'msg_6', sender_id: 'creator_demo', receiver_id: 'brand_boat', message: 'Always happy to work with boAt! What\'s the scope?', created_at: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000).toISOString(), is_read: true },
  { id: 'msg_7', sender_id: 'brand_boat', receiver_id: 'creator_demo', message: 'We need: 1 unboxing video (YouTube), 5 TikTok shorts, 3 reels. ₹1,25,000 total. 2-week turnaround.', created_at: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(), is_read: true },

  { id: 'msg_8', sender_id: 'brand_zomato', receiver_id: 'creator_demo', message: 'We\'re running a regional campaign! Check DM for details.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), is_read: false },
  { id: 'msg_9', sender_id: 'brand_zomato', receiver_id: 'creator_demo', message: 'Campaign: Monsoon Food Fest. We need 6 trending food videos. Budget: ₹1,50,000', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), is_read: false },

  { id: 'msg_10', sender_id: 'brand_myntra', receiver_id: 'creator_demo', message: 'Summer collection launch next month. Interested?', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), is_read: false },
];

export default function MessagesPage() {
  const { user } = useAppSelector(s => s.auth);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // ─── Load Mock Messages ────────────────────────────────────────────────────
  const processMockMessages = () => {
    const userId = user?.id || 'creator_demo';
    
    const getMockMessages = () => MOCK_MESSAGES.map(m => ({
      ...m,
      sender_id: m.sender_id === 'creator_demo' ? userId : m.sender_id,
      receiver_id: m.receiver_id === 'creator_demo' ? userId : m.receiver_id
    }));

    // Group by conversation partner
    const byOther: Record<string, Message[]> = {};
    for (const m of getMockMessages()) {
      const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!byOther[otherId]) byOther[otherId] = [];
      byOther[otherId].push(m);
    }

    const threadList: Thread[] = Object.entries(byOther).map(([otherId, msgs]) => {
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter(m => m.receiver_id === userId && !m.is_read).length;
      
      // Create human-readable names from partner IDs
      const nameMap: Record<string, string> = {
        'brand_mamaearth': 'Mamaearth',
        'brand_boat': 'boAt',
        'brand_zomato': 'Zomato',
        'brand_myntra': 'Myntra',
      };
      
      const otherName = nameMap[otherId] || otherId.slice(0, 8);
      return { otherId, otherName, lastMessage: last.message, lastAt: last.created_at, unread };
    });

    // Sort by date descending
    threadList.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
    setThreads(threadList);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    const loadThreads = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          // Group by conversation partner
          const byOther: Record<string, Message[]> = {};
          for (const m of data as Message[]) {
            const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
            if (!byOther[otherId]) byOther[otherId] = [];
            byOther[otherId].push(m);
          }

          const threadList: Thread[] = Object.entries(byOther).map(([otherId, msgs]) => {
            const last = msgs[0];
            const unread = msgs.filter(m => m.receiver_id === user.id && !m.is_read).length;
            const otherName = (last.sender_id === otherId ? last.sender_name : last.receiver_name) || otherId.slice(0, 8);
            return { otherId, otherName, lastMessage: last.message, lastAt: last.created_at, unread };
          });

          setThreads(threadList);
          setLoading(false);
        } else {
          // Use mock data as fallback
          processMockMessages();
        }
      } catch (error) {
        console.log('Using mock messages as fallback');
        processMockMessages();
      }
    };
    void loadThreads();
  }, [user?.id]);

  const loadMessages = async (otherId: string) => {
    if (!user?.id) return;
    setActiveThread(otherId);
    
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setMessages((data as Message[]) || []);
        // Mark as read
        await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('sender_id', otherId);
        setThreads(prev => prev.map(t => t.otherId === otherId ? { ...t, unread: 0 } : t));
      } else {
        const mockMsgs = MOCK_MESSAGES.map(m => ({
          ...m,
          sender_id: m.sender_id === 'creator_demo' ? user.id : m.sender_id,
          receiver_id: m.receiver_id === 'creator_demo' ? user.id : m.receiver_id
        })).filter(m => 
          (m.sender_id === user.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user.id)
        );
        setMessages(mockMsgs);
        setThreads(prev => prev.map(t => t.otherId === otherId ? { ...t, unread: 0 } : t));
      }
    } catch (error) {
      console.log('Using mock messages');
      const mockMsgs = MOCK_MESSAGES.map(m => ({
        ...m,
        sender_id: m.sender_id === 'creator_demo' ? user.id : m.sender_id,
        receiver_id: m.receiver_id === 'creator_demo' ? user.id : m.receiver_id
      })).filter(m => 
        (m.sender_id === user.id && m.receiver_id === otherId) ||
        (m.sender_id === otherId && m.receiver_id === user.id)
      );
      setMessages(mockMsgs);
      setThreads(prev => prev.map(t => t.otherId === otherId ? { ...t, unread: 0 } : t));
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeThread || !user?.id) return;
    setSending(true);
    
    const tempMsg: Message = {
      id: `msg_mock_${Date.now()}`,
      sender_id: user.id,
      receiver_id: activeThread,
      message: newMsg.trim(),
      created_at: new Date().toISOString(),
      is_read: true,
      sender_name: user.role === 'brand' ? 'Brand Name' : 'Creator Name'
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ sender_id: user.id, receiver_id: activeThread, message: newMsg.trim() })
        .select('*')
        .single();
        
      if (error) {
        // Fallback to local state if table doesn't exist
        console.log('Insert failed, falling back to local state:', error.message);
        setMessages(prev => [...prev, tempMsg]);
      } else {
        setMessages(prev => [...prev, data as Message]);
      }
    } catch (e) {
      console.log('Error inserting message, using local state');
      setMessages(prev => [...prev, tempMsg]);
    }
    
    // Also update the thread list lastMessage
    setThreads(prev => prev.map(t => 
      t.otherId === activeThread 
        ? { ...t, lastMessage: newMsg.trim(), lastAt: new Date().toISOString() } 
        : t
    ).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()));
    
    setNewMsg('');
    setSending(false);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Thread list */}
      <div style={{ width: 320, borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 12 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="input" placeholder="Search conversations…" style={{ paddingLeft: 30, fontSize: '0.85rem' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 16 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10, marginBottom: 10 }} />)}
            </div>
          ) : threads.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: '0.88rem' }}>No messages yet</p>
            </div>
          ) : (
            threads.map(t => (
              <div key={t.otherId} onClick={() => loadMessages(t.otherId)}
                style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: activeThread === t.otherId ? 'rgba(108,62,244,0.06)' : 'transparent', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (activeThread !== t.otherId) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-secondary)'; }}
                onMouseLeave={e => { if (activeThread !== t.otherId) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ width: 38, height: 38, flexShrink: 0 }}>{t.otherName[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: t.unread > 0 ? 700 : 500, fontSize: '0.88rem', marginBottom: 3 }}>{t.otherName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.lastMessage}</div>
                  </div>
                  {t.unread > 0 && <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: 'var(--color-primary)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{t.unread}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message area */}
      {activeThread ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)', fontWeight: 700 }}>
            Conversation
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map(m => {
              const isMine = m.sender_id === user?.id;
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMine ? 'var(--color-primary)' : 'var(--color-bg-card)', color: isMine ? '#fff' : 'var(--color-text-primary)', border: isMine ? 'none' : '1px solid var(--color-border)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {m.message}
                    <div style={{ fontSize: '0.68rem', opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                      {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10 }}>
            <input className="input" placeholder="Type a message…" value={newMsg} onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMsg.trim()}>
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          <MessageSquare size={56} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontWeight: 600, fontSize: '1rem' }}>Select a conversation</p>
          <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Choose from the list on the left</p>
        </div>
      )}
    </div>
  );
}
