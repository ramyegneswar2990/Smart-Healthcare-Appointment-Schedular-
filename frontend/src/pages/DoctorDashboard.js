import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppointmentList from '../components/doctor/AppointmentList';
import DoctorHome from '../components/doctor/DoctorHome';
import DoctorAppointmentPage from '../components/doctor/DoctorAppointmentPage';
import DoctorPayment from '../components/doctor/DoctorPayment';
import DoctorProfile from '../components/doctor/DoctorProfile';
import DoctorSettings from '../components/doctor/DoctorSettings';
import DoctorReportManager from '../components/doctor/DoctorReportManager';
import './DoctorLayout.css';

// Placeholder icons
// Placeholder icons
const HomeIcon = () => <span>🏠</span>;
const CalendarIcon = () => <span>📅</span>;
const CreditCardIcon = () => <span>💳</span>;
const UserIcon = () => <span>👤</span>;
const LogoutIcon = () => <span>🚪</span>;
const ReportIcon = () => <span>📋</span>;
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="4" fill="#E9D5FF" />
    <path d="M22 7L13.03 12.7C12.41 13.1 11.59 13.1 10.97 12.7L2 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#F6AD55" />
    <circle cx="18" cy="6" r="4" fill="#E53E3E" stroke="white" strokeWidth="1.5" />
  </svg>
);
const ClockIcon = () => <span>⏰</span>;
const SettingsIcon = () => <span>⚙️</span>;

const DoctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [globalSearch, setGlobalSearch] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="doctor-layout" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-icon" style={{ background: '#4299E1', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="logo-text" style={{ fontSize: '20px', fontWeight: '700', color: '#2D3748' }}>Health <span style={{ color: '#4299E1' }}>Care</span></span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/doctor/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <HomeIcon />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/doctor/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <CalendarIcon />
            <span>Work Board</span>
          </NavLink>
          <NavLink to="/doctor/appointment-page" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <ClockIcon />
            <span>Schedule Table</span>
          </NavLink>
          <NavLink to="/doctor/payment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <CreditCardIcon />
            <span>Payment</span>
          </NavLink>
          <NavLink to="/doctor/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <ReportIcon />
            <span>Patient Reports</span>
          </NavLink>
          <NavLink to="/doctor/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <UserIcon />
            <span>Profile</span>
          </NavLink>
          <NavLink to="/doctor/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <SettingsIcon />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #EDF2F7' }}>
          <div className="doctor-brief" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img
              src={user?.profileImage || `https://i.pravatar.cc/150?u=${user?._id}`}
              alt="Doctor"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div className="brief-info">
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{user?.name || 'Dr. Guest'}</h5>
              <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>{user?.specialization || 'Oncologist'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', padding: '12px 16px', color: '#E53E3E' }}>
            <LogoutIcon style={{ marginRight: '12px' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="layout-content">
        {/* Top Header */}
        <header className="top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '70px', background: '#fff', borderBottom: '1px solid #EDF2F7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 className="header-title" style={{ fontSize: '22px', fontWeight: '700', color: '#2D3748', margin: 0 }}>Dashboard</h1>
            <div style={{ padding: '6px 14px', background: '#F7FAFC', borderRadius: '10px', fontSize: '13px', color: '#718096', fontWeight: '600', border: '1px solid #EDF2F7' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="search-bar" style={{ display: 'flex', background: '#F7FAFC', border: '1px solid #EDF2F7', borderRadius: '10px', padding: '6px 12px', alignItems: 'center', gap: '8px' }}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search everything..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '180px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button className="icon-btn" onClick={() => alert('Feature coming soon!')} style={{ padding: '8px', borderRadius: '10px' }}><MailIcon /></button>
              <button className="icon-btn" onClick={() => alert('No new notifications')} style={{ padding: '8px', borderRadius: '10px' }}><BellIcon /></button>
            </div>

            <div className="profile-shortcut" style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '/doctor/profile'}>
              <img
                src={user?.profileImage || `https://i.pravatar.cc/150?u=${user?._id}`}
                alt="Profile"
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px dashed #4299E1', padding: '2px' }}
              />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="main-area" style={{ background: 'transparent', minHeight: 'calc(100vh - 70px)' }}>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DoctorHome searchTerm={globalSearch} />} />
            <Route path="appointments" element={<AppointmentList searchTerm={globalSearch} />} />
            <Route path="appointment-page" element={<DoctorAppointmentPage />} />
            <Route path="payment" element={<DoctorPayment />} />
            <Route path="reports" element={<DoctorReportManager />} />
            <Route path="profile" element={<DoctorProfile />} />
            <Route path="settings" element={<DoctorSettings />} />
            <Route path="*" element={<DoctorHome searchTerm={globalSearch} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
