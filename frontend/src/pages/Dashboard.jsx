import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Award, Code2, Clock, Flame, Play, ArrowRight, BarChart3, BrainCircuit,
    Swords, Radar, Briefcase, TrendingUp, Zap, ChevronRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AttemptModal from '../components/AttemptModal';
import { calculateLevel, getLevelProgress, getXPToNextLevel } from '../utils/leveling.js';

const getDayKey = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const buildCalendar = (attempts) => {
    const counts = {};
    attempts.forEach(a => { const k = getDayKey(a.createdAt); counts[k] = (counts[k] || 0) + 1; });
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 52 * 7);
    start.setDate(start.getDate() - start.getDay());
    const weeks = [];
    let current = new Date(start);
    let week = [];
    while (current <= today) {
        if (week.length === 7) { weeks.push(week); week = []; }
        const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
        week.push({ date: new Date(current), count: counts[key] || 0 });
        current.setDate(current.getDate() + 1);
    }
    while (week.length < 7) week.push({ date: null, count: -1 });
    if (week.length) weeks.push(week);
    return weeks;
};

const cellColor = count => {
    if (count <= 0) return 'rgba(255,255,255,0.05)';
    if (count === 1) return 'rgba(124,58,237,0.35)';
    if (count === 2) return 'rgba(124,58,237,0.6)';
    return 'rgba(124,58,237,0.9)';
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
        <div style={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(124,58,237,0.4)', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.8rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 4px' }}>{label}</p>
            <p style={{ color: 'var(--violet-light)', margin: 0, fontWeight: 700 }}>Score: {payload[0].value}/100</p>
        </div>
    );
    return null;
};

