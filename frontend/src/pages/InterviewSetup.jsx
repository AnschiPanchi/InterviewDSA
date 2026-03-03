import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings, CheckCircle2, Loader2, ListTree } from 'lucide-react';

const InterviewSetup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        topic: 'Arrays and Strings',
        difficulty: 'Medium',
        duration: 30
    });

    const topics = [
        'Arrays and Strings',
        'Linked Lists',
        'Trees and Graphs',
        'Dynamic Programming',
        'Sorting and Searching',
        'System Design Basics',
        'Recursion'
    ];

    const difficulties = [
        { level: 'Easy', color: 'var(--success)' },
        { level: 'Medium', color: 'var(--warning)' },
        { level: 'Hard', color: 'var(--danger)' }
    ];

    const durations = [15, 30, 45, 60];

    const handleStart = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/ai/generate-question', {
                topic: formData.topic,
                difficulty: formData.difficulty
            });

            // Pass the question context via state to the InterviewRoom
            navigate('/interview', {
                state: {
                    question: response.data,
                    setup: formData
                }
            });
        } catch (error) {
            console.error("Failed to generate question:", error);
            alert("Failed to contact the AI. Ensure the backend is running and the API key is valid.");
            setLoading(false);
        }
    };

    return (
        <div className="slide-up flex-center" style={{ minHeight: '60vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                        <Settings size={32} />
                    </div>
                    <h2>Configure Your Interview</h2>
                    <p className="text-muted">Tailor the machine to your current skill level.</p>
                </div>

                <form onSubmit={handleStart}>
                    <div className="form-group">
                        <label className="form-label">DSA Topic</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                className="form-control"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                style={{ appearance: 'none', cursor: 'pointer' }}
                            >
                                {topics.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ListTree size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Difficulty Level</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {difficulties.map(({ level, color }) => (
                                <div
                                    key={level}
                                    onClick={() => setFormData({ ...formData, difficulty: level })}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${formData.difficulty === level ? color : 'rgba(255,255,255,0.1)'}`,
                                        backgroundColor: formData.difficulty === level ? `${color}20` : 'rgba(15, 23, 42, 0.6)',
                                        color: formData.difficulty === level ? color : 'var(--text-main)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {formData.difficulty === level && <CheckCircle2 size={16} />}
                                    {level}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Time Limit (Minutes)</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {durations.map(duration => (
                                <div
                                    key={duration}
                                    onClick={() => setFormData({ ...formData, duration })}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${formData.duration === duration ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                        backgroundColor: formData.duration === duration ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    {duration}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span className="animate-pulse">Generating Question Matrix...</span>
                            </>
                        ) : (
                            'Start Interview'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default InterviewSetup;
