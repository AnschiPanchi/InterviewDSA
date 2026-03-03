const fs = require('fs');
let code = fs.readFileSync('src/pages/InterviewRoom.jsx', 'utf8');

// The file should export properly if it currently stops at
//         } finally {
//             setHintLoading(false);
//         }
//     };
//
// };

code = code.replace(/};\s*$/, '');
code = code.replace(/};\s*};\s*$/, '');

const endCode = `
    };

    if (!question) return null;

    return (
        <>
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
                        border: \`1px solid \${timeLeft < 300 ? 'var(--danger)' : 'rgba(255,255,255,0.1)'}\`
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
                                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Input:</strong> <code style={{ color: 'var(--text-main)' }}>{ex.input}</code></p>
                                            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Output:</strong> <code style={{ color: 'var(--success)' }}>{ex.output}</code></p>
                                            {ex.explanation && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}><strong>Explanation:</strong> {ex.explanation}</p>}
                                        </div>
                                    ))}
                                </div>

                                {/*  Hints Panel  */}
                                <div className="glass-panel" style={{ padding: '1.25rem', border: hints.length > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                                    <div className="flex-between" style={{ marginBottom: hints.length > 0 ? '1rem' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                            <Lightbulb size={16} color="var(--warning)" />
                                            <span>Hints</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                                ({hints.length}/{MAX_HINTS} used  {HINT_PENALTY} pts each)
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
                                                {hintLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Thinking...</> : ' Get Hint'}
                                            </button>
                                        )}
                                        {hints.length >= MAX_HINTS && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Max hints used</span>
                                        )}
                                    </div>
                                    {hints.map((hint, i) => (
                                        <div key={i} style={{
                                            backgroundColor: 'rgba(245,158,11,0.08)', padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)', marginBottom: i < hints.length - 1 ? '0.6rem' : 0,
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
                            <div className="glass-panel prose slide-up" style={{ padding: '1.5rem', flex: 1, border: '1px solid var(--primary)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
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

                                <div className="flex-between" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <span className="text-muted">Time Complexity:</span> <strong style={{ color: 'var(--primary)' }}>{feedback.timeComplexity}</strong>
                                    </div>
                                    <div>
                                        <span className="text-muted">Space Complexity:</span> <strong style={{ color: 'var(--primary)' }}>{feedback.spaceComplexity}</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/app')}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '2rem' }}
                                >
                                    Return to Dashboard
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Code Editor */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                        <div className="flex-between" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Code2 size={16} />
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        const newLang = e.target.value;
                                        setLanguage(newLang);
                                        if (!feedback && !isSubmitting) {
                                            setCode(question?.starterCode?.[newLang] || '// Write your solution here...\\n');
                                        }
                                    }}
                                    disabled={!!feedback || isSubmitting}
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
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                                >
                                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Evaluating...</> : <><Send size={16} /> Submit Solution</>}
                                </button>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
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
                                    readOnly: !!feedback,
                                    scrollBeyondLastLine: false,
                                    smoothScrolling: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: true,
                                    formatOnPaste: true,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InterviewRoom;
`;

fs.writeFileSync('src/pages/InterviewRoom.jsx', code.substring(0, code.lastIndexOf('};')) + endCode);
