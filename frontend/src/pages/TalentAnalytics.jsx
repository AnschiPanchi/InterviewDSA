import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip,
} from 'recharts';
import {
    Radar as RadarIcon, Trophy, Swords, Award, Loader2, AlertCircle
} from 'lucide-react';

const SKILL_CATEGORIES = {
    'Arrays': ['array', 'arrays', 'hashing', 'two sum', 'sliding window'],
    'Dynamic Programming': ['dp', 'dynamic programming', 'memoization', 'knapsack', 'fibonacci', 'lcs'],
    'Recursion': ['recursion', 'backtracking', 'recursive'],
    'Trees': ['tree', 'bst', 'binary tree', 'trie', 'avl'],
    'Graphs': ['graph', 'bfs', 'dfs', 'dijkstra', 'topological', 'cycle'],
    'System Design': ['system design', 'design', 'scaling', 'cache'],
};

const mapTopic = (topic = '') => {
    const t = topic.toLowerCase();
    for (const [cat, keywords] of Object.entries(SKILL_CATEGORIES)) {
        if (keywords.some(k => t.includes(k))) return cat;
    }
    return null;
};

const buildRadarData = (attempts) => {
    const stats = {};
    Object.keys(SKILL_CATEGORIES).forEach(c => { stats[c] = { total: 0, count: 0 }; });
    attempts.forEach(a => {
        const cat = mapTopic(a.topic);
        if (cat) { stats[cat].total += a.score; stats[cat].count++; }
    });
    return Object.keys(SKILL_CATEGORIES).map(cat => ({
        subject: cat.split(' ')[0],
        fullName: cat,
        score: stats[cat].count > 0 ? Math.round(stats[cat].total / stats[cat].count) : 0,
        attempts: stats[cat].count,
    }));
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        const d = payload[0].payload;
        return (
            <div style={{ background: 'rgba(13,17,23,0.97)', border: '1px solid rgba(124,58,237,0.4)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <p style={{ color: 'var(--violet-light)', fontWeight: 700, margin: '0 0 4px' }}>{d.fullName}</p>
                <p style={{ color: 'var(--text-main)', margin: 0 }}>Avg Score: <strong>{d.score > 0 ? `${d.score}/100` : 'No data'}</strong></p>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{d.attempts} attempt{d.attempts !== 1 ? 's' : ''}</p>
            </div>
        );
    }
    return null;
};

const RankBadge = ({ rank }) => {
    if (rank === 1) return <span style={{ fontSize: '1.15rem' }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: '1.15rem' }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: '1.15rem' }}>🥉</span>;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>#{rank}</span>;
};

const TABS = [
    { id: 'dna', label: 'Talent DNA', icon: <RadarIcon size={15} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={15} /> },
];

