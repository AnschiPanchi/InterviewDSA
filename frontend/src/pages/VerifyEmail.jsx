import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MailCheck, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email`, {
                email,
                otp: otp.trim()
            });
            // Automatically log them in since verification returns a token
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || resendLoading) return;
        setError('');
        setMsg('');
        setResendLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-otp`, { email });
            setMsg(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend code.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="slide-up flex-center" style={{ minHeight: '60vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--success)', marginBottom: '1.5rem' }}>
                    <MailCheck size={32} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Verify your Email</h2>
                <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                    We sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account.
                </p>

                {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
                {msg && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{msg}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            style={{
                                width: '100%', padding: '0.875rem 1rem',
                                backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '1.2rem', outline: 'none', textAlign: 'center', letterSpacing: '0.3em'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', marginTop: '1rem', backgroundColor: 'var(--success)', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
                        disabled={loading || otp.length < 5}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify Account'} <ArrowRight size={18} />
                    </button>
                    
                    <div style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
                        <span className="text-muted">Didn't receive a code? </span>
                        <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }} disabled={resendLoading}>
                            {resendLoading ? 'Sending...' : 'Click to resend'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
