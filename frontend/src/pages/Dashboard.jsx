import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BrainCircuit, Clock, Code2, Award, ArrowRight, Play, BarChart3, Flame } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AttemptModal from '../components/AttemptModal';

// ── Utility ──────────────────────────────────────────────────────────────
const getDayKey = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const buildCalendar = (attempts) => {
    const counts = {};
    attempts.forEach(a => { const k = getDayKey(a.createdAt); counts[k] = (counts[k] || 0) + 1; });

    const today = new Date();
    // Always start on a Sunday, ~52 weeks back
    const start = new Date(today);
    start.setDate(start.getDate() - 52 * 7);
    start.setDate(start.getDate() - start.getDay()); // rewind to Sunday

    const weeks = [];
    let current = new Date(start);
    let week = [];
    while (current <= today) {
        if (week.length === 7) { weeks.push(week); week = []; }
        const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
        week.push({ date: new Date(current), count: counts[key] || 0 });
        current.setDate(current.getDate() + 1);
    }
    // Fill the last partial week to 7 days so the grid stays rectangular
    while (week.length < 7) { week.push({ date: null, count: -1 }); }
    if (week.length) weeks.push(week);
    return weeks;
};

const cellColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.06)';
    if (count === 1) return 'rgba(139,92,246,0.35)';
    if (count === 2) return 'rgba(139,92,246,0.6)';
    return 'rgba(139,92,246,0.9)';
};

// ── Custom Tooltip for chart ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.4)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 4px' }}>{label}</p>
                <p style={{ color: 'var(--primary)', margin: 0 }}>Score: <strong>{payload[0].value}/100</strong></p>
            </div>
        );
    }
    return null;
};