const TalentAnalytics = () => {
    const { user } = useContext(AuthContext);
    const [attempts, setAttempts] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dna');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const base = import.meta.env.VITE_API_BASE_URL;

        setLoading(true);
        Promise.all([
            axios.get(`${base}/api/performance/trends`, { headers }),
            axios.get(`${base}/api/leaderboard`, { headers }),
        ]).then(([attRes, lbRes]) => {
            setAttempts(attRes.data);
            setLeaderboard(lbRes.data);
        }).catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, []);

    const radarData = buildRadarData(attempts);
    const avgScore = attempts.length
        ? Math.round(attempts.reduce((a, c) => a + c.score, 0) / attempts.length)
        : 0;
    const hasData = attempts.length > 0;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div className="slide-up">
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(6,182,212,0.1)', borderRadius: '14px', color: 'var(--cyan)', marginBottom: '1rem' }}>
                        <RadarIcon size={26} />
                    </div>
                    <h2 style={{ marginBottom: '0.4rem' }}>
                        Talent <span style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics</span>
                    </h2>
                    <p>Your personal skill fingerprint — built from your real interview attempts.</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.35rem', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border)' }}>
                    {TABS.map(({ id, label, icon }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`btn btn-sm ${activeTab === id ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ border: 'none', gap: '0.4rem' }}>
                            {icon} {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex-center" style={{ height: '300px', gap: '0.75rem', color: 'var(--text-muted)' }}>
                        <Loader2 size={22} className="animate-spin" /> Loading your data...
                    </div>
                ) : activeTab === 'dna' ? (
                    !hasData ? (
                        <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                            <AlertCircle size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                            <h4>No interview data yet</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Complete at least one AI mock interview to build your Talent DNA radar.
                            </p>
                            <a href="/setup" className="btn btn-primary" style={{ textDecoration: 'none' }}>Start an Interview</a>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                            {/* Radar chart */}
                            <div className="glass-panel" style={{ padding: '2rem' }}>
                                <div className="section-label">Skill Radar — {attempts.length} interviews</div>
                                <ResponsiveContainer width="100%" height={340}>
                                    <RadarChart data={radarData} cx="50%" cy="50%">
                                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'Outfit' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                                        <Radar name="Your Skills" dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Skill breakdown */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <div className="section-label">Talent DNA Summary</div>
                                    <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                                        <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            {avgScore}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overall Avg / 100</div>
                                    </div>
                                    {radarData.map(({ fullName, score, attempts: cnt }) => (
                                        <div key={fullName} style={{ marginBottom: '0.9rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.82rem' }}>
                                                <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>
                                                    {fullName}
                                                    {cnt === 0 && <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem', fontSize: '0.7rem' }}>(no data)</span>}
                                                </span>
                                                <span style={{ color: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : score > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700 }}>
                                                    {score > 0 ? `${score}/100` : '—'}
                                                </span>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${score}%`, opacity: score === 0 ? 0.1 : 1 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="glass-panel" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(124,58,237,0.2)' }}>
                                    <Award size={20} color="var(--violet-light)" style={{ marginBottom: '0.6rem' }} />
                                    <h4 style={{ marginBottom: '0.4rem', fontSize: '0.95rem' }}>Share Your Talent DNA</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Let recruiters see your skill proof, not just a resume.</p>
                                    <button className="btn btn-outline btn-sm" onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/talent`);
                                    }}>
                                        Copy Profile Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    /* Leaderboard tab — REAL DATA */
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <div className="section-label">Global Rankings</div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Ranked by average score across all AI mock interviews.
                                {leaderboard.length === 0 && ' No attempts recorded yet — be the first!'}
                            </p>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div className="flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                <Trophy size={36} style={{ opacity: 0.3 }} />
                                <p>No one on the leaderboard yet. Start practicing!</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Engineer</th>
                                        <th>Avg Score</th>
                                        <th>Problems</th>
                                        <th>Duel Wins</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry) => (
                                        <tr key={entry._id} style={entry.isCurrentUser ? { background: 'rgba(124,58,237,0.06)' } : {}}>
                                            <td><RankBadge rank={entry.rank} /></td>
                                            <td style={{ fontWeight: entry.isCurrentUser ? 800 : 600, color: entry.isCurrentUser ? 'var(--violet-light)' : 'var(--text-main)' }}>
                                                {entry.username}
                                                {entry.isCurrentUser && (
                                                    <span className="badge badge-violet" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>You</span>
                                                )}
                                            </td>
                                            <td style={{ color: entry.avgScore >= 85 ? 'var(--success)' : entry.avgScore >= 70 ? 'var(--warning)' : 'var(--danger)', fontWeight: 700 }}>
                                                {entry.avgScore}/100
                                            </td>
                                            <td style={{ color: 'var(--text-sub)' }}>{entry.totalAttempts}</td>
                                            <td style={{ color: 'var(--text-sub)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <Swords size={13} /> {entry.duelWins}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${entry.avgScore >= 85 ? 'badge-success' : 'badge-violet'}`}>
                                                    {entry.avgScore >= 85 ? 'Elite' : 'Rising'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TalentAnalytics;
