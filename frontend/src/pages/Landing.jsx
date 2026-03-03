import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Zap, Shield, Clock, Trophy, ArrowRight, Code2, Sparkles } from 'lucide-react';

const FEATURES = [
    { icon: <BrainCircuit size={24} />, color: '#8b5cf6', title: 'AI-Generated Questions', desc: 'Fresh DSA problems every session, tailored to your chosen topic and difficulty.' },
    { icon: <Sparkles size={24} />, color: '#ec4899', title: 'Instant AI Feedback', desc: 'Get scored on correctness, complexity, and code quality the moment you submit.' },
    { icon: <BarChart3 size={24} />, color: '#10b981', title: 'Progress Dashboard', desc: 'Heatmap calendar, score trends, and weak spot detection all in one place.' },
    { icon: <Clock size={24} />, color: '#f59e0b', title: 'Timed Sessions', desc: 'Practice under real interview pressure with configurable timers and Time\'s Up alerts.' },
    { icon: <Trophy size={24} />, color: '#f59e0b', title: 'Leaderboard', desc: 'Compete with other engineers and climb the global rankings.' },
    { icon: <Zap size={24} />, color: '#06b6d4', title: 'AI Hints & Chat', desc: 'Get Socratic nudges or chat with your AI mentor — without spoiling the solution.' },
];

const Landing = () => {
    return (
        <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ── Hero ──────────────────────────────────────────────── */}
            <div style={{ textAlign: 'center', padding: '5rem 2rem 6rem', position: 'relative' }}>
                {/* Background glow blobs */}
                <div style={{
                    position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                    width: '600px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="slide-up">
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.4rem 1rem', borderRadius: '2rem', marginBottom: '1.5rem',
                        background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)',
                        fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa',
                    }}>
                        <Sparkles size={14} /> Powered by Gemini AI
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.25rem', fontWeight: 800 }}>
                        Ace your next{' '}
                        <span className="text-gradient">coding interview</span>
                        <br />with an AI coach
                    </h1>

                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
                        AlgoPrep AI generates real DSA problems, gives you instant AI-powered feedback,
                        and tracks your progress — like LeetCode with a personal coach.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary" style={{
                            textDecoration: 'none', fontSize: '1rem', padding: '0.875rem 2rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                        }}>
                            Start for Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: '1rem', padding: '0.875rem 2rem' }}>
                            Log In
                        </Link>
                    </div>

                    {/* Social proof */}
                    <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        No credit card required • Free to use
                    </p>
                </div>
            </div>

            {/* ── Mock UI preview ───────────────────────────────────── */}
            <div style={{ padding: '0 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    border: '1px solid rgba(139,92,246,0.25)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1)',
                    borderRadius: '16px',
                }}>
                    {/* Fake browser chrome */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
                        {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
                            <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c }} />
                        ))}
                    </div>
                    {/* Fake stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                        {[
                            { label: 'Avg Score', val: '87/100', color: '#10b981' },
                            { label: 'Solved', val: '42 problems', color: '#8b5cf6' },
                            { label: 'Streak', val: '🔥 7 days', color: '#f59e0b' },
                        ].map(({ label, val, color }) => (
                            <div key={label} style={{ padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
                                <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</p>
                                <p style={{ margin: 0, fontWeight: 700, color }}>{val}</p>
                            </div>
                        ))}
                    </div>
                    {/* Fake code editor snippet */}
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.7 }}>
                        <span style={{ color: '#94a3b8' }}>// Two Sum — AI Score: </span><span style={{ color: '#10b981' }}>92/100 ✅</span>
                        <br /><span style={{ color: '#c084fc' }}>function</span> <span style={{ color: '#60a5fa' }}>twoSum</span>(<span style={{ color: '#fb923c' }}>nums, target</span>) {'{'}
                        <br />&nbsp;&nbsp;<span style={{ color: '#c084fc' }}>const</span> map = <span style={{ color: '#c084fc' }}>new</span> <span style={{ color: '#60a5fa' }}>Map</span>();
                        <br />&nbsp;&nbsp;<span style={{ color: '#c084fc' }}>for</span> (<span style={{ color: '#c084fc' }}>let</span> i = <span style={{ color: '#fb923c' }}>0</span>; i {'<'} nums.length; i++) {'{'}
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#94a3b8' }}>// O(n) solution using HashMap</span>
                        <br />&nbsp;&nbsp;{'}'}
                        <br />{'}'}
                    </div>
                </div>
            </div>

            {/* ── Features grid ─────────────────────────────────────── */}
            <div style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Everything you need to <span className="text-gradient">level up</span></h2>
                    <p className="text-muted">Built for engineers who want real interview results, not just practice.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {FEATURES.map(({ icon, color, title, desc }) => (
                        <div key={title} className="glass-panel" style={{
                            padding: '1.5rem',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}30`; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                backgroundColor: `${color}20`, color, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                            }}>
                                {icon}
                            </div>
                            <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{title}</h4>
                            <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CTA Banner ────────────────────────────────────────── */}
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <div className="glass-panel" style={{
                    maxWidth: '680px', margin: '0 auto', padding: '3rem 2rem',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
                    border: '1px solid rgba(139,92,246,0.3)',
                }}>
                    <Code2 size={36} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ marginBottom: '0.75rem' }}>Ready to crush your interviews?</h2>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Join engineers already training with AlgoPrep AI.</p>
                    <Link to="/register" className="btn btn-primary" style={{
                        textDecoration: 'none', fontSize: '1rem', padding: '0.875rem 2.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    }}>
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Landing;