// ── Main Component ────────────────────────────────────────────────────────
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
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/performance/trends`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTrends(response.data);
            } catch (error) {
                console.error("Failed to fetch trends", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    const averageScore = trends.length > 0
        ? Math.round(trends.reduce((acc, curr) => acc + curr.score, 0) / trends.length)
        : 0;

    const totalTime = trends.reduce((acc, curr) => acc + curr.timeSpent, 0);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);

    // Chart data — last 10 attempts in chronological order
    const chartData = [...trends].reverse().slice(-10).map((a) => ({
        name: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: a.score
    }));

    // ── Weak Spot Detection ──────────────────────────────────────────────
    const topicStats = {};
    trends.forEach(a => {
        if (!a.topic) return;
        if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, count: 0 };
        topicStats[a.topic].total += a.score;
        topicStats[a.topic].count += 1;
    });
    const topicAverages = Object.entries(topicStats)
        .map(([topic, { total, count }]) => ({ topic, avg: Math.round(total / count), count }))
        .sort((a, b) => a.avg - b.avg);

    const weakestTopic = topicAverages[0] || null;
    const strongestTopic = topicAverages[topicAverages.length - 1] || null;
    const passRate = trends.length > 0
        ? Math.round((trends.filter(a => a.score >= 70).length / trends.length) * 100)
        : null;

    const calendarWeeks = buildCalendar(trends);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = [];
    let lastMonth = -1;
    calendarWeeks.forEach((week, wi) => {
        const first = week[0]?.date;
        if (first) {
            const month = first.getMonth();
            if (month !== lastMonth) {
                monthLabels.push({ index: wi, label: MONTHS[month] });
                lastMonth = month;
            }
        }
    });


    return (
        <>
            <AttemptModal attempt={selectedAttempt} onClose={() => setSelectedAttempt(null)} />
            <div className="slide-up">
                <div className="flex-between" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h2>Welcome back, <span className="text-gradient">{user?.username || 'Engineer'}</span></h2>
                        <p className="text-muted">Track your progress and start a new mock interview.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {user?.currentStreak > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: 600 }}>
                                <Flame size={18} /> {user.currentStreak} day streak
                            </div>
                        )}
                        <button onClick={() => navigate('/setup')} className="btn btn-primary">
                            <Play size={18} /> Start Practice
                        </button>
                    </div>
                </div>

                {/* Stats cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Average Score</p>
                            <h3>{averageScore > 0 ? `${averageScore}/100` : '-'}</h3>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
                            <Code2 size={24} />
                        </div>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Problems Solved</p>
                            <h3>{trends.length}</h3>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'var(--secondary)' }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Time Practicing</p>
                            <h3>{hours > 0 ? `${hours}h ` : ''}{minutes}m</h3>
                        </div>
                    </div>
                </div>

                {/* ── Insights: Weak Spot Detection ── */}
                {trends.length >= 3 && (
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🔍 Your Insights</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>

                            {/* Weak Spot */}
                            {weakestTopic && weakestTopic.avg < 80 && (
                                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--danger)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.07 }}>⚠️</div>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--danger)', margin: '0 0 0.4rem', fontWeight: 600 }}>
                                        Needs Attention
                                    </p>
                                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{weakestTopic.topic}</h4>
                                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
                                        Avg score: <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{weakestTopic.avg}/100</span> across {weakestTopic.count} attempt{weakestTopic.count > 1 ? 's' : ''}
                                    </p>
                                    <button
                                        onClick={() => navigate('/setup')}
                                        className="btn"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                                    >
                                        Practice {weakestTopic.topic} →
                                    </button>
                                </div>
                            )}

                            {/* Strongest topic */}
                            {strongestTopic && topicAverages.length > 1 && (
                                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--success)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.07 }}>🏆</div>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--success)', margin: '0 0 0.4rem', fontWeight: 600 }}>
                                        Your Best Topic
                                    </p>
                                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{strongestTopic.topic}</h4>
                                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                                        Avg score: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{strongestTopic.avg}/100</span> across {strongestTopic.count} attempt{strongestTopic.count > 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* Pass Rate */}
                            {passRate !== null && (
                                <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.07 }}>📊</div>
                                    <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', margin: '0 0 0.4rem', fontWeight: 600 }}>
                                        Pass Rate (≥70)
                                    </p>
                                    <h2 style={{ margin: '0 0 0.25rem', color: passRate >= 70 ? 'var(--success)' : passRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                                        {passRate}%
                                    </h2>
                                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                                        {passRate >= 70 ? 'Excellent consistency! Keep it up.' : passRate >= 50 ? 'Getting there — keep practicing!' : 'Focus on fundamentals to boost your score.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Score Trend Chart */}
                {chartData.length >= 2 && (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>📈 Score Trend</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="url(#scoreGrad)"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#a78bfa' }}
                                />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Activity Heatmap */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🗓️ Activity</h3>
                    <div style={{ position: 'relative' }}>
                        {/* Month labels */}
                        <div style={{ display: 'flex', marginBottom: '4px', paddingLeft: '20px' }}>
                            {calendarWeeks.map((_, wi) => {
                                const label = monthLabels.find(m => m.index === wi);
                                return (
                                    <div key={wi} style={{ width: '14px', marginRight: '2px', fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {label?.label || ''}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Grid */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {/* Day labels */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                                {['', 'M', '', 'W', '', 'F', ''].map((d, i) => (
                                    <div key={i} style={{ height: '12px', fontSize: '9px', color: 'var(--text-muted)', lineHeight: '12px' }}>{d}</div>
                                ))}
                            </div>
                            {calendarWeeks.map((week, wi) => (
                                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {week.map((day, di) => {
                                        if (!day.date) return <div key={di} style={{ width: '12px', height: '12px' }} />;
                                        return (
                                            <div
                                                key={di}
                                                title={`${day.date.toDateString()}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                                                style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '2px',
                                                    backgroundColor: cellColor(day.count),
                                                    cursor: day.count > 0 ? 'pointer' : 'default',
                                                    transition: 'transform 0.1s',
                                                }}
                                                onMouseEnter={e => e.target.style.transform = 'scale(1.4)'}
                                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Less</span>
                            {[0, 1, 2, 3].map(n => (
                                <div key={n} style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: cellColor(n) }} />
                            ))}
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>More</span>
                        </div>
                    </div>
                </div>

                {/* Recent Interviews Table */}
                <h3>Recent Interviews</h3>
                <div className="glass-panel" style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
                    {loading ? (
                        <div className="flex-center animate-pulse" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                            <BarChart3 size={24} style={{ marginRight: '0.5rem' }} /> Loading trends...
                        </div>
                    ) : trends.length === 0 ? (
                        <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column', textAlign: 'center' }}>
                            <BrainCircuit size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h4>No interviews yet</h4>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Your past attempts will show up here.</p>
                            <button onClick={() => navigate('/setup')} className="btn btn-outline">Start your first interview</button>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Topic</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Difficulty</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Score</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {trends.map(attempt => (
                                    <tr key={attempt._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)' }}>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{attempt.topic}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem',
                                                backgroundColor: attempt.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : attempt.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                color: attempt.difficulty === 'Easy' ? 'var(--success)' : attempt.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'
                                            }}>
                                                {attempt.difficulty}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{ color: attempt.score >= 80 ? 'var(--success)' : attempt.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                                {attempt.score}/100
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {new Date(attempt.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <button
                                                className="btn"
                                                onClick={() => setSelectedAttempt(attempt)}
                                                style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}
                                                title="View details"
                                            >
                                                <ArrowRight size={18} />
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

