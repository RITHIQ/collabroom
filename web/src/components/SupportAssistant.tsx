import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mail, HelpCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { isOpenAiConfigured, openaiChatCompletion } from '../services/openaiClient';
import type { ChatMessage } from '../services/openaiClient';

const SUPPORT_SYSTEM: ChatMessage = {
  role: 'system',
  content: `You are the in-app support assistant for ColabRoom, a platform where brands and creators run campaigns, sign digital contracts, use escrow-style payments, and collaborate in campaign rooms.
Keep replies concise (under 220 words unless the user asks for detail). Use short paragraphs or bullet points. If the user asks for account-specific data you cannot see, explain that and suggest they email support@colabroom.io or use the Contact tab.
Never invent legal advice; for contract disputes suggest consulting a qualified lawyer.`,
};

const CONTACT_SYSTEM = `You help users write a clear, professional email to ColabRoom support (support@colabroom.io).
Output only the email body (greeting, 2–4 short paragraphs, closing). No subject line unless the user asked for one.`;

type Tab = 'help' | 'contact';

export default function SupportAssistant() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('help');
  const [helpInput, setHelpInput] = useState('');
  const [helpMessages, setHelpMessages] = useState<ChatMessage[]>([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [helpMessages, open]);

  const sendHelp = async () => {
    const text = helpInput.trim();
    if (!text) return;
    if (!isOpenAiConfigured()) {
      toast.error('Add VITE_OPENAI_API_KEY in web/.env.local to use AI support.');
      return;
    }
    const nextUser: ChatMessage = { role: 'user', content: text };
    setHelpInput('');
    setHelpMessages((m) => [...m, nextUser]);
    setHelpLoading(true);
    try {
      const reply = await openaiChatCompletion([SUPPORT_SYSTEM, ...helpMessages, nextUser]);
      setHelpMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not reach OpenAI.';
      toast.error(msg);
      setHelpMessages((m) => [...m, { role: 'assistant', content: `Sorry — ${msg}` }]);
    } finally {
      setHelpLoading(false);
    }
  };

  const polishContact = async () => {
    const draft = contactBody.trim();
    if (!draft) {
      toast.error('Write a short note first, then use AI polish.');
      return;
    }
    if (!isOpenAiConfigured()) {
      toast.error('Add VITE_OPENAI_API_KEY in web/.env.local.');
      return;
    }
    setContactLoading(true);
    try {
      const polished = await openaiChatCompletion(
        [
          { role: 'system', content: CONTACT_SYSTEM },
          {
            role: 'user',
            content: `Subject context: ${contactSubject || '(none)'}\n\nMy draft:\n${draft}`,
          },
        ],
        { temperature: 0.3 }
      );
      setContactBody(polished);
      toast.success('Message updated with GPT-4');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OpenAI request failed');
    } finally {
      setContactLoading(false);
    }
  };

  const mailtoHref = () => {
    const s = encodeURIComponent(contactSubject.trim() || 'ColabRoom support request');
    const b = encodeURIComponent(contactBody.trim() || '');
    return `mailto:support@colabroom.io?subject=${s}&body=${b}`;
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label="Help and support"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          right: 22,
          bottom: 22,
          zIndex: 9998,
          width: 54,
          height: 54,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'linear-gradient(135deg, #6C3EF4, #8B5CF6)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 28px rgba(108,62,244,0.45)',
        }}
      >
        <MessageCircle size={24} strokeWidth={2} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: 'rgba(0,0,0,0.35)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              style={{
                position: 'fixed',
                right: 20,
                bottom: 88,
                zIndex: 9999,
                width: 'min(100vw - 32px, 400px)',
                height: 'min(100vh - 120px, 520px)',
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-dropdown)',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(108,62,244,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HelpCircle size={18} color="var(--color-primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Help &amp; support</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    GPT-4 ·{' '}
                    {isOpenAiConfigured()
                      ? import.meta.env.DEV
                        ? 'Dev proxy (see .env.example)'
                        : 'Ready'
                      : 'API key / proxy not set'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                {(
                  [
                    { id: 'help' as const, label: 'Ask AI', icon: <HelpCircle size={15} /> },
                    { id: 'contact' as const, label: 'Contact', icon: <Mail size={15} /> },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      border: 'none',
                      background: tab === t.id ? 'rgba(108,62,244,0.08)' : 'transparent',
                      color: tab === t.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: tab === t.id ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                      marginBottom: -1,
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {tab === 'help' ? (
                <>
                  <div
                    ref={scrollRef}
                    style={{
                      flex: 1,
                      minHeight: 0,
                      overflow: 'auto',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {helpMessages.length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Ask about contracts, campaigns, payments, or how to use ColabRoom. Replies use your configured
                        OpenAI model (default <strong>gpt-4o</strong>).
                      </p>
                    )}
                    {helpMessages.map((msg, i) => (
                      <div
                        key={i}
                        style={{
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          maxWidth: '92%',
                          padding: '10px 12px',
                          borderRadius: 12,
                          fontSize: '0.82rem',
                          lineHeight: 1.55,
                          background:
                            msg.role === 'user' ? 'rgba(108,62,244,0.15)' : 'var(--color-bg-secondary)',
                          color: 'var(--color-text-primary)',
                          border:
                            msg.role === 'user'
                              ? '1px solid rgba(108,62,244,0.25)'
                              : '1px solid var(--color-border)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {helpLoading && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: '0.8rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} />
                        Thinking…
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <input
                      className="input"
                      placeholder="Type your question…"
                      value={helpInput}
                      onChange={(e) => setHelpInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void sendHelp();
                        }
                      }}
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={helpLoading}
                      onClick={() => void sendHelp()}
                      style={{ padding: '0 14px' }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    Draft your message, polish it with GPT-4, then open your mail app to send to{' '}
                    <strong>support@colabroom.io</strong>.
                  </p>
                  <div>
                    <label className="label" style={{ fontSize: '0.75rem' }}>
                      Subject
                    </label>
                    <input
                      className="input"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="What do you need help with?"
                      style={{ marginTop: 4, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minHeight: 120, display: 'flex', flexDirection: 'column' }}>
                    <label className="label" style={{ fontSize: '0.75rem' }}>
                      Message
                    </label>
                    <textarea
                      className="input"
                      value={contactBody}
                      onChange={(e) => setContactBody(e.target.value)}
                      placeholder="Describe your issue or question…"
                      style={{ marginTop: 4, flex: 1, minHeight: 140, resize: 'vertical', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={contactLoading}
                      onClick={() => void polishContact()}
                      style={{ flex: '1 1 auto', justifyContent: 'center', gap: 6 }}
                    >
                      {contactLoading ? <Loader2 size={14} style={{ animation: 'spin 0.9s linear infinite' }} /> : null}
                      Polish with GPT-4
                    </button>
                    <a className="btn btn-primary btn-sm" href={mailtoHref()} style={{ flex: '1 1 auto', justifyContent: 'center', textDecoration: 'none' }}>
                      Open email app
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
