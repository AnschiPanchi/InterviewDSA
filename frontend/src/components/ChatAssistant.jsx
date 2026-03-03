import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';

const ChatAssistant = ({ question }) => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm your AI mentor for this session. I can help you think through **${question?.title || 'this problem'}** — just ask! I won't give you the answer directly, but I'll guide your thinking. 🤔`,
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg = { role: 'user', content: trimmed };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/chat`, {
                question,
                message: trimmed,
                history: messages.slice(-6), // send last 6 turns for context
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the AI. Try again!" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(o => !o)}
                title="Chat with AI Mentor"
                style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 900,
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: open ? 'rgba(30,41,59,0.9)' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    border: 'none', cursor: 'pointer', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
                    transition: 'all 0.3s ease',
                    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
                {!open && messages.length > 1 && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        backgroundColor: 'var(--success)', fontSize: '0.65rem',
                        fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--bg-dark)',
                    }}>
                        {messages.filter(m => m.role === 'assistant').length}
                    </span>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 900,
                    width: '360px', maxHeight: '480px',
                    display: 'flex', flexDirection: 'column',
                    background: 'rgba(15,23,42,0.96)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.2s ease',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '0.875rem 1rem',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.1))',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bot size={16} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>AI Mentor</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--success)' }}>● Online</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                <div style={{
                                    maxWidth: '85%', padding: '0.6rem 0.875rem',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    backgroundColor: msg.role === 'user' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)',
                                    border: msg.role === 'user' ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    fontSize: '0.825rem', lineHeight: 1.55,
                                    whiteSpace: 'pre-wrap',
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '0.6rem 0.875rem',
                                    borderRadius: '16px 16px 16px 4px',
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex', gap: '4px', alignItems: 'center',
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{
                                            width: '6px', height: '6px', borderRadius: '50%',
                                            backgroundColor: 'var(--primary)',
                                            animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', gap: '0.5rem',
                    }}>
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask your mentor anything..."
                            rows={1}
                            style={{
                                flex: 1, resize: 'none',
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '0.5rem 0.75rem',
                                color: 'var(--text-main)', fontSize: '0.825rem',
                                fontFamily: 'inherit', outline: 'none',
                                maxHeight: '80px', overflowY: 'auto',
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            style={{
                                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                background: input.trim() && !loading ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.08)',
                                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatAssistant;
