import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Zap, Upload, Target, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const STEPS = ['Upload Resume', 'Select Goal', 'Set Preferences', 'Confirm'];

const TARGET_ROLES = [
    { id: 'SDE-1 at Google', label: 'SDE-1 at Google', icon: '🔍', tags: ['Algorithms', 'System Design'] },
    { id: 'SDE-1 at Amazon', label: 'SDE-1 at Amazon', icon: '📦', tags: ['Leadership', 'DSA'] },
    { id: 'SDE-1 at Meta', label: 'SDE-1 at Meta', icon: '🌐', tags: ['Scalability', 'React'] },
    { id: 'SDE-2 at Startup', label: 'SDE-2 at Startup', icon: '🚀', tags: ['Full Stack', 'Speed'] },
    { id: 'ML Engineer', label: 'ML Engineer', icon: '🤖', tags: ['Python', 'ML Systems'] },
    { id: 'Frontend Engineer', label: 'Frontend Engineer', icon: '🎨', tags: ['React', 'CSS', 'UX'] },
];

const TOPICS = [
    'Arrays & Hashing', 'Sliding Window', 'Two Pointers', 'Stack & Queue',
    'Binary Search', 'Recursion', 'Dynamic Programming', 'Trees',
    'Graphs', 'Greedy', 'Bit Manipulation', 'System Design', 'SQL',
];

