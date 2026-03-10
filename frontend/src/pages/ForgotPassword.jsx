import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Loader2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, { email });
            // Redirect to Reset page so they can input the code and new password
            navigate('/reset-password', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="slide-up flex-center" style={{ minHeight: '60vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', color: '#38bdf8', marginBottom: '1rem' }}>
                    <KeyRound size={32} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Forgot Password</h2>
                <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', marginTop: '1rem', backgroundColor: '#38bdf8', color: '#000', fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin auto-margin-x" /> : 'Send Reset Link'}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                        <Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
