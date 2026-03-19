import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    Briefcase, Search, MapPin, Building2, ExternalLink, Filter,
    RefreshCw, Zap, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';

// ── Static job database (extend or replace with real API) ────────────────────
const JOB_DATABASE = [
    {
        id: 1, title: 'Software Engineer II', company: 'Google', location: 'Bangalore, India',
        type: 'Full-time', posted: '2d ago', applyUrl: 'https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineer%20II',
        requiredSkills: ['Python', 'Algorithms', 'System Design', 'Java', 'C++', 'Distributed Systems'],
        targetRole: 'SDE-1 at Google',
        description: 'Work on large-scale distributed systems at Google. Strong DSA fundamentals required.',
    },
    {
        id: 2, title: 'Frontend Engineer', company: 'Meta', location: 'Remote',
        type: 'Full-time', posted: '1d ago', applyUrl: 'https://www.metacareers.com/jobs',
        requiredSkills: ['React', 'JavaScript', 'CSS', 'TypeScript', 'Node.js', 'GraphQL'],
        targetRole: 'Frontend Engineer',
        description: 'Build high-performance, accessible UI for billions of users across Facebook and Instagram.',
    },
    {
        id: 3, title: 'SDE-1', company: 'Amazon', location: 'Hyderabad, India',
        type: 'Full-time', posted: '3d ago', applyUrl: 'https://www.amazon.jobs/en/search?base_query=SDE+1',
        requiredSkills: ['Java', 'Data Structures', 'Algorithms', 'REST API', 'AWS'],
        targetRole: 'SDE-1 at Amazon',
        description: 'Join Amazon and build services used by millions. Focus on reliability and scalability.',
    },
    {
        id: 4, title: 'Full Stack Developer', company: 'Microsoft', location: 'Redmond, WA',
        type: 'Full-time', posted: '5h ago', applyUrl: 'https://careers.microsoft.com/us/en/search-results',
        requiredSkills: ['C#', 'TypeScript', 'React', 'MongoDB', 'Azure', 'SQL'],
        targetRole: 'SDE-2 at Startup',
        description: 'Fast-paced environment at Microsoft. Own features end-to-end from day one.',
    },
    {
        id: 5, title: 'Platform Engineer', company: 'Netflix', location: 'Los Gatos, CA',
        type: 'Full-time', posted: '1w ago', applyUrl: 'https://jobs.netflix.com',
        requiredSkills: ['Go', 'Kubernetes', 'REST API', 'System Design', 'Docker', 'Redis'],
        targetRole: 'SDE-2 at Startup',
        description: 'Build the global streaming infrastructure that powers Netflix\'s content delivery.',
    },
    {
        id: 6, title: 'Backend Engineer', company: 'Apple', location: 'Cupertino, CA',
        type: 'Full-time', posted: '4d ago', applyUrl: 'https://www.apple.com/jobs/us/',
        requiredSkills: ['Swift', 'Java', 'Spring Boot', 'Algrorithms', 'NoSQL', 'Microservices'],
        targetRole: 'SDE-1 at Amazon',
        description: 'Work on secure and scalable backend services for Apple\'s ecosystem.',
    },
    {
        id: 7, title: 'Product Engineer', company: 'Stripe', location: 'Remote',
        type: 'Full-time', posted: '2d ago', applyUrl: 'https://stripe.com/jobs/search',
        requiredSkills: ['Ruby', 'JavaScript', 'React', 'SQL', 'REST API', 'System Design'],
        targetRole: 'Full Stack Engineer',
        description: 'Build financial infrastructure for the internet. Focus on quality and reliability.',
    },
];

// ── Match calculation ─────────────────────────────────────────────────────────
// Returns 0-100 match score based on user's skills and targetJob
const calculateMatch = (job, userSkills = [], userTargetJob = '') => {
    if (!userSkills.length && !userTargetJob) return null; // can't calculate

    let score = 30; // base

    // Skill overlap (up to 50 points)
    const normalizeSkill = s => s.toLowerCase().replace(/[.\s-]/g, '');
    const userSkillsNorm = userSkills.map(normalizeSkill);
    const jobSkillsNorm = job.requiredSkills.map(normalizeSkill);
    const matched = jobSkillsNorm.filter(js =>
        userSkillsNorm.some(us => us.includes(js) || js.includes(us))
    );
    const skillPct = job.requiredSkills.length > 0 ? matched.length / job.requiredSkills.length : 0;
    score += Math.round(skillPct * 50);

    // Role alignment (up to 20 points)
    if (userTargetJob && job.targetRole) {
        if (userTargetJob === job.targetRole) score += 20;
        else if (userTargetJob.toLowerCase().includes(job.targetRole.toLowerCase().split(' ')[0])) score += 8;
    }

    return Math.max(10, Math.min(98, score));
};

