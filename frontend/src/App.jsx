import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OnboardingModal, { shouldShowOnboarding } from './components/OnboardingModal';
import { Loader2, LogOut, User, Sun, Moon, Settings as SettingsIcon, Trophy } from 'lucide-react';

// ── Theme helpers ─────────────────────────────────────────────────────────
const getInitialTheme = () => localStorage.getItem('theme') || 'dark';

const applyTheme = (theme) => {
  document.body.classList.toggle('light', theme === 'light');
  localStorage.setItem('theme', theme);
};

// ── Route guard ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const Navigation = ({ theme, toggleTheme }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const isInterviewActive = location.pathname === '/interview';

  const handleLogoClick = (e) => {
    if (isInterviewActive) {
      e.preventDefault();
      // We can dispatch a custom event that InterviewRoom listens for,
      // or rely on the UI 'End Interview' button in the room
      window.dispatchEvent(new CustomEvent('request-interview-exit'));
    }
  };

  return (
    <header className="flex-between" style={{ marginBottom: '2rem' }}>
      <div>
        <Link to="/" onClick={handleLogoClick} style={{ textDecoration: 'none' }}>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>AlgoPrep AI</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Your Mock Technical Interviewer</p>
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className="btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)',
            padding: '0.5rem', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <>
            <Link to="/app" className="btn btn-outline" style={{ textDecoration: 'none', border: 'none' }}>Dashboard</Link>
            <Link to="/leaderboard" className="btn btn-outline" style={{ textDecoration: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Trophy size={16} /> Rankings
            </Link>
            <Link to="/profile" className="btn btn-outline" style={{ textDecoration: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> Profile
            </Link>
            <Link to="/settings" className="btn btn-outline" style={{ textDecoration: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SettingsIcon size={18} />
            </Link>
            <Link to="/setup" className="btn btn-primary" style={{ textDecoration: 'none' }}>New Interview</Link>
            <button onClick={logout} className="btn" style={{ background: 'transparent', color: 'var(--text-muted)' }} title="Logout">
              <LogOut size={20} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Log In</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

// ── Inner App ─────────────────────────────────────────────────────────────
const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    if (!loading && user && shouldShowOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user, loading]);

  return (
    <>
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      <div className="container">
        <Navigation theme={theme} toggleTheme={toggleTheme} />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/" element={user && !loading ? <Navigate to="/app" replace /> : <Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected */}
            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────
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
