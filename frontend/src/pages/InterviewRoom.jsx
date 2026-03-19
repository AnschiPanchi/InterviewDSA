import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Code2, Clock, Send, PlayCircle, Loader2, Sparkles, AlertCircle, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import TimesUpOverlay from '../components/TimesUpOverlay';
import ChatAssistant from '../components/ChatAssistant';

const SESSION_KEY = 'interviewSession';

const InterviewRoom = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const savedSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    const { question, setup } = location.state || savedSession || {};

    useEffect(() => {
        if (location.state?.question) {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(location.state));
        }
    }, [location.state]);

    const [language, setLanguage] = useState(savedSession?.language || 'javascript');
    const [code, setCode] = useState(savedSession?.code || question?.starterCode?.javascript || '// Write your solution here...\n');
    const [approach, setApproach] = useState(savedSession?.approach || '');
    const [timeLeft, setTimeLeft] = useState(savedSession?.timeLeft ?? ((setup?.duration || 30) * 60));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [hints, setHints] = useState([]);
    const [hintLoading, setHintLoading] = useState(false);
    const MAX_HINTS = 3;
    const HINT_PENALTY = 5;

    useEffect(() => {
        if (!question) navigate('/setup');
    }, [question, navigate]);

    useEffect(() => {
        if (!question || feedback) return;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ question, setup, language, code, approach, timeLeft }));

        // Warn when trying to close or refresh the page
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [timeLeft, code, language, approach, question, feedback, setup]);

    useEffect(() => {
        if (timeLeft <= 0 || feedback || isSubmitting) return;
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, feedback, isSubmitting]);

    useEffect(() => {
        const handleExitRequest = () => {
            if (!feedback && !isSubmitting) setShowExitWarning(true);
        };
        window.addEventListener('request-interview-exit', handleExitRequest);
        return () => window.removeEventListener('request-interview-exit', handleExitRequest);
    }, [feedback, isSubmitting]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleRunCode = async () => {
        if (!question.testCases || question.testCases.length === 0) {
            alert("No test cases available for this question. This might be an older question format.");
            return;
        }
        setIsRunning(true);
        setTestResults(null);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/execute`, {
                code,
                language,
                testCases: question.testCases
            });
            setTestResults(res.data);
        } catch (error) {
            console.error("Execution error:", error);
            setTestResults({ error: error.response?.data?.error || "Failed to execute code." });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const totalTime = (setup?.duration || 30) * 60;
        const timeSpent = totalTime - timeLeft;

        try {
            const token = localStorage.getItem('token');
            const reviewRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/review`, {
                question,
                language,
                code,
                approach
            }, { headers: { Authorization: `Bearer ${token}` } });
            const reviewData = reviewRes.data;
            const hintPenalty = hints.length * HINT_PENALTY;
            const finalScore = Math.max(0, reviewData.score - hintPenalty);
            reviewData.score = finalScore;
            if (hintPenalty > 0) reviewData.feedback += ` (Note: −${hintPenalty} pts deducted for ${hints.length} hint${hints.length > 1 ? 's' : ''} used.)`;
            setFeedback(reviewData);
            sessionStorage.removeItem(SESSION_KEY);

            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/performance/save`, {
                topic: setup?.topic || 'General',
                difficulty: setup?.difficulty || 'Medium',
                questionTitle: question.title,
                code,
                timeSpent,
                score: finalScore,
                feedbackSummary: reviewData.feedback,
                strengths: reviewData.strengths || [],
                areasForImprovement: reviewData.areasForImprovement || []
            }, { headers: { Authorization: `Bearer ${token}` } });

        } catch (error) {
            console.error("Failed to submit and review:", error);
            alert("An error occurred while submitting your attempt.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getHint = async () => {
        if (hints.length >= MAX_HINTS || hintLoading || feedback) return;
        setHintLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/hint`, {
                question,
                hintsAlreadyGiven: hints
            });
            setHints(prev => [...prev, res.data.hint]);
        } catch (err) {
            console.error('Hint error:', err);
        } finally {
            setHintLoading(false);
        }
    };

    const [showExitWarning, setShowExitWarning] = useState(false);

    if (!question) return null;

    // Is the run button disabled (unsupported language)
    const canRun = ['javascript', 'python', 'cpp', 'java'].includes(language);

    return (
        <>
            {showExitWarning && (
                <div className="modal-overlay flex-center" style={{ zIndex: 1000, position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <div className="glass-panel slide-up" style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
                        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                        <h3 style={{ marginBottom: '1rem' }}>End Interview Early?</h3>
                        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                            If you leave now, you will receive a score of 0 for this interview attempt and it will be recorded on your profile.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setShowExitWarning(false)}>
                                Keep Coding
                            </button>
                            <button className="btn btn-primary" style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={async () => {
                                setShowExitWarning(false);
                                setIsSubmitting(true);
                                try {
                                    const token = localStorage.getItem('token');
                                    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/performance/save`, {
                                        topic: setup?.topic || 'General',
                                        difficulty: setup?.difficulty || 'Medium',
                                        questionTitle: question.title,
                                        code: '',
                                        timeSpent: (setup?.duration || 30) * 60 - timeLeft,
                                        score: 0,
                                        feedbackSummary: "Candidate abandoned the interview.",
                                        strengths: [],
                                        areasForImprovement: ["Completing interviews"]
                                    }, { headers: { Authorization: `Bearer ${token}` } });
                                } catch (e) {
                                    console.error("Failed to save zero score:", e);
                                }
                                sessionStorage.removeItem(SESSION_KEY);
                                navigate('/app');
                            }}>
                                End & Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {timeLeft === 0 && !feedback && (
                <TimesUpOverlay onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            )}
            {!feedback && <ChatAssistant question={question} />}

            <div className="slide-up">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{question.title}</h2>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            backgroundColor: setup?.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' :
                                setup?.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' :
                                    'rgba(239, 68, 68, 0.2)',
                            color: setup?.difficulty === 'Easy' ? 'var(--success)' :
                                setup?.difficulty === 'Medium' ? 'var(--warning)' :
                                    'var(--danger)'
                        }}>
                            {setup?.difficulty || 'Medium'}
                        </span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                        color: timeLeft < 300 ? 'var(--danger)' : 'var(--primary)',
                        fontWeight: 600,
                        border: `1px solid ${timeLeft < 300 ? 'var(--danger)' : 'rgba(255,255,255,0.1)'}`
                    }}>
                        <Clock size={18} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1.5fr', gap: '1.5rem', height: 'calc(100vh - 160px)' }}>

                    {/* Left Column: Problem & Feedback */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {!feedback ? (
                            <>
                                {/* Problem Description */}
                                <div className="glass-panel prose" style={{ padding: '1.5rem', flex: 1 }}>
                                    <h3>Problem Description</h3>
                                    <p>{question.description}</p>

                                    <h4>Constraints</h4>
                                    <ul>
                                        {question.constraints?.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>

                                    <h4>Examples</h4>
                                    {question.examples?.map((ex, i) => (
                                        <div key={i} style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Input:</strong> <code style={{ color: 'var(--text-main)' }}>{typeof ex.input === 'object' ? JSON.stringify(ex.input) : String(ex.input)}</code></p>
                                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Output:</strong> <code style={{ color: 'var(--success)' }}>{typeof ex.output === 'object' ? JSON.stringify(ex.output) : String(ex.output)}</code></p>
                                            {ex.explanation && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}><strong>Explanation:</strong> {ex.explanation}</p>}
                                        </div>
                                    ))}
                                </div>

                                {/* Hints Panel */}
                                <div className="glass-panel" style={{ padding: '1.25rem', border: hints.length > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="flex-between" style={{ marginBottom: hints.length > 0 ? '1rem' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                            <Lightbulb size={16} color="var(--warning)" />
                                            <span>Hints</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                                ({hints.length}/{MAX_HINTS} used · −{HINT_PENALTY} pts each)
                                            </span>
                                        </div>
                                        {hints.length < MAX_HINTS && !feedback && (
                                            <button
                                                onClick={getHint}
                                                disabled={hintLoading}
                                                className="btn"
                                                style={{
                                                    padding: '0.35rem 0.9rem', fontSize: '0.8rem',
                                                    background: 'rgba(245,158,11,0.15)',
                                                    color: 'var(--warning)',
                                                    border: '1px solid rgba(245,158,11,0.35)',
                                                }}
                                            >
                                                {hintLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking...</> : '💡 Get Hint'}
                                            </button>
                                        )}
                                    </div>
                                    {hints.map((hint, i) => (
                                        <div key={i} style={{
                                            backgroundColor: 'rgba(245,158,11,0.08)', padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)', marginBottom: i < hints.length - 1 ? '0.6rem' : 0,
                                            marginTop: i === 0 ? '1rem' : 0,
                                            borderLeft: '3px solid var(--warning)', fontSize: '0.875rem', lineHeight: 1.6,
                                        }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                                                Hint {i + 1}
                                            </span>
                                            {hint}
                                        </div>
                                    ))}
                                </div>

                                {/* Approach Input */}
                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Sparkles size={16} /> Explain your approach (Optional but recommended)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Before coding, briefly explain your logic or algorithm. The AI will review this to gauge your problem-solving skills."
                                        value={approach}
                                        onChange={(e) => setApproach(e.target.value)}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </>
                        ) : (
                            /* AI Feedback View */
                            <div className="glass-panel prose slide-up" style={{ padding: '1.5rem', flex: 1, border: '1px solid var(--primary)', overflowWrap: 'break-word', wordBreak: 'break-word', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Sparkles size={20} /> AI Interviewer Feedback
                                    </h3>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        color: feedback.score >= 80 ? 'var(--success)' : feedback.score >= 60 ? 'var(--warning)' : 'var(--danger)'
                                    }}>
                                        {feedback.score}/100
                                    </div>
                                </div>

                                <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Overall Assessment</h4>
                                    <p style={{ margin: 0 }}>{feedback.feedback}</p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)' }}>Strengths</h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                            {feedback.strengths?.map((s, i) => <li key={i} style={{ color: 'var(--text-muted)' }}>{s}</li>)}
                                        </ul>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--danger)' }}>Areas for Improvement</h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                                            {feedback.areasForImprovement?.map((s, i) => <li key={i} style={{ color: 'var(--text-muted)' }}>{s}</li>)}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex-between" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: 'auto' }}>
                                    <div>
                                        <span className="text-muted">Time Complexity:</span> <strong style={{ color: 'var(--primary)' }}>{feedback.timeComplexity}</strong>
                                    </div>
                                    <div>
                                        <span className="text-muted">Space Complexity:</span> <strong style={{ color: 'var(--primary)' }}>{feedback.spaceComplexity}</strong>
                                    </div>
                                </div>

                                <div style={{ position: 'sticky', bottom: 0, paddingTop: '1.5rem', marginTop: '1.5rem', backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
                                    <button
                                        onClick={() => navigate('/app')}
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                    >
                                        ← Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Code Editor & Runner */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, flex: 1 }}>
                            <div className="flex-between" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <Code2 size={16} />
                                    <select
                                        value={language}
                                        onChange={(e) => {
                                            const newLang = e.target.value;
                                            setLanguage(newLang);
                                            if (!feedback && !isSubmitting) {
                                                setCode(question?.starterCode?.[newLang] || '// Write your solution here...\n');
                                            }
                                        }}
                                        disabled={!!feedback || isSubmitting || isRunning}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'var(--text-main)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: 'var(--radius-sm)',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                    </select>
                                </div>
                                {!feedback && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn"
                                            onClick={handleRunCode}
                                            disabled={isRunning || isSubmitting || !canRun}
                                            style={{
                                                padding: '0.4rem 1rem', fontSize: '0.875rem',
                                                background: 'rgba(255,255,255,0.1)',
                                                color: canRun ? 'var(--text-main)' : 'var(--text-muted)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                cursor: canRun ? 'pointer' : 'not-allowed'
                                            }}
                                            title={!canRun ? "Run supported for JS/Python only" : "Run against test cases"}
                                        >
                                            {isRunning ? <><Loader2 size={16} className="animate-spin" /> Running</> : <><PlayCircle size={16} /> Run Code</>}
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || isRunning}
                                            style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                                        >
                                            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Evaluating...</> : <><Send size={16} /> Submit Solution</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(value) => setCode(value)}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                        lineHeight: 24,
                                        padding: { top: 16 },
                                        readOnly: !!feedback || isRunning,
                                        scrollBeyondLastLine: false,
                                        smoothScrolling: true,
                                        cursorBlinking: 'smooth',
                                        cursorSmoothCaretAnimation: true,
                                        formatOnPaste: true,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Test Cases Panel */}
                        <div className="glass-panel" style={{ height: '300px', padding: '1rem', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                                    <PlayCircle size={16} color="var(--primary)" /> Test Cases
                                </div>
                                {testResults && (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {testResults.results?.filter(r => r.status === 'Pass').length || 0} / {question.testCases?.length || 0} Passed
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {isRunning && (
                                    <div style={{ 
                                        padding: '2rem', 
                                        textAlign: 'center', 
                                        color: 'var(--primary)', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        gap: '0.5rem' 
                                    }}>
                                        <Loader2 size={24} className="animate-spin" />
                                        <span style={{ fontSize: '0.875rem' }}>Executing in remote environment...</span>
                                    </div>
                                )}

                                {!isRunning && testResults?.error && (
                                    <div style={{ 
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                                        padding: '1rem', 
                                        borderRadius: 'var(--radius-md)', 
                                        color: 'var(--danger)', 
                                        fontSize: '0.875rem', 
                                        border: '1px solid rgba(239, 68, 68, 0.3)', 
                                        whiteSpace: 'pre-wrap', 
                                        fontFamily: 'monospace',
                                        marginBottom: '1rem'
                                    }}>
                                        <strong>Execution Error:</strong><br/>
                                        {testResults.error}
                                    </div>
                                )}

                                {testResults?.stdout && (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Latest Output:</div>
                                        <pre style={{ 
                                            padding: '0.75rem', 
                                            backgroundColor: 'rgba(0,0,0,0.5)', 
                                            borderRadius: 'var(--radius-sm)', 
                                            fontSize: '0.8rem', 
                                            color: '#e2e8f0',
                                            overflowX: 'auto' 
                                        }}>
                                            {testResults.stdout}
                                        </pre>
                                    </div>
                                )}

                                {(question.testCases || []).map((tc, i) => {
                                    const result = testResults?.results?.[i];
                                    const status = result?.status || 'Not Run';
                                    
                                    return (
                                        <div key={i} style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${
                                                status === 'Pass' ? 'rgba(16, 185, 129, 0.3)' : 
                                                status === 'Fail' || status === 'Error' ? 'rgba(239, 68, 68, 0.3)' : 
                                                'rgba(255, 255, 255, 0.08)'
                                            }`,
                                            borderLeft: `4px solid ${
                                                status === 'Pass' ? 'var(--success)' : 
                                                status === 'Fail' || status === 'Error' ? 'var(--danger)' : 
                                                'var(--primary)'
                                            }`,
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-md)',
                                            transition: 'var(--transition)'
                                        }}>
                                            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {status === 'Pass' && <CheckCircle2 size={16} color="var(--success)" />}
                                                    {(status === 'Fail' || status === 'Error') && <XCircle size={16} color="var(--danger)" />}
                                                    {status === 'Not Run' && <PlayCircle size={16} color="var(--text-muted)" />}
                                                    <strong style={{ fontSize: '0.85rem' }}>Test Case {i + 1}</strong>
                                                </div>
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: 600,
                                                    color: status === 'Pass' ? 'var(--success)' : status === 'Fail' || status === 'Error' ? 'var(--danger)' : 'var(--text-muted)'
                                                }}>
                                                    {status.toUpperCase()}
                                                </span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Input</div>
                                                    <code style={{ fontSize: '0.75rem', display: 'block', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '4px' }}>
                                                        {typeof tc.input === 'object' ? JSON.stringify(tc.input) : String(tc.input)}
                                                    </code>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Expected</div>
                                                    <code style={{ fontSize: '0.75rem', display: 'block', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '4px' }}>
                                                        {typeof tc.expectedOutput === 'object' ? JSON.stringify(tc.expectedOutput) : String(tc.expectedOutput)}
                                                    </code>
                                                </div>
                                                
                                                {result && (status === 'Fail' || status === 'Error') && (
                                                    <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginBottom: '0.2rem' }}>
                                                            {status === 'Error' ? 'Execution Error' : 'Actual Output'}
                                                        </div>
                                                        <code style={{ 
                                                            fontSize: '0.75rem', 
                                                            display: 'block', 
                                                            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                                                            color: 'var(--danger)',
                                                            padding: '0.5rem', 
                                                            borderRadius: '4px',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {status === 'Error' ? (result.error || 'Unknown error') : JSON.stringify(result.actual)}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default InterviewRoom;