import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, { 
                email,
                otp: otp.trim(),
                newPassword 
            });
            setMsg(res.data.message);
            // Optionally redirect after a few seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="slide-up flex-center" style={{ minHeight: '60vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', color: '#38bdf8', marginBottom: '1rem' }}>
                    <ShieldCheck size={32} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Set New Password</h2>
                <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Enter the 6-digit code sent to <strong>{email}</strong> and pick your new password.
                </p>

                {error && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
                {msg && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {msg}
                        <br/><br/>
                        <Link to="/login" style={{ color: 'var(--success)', textDecoration: 'underline' }}>Login now</Link>
                    </div>
                )}

                {!msg && (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: '1rem' }}>
                            <label className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.875rem', marginTop: '1.5rem', backgroundColor: '#38bdf8', color: '#000', fontWeight: 'bold' }}
                            disabled={loading || otp.length < 5}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin auto-margin-x" /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
