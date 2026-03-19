import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    BrainCircuit, BarChart3, Zap, Clock, Trophy, ArrowRight,
    Code2, Sparkles, Swords, Radar, Briefcase, CheckCircle2,
    Star, TrendingUp, Target, Users
} from 'lucide-react';

const FEATURES = [
    {
        icon: <BrainCircuit size={22} />, gradient: 'linear-gradient(135deg,#7c3aed,#9333ea)',
        glow: 'rgba(124,58,237,0.35)',
        title: 'AI Mock Interviews', desc: 'Fresh DSA problems every session. Get scored on correctness, complexity, and code quality instantly.'
    },
    {
        icon: <Swords size={22} />, gradient: 'linear-gradient(135deg,#db2777,#e11d48)',
        glow: 'rgba(219,39,119,0.35)',
        title: 'Code Duel (1v1)', desc: 'Battle peers in real-time. Write O(n) code and beat opponents who solve it in O(n²) — quality wins.'
    },
    {
        icon: <Radar size={22} />, gradient: 'linear-gradient(135deg,#0891b2,#7c3aed)',
        glow: 'rgba(6,182,212,0.3)',
        title: 'Talent Analytics', desc: 'Radar chart your "Talent DNA" across DP, Recursion, Trees, and more. Show recruiters proof of skill.'
    },
    {
        icon: <Target size={22} />, gradient: 'linear-gradient(135deg,#059669,#0891b2)',
        glow: 'rgba(16,185,129,0.3)',
        title: 'The Forge', desc: 'Upload your resume. Set your target role. The platform becomes your custom career coach.'
    },
    {
        icon: <Zap size={22} />, gradient: 'linear-gradient(135deg,#d97706,#db2777)',
        glow: 'rgba(217,119,6,0.3)',
        title: 'Dashboard Oracle', desc: 'A persistent AI mentor sidebar for 24/7 technical mentorship and code explanation.'
    },
    {
        icon: <Briefcase size={22} />, gradient: 'linear-gradient(135deg,#7c3aed,#0891b2)',
        glow: 'rgba(124,58,237,0.3)',
        title: 'Smart Job Match', desc: 'Find roles you\'re statistically likely to land. AI compares your Talent DNA against live job listings.'
    },
];

const STATS = [
    { value: '50K+', label: 'Problems Generated', icon: <Code2 size={18} /> },
    { value: '98%', label: 'Interview Ready', icon: <CheckCircle2 size={18} /> },
    { value: '4.9★', label: 'User Rating', icon: <Star size={18} /> },
    { value: '3x', label: 'Faster Prep', icon: <TrendingUp size={18} /> },
];

