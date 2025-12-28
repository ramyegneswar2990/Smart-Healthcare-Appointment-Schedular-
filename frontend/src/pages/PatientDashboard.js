import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PatientHome from '../components/patient/PatientHome';
import AppointmentList from '../components/patient/AppointmentList';
import BookAppointment from '../components/patient/BookAppointment';
import PrescriptionList from '../components/patient/PrescriptionList';
import ReportList from '../components/patient/ReportList';
import DoctorList from '../components/patient/DoctorList';
import PatientProfile from '../components/patient/PatientProfile';
import SmartBookingPage from '../components/patient/SmartBookingPage';
import './DoctorLayout.css';

const HomeIcon = () => <span>🏠</span>;
const UserIcon = () => <span>👤</span>;
const CalendarIcon = () => <span>📅</span>;
const PrescriptionIcon = () => <span>💊</span>;
const ReportIcon = () => <span>📄</span>;
const DoctorIcon = () => <span>🩺</span>;
const LogoutIcon = () => <span>🚪</span>;
const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#718096" />
    <circle cx="18" cy="6" r="4" fill="#E53E3E" stroke="white" strokeWidth="1.5" />
  </svg>
);

const PatientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Health Overview';
    if (path.includes('appointments')) return 'My Appointments';
    if (path.includes('prescriptions')) return 'Medical Prescriptions';
    if (path.includes('reports')) return 'Medical Reports';
    if (path.includes('doctors')) return 'Specialist Directory';
    if (path.includes('profile')) return 'My Profile';
    return 'Dashboard';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="doctor-layout" style={{ fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)' }}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#3182CE', borderRadius: '8px', padding: '6px', color: 'white', display: 'flex' }}>
            <DoctorIcon />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#1A365D' }}>HealthCare<span style={{ color: '#3182CE' }}>+</span></span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/patient/dashboard" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <HomeIcon /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/patient/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserIcon /> <span>Profile</span>
          </NavLink>
          <NavLink to="/patient/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarIcon /> <span>Appointments</span>
          </NavLink>
          <NavLink to="/patient/prescriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PrescriptionIcon /> <span>Prescriptions</span>
          </NavLink>
          <NavLink to="/patient/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ReportIcon /> <span>Reports</span>
          </NavLink>
          <NavLink to="/patient/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <DoctorIcon /> <span>Doctors</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid #EDF2F7' }}>
          <div className="user-brief" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img
              src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'Patient'}&background=3182CE&color=fff`}
              style={{ width: '36px', height: '36px', borderRadius: '50%' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#2D3748', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>Patient Account</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#E53E3E' }}>
            <LogoutIcon /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="layout-content">
        <header className="top-header" style={{ background: 'transparent', border: 'none', padding: '30px', height: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A365D', margin: 0 }}>{getPageTitle()}</h2>
            <div style={{ padding: '6px 14px', background: 'white', borderRadius: '10px', fontSize: '13px', color: '#718096', fontWeight: '600', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="icon-btn" style={{ background: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} onClick={() => alert('No new notifications')}><BellIcon /></button>
            <div className="profile-btn" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/patient/profile'}>
              <img
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'Patient'}&background=3182CE&color=fff`}
                alt="Profile"
                style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>
        </header>

        <main className="main-area" style={{ flex: 1, overflowY: 'auto', padding: '0 30px 30px 30px' }}>
          <Routes>
            <Route path="/" element={<PatientHome />} />
            <Route path="/dashboard" element={<PatientHome />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/appointments/book" element={<BookAppointment />} />
            <Route path="/appointments/smart-book" element={<SmartBookingPage />} />
            <Route path="/prescriptions" element={<PrescriptionList />} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
