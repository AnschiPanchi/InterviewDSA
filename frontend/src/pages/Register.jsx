import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Loader2, ShieldCheck, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaQuestion, setCaptchaQuestion] = useState('');
    const [captchaKey, setCaptchaKey] = useState({ n1: 0, n2: 0 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useContext(AuthContext);

    const generateCaptcha = () => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setCaptchaKey({ n1, n2 });
        setCaptchaQuestion(`${n1} + ${n2}`);
    };

    useEffect(() => { generateCaptcha(); }, []);

    const strength = password.length === 0 ? 0
        : password.length < 6 ? 1
        : password.length < 10 ? 2 : 3;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(username, email, password, captchaQuestion, captchaAnswer);
            navigate('/app');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register');
            generateCaptcha();
            setCaptchaAnswer('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            {/* Background blob */}
            <div style={{ position: 'fixed', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

            <div className="slide-up" style={{ width: '100%', maxWidth: '460px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.35rem' }}>AlgoPrep AI</span>
                    </Link>
                    <div style={{ display: 'inline-flex', padding: '0.85rem', background: 'rgba(16,185,129,0.1)', borderRadius: '14px', color: 'var(--success)', margin: '1.25rem auto 1rem', width: 'fit-content' }}>
                        <UserPlus size={26} />
                    </div>
                    <h2 style={{ marginBottom: '0.4rem' }}>Create your account</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Join the career-ready coding platform</p>
                </div>

                <div className="glass-panel" style={{ padding: '2.25rem' }}>
                    {error && (
                        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Username</label>
                                <input type="text" className="form-control" placeholder="johndev" value={username} onChange={e => setUsername(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" placeholder="john@dev.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    className="form-control" placeholder="min. 6 characters"
                                    value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button type="button" onClick={() => setShowPwd(p => !p)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                    {[1, 2, 3].map(level => (
                                        <div key={level} style={{ flex: 1, height: '3px', borderRadius: '99px', background: strength >= level ? (level === 1 ? 'var(--danger)' : level === 2 ? 'var(--warning)' : 'var(--success)') : 'var(--border)', transition: 'var(--t-base)' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Captcha */}
                        <div style={{ margin: '1.25rem 0', padding: '1rem', background: 'rgba(255,255,255,0.025)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <ShieldCheck size={14} /> Human Verification
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '3px', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--r-sm)', color: 'var(--text-main)' }}>
                                    {captchaQuestion}
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '1.3rem' }}>=</span>
                                <input
                                    type="number" className="form-control" placeholder="?"
                                    style={{ textAlign: 'center', width: '80px', padding: '0.5rem' }}
                                    value={captchaAnswer} onChange={e => setCaptchaAnswer(e.target.value)} required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem' }} disabled={loading}>
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Create Account <ArrowRight size={17} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--violet-light)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {['Free forever', 'No credit card', 'AI-powered'].map(text => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <CheckCircle2 size={13} color="var(--success)" /> {text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Register;
