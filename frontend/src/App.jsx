import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, NavLink } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DuelRoom from './pages/DuelRoom';
import TalentAnalytics from './pages/TalentAnalytics';
import ForgeOnboarding from './pages/ForgeOnboarding';
import JobMatchHub from './pages/JobMatchHub';
import PracticeHub from './pages/PracticeHub';
import CommunityQuests from './pages/CommunityQuests';
import Achievements from './pages/Achievements';
import QuizBattleRoom from './pages/QuizBattleRoom';
import TopicStudy from './pages/TopicStudy';
import AdaptiveQuiz from './pages/AdaptiveQuiz';
import OnboardingModal, { shouldShowOnboarding } from './components/OnboardingModal';
import {
    Loader2, LogOut, Sun, Moon, Settings as SettingsIcon,
    Trophy, LayoutDashboard, User, Swords, Radar, Briefcase, Flame,
    Code2, Brain, Sparkles, ChevronDown
} from 'lucide-react';

const getInitialTheme = () => localStorage.getItem('theme') || 'dark';
const applyTheme = (theme) => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
};

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return (
        <div className="flex-center" style={{ height: '100vh' }}>
            <Loader2 className="animate-spin" size={32} color="var(--violet-light)" />
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const Navigation = ({ theme, toggleTheme }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const isInterviewActive = location.pathname === '/interview';
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const handleLogoClick = (e) => {
        if (isInterviewActive) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('request-interview-exit'));
        }
    };

    return (
        <header className="navbar" style={scrolled ? { boxShadow: '0 4px 30px rgba(0,0,0,0.35)' } : {}}>
            <div className="navbar-inner">
                {/* Brand */}
                <Link to="/" onClick={handleLogoClick} style={{ textDecoration: 'none' }} className="nav-brand">
                    <h1 className="text-gradient" style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>AlgoPrep AI</h1>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Career-Ready Platform</p>
                </Link>

                {/* Nav links */}
                <nav className="nav-links">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="btn btn-ghost btn-icon"
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        style={{ marginRight: '0.25rem' }}
                    >
                        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                    </button>

                    {user ? (
                        <>
                            <NavLink to="/app" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <LayoutDashboard size={15} /> Dashboard
                            </NavLink>

                            <div className="nav-dropdown">
                                <button className="nav-dropdown-btn">
                                    <Brain size={15} /> Practice <ChevronDown size={14} />
                                </button>
                                <div className="nav-dropdown-content">
                                    <NavLink to="/community" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Sparkles size={15} /> System Quests
                                    </NavLink>
                                    <NavLink to="/battle" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Flame size={15} /> Quiz Battle
                                    </NavLink>
                                </div>
                            </div>

                            <div className="nav-dropdown">
                                <button className="nav-dropdown-btn">
                                    <Swords size={15} /> Compete <ChevronDown size={14} />
                                </button>
                                <div className="nav-dropdown-content">
                                    <NavLink to="/duel" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Swords size={15} /> Code Duel
                                    </NavLink>
                                    <NavLink to="/leaderboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Trophy size={15} /> Rankings
                                    </NavLink>
                                </div>
                            </div>

                            <div className="nav-dropdown">
                                <button className="nav-dropdown-btn">
                                    <Briefcase size={15} /> Career <ChevronDown size={14} />
                                </button>
                                <div className="nav-dropdown-content">
                                    <NavLink to="/talent" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Radar size={15} /> Analytics
                                    </NavLink>
                                    <NavLink to="/achievements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Trophy size={15} /> Achievements
                                    </NavLink>
                                    <NavLink to="/practice" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Brain size={15} /> Practice Hub
                                    </NavLink>
                                    <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <Briefcase size={15} /> Jobs
                                    </NavLink>
                                    <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                        <User size={15} /> Profile
                                    </NavLink>
                                </div>
                            </div>
                            <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <SettingsIcon size={15} />
                            </NavLink>
                            <Link to="/setup" className="btn btn-primary btn-sm" style={{ marginLeft: '0.5rem', textDecoration: 'none' }}>
                                New Interview
                            </Link>
                            <button
                                onClick={logout}
                                className="btn btn-ghost btn-icon"
                                title="Logout"
                                style={{ marginLeft: '0.25rem', color: 'var(--danger)' }}
                            >
                                <LogOut size={17} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link" style={{ textDecoration: 'none' }}>Log In</Link>
                            <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', marginLeft: '0.25rem' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

const AppContent = () => {
    const { user, loading } = useContext(AuthContext);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [theme, setTheme] = useState(getInitialTheme);
    const location = useLocation();
    const isFullscreen = ['/interview'].includes(location.pathname);

    useEffect(() => { applyTheme(theme); }, [theme]);
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        if (!loading && user && shouldShowOnboarding()) setShowOnboarding(true);
    }, [user, loading]);

    return (
        <>
            {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
            {!isFullscreen && <Navigation theme={theme} toggleTheme={toggleTheme} />}
            <div style={{ paddingTop: isFullscreen ? 0 : 'var(--nav-h)' }}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={user && !loading ? <Navigate to="/app" replace /> : <Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Protected */}
                    <Route path="/app"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/setup"    element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
                    <Route path="/interview" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
                    <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                    <Route path="/duel"     element={<ProtectedRoute><DuelRoom /></ProtectedRoute>} />
                    <Route path="/duel/:roomId" element={<ProtectedRoute><DuelRoom /></ProtectedRoute>} />
                    <Route path="/talent"   element={<ProtectedRoute><TalentAnalytics /></ProtectedRoute>} />
                    <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                    <Route path="/forge"    element={<ProtectedRoute><ForgeOnboarding /></ProtectedRoute>} />
                    <Route path="/jobs"     element={<ProtectedRoute><JobMatchHub /></ProtectedRoute>} />
                    <Route path="/practice" element={<ProtectedRoute><PracticeHub /></ProtectedRoute>} />
                    <Route path="/study"    element={<ProtectedRoute><TopicStudy /></ProtectedRoute>} />
                    <Route path="/community" element={<ProtectedRoute><CommunityQuests /></ProtectedRoute>} />
                    <Route path="/battle"   element={<ProtectedRoute><QuizBattleRoom /></ProtectedRoute>} />
                    <Route path="/quiz"     element={<ProtectedRoute><AdaptiveQuiz /></ProtectedRoute>} />
                </Routes>
            </div>
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
