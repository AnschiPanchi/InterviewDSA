import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Award, CheckCircle2, Lock, Star, Trophy, 
    Shield, Target, Zap, Loader2, Sparkles, Medal
} from 'lucide-react';

const Achievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const token = localStorage.getItem('token');
                const base = import.meta.env.VITE_API_BASE_URL;
                const res = await axios.get(`${base}/api/achievements`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAchievements(res.data);
            } catch (err) {
                console.error('Failed to fetch achievements', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    const earnedCount = achievements.filter(a => a.isEarned).length;
    const progress = achievements.length > 0 ? (earnedCount / achievements.length) * 100 : 0;

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="slide-up">
                {/* Header Section */}
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ padding: '0.6rem', background: 'rgba(245,158,11,0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Trophy size={24} />
                        </div>
                        <h2 style={{ margin: 0 }}>Hall of <span className="text-gradient">Achievements</span></h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '1.5rem' }}>
                        Track your career milestones and unlock exclusive badges. Flex your progress and showcase your DSA mastery.
                    </p>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--violet-light)' }}>{earnedCount}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unlocked</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-sub)' }}>Mastery Progress</span>
                                <span style={{ color: 'var(--violet-light)', fontWeight: 700 }}>{Math.round(progress)}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={32} />
                        <span>Polishing your trophies...</span>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {achievements.map((a) => (
                            <div 
                                key={a.id} 
                                className={`glass-panel ${a.isEarned ? 'card-glow' : ''}`}
                                style={{ 
                                    padding: '1.5rem', 
                                    opacity: a.isEarned ? 1 : 0.6,
                                    border: a.isEarned ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {!a.isEarned && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                                        <Lock size={16} />
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'start' }}>
                                    <div style={{ 
                                        width: '56px', 
                                        height: '56px', 
                                        borderRadius: '16px', 
                                        background: a.isEarned ? 'var(--violet-dim)' : 'rgba(255,255,255,0.03)',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justify_content: 'center',
                                        fontSize: '1.75rem',
                                        flexShrink: 0,
                                        border: a.isEarned ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent'
                                    }}>
                                        {a.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '0.4rem', color: a.isEarned ? 'var(--text-main)' : 'var(--text-sub)' }}>{a.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                                            {a.description}
                                        </p>
                                        {a.isEarned ? (
                                            <div className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                                                <CheckCircle2 size={10} /> Unlocked {new Date(a.earnedAt).toLocaleDateString()}
                                            </div>
                                        ) : (
                                            <div className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                                                Keep Practicing
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Achievements;
