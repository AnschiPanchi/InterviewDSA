import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Flame, Award, Star, TrendingUp, Clock, Code2, Target, Zap, Linkedin, Github, Sparkles, Navigation, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// ── Badges ────────────────────────────────────────────────────────────────
const computeBadges = (attempts) => {
    const badges = [];
    const n = attempts.length;
    const avgScore = n > 0 ? attempts.reduce((a, b) => a + b.score, 0) / n : 0;
    const topics = new Set(attempts.map(a => a.topic)).size;
    const hasHard = attempts.some(a => a.difficulty === 'Hard');
    const perfect = attempts.some(a => a.score === 100);
    const streak7 = n >= 7;

    if (n >= 1) badges.push({ icon: '🚀', label: 'First Submit', desc: 'Completed your first interview', earned: true });
    if (n >= 10) badges.push({ icon: '💪', label: 'Grinder', desc: '10+ interviews completed', earned: true });
    if (n >= 25) badges.push({ icon: '🔥', label: 'On Fire', desc: '25+ interviews completed', earned: true });
    if (n >= 50) badges.push({ icon: '🏆', label: 'Elite', desc: '50+ interviews completed', earned: true });
    if (avgScore >= 80) badges.push({ icon: '⭐', label: 'High Scorer', desc: 'Average score ≥ 80', earned: true });
    if (avgScore >= 90) badges.push({ icon: '👑', label: 'Top Performer', desc: 'Average score ≥ 90', earned: true });
    if (perfect) badges.push({ icon: '💯', label: 'Perfect Score', desc: 'Got 100 on an interview', earned: true });
    if (hasHard) badges.push({ icon: '🗻', label: 'Hard Mode', desc: 'Solved a Hard difficulty problem', earned: true });
    if (topics >= 3) badges.push({ icon: '🌐', label: 'Versatile', desc: 'Practiced 3+ different topics', earned: true });
    if (streak7) badges.push({ icon: '📅', label: 'Consistent', desc: '7+ interviews on record', earned: true });

    // unearned (greyed out)
    if (n < 10) badges.push({ icon: '💪', label: 'Grinder', desc: `${10 - n} more interviews needed`, earned: false });
    if (avgScore < 80) badges.push({ icon: '⭐', label: 'High Scorer', desc: 'Reach an average of 80+', earned: false });
    if (!perfect) badges.push({ icon: '💯', label: 'Perfect Score', desc: 'Get 100 on an interview', earned: false });

    return badges;
};

// ── Topic Breakdown Bar ────────────────────────────────────────────────────
const TopicBar = ({ topic, avg, count, maxAvg }) => {
    const pct = maxAvg > 0 ? (avg / maxAvg) * 100 : 0;
    const color = avg >= 80 ? 'var(--success)' : avg >= 60 ? 'var(--warning)' : 'var(--danger)';
    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 500 }}>{topic}</span>
                <span style={{ color, fontWeight: 600 }}>{avg}/100 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({count} attempt{count !== 1 ? 's' : ''})</span></span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: '4px',
                    background: avg >= 80
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : avg >= 60
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                    width: `${pct}%`,
                    transition: 'width 1s ease',
                }} />
            </div>
        </div>
    );
};

