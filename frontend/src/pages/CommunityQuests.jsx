import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Sparkles, Shield, Trophy, Users, Clock, 
    ArrowRight, CheckCircle2, Star, Zap, Flame,
    Calendar, Target, Sword, Loader2, Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SystemQuests = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [claiming, setClaiming] = useState(null);

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const fetchQuests = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/quiz/current-quests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuests(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load system quests.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchQuests();
    }, [token]);

    const handleClaim = async (id) => {
        setClaiming(id);
        try {
            const res = await axios.post(`${API_URL}/api/quiz/quest/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setQuests(quests.map(q => q._id === id ? { ...q, isCompleted: true } : q));
            }
        } catch (err) {
            console.error('Failed to claim quest reward', err);
            alert(err.response?.data?.error || 'Failed to claim reward');
        } finally {
            setClaiming(null);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="slide-up" style={{ maxWidth: '920px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div className="badge badge-warning" style={{ marginBottom: '1.25rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                        <Shield size={16} /> Official System Quests
                    </div>
                    <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>Quest <span className="text-gradient">Board</span></h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        Uniform challenges for the entire community. Master a new DSA topic every day and climb the global ranks.
                    </p>
                </div>

                {loading ? (
                    <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="animate-spin" size={32} />
                        <span>Fetching today's challenges...</span>
                    </div>
                ) : error ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {quests.map(quest => (
                            <div key={quest._id} className={`glass-panel ${quest.isCompleted ? 'card-glow' : ''}`} style={{ 
                                padding: '1.75rem', 
                                display: 'flex', 
                                flexDirection: 'column',
                                border: quest.isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                                minHeight: '320px',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <span className={`badge ${quest.type === 'weekly' ? 'badge-pink' : 'badge-violet'}`} style={{ fontSize: '0.65rem' }}>
                                            {quest.type === 'weekly' ? <Calendar size={12} /> : <Clock size={12} />} 
                                            {quest.type === 'weekly' ? 'WEEKLY' : 'DAILY'}
                                        </span>
                                        <span className={`badge ${quest.difficulty === 'Easy' ? 'badge-success' : quest.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                                            {quest.difficulty}
                                        </span>
                                    </div>
                                    {quest.isCompleted && <CheckCircle2 size={20} color="var(--success)" />}
                                </div>

                                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{quest.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>
                                    {quest.description}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: 800, fontSize: '1rem' }}>
                                        <Zap size={15} fill="currentColor" />
                                        +{quest.xpReward} XP
                                    </div>
                                    
                                    {quest.isCompleted ? (
                                        <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <CheckCircle2 size={16} /> CLAIMED
                                        </div>
                                    ) : quest.isSolved ? (
                                        <button 
                                            className="btn btn-warning btn-sm" 
                                            onClick={() => handleClaim(quest._id)}
                                            disabled={claiming === quest._id}
                                            style={{ background: 'var(--warning)', color: '#000', fontWeight: 700 }}
                                        >
                                            {claiming === quest._id ? 'Claiming...' : <><Gift size={14} /> Claim Reward</>}
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/quiz?questionId=${quest.problemId._id}&questId=${quest._id}`)}>
                                            Solve <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="glass-panel" style={{ marginTop: '3rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(124,58,237,0.05)', border: '1px dashed rgba(124,58,237,0.3)' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: '50%', color: 'var(--violet-light)' }}>
                        <Target size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Master of Consistency</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete 7 daily quests in a row to earn the "Relentless" achievement.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemQuests;
