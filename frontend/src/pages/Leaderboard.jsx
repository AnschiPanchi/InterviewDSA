import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7c3f']; // gold, silver, bronze
const PODIUM_LABELS = ['🥇', '🥈', '🥉'];

const medalIcon = (rank) => {
    if (rank === 1) return <Trophy size={18} color="#f59e0b" />;
    if (rank === 2) return <Medal size={18} color="#94a3b8" />;
    if (rank === 3) return <Medal size={18} color="#cd7c3f" />;
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>#{rank}</span>;
};

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard`)
            .then(res => setData(res.data))
            .catch(err => console.error('Leaderboard fetch error:', err))
            .finally(() => setLoading(false));
    }, []);

    const top3 = data.slice(0, 3);
    const rest = data.slice(3);

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Trophy size={32} color="#f59e0b" />
                    <h2 style={{ margin: 0, fontSize: '2rem' }}>Leaderboard</h2>
                </div>
                <p className="text-muted">Top performers ranked by average interview score</p>
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '1rem' }}>
                    <Loader2 size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                    <p className="text-muted">Loading rankings...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="glass-panel flex-center" style={{ padding: '4rem', flexDirection: 'column', textAlign: 'center' }}>
                    <Trophy size={48} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h4>No rankings yet</h4>
                    <p className="text-muted">Be the first to complete an interview and claim the top spot!</p>
                </div>
            ) : (
                <>
                    {/* Podium for top 3 */}
                    {top3.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '1rem', marginBottom: '2.5rem' }}>
                            {/* Reorder: 2nd, 1st, 3rd */}
                            {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
                                if (!entry) return <div key={podiumIdx} style={{ width: '180px' }} />;
                                const rank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                                const heights = [140, 180, 110];
                                const color = PODIUM_COLORS[rank - 1];
                                const isMe = entry.username === user?.username;

                                return (
                                    <div key={entry.username} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: '52px', height: '52px', borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${color}, ${color}88)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '1.3rem',
                                            border: isMe ? '2px solid var(--primary)' : '2px solid transparent',
                                            boxShadow: isMe ? '0 0 12px var(--primary)' : 'none',
                                        }}>
                                            {entry.username?.[0]?.toUpperCase()}
                                        </div>

                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                                                {isMe ? `${entry.username} (you)` : entry.username}
                                            </p>
                                            <p style={{ margin: 0, color, fontWeight: 700, fontSize: '1.1rem' }}>
                                                {entry.avgScore}
                                            </p>
                                            <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>avg score</p>
                                        </div>

                                        {/* Podium block */}
                                        <div style={{
                                            width: '120px',
                                            height: `${heights[podiumIdx]}px`,
                                            background: `linear-gradient(180deg, ${color}30, ${color}10)`,
                                            border: `1px solid ${color}50`,
                                            borderRadius: '8px 8px 0 0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2rem',
                                        }}>
                                            {PODIUM_LABELS[rank - 1]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Full rankings table */}
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, width: '60px' }}>Rank</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500 }}>User</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Avg Score</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Best</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Attempts</th>
                                    <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((entry, idx) => {
                                    const rank = idx + 1;
                                    const isMe = entry.username === user?.username;
                                    return (
                                        <tr key={entry.username} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            backgroundColor: isMe ? 'rgba(139,92,246,0.08)' : 'transparent',
                                            transition: 'background-color 0.2s',
                                        }}>
                                            <td style={{ padding: '0.875rem 1.5rem' }}>
                                                {medalIcon(rank)}
                                            </td>
                                            <td style={{ padding: '0.875rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: rank <= 3
                                                            ? `linear-gradient(135deg, ${PODIUM_COLORS[rank - 1]}, ${PODIUM_COLORS[rank - 1]}88)`
                                                            : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                                                    }}>
                                                        {entry.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: isMe ? 600 : 400 }}>
                                                        {entry.username}
                                                        {isMe && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', backgroundColor: 'rgba(139,92,246,0.15)', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>you</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.875rem 1.5rem', textAlign: 'right', fontWeight: 700, color: entry.avgScore >= 80 ? 'var(--success)' : entry.avgScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                                                {entry.avgScore}
                                            </td>
                                            <td style={{ padding: '0.875rem 1.5rem', textAlign: 'right' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                                                    <Star size={13} color="#f59e0b" fill="#f59e0b" /> {entry.bestScore}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.875rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                                                {entry.totalAttempts}
                                            </td>
                                            <td style={{ padding: '0.875rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                {formatTime(entry.totalTime)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Leaderboard;
