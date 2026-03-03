import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        <div className="slide-up flex-center" style={{ minHeight: '60vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
                        <LogIn size={32} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="text-muted">Sign in to continue your preparation.</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                        <span className="text-muted">Don't have an account? </span>
                        <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
