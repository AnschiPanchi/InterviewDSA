import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    BookOpen, Zap, HelpCircle, Bug, CheckCircle2, 
    ArrowLeft, Loader2, Sparkles, ChevronRight 
} from 'lucide-react';

const TopicStudy = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(true);
    const [guide, setGuide] = useState(null);
    const [activeTab, setActiveTab] = useState('theory');
    const [showSolution, setShowSolution] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const t = params.get('topic');
        if (t) {
            setTopic(t);
            fetchGuide(t);
        } else {
            navigate('/practice');
        }
    }, [location.search]);

    const fetchGuide = async (t) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/study-guide`, { topic: t }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuide(res.data);
        } catch (err) {
            console.error("Failed to fetch study guide:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="animate-pulse" style={{ padding: '1.5rem', background: 'rgba(124,58,237,0.1)', borderRadius: '20px' }}>
                    <BookOpen size={48} color="var(--violet-light)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3>Forging Study Guide...</h3>
                    <p className="text-muted">Analyzing key patterns for {topic}</p>
                </div>
            </div>
        );
    }

    if (!guide) return <div className="container">Error loading study guide.</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="slide-up">
                <button 
                    className="btn btn-ghost" 
                    onClick={() => navigate('/practice')}
                    style={{ marginBottom: '2rem', gap: '0.5rem', padding: 0 }}
                >
                    <ArrowLeft size={16} /> Back to Practice Hub
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'inline-flex', padding: '0.6rem 1rem', background: 'var(--violet-dim)', borderRadius: '10px', color: 'var(--violet-light)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                            Deep Dive Module
                        </div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{guide.topic} <span className="text-gradient">Mastery</span></h2>
                        <p className="text-muted">Master the core concepts before jumping into the mock interview.</p>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => navigate(`/setup?topic=${guide.topic}`)}
                        style={{ padding: '1rem 2rem', gap: '0.75rem' }}
                    >
                        <Zap size={18} /> Start Mock Interview
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                    {[
                        { id: 'theory', label: 'Core Theory', icon: <BookOpen size={16} /> },
                        { id: 'concepts', label: 'Interview Q&A', icon: <HelpCircle size={16} /> },
                        { id: 'challenge', label: 'Micro-Challenge', icon: <Bug size={16} /> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{ gap: '0.6rem', padding: '0.6rem 1.25rem' }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="glass-panel" style={{ padding: '2.5rem' }}>
                    {activeTab === 'theory' && (
                        <div className="slide-up">
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {guide.cheatSheet?.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>{i + 1}</div>
                                        <div>
                                            <h4 style={{ color: 'var(--violet-light)', marginBottom: '0.5rem' }}>{item.concept}</h4>
                                            <p style={{ color: 'var(--text-sub)', lineHeight: 1.7, fontSize: '1rem' }}>{item.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'concepts' && (
                        <div className="slide-up" style={{ display: 'grid', gap: '1.5rem' }}>
                            {guide.interviewQuestions?.map((q, i) => (
                                <div key={i} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        <HelpCircle size={18} /> Q{i + 1}: {q.question}
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid var(--violet-light)', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                        <span style={{ color: 'var(--violet-light)', fontWeight: 800, marginRight: '0.5rem' }}>A:</span>
                                        {q.answer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'challenge' && (
                        <div className="slide-up">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Bug size={18} color="var(--danger)" /> Spot the Bug
                                </h4>
                                <p className="text-muted">There is a logical error in the snippet below. Can you find it?</p>
                            </div>
                            
                            <div style={{ position: 'relative' }}>
                                <pre style={{ 
                                    background: '#0f172a', 
                                    padding: '1.5rem', 
                                    borderRadius: '12px', 
                                    color: '#e2e8f0', 
                                    fontSize: '0.9rem', 
                                    lineHeight: 1.6,
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    overflowX: 'auto'
                                }}>
                                    <code>{guide.microChallenge?.snippet}</code>
                                </pre>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button 
                                    className={`btn ${showSolution ? 'btn-success' : 'btn-outline'}`}
                                    onClick={() => setShowSolution(!showSolution)}
                                >
                                    {showSolution ? 'Hide Solution' : 'Reveal Hint & Solution'}
                                </button>
                                {showSolution && (
                                    <div className="fade-in" style={{ flex: 1, padding: '1rem 1.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 700, marginBottom: '0.25rem' }}>Fix:</div>
                                        <p style={{ fontSize: '0.95rem', margin: 0 }}>{guide.microChallenge?.solution}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Next Action */}
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <div className="section-label">Completed the module?</div>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => navigate(`/setup?topic=${guide.topic}`)}
                        style={{ padding: '1.25rem 3rem', fontSize: '1.1rem', gap: '0.75rem' }}
                    >
                        Ready for the Interview <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopicStudy;
