import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, Tag, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Evaluate from './pages/Evaluate.jsx';
import History from './pages/History.jsx';
import Labels from './pages/Labels.jsx';
import './App.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/evaluate', label: 'New Evaluation', icon: PlusCircle },
  { to: '/history', label: 'History', icon: ClipboardList },
  { to: '/labels', label: 'Labels', icon: Tag },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><Zap size={18} /></div>
          <span className="logo-text">PromptLab</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="version-tag">
            <span className="dot" />
            <span>v1.0.0 — LLM Ops</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-breadcrumb">
            {navItems.find(n => (n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label || 'PromptLab'}
          </div>
          <div className="topbar-status">
            <span className="status-dot" />
            <span>System Online</span>
          </div>
        </header>

        <div className="page-wrapper">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/evaluate" element={<Evaluate />} />
            <Route path="/evaluate/:id" element={<Evaluate />} />
            <Route path="/history" element={<History />} />
            <Route path="/labels" element={<Labels />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
