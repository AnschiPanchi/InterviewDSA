import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Target, Brain, Award, Zap, ChevronRight, CheckCircle2, XCircle, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

const AdaptiveQuiz = () => {
    const { token, user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const targetQuestionId = queryParams.get('questionId');
    const targetQuestId = queryParams.get('questId');

    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOpt, setSelectedOpt] = useState(null);
    const [result, setResult] = useState(null); // { isCorrect, correctOption, explanation, abilityScore }
    const [submitting, setSubmitting] = useState(false);
    
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const fetchNext = async () => {
        setLoading(true);
        setResult(null);
        setSelectedOpt(null);
        try {
            const url = targetQuestionId && !result 
                ? `${API_URL}/api/quiz/next?questionId=${targetQuestionId}`
                : `${API_URL}/api/quiz/next`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQuestion(data);
                setError(null);
            } else if (res.status === 404) {
                setQuestion(null);
                if (targetQuestionId) setError("Question not found. It might have been deleted or moved.");
            } else {
                setQuestion(null);
                setError("Failed to fetch next challenge. Please try again later.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNext();
    }, []);

    const handleSubmit = async () => {
        if (selectedOpt === null) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/quiz/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ questionId: question._id, selectedOption: selectedOpt })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '80vh' }}><Loader2 className="animate-spin" size={32} color="var(--violet-light)" /></div>;

    if (error) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', textAlign: 'center', padding: '0 2rem' }}>
            <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Oops! Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/community')}>Back to Quests</button>
        </div>
    );

    if (!question) return (
        <div className="flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
            <Brain size={64} color="var(--text-muted)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>You're all caught up!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>No more questions due today. Your spaced repetition queue is clear.</p>
        </div>
    );

    const isCorrectChoice = (idx) => result && result.correctOption === idx;
    const isWrongChoice = (idx) => result && !result.isCorrect && selectedOpt === idx;

    return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="slide-up" style={{ maxWidth: '720px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Target color="var(--pink-light)" /> Adaptive Trainer
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Powered by Spaced Repetition (SM-2)</p>
                    </div>
                    <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <Brain size={16} /> Ability Score: {result ? result.abilityScore : (user?.abilityScore || 5)}/10
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: `var(--diff-${question.difficulty_level <= 3 ? 'easy' : question.difficulty_level <= 7 ? 'medium' : 'hard'})` }} />
                    
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <span className="badge badge-primary">{question.topic}</span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>Lvl {question.difficulty_level}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                        {question.text}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                        {question.options.map((opt, idx) => {
                            let bg = 'rgba(255,255,255,0.03)';
                            let border = '1px solid rgba(255,255,255,0.1)';
                            if (result) {
                                if (isCorrectChoice(idx)) { bg = 'rgba(16,185,129,0.1)'; border = '1px solid var(--success)'; }
                                else if (isWrongChoice(idx)) { bg = 'rgba(239,68,68,0.1)'; border = '1px solid var(--danger)'; }
                            } else if (selectedOpt === idx) {
                                bg = 'rgba(124,58,237,0.15)'; border = '1px solid var(--violet-light)';
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={!!result}
                                    onClick={() => setSelectedOpt(idx)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        width: '100%', padding: '1rem 1.25rem', background: bg, border,
                                        borderRadius: '12px', color: 'var(--text-main)', textAlign: 'left',
                                        cursor: result ? 'default' : 'pointer', transition: 'all 0.2s',
                                        fontFamily: 'Inter, sans-serif', fontSize: '0.95rem'
                                    }}
                                >
                                    <span><span style={{ color: 'var(--text-muted)', marginRight: '0.75rem', fontWeight: 600 }}>{String.fromCharCode(65 + idx)}.</span> {opt}</span>
                                    {result && isCorrectChoice(idx) && <CheckCircle2 color="var(--success)" size={18} />}
                                    {result && isWrongChoice(idx) && <XCircle color="var(--danger)" size={18} />}
                                </button>
                            );
                        })}
                    </div>

                    {!result ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" disabled={selectedOpt === null || submitting} onClick={handleSubmit}>
                                {submitting ? 'Checking...' : 'Submit Answer'}
                            </button>
                        </div>
                    ) : (
                        <div className="slide-up">
                            <div style={{ padding: '1.25rem', background: result.isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '12px', border: `1px solid ${result.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, marginBottom: '1.5rem' }}>
                                <h4 style={{ color: result.isCorrect ? 'var(--success)' : 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {result.isCorrect ? <><Zap size={18} /> Perfect!</> : <><AlertTriangle size={18} /> Incorrect</>}
                                </h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {question.explanation || (result.isCorrect ? "Great job! Your spaced repetition interval has increased." : "We'll review this again in 2 days to strengthen your retention.")}
                                </p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                {targetQuestId && (
                                    <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/quests')}>
                                        <ArrowLeft size={16} /> Back to Quests
                                    </button>
                                )}
                                <button className="btn btn-primary" onClick={() => {
                                    if (targetQuestionId) {
                                        navigate('/quiz', { replace: true });
                                        fetchNext();
                                    } else {
                                        fetchNext();
                                    }
                                }}>
                                    Next Question <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdaptiveQuiz;