const QUICK_LINKS = [
    { to: '/duel', icon: <Swords size={20} />, label: 'Code Duel', desc: '1v1 battle', color: '#db2777', bg: 'rgba(219,39,119,0.1)' },
    { to: '/talent', icon: <Radar size={20} />, label: 'Analytics', desc: 'Talent DNA', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { to: '/jobs', icon: <Briefcase size={20} />, label: 'Job Match', desc: 'Find roles', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    { to: '/forge', icon: <Zap size={20} />, label: 'The Forge', desc: 'Career coach', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
];

const Dashboard = () => {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/performance/trends`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTrends(data);
            } catch (e) { console.error('Failed to fetch trends', e); }
            finally { setLoading(false); }
        };
        fetchTrends();
    }, []);

    const averageScore = trends.length ? Math.round(trends.reduce((a, c) => a + c.score, 0) / trends.length) : 0;
    const totalTime = trends.reduce((a, c) => a + c.timeSpent, 0);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const chartData = [...trends].reverse().slice(-10).map(a => ({
        name: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.score,
    }));

    const topicStats = {};
    trends.forEach(a => {
        if (!a.topic) return;
        if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, count: 0 };
        topicStats[a.topic].total += a.score;
        topicStats[a.topic].count++;
    });
    const topicAverages = Object.entries(topicStats)
        .map(([topic, { total, count }]) => ({ topic, avg: Math.round(total / count), count }))
        .sort((a, b) => a.avg - b.avg);
    const weakest = topicAverages[0] || null;
    const strongest = topicAverages[topicAverages.length - 1] || null;
    const passRate = trends.length ? Math.round((trends.filter(a => a.score >= 70).length / trends.length) * 100) : null;

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const calendarWeeks = buildCalendar(trends);
    const monthLabels = [];
    let lastMonth = -1;
    calendarWeeks.forEach((week, wi) => {
        const first = week[0]?.date;
        if (first) {
            const m = first.getMonth();
            if (m !== lastMonth) { monthLabels.push({ index: wi, label: MONTHS[m] }); lastMonth = m; }
        }
    });

    return (
        <>
            <AttemptModal attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} />
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

                {/* Header */}
                <div className="flex-between slide-up" style={{ marginBottom: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', fontWeight: 600 }}>
                            Welcome back
                        </p>
                        <h2 style={{ margin: 0 }}>
                            {user?.username || 'Engineer'} <span className="text-gradient" style={{ fontSize: '1.75rem' }}>👋</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>Track your progress and start a new session</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', height: 'fit-content' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Level</div>
                                <div style={{ fontWeight: 800, color: 'var(--violet-light)' }}>Lvl {user?.level || 1}</div>
                            </div>
                            <div style={{ width: '120px' }}>
                                <div className="progress-bar" style={{ height: '8px' }}>
                                    <div className="progress-fill" style={{ width: `${getLevelProgress(user?.xp || 0)}%` }} />
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {getXPToNextLevel(user?.xp || 0)} XP to next
                                </div>
                            </div>
                        </div>
                        {user?.currentStreak > 0 && (
                            <div className="badge badge-warning">
                                <Flame size={13} /> {user.currentStreak} day streak
                            </div>
                        )}
                        <button onClick={() => navigate('/setup')} className="btn btn-primary" style={{ gap: '0.5rem' }}>
                            <Play size={16} /> Start Practice
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }} className="stagger">
                    {[
                         { icon: <Zap size={20} />, label: 'Total XP', value: user?.xp || 0, iconBg: 'rgba(245,158,11,0.12)', iconColor: 'var(--warning)' },
                        { icon: <Award size={20} />, label: 'Avg Score', value: averageScore > 0 ? `${averageScore}/100` : '—', iconBg: 'rgba(124,58,237,0.15)', iconColor: 'var(--violet-light)' },
                        { icon: <Code2 size={20} />, label: 'Problems Solved', value: trends.length, iconBg: 'rgba(16,185,129,0.12)', iconColor: 'var(--success)' },
                        { icon: <Clock size={20} />, label: 'Time Practiced', value: `${hours > 0 ? `${hours}h ` : ''}${minutes}m`, iconBg: 'rgba(16,185,129,0.12)', iconColor: 'var(--success)' },

                    ].map(({ icon, label, value, iconBg, iconColor }) => (
                        <div key={label} className="glass-panel slide-up">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
                                <div>
                                    <div className="stat-label">{label}</div>
                                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick links to new features */}
                <div style={{ marginBottom: '2rem' }}>
                    <div className="section-label">Platform Features</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                        {QUICK_LINKS.map(({ to, icon, label, desc, color, bg }) => (
                            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                                <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{label}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
                                    </div>
                                    <ChevronRight size={15} color="var(--text-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Insights row */}
                {trends.length >= 3 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div className="section-label">Your Insights</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                            {weakest && weakest.avg < 80 && (
                                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--danger)' }}>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--danger)', margin: '0 0 0.4rem', fontWeight: 700 }}>Needs Attention</p>
                                    <h4 style={{ margin: '0 0 0.35rem' }}>{weakest.topic}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>Avg: <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{weakest.avg}/100</span> over {weakest.count} attempts</p>
                                    <button onClick={() => navigate('/setup')} className="btn btn-danger btn-sm">Practice Now →</button>
                                </div>
                            )}
                            {strongest && topicAverages.length > 1 && (
                                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--success)' }}>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--success)', margin: '0 0 0.4rem', fontWeight: 700 }}>Your Best Topic</p>
                                    <h4 style={{ margin: '0 0 0.35rem' }}>{strongest.topic}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Avg: <span style={{ color: 'var(--success)', fontWeight: 700 }}>{strongest.avg}/100</span> over {strongest.count} attempts</p>
                                </div>
                            )}
                            {passRate !== null && (
                                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--violet-light)' }}>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--violet-light)', margin: '0 0 0.4rem', fontWeight: 700 }}>Pass Rate (≥70)</p>
                                    <h2 style={{ margin: '0 0 0.35rem', color: passRate >= 70 ? 'var(--success)' : passRate >= 50 ? 'var(--warning)' : 'var(--danger)', fontSize: '2rem' }}>{passRate}%</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{passRate >= 70 ? '🎉 Excellent consistency!' : passRate >= 50 ? '💪 Getting there!' : '📚 Focus on fundamentals'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Score trend */}
                {chartData.length >= 2 && (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="section-label">Score Trend</div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#7c3aed" />
                                        <stop offset="100%" stopColor="#db2777" />
                                    </linearGradient>
                                </defs>
                                <Line type="monotone" dataKey="score" stroke="url(#scoreGrad)" strokeWidth={2.5} dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#a78bfa' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Activity heatmap */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                    <div className="section-label">Activity</div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '22px' }}>
                            {calendarWeeks.map((_, wi) => {
                                const lbl = monthLabels.find(m => m.index === wi);
                                return <div key={wi} style={{ width: '15px', marginRight: '2px', fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{lbl?.label || ''}</div>;
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                                {['','M','','W','','F',''].map((d, i) => (
                                    <div key={i} style={{ height: '13px', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '13px' }}>{d}</div>
                                ))}
                            </div>
                            {calendarWeeks.map((week, wi) => (
                                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {week.map((day, di) => {
                                        if (!day.date) return <div key={di} style={{ width: '13px', height: '13px' }} />;
                                        return (
                                            <div key={di} className="heatmap-cell"
                                                title={`${day.date.toDateString()}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                                                style={{ backgroundColor: cellColor(day.count), cursor: day.count > 0 ? 'pointer' : 'default' }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Less</span>
                            {[0,1,2,3].map(n => <div key={n} style={{ width: '13px', height: '13px', borderRadius: '3px', backgroundColor: cellColor(n) }} />)}
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>More</span>
                        </div>
                    </div>
                </div>

                {/* Recent Interviews */}
                <div className="section-label" style={{ marginBottom: '0.75rem' }}>Recent Interviews</div>
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    {loading ? (
                        <div className="flex-center" style={{ padding: '3rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
                            <BarChart3 size={22} className="animate-pulse" /> Loading...
                        </div>
                    ) : trends.length === 0 ? (
                        <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column', textAlign: 'center' }}>
                            <BrainCircuit size={48} color="var(--violet-light)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
                            <h4 style={{ marginBottom: '0.5rem' }}>No interviews yet</h4>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Your past attempts will appear here</p>
                            <button onClick={() => navigate('/setup')} className="btn btn-outline">Start your first interview</button>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead><tr>
                                <th>Topic</th><th>Difficulty</th><th>Score</th><th>Date</th><th />
                            </tr></thead>
                            <tbody>
                                {trends.map(attempt => (
                                    <tr key={attempt._id}>
                                        <td style={{ fontWeight: 600 }}>{attempt.topic}</td>
                                        <td>
                                            <span className={`diff-${attempt.difficulty?.toLowerCase() || 'easy'}`}>{attempt.difficulty}</span>
                                        </td>
                                        <td style={{ color: attempt.score >= 80 ? 'var(--success)' : attempt.score >= 60 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>
                                            {attempt.score}/100
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedAttempt(attempt)} title="View details">
                                                <ArrowRight size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
