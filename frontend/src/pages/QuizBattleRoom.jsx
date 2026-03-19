import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Swords, Bot, Zap, Crown, Timer, Trophy, Flame } from 'lucide-react';

const MOCK_QUESTIONS = [
    { text: "What is the time complexity of binary search?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correct: 2 },
    { text: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Tree", "Graph"], correct: 1 },
    { text: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Colorful Style Sheets"], correct: 0 },
    { text: "What is the worst-case time complexity of QuickSort?", options: ["O(n log n)", "O(n^2)", "O(n)", "O(1)"], correct: 1 },
    { text: "In JavaScript, what is 'this' inside an arrow function?", options: ["The global object", "Lexically scoped from surrounding context", "Undefined", "The element that fired the event"], correct: 1 },
];

const QuizBattleRoom = () => {
    const { user } = useContext(AuthContext);
    const [phase, setPhase] = useState('lobby'); // lobby, battle, result
    const [myScore, setMyScore] = useState(0);
    const [oppScore, setOppScore] = useState(0);
    const [currentQ, setCurrentQ] = useState(0);
    const [winner, setWinner] = useState(null);
    const [selectedOpt, setSelectedOpt] = useState(null);

    const WIN_SCORE = 5; // Reduced from 10 for quicker demo

    // Bot logic
    useEffect(() => {
        if (phase === 'battle') {
            const interval = setInterval(() => {
                // Bot scores randomly every 4-8 seconds
                if (Math.random() > 0.3 && oppScore < WIN_SCORE && !winner) {
                    setOppScore(s => {
                        const next = s + 1;
                        if (next >= WIN_SCORE) {
                            setWinner('AlgoBot (AI)');
                            setPhase('result');
                        }
                        return next;
                    });
                }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [phase, oppScore, winner]);

    const handleAnswer = (idx) => {
        if (selectedOpt !== null) return;
        setSelectedOpt(idx);
        
        const q = MOCK_QUESTIONS[currentQ % MOCK_QUESTIONS.length];
        
        setTimeout(() => {
            if (idx === q.correct) {
                setMyScore(s => {
                    const next = s + 1;
                    if (next >= WIN_SCORE) {
                        setWinner(user?.username || 'You');
                        setPhase('result');
                    }
                    return next;
                });
            }
            setSelectedOpt(null);
            setCurrentQ(q => q + 1);
        }, 800);
    };

    if (phase === 'lobby') {
        return (
            <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel slide-up" style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px' }}>
                    <div className="badge badge-pink" style={{ marginBottom: '1.5rem', padding: '0.75rem 1.5rem' }}>
                        <Swords size={20} /> Multiplayer Battle
                    </div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Quiz <span className="text-gradient">Arena</span></h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        First to 5 points wins. Compete in real-time. Gain XP and Battle Badges.
                    </p>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={() => setPhase('battle')}>
                        <Zap size={18} fill="currentColor" /> Enter Arena vs Bot
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'result') {
        const isMe = winner === (user?.username || 'You');
        return (
            <div className="flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
                <div className="glass-panel slide-up" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', borderTop: `4px solid ${isMe ? 'var(--success)' : 'var(--danger)'}` }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{isMe ? '🏆' : '💀'}</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>{isMe ? 'Victory!' : 'Defeat'}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {isMe ? 'You dominated the arena. Battle Badge awarded!' : 'The bot was faster this time. Keep practicing!'}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: isMe ? 'var(--success)' : 'var(--text-main)' }}>{myScore}</div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.3 }}>-</div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AlgoBot</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: !isMe ? 'var(--success)' : 'var(--text-main)' }}>{oppScore}</div>
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={() => { setPhase('lobby'); setMyScore(0); setOppScore(0); setCurrentQ(0); setWinner(null); }}>
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    const q = MOCK_QUESTIONS[currentQ % MOCK_QUESTIONS.length];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-base)' }}>
            {/* Battle Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', background: 'rgba(13,17,23,0.95)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ minWidth: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--success)', fontSize: '1.25rem' }}>
                        {myScore}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You</div>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{user?.username || 'Player'} {myScore >= WIN_SCORE - 1 && <Flame size={14} color="var(--warning)" />}</div>
                    </div>
                </div>

                <div className="badge badge-pink" style={{ padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '2px' }}>
                    VS
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'right' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Opponent</div>
                        <div style={{ fontWeight: 700, color: 'var(--violet-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {oppScore >= WIN_SCORE - 1 && <Flame size={14} color="var(--warning)" />}
                            AlgoBot <Bot size={14} />
                        </div>
                    </div>
                    <div style={{ minWidth: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.1)', border: '1px solid var(--violet-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--violet-light)', fontSize: '1.25rem' }}>
                        {oppScore}
                    </div>
                </div>
            </div>

            {/* Battle Arena */}
            <div className="flex-center" style={{ flex: 1, padding: '2rem' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--pink-light)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                            Question {currentQ + 1}
                        </div>
                        <h2 style={{ fontSize: '1.75rem', lineHeight: 1.4 }}>{q.text}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {q.options.map((opt, idx) => {
                            let bg = 'rgba(255,255,255,0.03)';
                            let border = '1px solid rgba(255,255,255,0.1)';
                            if (selectedOpt !== null) {
                                if (idx === q.correct) { bg = 'rgba(16,185,129,0.15)'; border = '1px solid var(--success)'; }
                                else if (selectedOpt === idx) { bg = 'rgba(239,68,68,0.15)'; border = '1px solid var(--danger)'; }
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={selectedOpt !== null}
                                    style={{
                                        padding: '1.25rem', background: bg, border, borderRadius: '12px',
                                        color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600,
                                        cursor: selectedOpt !== null ? 'default' : 'pointer', transition: 'all 0.2s',
                                        textAlign: 'center'
                                    }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Progress Bar (Visual flair) */}
            <div style={{ display: 'flex', height: '6px' }}>
                <div style={{ width: `${(myScore / WIN_SCORE) * 100}%`, background: 'var(--success)', transition: 'width 0.3s' }} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ width: `${(oppScore / WIN_SCORE) * 100}%`, background: 'var(--violet-light)', transition: 'width 0.3s' }} />
            </div>
        </div>
    );
};

export default QuizBattleRoom;
