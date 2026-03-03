import React, { useEffect, useState } from 'react';
import { Timer, Send } from 'lucide-react';

const TimesUpOverlay = ({ onSubmit, isSubmitting }) => {
    const [phase, setPhase] = useState('enter'); // enter → idle

    useEffect(() => {
        const t = setTimeout(() => setPhase('idle'), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '2rem',
            background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.25) 0%, rgba(9,9,21,0.97) 70%)',
            backdropFilter: 'blur(10px)',
            animation: phase === 'enter' ? 'fadeIn 0.5s ease' : 'none',
        }}>
            {/* Pulsing ring */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'absolute',
                    width: '160px', height: '160px',
                    borderRadius: '50%',
                    border: '3px solid rgba(239,68,68,0.4)',
                    animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    width: '130px', height: '130px',
                    borderRadius: '50%',
                    border: '2px solid rgba(239,68,68,0.25)',
                    animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite 0.4s',
                }} />
                <div style={{
                    width: '100px', height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    border: '2px solid rgba(239,68,68,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ef4444',
                }}>
                    <Timer size={42} />
                </div>
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '3.5rem', fontWeight: 800,
                    color: '#ef4444',
                    letterSpacing: '-0.02em',
                    margin: '0 0 0.5rem',
                    textShadow: '0 0 40px rgba(239,68,68,0.5)',
                    animation: 'slideUp 0.5s ease 0.1s both',
                }}>
                    Time's Up!
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1.1rem',
                    margin: 0,
                    animation: 'slideUp 0.5s ease 0.2s both',
                }}>
                    Your session has ended. Submit your current solution.
                </p>
            </div>

            {/* Submit button */}
            <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                    fontSize: '1rem',
                    padding: '0.875rem 2.5rem',
                    background: isSubmitting
                        ? 'rgba(139,92,246,0.4)'
                        : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    animation: 'slideUp 0.5s ease 0.3s both',
                    transform: 'scale(1)',
                    transition: 'transform 0.2s',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!isSubmitting) e.target.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
            >
                {isSubmitting ? (
                    <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '0.5rem' }}>⟳</span> Submitting...</>
                ) : (
                    <><Send size={18} style={{ marginRight: '0.5rem' }} /> Submit My Code</>
                )}
            </button>

            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', animation: 'slideUp 0.5s ease 0.4s both' }}>
                Your code is saved — clicking submit sends it for AI review.
            </p>

            <style>{`
                @keyframes ping {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default TimesUpOverlay;