const Landing = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (!heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
            const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 20;
            heroRef.current.style.setProperty('--mx', `${x}px`);
            heroRef.current.style.setProperty('--my', `${y}px`);
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    return (
        <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

            {/* ══ HERO ══════════════════════════════════════════════════ */}
            <section ref={heroRef} style={{ padding: '7rem 2rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative blob ring */}
                <div style={{
                    position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
                    width: '900px', height: '600px', borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none', filter: 'blur(40px)',
                }} />
                <div style={{
                    position: 'absolute', top: '20%', left: '10%',
                    width: '300px', height: '300px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(219,39,119,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none', filter: 'blur(50px)',
                }} />
                <div style={{
                    position: 'absolute', top: '30%', right: '8%',
                    width: '250px', height: '250px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)',
                    pointerEvents: 'none', filter: 'blur(40px)',
                }} />

                <div className="slide-up" style={{ position: 'relative', zIndex: 1, maxWidth: '850px', margin: '0 auto' }}>
                    <div className="feature-chip" style={{ marginBottom: '2rem' }}>
                        <Sparkles size={13} /> Powered by Google Gemini AI
                    </div>

                    <h1 style={{ fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '1.5rem', lineHeight: 1.05 }}>
                        Stop Practicing.
                        <br />
                        Start <span className="text-gradient">Winning Offers.</span>
                    </h1>

                    <p style={{ fontSize: 'clamp(1.05rem,2vw,1.25rem)', color: 'var(--text-sub)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
                        AlgoPrep AI turns practice into career proof. Code Duels, Talent DNA analytics,
                        personalized coaching — everything a top-tier engineer needs.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <Link to="/register" className="btn btn-primary btn-xl" style={{ textDecoration: 'none', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
                            Start for Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-ghost btn-xl" style={{ textDecoration: 'none' }}>
                            Log In
                        </Link>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No credit card required • Free to use</p>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0', maxWidth: '700px', margin: '4rem auto 0', animation: 'fadeUp 0.5s 0.2s var(--ease) both' }}>
                    {STATS.map(({ value, label, icon }, i) => (
                        <div key={label} style={{
                            flex: 1, padding: '1.2rem 0.5rem', textAlign: 'center',
                            borderRight: i < STATS.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{ color: 'var(--violet-light)', marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{value}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ MOCK UI PREVIEW ══════════════════════════════════════ */}
            <section style={{ padding: '2rem 2rem 5rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="glass-panel" style={{
                    padding: '1.5rem 1.75rem',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: '0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    background: 'rgba(13,17,23,0.85)',
                }}>
                    {/* Browser chrome */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                        {['#ef4444','#f59e0b','#10b981'].map((c, i) => (
                            <div key={i} style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: c, opacity: 0.9 }} />
                        ))}
                        <div style={{
                            flex: 1, height: '26px', marginLeft: '8px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', paddingLeft: '10px',
                            fontSize: '0.7rem', color: 'var(--text-muted)',
                        }}>
                            algoprep.ai/app
                        </div>
                    </div>

                    {/* Dashboard preview content */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                        {[
                            { label: 'Avg Score', val: '87/100', color: 'var(--violet-light)', bg: 'rgba(124,58,237,0.1)' },
                            { label: 'Problems Solved', val: '142', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
                            { label: 'Duel Wins', val: '28', color: 'var(--cyan)', bg: 'rgba(6,182,212,0.1)' },
                            { label: 'Streak', val: '🔥 14d', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
                        ].map(({ label, val, color, bg }) => (
                            <div key={label} style={{
                                padding: '0.85rem 1rem', borderRadius: '10px',
                                background: bg, border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, margin: '0 0 0.35rem' }}>{label}</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color, margin: 0, letterSpacing: '-0.02em' }}>{val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Code editor snippet */}
                    <div style={{
                        background: 'rgba(0,0,0,0.5)', borderRadius: '10px',
                        padding: '1rem 1.25rem', fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.8rem', lineHeight: 1.8, border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{'// Two Sum — AI Judge: '}</span>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Score 94/100 ✅ O(n) complexity detected</span>
                        </div>
                        <div><span style={{ color: '#c084fc' }}>function </span><span style={{ color: '#60a5fa' }}>twoSum</span><span style={{ color: '#f8fafc' }}>({'('}nums, target{')'}) {'{'}</span></div>
                        <div>&nbsp;&nbsp;<span style={{ color: '#c084fc' }}>const </span><span style={{ color: '#f8fafc' }}>map = </span><span style={{ color: '#c084fc' }}>new </span><span style={{ color: '#60a5fa' }}>Map</span>();</div>
                        <div>&nbsp;&nbsp;<span style={{ color: '#c084fc' }}>for </span>(<span style={{ color: '#c084fc' }}>const </span>[i, n] <span style={{ color: '#c084fc' }}>of </span>nums.entries()) {'{'}</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#94a3b8' }}>{`// O(1) lookup — optimal solution`}</span></div>
                        <div>&nbsp;&nbsp;{'}'}</div>
                        <div>{'}'}</div>
                    </div>
                </div>
            </section>

            {/* ══ FEATURES GRID ════════════════════════════════════════ */}
            <section style={{ padding: '4rem 2rem 5rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div className="accent-bar" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>
                        Everything you need to <span className="text-gradient">level up</span>
                    </h2>
                    <p style={{ maxWidth: '520px', margin: '0 auto' }}>
                        Built for engineers serious about landing roles at top tech companies.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}
                    className="stagger">
                    {FEATURES.map(({ icon, gradient, glow, title, desc }) => (
                        <div key={title} className="glass-panel slide-up" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = `0 25px 50px rgba(0,0,0,0.4), 0 0 0 1px ${glow}`;
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = '';
                                e.currentTarget.style.boxShadow = '';
                                e.currentTarget.style.borderColor = '';
                            }}
                        >
                            {/* Background glow */}
                            <div style={{
                                position: 'absolute', top: '-30px', right: '-30px',
                                width: '120px', height: '120px', borderRadius: '50%',
                                background: glow, filter: 'blur(40px)',
                                opacity: 0.4, pointerEvents: 'none',
                            }} />
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: gradient, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#fff', marginBottom: '1.1rem',
                                boxShadow: `0 6px 16px ${glow}`,
                            }}>
                                {icon}
                            </div>
                            <h4 style={{ marginBottom: '0.5rem' }}>{title}</h4>
                            <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.7 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ DUEL HIGHLIGHT ═══════════════════════════════════════ */}
            <section style={{ padding: '3rem 2rem 5rem', maxWidth: '1100px', margin: '0 auto' }}>
                <div className="glass-panel" style={{
                    padding: '3rem',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(219,39,119,0.08) 100%)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center',
                    borderRadius: '24px',
                }}>
                    <div>
                        <div className="feature-chip" style={{ marginBottom: '1.5rem' }}>
                            <Swords size={13} /> New Feature
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>
                            Code Duel — <span className="text-gradient">Quality Over Speed</span>
                        </h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: 1.8 }}>
                            A player who writes O(n) code in 10 minutes beats a player who writes O(n²) in 5 minutes.
                            Real-time 1v1 battles judged by AI on efficiency, readability, and correctness.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                            {['Synchronized Monaco Editors', 'AI complexity scoring', 'Ranked match history'].map(item => (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <CheckCircle2 size={16} color="var(--success)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            Challenge Someone <Swords size={16} />
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'You', score: 'O(n)', time: '10:24', status: '🏆 Winner', statusColor: 'var(--success)', bg: 'rgba(16,185,129,0.08)' },
                            { name: 'Opponent', score: 'O(n²)', time: '5:12', status: 'Lost', statusColor: 'var(--danger)', bg: 'rgba(244,63,94,0.06)' },
                        ].map(({ name, score, time, status, statusColor, bg }) => (
                            <div key={name} style={{
                                padding: '1.25rem 1.5rem', borderRadius: '14px',
                                background: bg, border: '1px solid rgba(255,255,255,0.07)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Time: {time}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: statusColor }}>{score}</div>
                                    <div style={{ fontSize: '0.8rem', color: statusColor, fontWeight: 600 }}>{status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CTA ══════════════════════════════════════════════════ */}
            <section style={{ padding: '4rem 2rem 6rem', textAlign: 'center' }}>
                <div className="glass-panel glow-pulse" style={{
                    maxWidth: '680px', margin: '0 auto', padding: '4rem 2rem',
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(219,39,119,0.08) 100%)',
                    border: '1px solid rgba(124,58,237,0.3)', borderRadius: '28px',
                }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '18px',
                        background: 'linear-gradient(135deg,#7c3aed,#db2777)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                    }}>
                        <Users size={28} color="#fff" />
                    </div>
                    <h2 style={{ marginBottom: '0.75rem' }}>Ready to crush your interviews?</h2>
                    <p style={{ marginBottom: '2.5rem', maxWidth: '420px', margin: '0 auto 2.5rem' }}>
                        Join engineers already training with AlgoPrep AI. Your dream offer is one practice session away.
                    </p>
                    <Link to="/register" className="btn btn-primary btn-xl" style={{
                        textDecoration: 'none',
                        boxShadow: '0 0 50px rgba(124,58,237,0.45)',
                    }}>
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;