const ForgeOnboarding = () => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [parsedSkills, setParsedSkills] = useState([]);
    const [selectedRole, setSelectedRole] = useState(user?.targetJob || '');
    const [weakTopics, setWeakTopics] = useState(user?.weakTopics || []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Pre-fill from existing profile
    useEffect(() => {
        if (user?.targetJob) setSelectedRole(user.targetJob);
        if (user?.weakTopics?.length) setWeakTopics(user.weakTopics);
    }, [user]);

    const handleFileSelect = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer?.files[0] || e.target.files?.[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
            setError('');
        } else if (f) {
            setError('Please upload a PDF file.');
        }
    };

    const handleParse = async () => {
        if (!file) { setStep(1); return; }
        setParsing(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const form = new FormData();
            form.append('resume', file);
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/onboarding/parse-resume`,
                form,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );
            setParsedSkills(data.skills || []);
        } catch (err) {
            setError('Failed to parse resume — you can skip and fill in manually.');
        } finally {
            setParsing(false);
            setStep(1);
        }
    };

    const toggleTopic = (t) => setWeakTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    const handleFinish = async () => {
        if (!selectedRole) return;
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/onboarding/save`,
                {
                    targetRole: selectedRole,
                    weakTopics,
                    skills: parsedSkills.length > 0 ? parsedSkills : undefined,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update AuthContext so Dashboard/Jobs pages see new forgeComplete + weakTopics
            updateUser({
                targetJob: selectedRole,
                weakTopics,
                forgeComplete: true,
                ...(parsedSkills.length > 0 ? { skills: parsedSkills } : {}),
            });
            setDone(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save — please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (done) return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
            <div className="slide-up" style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>🔥</div>
                <h2 style={{ marginBottom: '0.75rem' }}>The Forge is Ready!</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--text-sub)' }}>
                    Your personalized study plan is saved. The platform will now coach you toward your target role.
                </p>
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                    <div className="section-label" style={{ marginBottom: '1rem' }}>Your Custom Plan</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Target Role</span>
                        <span style={{ fontWeight: 700, color: 'var(--violet-light)' }}>{selectedRole}</span>
                    </div>
                    {parsedSkills.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Skills Detected</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                {parsedSkills.map(s => <span key={s} className="badge badge-success">{s}</span>)}
                            </div>
                        </div>
                    )}
                    {weakTopics.length > 0 && (
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Focus Areas</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                {weakTopics.map(t => <span key={t} className="badge badge-violet">{t}</span>)}
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/app')}>
                        <Sparkles size={16} /> Go to Dashboard
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate('/jobs')}>
                        Find Matching Jobs
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div className="slide-up" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.85rem', background: 'rgba(245,158,11,0.1)', borderRadius: '16px', color: 'var(--warning)', marginBottom: '1.1rem' }}>
                        <Zap size={28} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>
                        The <span style={{ color: 'var(--warning)' }}>Forge</span> — Personalization
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                        {user?.forgeComplete
                            ? 'Update your career goals and preferences below.'
                            : 'One-time setup that makes every feature work for your specific career goal.'}
                    </p>
                    {user?.forgeComplete && (
                        <div className="badge badge-success" style={{ margin: '0.75rem auto 0', width: 'fit-content' }}>
                            <CheckCircle2 size={12} /> Setup complete — editing preferences
                        </div>
                    )}
                </div>

                {/* Step progress */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700,
                                    background: i < step ? 'var(--success)' : i === step ? 'linear-gradient(135deg,#7c3aed,#db2777)' : 'var(--bg-card)',
                                    border: i === step ? 'none' : '1px solid var(--border)',
                                    color: i <= step ? '#fff' : 'var(--text-muted)',
                                    boxShadow: i === step ? 'var(--shadow-glow-v)' : 'none',
                                    flexShrink: 0,
                                }}>
                                    {i < step ? <CheckCircle2 size={14} /> : i + 1}
                                </div>
                                <span style={{ fontSize: '0.78rem', fontWeight: i === step ? 700 : 500, color: i === step ? 'var(--text-main)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--success)' : 'var(--border)', margin: '0 0.6rem', transition: 'background 0.3s' }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="error-banner" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    {/* STEP 0: Resume Upload */}
                    {step === 0 && (
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Upload your Resume <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                                We'll automatically extract your skills. PDF only, max 10MB.
                            </p>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleFileSelect}
                                onClick={() => document.getElementById('resume-input').click()}
                                style={{
                                    border: `2px dashed ${dragOver ? 'var(--violet-light)' : file ? 'var(--success)' : 'var(--border)'}`,
                                    borderRadius: '14px', padding: '3rem', textAlign: 'center', cursor: 'pointer',
                                    background: dragOver ? 'rgba(124,58,237,0.05)' : file ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
                                    transition: 'var(--t-base)',
                                }}
                            >
                                {file ? (
                                    <>
                                        <CheckCircle2 size={36} color="var(--success)" style={{ marginBottom: '0.75rem' }} />
                                        <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{file.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB · PDF</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={36} color="var(--text-muted)" style={{ marginBottom: '0.75rem' }} />
                                        <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Drop your PDF here or click to browse</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skills detected automatically via AI</p>
                                    </>
                                )}
                                <input id="resume-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Skip this step →</button>
                                <button className="btn btn-primary" onClick={handleParse} disabled={parsing}>
                                    {parsing ? <><Loader2 size={16} className="animate-spin" /> Parsing resume...</> : file ? <>Parse Resume <ChevronRight size={16} /></> : <>Next <ChevronRight size={16} /></>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: Goal Selection */}
                    {step === 1 && (
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Choose your Target Role</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                This calibrates difficulty, topics, and job matches across the platform.
                            </p>
                            {parsedSkills.length > 0 && (
                                <div style={{ padding: '0.85rem 1rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                                    <p style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '0.5rem' }}>✅ Detected from resume ({parsedSkills.length} skills):</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {parsedSkills.map(s => <span key={s} className="badge badge-success">{s}</span>)}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {TARGET_ROLES.map(({ id, label, icon, tags }) => (
                                    <div key={id} onClick={() => setSelectedRole(id)}
                                        style={{
                                            padding: '1rem', borderRadius: '12px', cursor: 'pointer', transition: 'var(--t-fast)',
                                            border: `1px solid ${selectedRole === id ? 'var(--violet-light)' : 'var(--border)'}`,
                                            background: selectedRole === id ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
                                        }}>
                                        <div style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{icon}</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: selectedRole === id ? 'var(--violet-light)' : 'var(--text-main)' }}>{label}</div>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                            {tags.map(t => <span key={t} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{t}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(0)}><ChevronLeft size={15} /> Back</button>
                                <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!selectedRole}>
                                    Continue <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Weak Topics */}
                    {step === 2 && (
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>What topics do you struggle with?</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
                                We'll prioritize these in your study plan and practice sessions. Select all that apply.
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                {TOPICS.map(t => (
                                    <button key={t} onClick={() => toggleTopic(t)}
                                        className={`btn btn-sm ${weakTopics.includes(t) ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{ borderRadius: 'var(--r-full)' }}>
                                        {weakTopics.includes(t) && <CheckCircle2 size={13} />} {t}
                                    </button>
                                ))}
                            </div>
                            {weakTopics.length > 0 && (
                                <p style={{ fontSize: '0.78rem', color: 'var(--violet-light)', marginBottom: '1rem' }}>
                                    {weakTopics.length} topic{weakTopics.length !== 1 ? 's' : ''} selected
                                </p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}><ChevronLeft size={15} /> Back</button>
                                <button className="btn btn-primary" onClick={() => setStep(3)}>
                                    Review <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Confirm */}
                    {step === 3 && (
                        <div>
                            <h3 style={{ marginBottom: '1.25rem' }}>Confirm Your Plan</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }}>
                                <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Target Role</div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--violet-light)' }}>{selectedRole}</div>
                                </div>
                                {parsedSkills.length > 0 && (
                                    <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Skills from Resume</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {parsedSkills.map(s => <span key={s} className="badge badge-success" style={{ fontSize: '0.72rem' }}>{s}</span>)}
                                        </div>
                                    </div>
                                )}
                                <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                                        Focus Areas {weakTopics.length === 0 && '(none selected)'}
                                    </div>
                                    {weakTopics.length > 0 ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {weakTopics.map(t => <span key={t} className="badge badge-violet" style={{ fontSize: '0.72rem' }}>{t}</span>)}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform will auto-detect from your attempts</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}><ChevronLeft size={15} /> Edit</button>
                                <button className="btn btn-primary" onClick={handleFinish} disabled={saving}>
                                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Zap size={16} /> Forge My Plan</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgeOnboarding;
