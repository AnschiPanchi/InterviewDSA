import React from 'react';
import { X, Code2, Sparkles, Clock, Star } from 'lucide-react';

const AttemptModal = ({ attempt, onClose }) => {
    if (!attempt) return null;

    const score = attempt.score || 0;
    const scoreColor = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
    const timeMins = Math.floor(attempt.timeSpent / 60);
    const timeSecs = attempt.timeSpent % 60;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                backgroundColor: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="glass-panel slide-up"
                style={{
                    width: '100%', maxWidth: '780px', maxHeight: '90vh',
                    overflowY: 'auto', padding: '2rem',
                    border: '1px solid rgba(139,92,246,0.3)',
                    boxShadow: '0 25px 80px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.25rem 0' }}>{attempt.question}</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <span style={{
                                padding: '0.2rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem',
                                backgroundColor: attempt.difficulty === 'Easy' ? 'rgba(16,185,129,0.2)' : attempt.difficulty === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                                color: attempt.difficulty === 'Easy' ? 'var(--success)' : attempt.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'
                            }}>{attempt.difficulty}</span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{attempt.topic}</span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                {new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.4rem' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Score & Time row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: scoreColor }}>{score}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Score / 100</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>
                            <Clock size={16} />
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{timeMins}m {timeSecs}s</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Time Spent</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: 'var(--warning)' }}>
                            <Star size={16} />
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            {score >= 80 ? 'Passed ✅' : score >= 60 ? 'Partial 🟡' : 'Needs Work ❌'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Result</div>
                    </div>
                </div>

                {/* AI Feedback Summary */}
                {attempt.feedbackSummary && (
                    <div style={{ backgroundColor: 'rgba(139,92,246,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '3px solid var(--primary)' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>
                            <Sparkles size={16} /> AI Overall Feedback
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{attempt.feedbackSummary}</p>
                    </div>
                )}

                {/* Strengths & Areas */}
                {(attempt.strengths?.length > 0 || attempt.areasForImprovement?.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {attempt.strengths?.length > 0 && (
                            <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ color: 'var(--success)', margin: '0 0 0.75rem', fontSize: '0.85rem' }}>✅ Strengths</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    {attempt.strengths.map((s, i) => <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{s}</li>)}
                                </ul>
                            </div>
                        )}
                        {attempt.areasForImprovement?.length > 0 && (
                            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ color: 'var(--danger)', margin: '0 0 0.75rem', fontSize: '0.85rem' }}>📈 Areas to Improve</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    {attempt.areasForImprovement.map((s, i) => <li key={i} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{s}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Code */}
                {attempt.code && (
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                            <Code2 size={16} /> Your Submitted Code
                        </h4>
                        <pre style={{
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            overflowX: 'auto',
                            fontSize: '0.8rem',
                            lineHeight: 1.6,
                            margin: 0,
                            color: '#e2e8f0',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            border: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            {attempt.code}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttemptModal;
