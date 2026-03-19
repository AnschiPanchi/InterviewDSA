import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Brain, Zap, Target, TrendingDown, Briefcase, 
    ArrowRight, Loader2, Award, Sparkles 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const PracticeHub = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [weakTopics, setWeakTopics] = useState([]);
    const [missingSkills, setMissingSkills] = useState([]);

    const priorityLearningTopic = weakTopics[0]?.topic || missingSkills[0]?.skill || null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [trendsRes, profileRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/performance/trends`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/job-skills`, {
                        skills: user?.skills || [],
                        targetJob: user?.targetJob || ''
                    }, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                // Analyze weak topics
                const topicStats = {};
                trendsRes.data.forEach(a => {
                    if (!a.topic) return;
                    if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, count: 0 };
                    topicStats[a.topic].total += a.score;
                    topicStats[a.topic].count++;
                });
                const weak = Object.entries(topicStats)
                    .map(([topic, { total, count }]) => ({ topic, avg: Math.round(total / count), count }))
                    .filter(t => t.avg < 75)
                    .sort((a, b) => a.avg - b.avg);
                setWeakTopics(weak);

                // Missing skills from job analysis
                setMissingSkills(profileRes.data.missingSkills || []);

            } catch (err) {
                console.error("Failed to fetch practice data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '70vh', flexDirection: 'column', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--violet-light)" />
                <p className="text-muted">Analyzing your career trajectory...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div className="slide-up">
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: '14px', color: 'var(--violet-light)', marginBottom: '1rem' }}>
                        <Brain size={28} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Practice <span className="text-gradient">Hub</span></h2>
                    <p className="text-muted">Targeted training to bridge your skill gaps and ace interviews.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Weakness Targeting */}
                    <div>
                        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingDown size={14} color="var(--danger)" /> Needs Reinforcement
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {weakTopics.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <Award size={32} color="var(--success)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '0.9rem' }}>No critical weaknesses found yet! Keep practicing to maintain your edge.</p>
                                </div>
                            ) : weakTopics.map(t => (
                                <div key={t.topic} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem' }}>{t.topic}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                            Avg Score: <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{t.avg}%</span> • {t.count} attempts
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => navigate(`/study?topic=${t.topic}`)}
                                        >
                                            Study
                                        </button>
                                        <button 
                                            className="btn btn-danger btn-sm"
                                            onClick={() => navigate(`/study?topic=${t.topic}`)}
                                        >
                                            Learn First →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Gap Targeting */}
                    <div>
                        <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target size={14} color="var(--violet-light)" /> Missing Career Skills
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!user?.targetJob ? (
                                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <Briefcase size={32} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '0.9rem' }}>Set a target job in **The Forge** to identify missing skills.</p>
                                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/forge')} style={{ marginTop: '0.5rem' }}>Go to Forge →</button>
                                </div>
                            ) : missingSkills.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                    <Sparkles size={32} color="var(--success)" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '0.9rem' }}>You're fully qualified for your target role! Start taking mock interviews to refine your delivery.</p>
                                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/setup')} style={{ marginTop: '0.5rem' }}>Start Interview →</button>
                                </div>
                            ) : missingSkills.map(s => (
                                <div key={s.skill} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.25rem' }}>{s.skill}</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{s.reason}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => navigate(`/study?topic=${s.skill}`)}
                                        >
                                            Learn
                                        </button>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => navigate(`/study?topic=${s.skill}`)}
                                        >
                                            Learn First →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Quick Start Card */}
                <div className="glass-panel" style={{ marginTop: '3rem', padding: '2rem', background: 'var(--violet-dim)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>Ready for a fresh challenge?</h3>
                            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', margin: 0 }}>
                                {priorityLearningTopic
                                    ? `Start with ${priorityLearningTopic} to close your weakest gap before your next mock interview.`
                                    : 'Start a random mock interview or select a specific topic you want to master today.'}
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(priorityLearningTopic ? `/study?topic=${priorityLearningTopic}` : '/setup')}
                            style={{ padding: '1rem 2rem', fontSize: '1rem', gap: '0.5rem' }}
                        >
                            <Zap size={20} /> {priorityLearningTopic ? 'Start Learning Gap' : 'Open Interview Setup'} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeHub;
