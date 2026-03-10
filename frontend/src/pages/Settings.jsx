import React, { useState, useContext } from 'react';
import axios from 'axios';
import { User, Lock, Check, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
    const { user, updateUser } = useContext(AuthContext);

    // Username form
    const [newUsername, setNewUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState(null); // { type: 'success'|'error', msg }
    const [usernameLoading, setUsernameLoading] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Professional Profile form
    const [linkedin, setLinkedin] = useState(user?.linkedin || '');
    const [github, setGithub] = useState(user?.github || '');
    const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '');
    const [targetJob, setTargetJob] = useState(user?.targetJob || '');
    const [profileStatus, setProfileStatus] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const handleUsernameChange = async (e) => {
        e.preventDefault();
        if (!newUsername.trim()) return;
        setUsernameLoading(true);
        setUsernameStatus(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/settings`,
                { newUsername: newUsername.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsernameStatus({ type: 'success', msg: `Username changed to "${res.data.username}"` });
            setNewUsername('');
            updateUser({ username: res.data.username });
        } catch (err) {
            setUsernameStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to update username' });
        } finally {
            setUsernameLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordStatus({ type: 'error', msg: 'New passwords do not match' });
            return;
        }
        if (newPassword.length < 6) {
            setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters' });
            return;
        }
        setPasswordLoading(true);
        setPasswordStatus(null);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/settings`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPasswordStatus({ type: 'success', msg: 'Password changed successfully!' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            setPasswordStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to update password' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleProfileChange = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileStatus(null);
        try {
            const token = localStorage.getItem('token');
            const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s);
            const payload = { linkedin, github, skills: skillsArray, targetJob: targetJob.trim() };
            
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/auth/settings`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            updateUser(payload);
            setProfileStatus({ type: 'success', msg: 'Professional profile updated!' });
        } catch (err) {
            setProfileStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setProfileLoading(false);
        }
    };

    const StatusBanner = ({ status }) => {
        if (!status) return null;
        const isSuccess = status.type === 'success';
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
                backgroundColor: isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: isSuccess ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                marginBottom: '1rem',
            }}>
                {isSuccess ? <Check size={16} /> : <AlertCircle size={16} />}
                {status.msg}
            </div>
        );
    };

    return (
        <div className="slide-up" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2>Account Settings</h2>
                <p className="text-muted">Manage your username and password.</p>
            </div>

            {/* Current account info */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '1.2rem', flexShrink: 0,
                }}>
                    {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{user?.username}</p>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.8rem' }}>Current account</p>
                </div>
            </div>

            {/* Change Username */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <User size={18} color="var(--primary)" /> Change Username
                </h3>
                <StatusBanner status={usernameStatus} />
                <form onSubmit={handleUsernameChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>New Username</label>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            placeholder={user?.username}
                            style={{
                                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                                backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={usernameLoading || !newUsername.trim()} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
                        {usernameLoading ? 'Saving...' : 'Update Username'}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Lock size={18} color="var(--primary)" /> Change Password
                </h3>
                <StatusBanner status={passwordStatus} />
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, placeholder: '••••••••' },
                        { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'Min 6 characters' },
                        { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Repeat new password' },
                    ].map(({ label, value, setter, placeholder }) => (
                        <div key={label}>
                            <label className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>{label}</label>
                            <input
                                type="password"
                                value={value}
                                onChange={e => setter(e.target.value)}
                                placeholder={placeholder}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                                    backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                    fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                        </div>
                    ))}
                    <button type="submit" className="btn btn-primary" disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Professional Profile */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <User size={18} color="var(--primary)" /> Professional Profile
                </h3>
                <StatusBanner status={profileStatus} />
                <form onSubmit={handleProfileChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>LinkedIn URL</label>
                        <input
                            type="text"
                            value={linkedin}
                            onChange={e => setLinkedin(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                                backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>GitHub URL</label>
                        <input
                            type="text"
                            value={github}
                            onChange={e => setGithub(e.target.value)}
                            placeholder="https://github.com/username"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                                backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Target Job Role</label>
                        <input
                            type="text"
                            value={targetJob}
                            onChange={e => setTargetJob(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                                backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Technical Skills (Comma separated)</label>
                        <input
                            type="text"
                            value={skillsInput}
                            onChange={e => setSkillsInput(e.target.value)}
                            placeholder="e.g. React, Node.js, Python, MongoDB"
                            style={{
                                width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
                                backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                                fontSize: '0.95rem', outline: 'none',
                            }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
                        {profileLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