// ── Main Profile ───────────────────────────────────────────────────────────
const Profile = () => {
    const { user } = useContext(AuthContext);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendation, setRecommendation] = useState(null);
    const [recLoading, setRecLoading] = useState(false);
    const [recError, setRecError] = useState(null);

    const getRecommendation = async () => {
        setRecLoading(true);
        setRecError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/recommend-topic`, 
                { skills: user?.skills || [], targetJob: user?.targetJob || '', userId: user?._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecommendation(res.data);
        } catch (err) {
            setRecError('Failed to load recommendation.');
        } finally {
            setRecLoading(false);
        }
    };

    const [jobSkills, setJobSkills] = useState(null);
    const [jobSkillsLoading, setJobSkillsLoading] = useState(false);
    const [jobSkillsError, setJobSkillsError] = useState(null);

    const getJobSkills = async () => {
        if (!user?.targetJob) return;
        setJobSkillsLoading(true);
        setJobSkillsError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/job-skills`, 
                { skills: user?.skills || [], targetJob: user.targetJob },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setJobSkills(res.data);
        } catch (err) {
            setJobSkillsError('Failed to analyze skill gap.');
        } finally {
            setJobSkillsLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/performance/trends`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttempts(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0 ? Math.round(attempts.reduce((a, b) => a + b.score, 0) / totalAttempts) : 0;
    const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
    const totalTime = attempts.reduce((a, b) => a + b.timeSpent, 0);
    const passRate = totalAttempts > 0 ? Math.round((attempts.filter(a => a.score >= 70).length / totalAttempts) * 100) : 0;

    // Topic breakdown
    const topicMap = {};
    attempts.forEach(a => {
        if (!a.topic) return;
        if (!topicMap[a.topic]) topicMap[a.topic] = { total: 0, count: 0 };
        topicMap[a.topic].total += a.score;
        topicMap[a.topic].count++;
    });
    const topicBreakdown = Object.entries(topicMap)
        .map(([topic, { total, count }]) => ({ topic, avg: Math.round(total / count), count }))
        .sort((a, b) => b.avg - a.avg);
    const maxAvg = topicBreakdown[0]?.avg || 100;

    const badges = computeBadges(attempts);
    const earnedBadges = badges.filter(b => b.earned);
    const unearnedBadges = badges.filter(b => !b.earned);

    const fmtTime = (s) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

    return (
        <div className="slide-up" style={{ maxWidth: '860px', margin: '0 auto' }}>
            {/* Hero card */}
            <div className="glass-panel" style={{
                padding: '2rem', marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
                border: '1px solid rgba(139,92,246,0.25)',
                display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
            }}>
                {/* Avatar */}
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '2rem',
                    boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                }}>
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                        <h2 style={{ margin: 0 }}>{user?.username}</h2>
                        {user?.linkedin && (
                            <a href={user.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0e76a8'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <Linkedin size={20} />
                            </a>
                        )}
                        {user?.github && (
                            <a href={user.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <Github size={20} />
                            </a>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {user?.currentStreak > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem' }}>
                                <Flame size={15} /> {user.currentStreak} day streak
                            </span>
                        )}
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                            {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''} earned
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}
                        </span>
                    </div>

                    {user?.targetJob && (
                        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 500 }}>
                            <Navigation size={16} /> Target Role: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.targetJob}</span>
                        </div>
                    )}
                    
                    {/* Skills map */}
                    {user?.skills && user.skills.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {user.skills.map((skill, i) => (
                                <span key={i} style={{ 
                                    padding: '0.2rem 0.6rem', backgroundColor: 'rgba(255,255,255,0.08)', 
                                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '1rem', 
                                    fontSize: '0.75rem', color: 'var(--text-primary)' 
                                }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {/* Pass rate circle */}
                {totalAttempts > 0 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: `conic-gradient(${passRate >= 70 ? 'var(--success)' : passRate >= 50 ? 'var(--warning)' : 'var(--danger)'} ${passRate * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                                {passRate}%
                            </div>
                        </div>
                        <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.7rem' }}>pass rate</p>
                    </div>
                )}
            </div>

            {/* AI Learning Path Panel */}
            {user?.targetJob && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Navigation size={18} color="#10b981" /> AI Skill Gap Analysis
                            </h3>
                            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem', maxWidth: '500px' }}>
                                We noticed you're aiming to be a <strong>{user.targetJob}</strong>. Find out exactly what technical skills you are currently missing to reach that goal.
                            </p>
                        </div>
                        <button onClick={getJobSkills} className="btn" disabled={jobSkillsLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', color: '#000', fontWeight: 600 }}>
                            {jobSkillsLoading ? 'Analyzing Resume...' : 'Generate Learning Path'}
                        </button>
                    </div>
                    
                    {jobSkillsError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '1rem' }}>{jobSkillsError}</p>}
                    
                    {jobSkills && (
                        <div className="slide-up" style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10b981' }}>
                            <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{jobSkills.verdict}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {jobSkills.missingSkills?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                                        <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                                        <div>
                                            <p style={{ margin: '0 0 0.2rem', fontWeight: 600, fontSize: '0.9rem', color: '#10b981' }}>{item.skill}</p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI Recommendation Panel */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} color="#ec4899" /> AI Topic Recommendation
                        </h3>
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem', maxWidth: '500px' }}>
                            Not sure what to practice next? Let our AI analyze your skills and performance to suggest the single most impactful interview topic for you to focus on right now.
                        </p>
                    </div>
                    <button onClick={getRecommendation} className="btn btn-primary" disabled={recLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {recLoading ? 'Analyzing Profile...' : 'Get Recommendation'}
                    </button>
                </div>
                
                {recError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '1rem' }}>{recError}</p>}
                
                {recommendation && (
                    <div className="slide-up" style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #ec4899' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>Suggested Topic: <strong style={{ color: '#ec4899' }}>{recommendation.topic}</strong></h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{recommendation.reason}</p>
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { icon: <Code2 size={20} />, color: 'var(--primary)', label: 'Interviews', val: totalAttempts },
                    { icon: <Target size={20} />, color: 'var(--success)', label: 'Avg Score', val: totalAttempts > 0 ? `${avgScore}/100` : '-' },
                    { icon: <Star size={20} />, color: 'var(--warning)', label: 'Best Score', val: totalAttempts > 0 ? `${bestScore}/100` : '-' },
                    { icon: <Clock size={20} />, color: 'var(--secondary)', label: 'Time Practiced', val: totalAttempts > 0 ? fmtTime(totalTime) : '-' },
                ].map(({ icon, color, label, val }) => (
                    <div key={label} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: `${color}20`, color }}>{icon}</div>
                        <div>
                            <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>{label}</p>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Topic Breakdown */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={18} color="var(--primary)" /> Topic Breakdown
                    </h3>
                    {loading ? (
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Loading...</p>
                    ) : topicBreakdown.length === 0 ? (
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Complete interviews to see your topic performance.</p>
                    ) : (
                        topicBreakdown.map(({ topic, avg, count }) => (
                            <TopicBar key={topic} topic={topic} avg={avg} count={count} maxAvg={maxAvg} />
                        ))
                    )}
                </div>

                {/* Difficulty breakdown */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={18} color="var(--warning)" /> Difficulty Breakdown
                    </h3>
                    {['Easy', 'Medium', 'Hard'].map(diff => {
                        const items = attempts.filter(a => a.difficulty === diff);
                        const avg = items.length > 0 ? Math.round(items.reduce((a, b) => a + b.score, 0) / items.length) : null;
                        const color = diff === 'Easy' ? 'var(--success)' : diff === 'Medium' ? 'var(--warning)' : 'var(--danger)';
                        return (
                            <div key={diff} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
                                <span style={{ color, fontWeight: 600, fontSize: '0.875rem' }}>{diff}</span>
                                <span style={{ fontSize: '0.875rem' }}>
                                    {items.length > 0 ? <>{items.length} attempt{items.length !== 1 ? 's' : ''} · avg <strong style={{ color }}>{avg}</strong></> : <span className="text-muted">No attempts yet</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Badges */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} color="var(--warning)" /> Achievements
                    <span className="text-muted" style={{ fontWeight: 400, fontSize: '0.8rem' }}>({earnedBadges.length} earned)</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {[...earnedBadges, ...unearnedBadges].map((badge, i) => (
                        <div key={i} title={badge.desc} style={{
                            padding: '0.875rem',
                            backgroundColor: badge.earned ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                            borderRadius: 'var(--radius-md)',
                            border: badge.earned ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            textAlign: 'center',
                            filter: badge.earned ? 'none' : 'grayscale(1)',
                            opacity: badge.earned ? 1 : 0.4,
                            transition: 'transform 0.2s',
                            cursor: 'default',
                        }}
                            onMouseEnter={e => { if (badge.earned) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{badge.icon}</div>
                            <p style={{ margin: '0 0 0.2rem', fontWeight: 600, fontSize: '0.8rem' }}>{badge.label}</p>
                            <p className="text-muted" style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.3 }}>{badge.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;
