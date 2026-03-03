import React, { useState } from 'react';
import { BrainCircuit, BarChart3, UserCircle, ArrowRight, Check } from 'lucide-react';

const STEPS = [
    {
        icon: <BrainCircuit size={48} />,
        color: '#8b5cf6',
        title: 'Welcome to AlgoPrep AI 🎉',
        subtitle: 'Your personal mock interview coach',
        body: 'AlgoPrep AI generates real DSA problems, reviews your code with AI, and tracks your growth over time — just like practising on LeetCode, but with instant feedback.',
    },
    {
        icon: <BarChart3 size={48} />,
        color: '#10b981',
        title: 'How It Works',
        subtitle: '3 simple steps to level up',
        body: null,
        steps: [
            { emoji: '🎯', label: 'Pick a topic & difficulty', sub: 'Arrays, Trees, DP and more' },
            { emoji: '💻', label: 'Solve in the code editor', sub: 'Multi-language, real-time timer' },
            { emoji: '🤖', label: 'Get instant AI feedback', sub: 'Score, strengths, and improvements' },
        ],
    },
    {
        icon: <UserCircle size={48} />,
        color: '#ec4899',
        title: 'Track Your Progress',
        subtitle: 'Every session makes you better',
        body: 'Your Dashboard shows score trends, an activity heatmap, weak spot detection, and a daily streak — all updating automatically as you practice.',
    },
];

const STORAGE_KEY = 'algoprep_onboarding_done';

export const shouldShowOnboarding = () => !localStorage.getItem(STORAGE_KEY);

const OnboardingModal = ({ onClose }) => {
    const [step, setStep] = useState(0);
    const current = STEPS[step];

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            localStorage.setItem(STORAGE_KEY, 'true');
            onClose();
        }
    };

    const handleSkip = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease',
        }}>
            <div className="glass-panel slide-up" style={{
                width: '100%', maxWidth: '500px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                position: 'relative',
            }}>
                {/* Step dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={{
                            width: i === step ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: i === step ? current.color : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.3s ease',
                        }} />
                    ))}
                </div>

                {/* Icon */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '90px', height: '90px',
                    borderRadius: '50%',
                    backgroundColor: `${current.color}20`,
                    border: `2px solid ${current.color}50`,
                    color: current.color,
                    marginBottom: '1.5rem',
                    transition: 'all 0.3s ease',
                }}>
                    {current.icon}
                </div>

                {/* Text */}
                <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.5rem' }}>{current.title}</h2>
                <p style={{ color: current.color, margin: '0 0 1.25rem', fontWeight: 500, fontSize: '0.9rem' }}>{current.subtitle}</p>

                {current.body && (
                    <p className="text-muted" style={{ lineHeight: 1.7, fontSize: '0.95rem', margin: '0 0 2rem' }}>
                        {current.body}
                    </p>
                )}

                {current.steps && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', textAlign: 'left' }}>
                        {current.steps.map((s, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <span style={{ fontSize: '1.5rem' }}>{s.emoji}</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</p>
                                    <p className="text-muted" style={{ margin: 0, fontSize: '0.78rem' }}>{s.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    {step < STEPS.length - 1 && (
                        <button onClick={handleSkip} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
                            Skip
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        className="btn btn-primary"
                        style={{
                            fontSize: '0.95rem', padding: '0.7rem 2rem',
                            background: `linear-gradient(135deg, ${current.color}, ${current.color}bb)`,
                            flex: step === STEPS.length - 1 ? 1 : 'none',
                        }}
                    >
                        {step === STEPS.length - 1 ? (
                            <><Check size={16} style={{ marginRight: '0.5rem' }} /> Let's Go!</>
                        ) : (
                            <>Next <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
