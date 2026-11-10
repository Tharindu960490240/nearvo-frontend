import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LuMapPinX as MapPinX } from 'react-icons/lu';
import { EmailBanner, Footer } from './components/Layout.jsx';
import { SideNav, TopHeader } from './components/AppShell.jsx';
import { LoadingPage } from './components/ui.jsx';
import { homeFor, useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import FindTradies from './pages/FindTradies.jsx';
import TradieProfile from './pages/TradieProfile.jsx';
import PostJob from './pages/PostJob.jsx';
import JobDetail from './pages/JobDetail.jsx';
import MyJobs from './pages/MyJobs.jsx';
import TradieDashboard from './pages/TradieDashboard.jsx';
import TradieProfileEdit from './pages/TradieProfileEdit.jsx';
import Admin from './pages/Admin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Account from './pages/Account.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import { Privacy, ReportPage, Terms } from './pages/Legal.jsx';

function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function NotFound() {
  return (
    <div className="container container-sm page center">
      <MapPinX size={60} color="var(--brand)" style={{ margin: '0 auto' }} />
      <h1 className="mt">Page not found</h1>
      <p className="muted mt-sm mb-lg">We couldn't find what you were looking for.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <TopHeader />
      <div className="app-shell">
        <SideNav />
        <div className="app-main">
          <EmailBanner />
          <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tradies" element={<FindTradies />} />
          <Route path="/tradies/:id" element={<TradieProfile />} />
          <Route path="/jobs/new" element={<Protected roles={['customer']}><PostJob /></Protected>} />
          <Route path="/jobs/:id" element={<Protected><JobDetail /></Protected>} />
          <Route path="/my-jobs" element={<Protected roles={['customer']}><MyJobs /></Protected>} />
          <Route path="/tradie" element={<Protected roles={['tradie']}><TradieDashboard /></Protected>} />
          <Route path="/tradie/profile" element={<Protected roles={['tradie']}><TradieProfileEdit /></Protected>} />
          <Route path="/admin" element={<Protected roles={['admin']}><Admin /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/account" element={<Protected><Account /></Protected>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
