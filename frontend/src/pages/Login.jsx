import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Loader2, Eye, EyeOff, ArrowRight, Sparkles, Swords, Radar, Briefcase } from 'lucide-react';

const PERKS = [
    { icon: <Sparkles size={15} />, text: 'AI-Powered mock interviews' },
    { icon: <Swords size={15} />, text: 'Live 1v1 Code Duels' },
    { icon: <Radar size={15} />, text: 'Talent DNA analytics' },
    { icon: <Briefcase size={15} />, text: 'Smart Job matching' },
];

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/app');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>

            {/* Left — branding panel */}
            <div style={{
                background: 'linear-gradient(160deg, rgba(124,58,237,0.25) 0%, rgba(13,17,23,0.95) 60%, rgba(219,39,119,0.1) 100%)',
                borderRight: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '4rem 3.5rem', position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,39,119,0.15) 0%, transparent 70%)', filter: 'blur(30px)' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.35rem' }}>AlgoPrep AI</h1>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3rem' }}>Career-Ready Platform</p>
                    </Link>

                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
                        Your career-ready<br /><span className="text-gradient">coding OS.</span>
                    </h2>
                    <p style={{ color: 'var(--text-sub)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '340px' }}>
                        Train smarter, prove your talent, and match with jobs you're built for.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {PERKS.map(({ icon, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ color: 'var(--violet-light)', background: 'var(--violet-dim)', padding: '6px', borderRadius: '8px', display: 'flex' }}>{icon}</div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — form */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
                <div className="slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'var(--violet-dim)', borderRadius: '14px', color: 'var(--violet-light)', marginBottom: '1.25rem' }}>
                            <LogIn size={24} />
                        </div>
                        <h2 style={{ marginBottom: '0.4rem' }}>Welcome back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to continue your preparation</p>
                    </div>

                    {error && (
                        <div className="error-banner" style={{ marginBottom: '1.5rem' }}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email or Username</label>
                            <input
                                type="text" className="form-control"
                                placeholder="your@email.com"
                                value={username} onChange={e => setUsername(e.target.value)} required
                            />
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                                <Link to="/forgot-password" style={{ color: 'var(--violet-light)', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>Forgot password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button type="button" onClick={() => setShowPwd(p => !p)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '0.95rem' }} disabled={loading}>
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <>Sign In <ArrowRight size={17} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--violet-light)', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