const matchColor = (pct) => pct >= 80 ? 'var(--success)' : pct >= 65 ? 'var(--warning)' : 'var(--danger)';
const matchBg = (pct) => pct >= 80 ? 'rgba(16,185,129,0.1)' : pct >= 65 ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.08)';
const matchLabel = (pct) => pct >= 80 ? 'Great Match' : pct >= 65 ? 'Good Match' : 'Partial Match';

const JobMatchHub = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [minMatch, setMinMatch] = useState(0);
    const [selectedJob, setSelectedJob] = useState(null);

    const hasProfile = (user?.skills?.length > 0) || user?.targetJob;

    // Compute matches only when user profile is available
    const jobsWithMatch = useMemo(() => {
        if (!hasProfile) return [];
        return JOB_DATABASE.map(job => ({
            ...job,
            match: calculateMatch(job, user?.skills || [], user?.targetJob || ''),
        })).sort((a, b) => (b.match || 0) - (a.match || 0));
    }, [user?.skills, user?.targetJob]);

    const filtered = jobsWithMatch
        .filter(j => minMatch === 0 || j.match >= minMatch)
        .filter(j => !query || j.title.toLowerCase().includes(query.toLowerCase()) || j.company.toLowerCase().includes(query.toLowerCase()));

    // ── Profile not set up ────────────────────────────────────────────────────
    if (!hasProfile) return (
        <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
            <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(245,158,11,0.1)', borderRadius: '20px', color: 'var(--warning)' }}>
                    <AlertCircle size={36} />
                </div>
                <h2>Complete The Forge First</h2>
                <p style={{ maxWidth: '440px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    Job Match needs to know your skills and target role before it can calculate your fit.
                    Complete The Forge setup — it only takes 2 minutes.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/forge')}>
                        <Zap size={16} /> Set Up The Forge
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate('/settings')}>
                        Add Skills in Settings
                    </button>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '480px', textAlign: 'left', marginTop: '0.5rem' }}>
                    <div className="section-label">Why is this needed?</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            "We match your skills against the job's required stack",
                            'Your target role boosts relevant job scores',
                            'Weak topics are factored in to show realistic fit',
                        ].map(text => (
                            <div key={text} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                                <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <div className="slide-up">
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ display: 'inline-flex', padding: '0.75rem', background: 'rgba(124,58,237,0.1)', borderRadius: '14px', color: 'var(--violet-light)', marginBottom: '1rem' }}>
                            <Briefcase size={26} />
                        </div>
                        <h2 style={{ marginBottom: '0.4rem' }}>Smart <span className="text-gradient">Job Match</span></h2>
                        <p>Scores calculated using your actual skills and target role.</p>
                    </div>
                    {/* Profile summary */}
                    <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', fontSize: '0.82rem' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.35rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Your Profile</div>
                        {user?.targetJob && (
                            <div style={{ marginBottom: '0.35rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Target: </span>
                                <span style={{ fontWeight: 700, color: 'var(--violet-light)' }}>{user.targetJob}</span>
                            </div>
                        )}
                        {user?.skills?.length > 0 && (
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Skills: </span>
                                <span style={{ fontWeight: 600 }}>{user.skills.slice(0, 4).join(', ')}{user.skills.length > 4 ? ` +${user.skills.length - 4}` : ''}</span>
                            </div>
                        )}
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }} onClick={() => navigate('/forge')}>
                            Update Forge →
                        </button>
                    </div>
                </div>

                {/* Search + filter */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input className="form-control" placeholder="Search by title or company..." value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Filter size={13} color="var(--text-muted)" />
                        {[{ v: 0, label: 'All' }, { v: 60, label: '60%+' }, { v: 70, label: '70%+' }, { v: 80, label: '80%+' }].map(({ v, label }) => (
                            <button key={v} onClick={() => setMinMatch(v)}
                                className={`btn btn-sm ${minMatch === v ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ borderRadius: 'var(--r-full)', fontSize: '0.78rem' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Jobs list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {filtered.length === 0 ? (
                            <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', gap: '1rem' }}>
                                <Briefcase size={36} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                                <p style={{ color: 'var(--text-muted)' }}>No jobs match your filters. Try lowering the match threshold.</p>
                            </div>
                        ) : filtered.map(job => (
                            <div key={job.id} className="glass-panel" style={{
                                padding: '1.1rem 1.4rem', cursor: 'pointer', transition: 'var(--t-fast)',
                                borderColor: selectedJob?.id === job.id ? 'rgba(124,58,237,0.5)' : '',
                                background: selectedJob?.id === job.id ? 'rgba(124,58,237,0.05)' : '',
                            }}
                                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
                                onMouseLeave={e => { if (selectedJob?.id !== job.id) { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; } }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                                            <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{job.title}</h4>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>{job.type}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Building2 size={11} />{job.company}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} />{job.location}</span>
                                            <span>{job.posted}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                            {job.requiredSkills.slice(0, 4).map(s => {
                                                const userHas = (user?.skills || []).some(us =>
                                                    us.toLowerCase().replace(/[.\s]/g, '').includes(s.toLowerCase().replace(/[.\s]/g, '')) ||
                                                    s.toLowerCase().replace(/[.\s]/g, '').includes(us.toLowerCase().replace(/[.\s]/g, ''))
                                                );
                                                return (
                                                    <span key={s} className={`badge ${userHas ? 'badge-success' : 'badge-violet'}`} style={{ fontSize: '0.68rem' }}>
                                                        {userHas && '✓ '}{s}
                                                    </span>
                                                );
                                            })}
                                            {job.requiredSkills.length > 4 && (
                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+{job.requiredSkills.length - 4} more</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Match score */}
                                    <div style={{ textAlign: 'center', flexShrink: 0, padding: '0.5rem 0.85rem', borderRadius: '12px', background: matchBg(job.match), border: `1px solid ${matchColor(job.match)}30` }}>
                                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: matchColor(job.match), lineHeight: 1, letterSpacing: '-0.03em' }}>{job.match}%</div>
                                        <div style={{ fontSize: '0.62rem', color: matchColor(job.match), fontWeight: 700, marginTop: '0.15rem', whiteSpace: 'nowrap' }}>{matchLabel(job.match)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail panel */}
                    {selectedJob && (
                        <div className="glass-panel" style={{ padding: '1.75rem', position: 'sticky', top: 'calc(var(--nav-h, 64px) + 1rem)' }}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ marginBottom: '0.3rem', fontSize: '1.05rem' }}>{selectedJob.title}</h3>
                                <p style={{ color: 'var(--violet-light)', fontWeight: 700, marginBottom: '0.6rem', fontSize: '0.9rem' }}>{selectedJob.company}</p>
                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} />{selectedJob.location}</span>
                                    <span>{selectedJob.type}</span>
                                    <span>{selectedJob.posted}</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{selectedJob.description}</p>

                            {/* Real match breakdown */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div className="section-label">Your Match Breakdown</div>
                                <div style={{ textAlign: 'center', padding: '0.85rem', background: matchBg(selectedJob.match), borderRadius: '12px', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '2.25rem', fontWeight: 900, color: matchColor(selectedJob.match) }}>{selectedJob.match}%</span>
                                    <p style={{ fontSize: '0.78rem', color: matchColor(selectedJob.match), margin: '0.15rem 0 0', fontWeight: 700 }}>{matchLabel(selectedJob.match)}</p>
                                </div>

                                {/* Skill-by-skill breakdown */}
                                <div className="section-label" style={{ marginBottom: '0.8rem' }}>Skill Analysis</div>
                                <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    {selectedJob.requiredSkills.map(skill => {
                                        const userHas = (user?.skills || []).some(us =>
                                            us.toLowerCase().replace(/[.\s]/g, '').includes(skill.toLowerCase().replace(/[.\s]/g, '')) ||
                                            skill.toLowerCase().replace(/[.\s]/g, '').includes(us.toLowerCase().replace(/[.\s]/g, ''))
                                        );
                                        return (
                                            <div key={skill} style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.75rem', 
                                                padding: '0.75rem 1rem', 
                                                background: userHas ? 'rgba(16,185,129,0.05)' : 'rgba(244,63,94,0.03)', 
                                                borderRadius: '10px',
                                                border: '1px solid',
                                                borderColor: userHas ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'
                                            }}>
                                                <div style={{ color: userHas ? 'var(--success)' : 'var(--danger)' }}>
                                                    {userHas ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: userHas ? 'var(--text-main)' : 'var(--text-sub)' }}>{skill}</div>
                                                    <div style={{ fontSize: '0.7rem', color: userHas ? 'var(--success)' : 'var(--danger)', opacity: 0.8 }}>
                                                        {userHas ? 'You have this skill' : 'Recommended to learn'}
                                                    </div>
                                                </div>
                                                {!userHas && (
                                                    <button 
                                                        className="btn btn-ghost btn-sm" 
                                                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', border: '1px solid rgba(244,63,94,0.3)' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/setup?topic=${skill}`);
                                                        }}
                                                    >
                                                        Practice →
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <a href={selectedJob.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}>
                                    <ExternalLink size={14} /> View & Apply on Company Site
                                </a>
                                <button className="btn btn-ghost" onClick={() => setSelectedJob(null)} style={{ padding: '0.5rem 0.75rem' }}>✕</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobMatchHub;
