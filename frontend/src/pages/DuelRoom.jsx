import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import {
    Swords, Timer, Trophy, Send, Users, Zap, Crown, Copy,
    CheckCircle2, Bot, Wifi, WifiOff, Hash, Play, ArrowRight, ChevronLeft,
    Loader2, MessageSquare, AlertTriangle, XCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const DuelRoom = () => {
    const { user, token } = useContext(AuthContext);
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();

    const [phase, setPhase] = useState('lobby'); // lobby | waiting | duel | judging | result
    const [roomId, setRoomId] = useState(urlRoomId || '');
    const [joined, setJoined] = useState(false);
    const [players, setPlayers] = useState([]);
    const [code, setCode] = useState('// Solve the problem here...\nfunction solve() {\n\n}');
    const [problem] = useState({
        title: "Two Sum", 
        difficulty: "Easy",
        desc: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
        tags: ["Array", "Hash Table"]
    });
    const [elapsed, setElapsed] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [duelResult, setDuelResult] = useState(null);
    const [roomStatus, setRoomStatus] = useState('waiting');
    const [opponentSubmitted, setOpponentSubmitted] = useState(false);
    const [language, setLanguage] = useState('javascript');

    const timerRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        socketRef.current = io(API_URL, {
            auth: { token }
        });

        const s = socketRef.current;

        s.on('room_update', (room) => {
            console.log("Room Update Received:", room);
            setPlayers(room.players);
            setRoomStatus(room.status);
            if (room.language) setLanguage(room.language);
            
            // Auto-start duel if 2 players are in and we are in waiting state
            if (room.players.length === 2 && (room.status === 'duel' || room.status === 'waiting')) {
                setPhase('duel');
            }
        });

        s.on('player_submitted', (data) => {
            if (data.username !== user.username) {
                setOpponentSubmitted(true);
            }
        });

        s.on('duel_finished', (result) => {
            setDuelResult(result);
            setPhase('result');
        });

        return () => {
            s.disconnect();
            clearInterval(timerRef.current);
        };
    }, [token, user.username]);

    useEffect(() => {
        if (phase === 'duel') {
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
    }, [phase]);

    const handleJoin = () => {
        if (!roomId || !socketRef.current) return;
        socketRef.current.emit('join_room', { roomId, username: user.username });
        setJoined(true);
        setPhase('waiting');
    };

    const handleCreate = () => {
        if (!socketRef.current) return;
        const id = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(id);
        socketRef.current.emit('join_room', { roomId: id, username: user.username });
        setJoined(true);
        setPhase('waiting');
    };

    const handleSubmit = () => {
        if (!socketRef.current) return;
        setIsSubmitted(true);
        socketRef.current.emit('submit_code', { roomId, username: user.username, code, language });
        if (opponentSubmitted) {
            setPhase('judging');
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        if (socketRef.current) {
            socketRef.current.emit('change_language', { roomId, language: newLang });
        }
    };

    // ── LOBBY UI ─────────────────────────────────────────────────────────────
    if (phase === 'lobby') return (
        <div className="container" style={{ paddingTop: '4rem' }}>
            <div className="slide-up" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '1.25rem', background: 'rgba(219,39,119,0.1)', borderRadius: '24px', marginBottom: '1.5rem', color: 'var(--pink-light)', border: '1px solid rgba(219,39,119,0.2)' }}>
                    <Swords size={40} />
                </div>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Code <span className="text-gradient">Duel</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
                    Challenge a friend or a random opponent in a real-time DSA battle. AI judges your quality.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Host a Battle</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create a unique room link to invite your opponent.</p>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreate}>
                            Create Room
                        </button>
                    </div>

                    <div className="glass-panel" style={{ padding: '2.5rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Join Battle</h3>
                        <input 
                            className="form-control" 
                            placeholder="Enter Room Code" 
                            value={roomId} 
                            onChange={e => setRoomId(e.target.value.toUpperCase())}
                            style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em', marginBottom: '1rem' }}
                        />
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleJoin} disabled={!roomId}>
                            Join Room
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── WAITING UI ───────────────────────────────────────────────────────────
    if (phase === 'waiting') return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
                <div className="spinner" style={{ width: '50px', height: '50px', margin: '0 auto 2rem' }}></div>
                <h2 style={{ marginBottom: '1rem' }}>Waiting for Opponent</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Share this code with your rival:</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.3em', color: 'var(--violet-light)', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    {roomId}
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Users size={16} /> {players.length} / 2 Connected
                    </div>
                </div>
            </div>
        </div>
    );

    // ── DUEL UI ──────────────────────────────────────────────────────────────
    if (phase === 'duel' || phase === 'judging') return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
            <div style={{ height: '60px', background: 'rgba(13,17,23,0.98)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="pulse-dot" style={{ background: 'var(--success)' }}></div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>LIVE BATTLE</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ROOM: <span style={{ color: 'var(--text-main)' }}>{roomId}</span></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem', fontWeight: 900, fontFamily: 'JetBrains Mono' }}>
                    <select 
                        value={language}
                        onChange={e => handleLanguageChange(e.target.value)}
                        disabled={isSubmitted}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', outline: 'none' }}
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                    <Timer size={20} color="var(--violet-light)" />
                    {fmt(elapsed)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {players.map(p => (
                            <div key={p.id} className="badge" style={{ background: p.username === user.username ? 'var(--violet-dim)' : 'rgba(255,255,255,0.05)', borderColor: p.username === user.username ? 'var(--violet-light)' : 'var(--border)' }}>
                                {p.username === user.username ? 'YOU' : p.username.toUpperCase()}
                            </div>
                        ))}
                    </div>
                    {opponentSubmitted && <span className="badge badge-warning">OPPONENT FINISHED</span>}
                    <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isSubmitted}>
                        {isSubmitted ? 'SUBMITTED' : <><Send size={14} /> SUBMIT</>}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderRight: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
                    <div className="badge badge-success" style={{ marginBottom: '1rem' }}>{problem.difficulty}</div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{problem.title}</h2>
                    <p style={{ color: 'var(--text-sub)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2rem' }}>{problem.desc}</p>
                    
                    <div className="section-label">AI Judging Criteria</div>
                    <div className="glass-panel" style={{ padding: '1rem', fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Efficiency</span> <span>O(n) / O(log n)</span>
                        </div>
                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Readability</span> <span>Named variables / Comments</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Correctness</span> <span>Logic / Edge cases</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {phase === 'judging' ? (
                        <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '1.5rem', background: 'rgba(0,0,0,0.4)' }}>
                            <Loader2 size={48} className="animate-spin" color="var(--violet-light)" />
                            <h3 style={{ margin: 0 }}>AI Judging in Progress...</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Analyzing complexity and readability of both submissions.</p>
                        </div>
                    ) : (
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language={language}
                            value={code}
                            onChange={v => setCode(v)}
                            options={{
                                fontSize: 16,
                                minimap: { enabled: false },
                                padding: { top: 20 },
                                fontFamily: 'JetBrains Mono, monospace'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );

    // ── RESULT UI ────────────────────────────────────────────────────────────
    if (phase === 'result' && duelResult) return (
        <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div className="slide-up" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>
                        {duelResult.winner === user.username ? '🏆' : duelResult.winner === 'Draw' ? '🤝' : '💪'}
                    </div>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                        {duelResult.winner === user.username ? 'VICTORY' : duelResult.winner === 'Draw' ? 'IT\'S A DRAW' : 'GOOD EFFORT'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>AI evaluation complete for Room {roomId}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    {[
                        { name: players[0]?.username, score: duelResult.p1, isYou: players[0]?.username === user.username },
                        { name: players[1]?.username, score: duelResult.p2, isYou: players[1]?.username === user.username }
                    ].map(p => (
                        <div key={p.name} className={`glass-panel ${duelResult.winner === p.name ? 'card-glow' : ''}`} style={{ padding: '2.5rem', border: duelResult.winner === p.name ? '2px solid var(--success)' : '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {p.name} {p.isYou && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>(YOU)</span>}
                                </h3>
                                {duelResult.winner === p.name && <Crown color="var(--warning)" size={24} />}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Correctness</span>
                                    <span style={{ fontWeight: 800, color: 'var(--success)' }}>{p.score?.correctness}/10</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Efficiency</span>
                                    <span style={{ fontWeight: 800, color: 'var(--warning)' }}>{p.score?.efficiency}/10</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Readability</span>
                                    <span style={{ fontWeight: 800, color: 'var(--cyan)' }}>{p.score?.readability}/10</span>
                                </div>
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                                    "{p.score?.feedback}"
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', background: 'rgba(124,58,237,0.05)', border: '1px dashed rgba(124,58,237,0.3)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                        <Bot size={24} color="var(--violet-light)" />
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem' }}>AI Judge's Verdict</h4>
                            <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: 1.6 }}>{duelResult.explanation}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        New Duel
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );

    return null;
};

export default DuelRoom;
