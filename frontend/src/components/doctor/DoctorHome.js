import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './DoctorHome.css';

// Placeholder icons
const UserGroupIcon = () => <span>👥</span>;
const CalendarIcon = () => <span>📅</span>;
const ClockIcon = () => <span>⏰</span>;
const ChatIcon = () => <span>💬</span>;
const DocumentTextIcon = () => <span>📄</span>;
const PhoneIcon = () => <span>📞</span>;
const CheckIcon = () => <span>✓</span>;
const XIcon = () => <span>✕</span>;

const DoctorHome = ({ searchTerm = '' }) => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayPatients: 0,
        todayAppointments: 0,
        appointments: [],
        requests: []
    });
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/appointments/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await api.patch(`/api/appointments/${appointmentId}/status`, { status: newStatus });
            // Refresh stats to reflect changes
            fetchStats();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update appointment status');
        }
    };

    // Calendar Helper
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Array(new Date(year, month, 1).getDay()).fill(null);
        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            days.push(i);
        }
        return days;
    };

    const days = getDaysInMonth(currentDate);
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const filteredAppointments = (stats.appointments || []).filter(app =>
        app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequests = (stats.requests || []).filter(req =>
        req.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '24px' }}>Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            {/* Top Stats Row */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.totalPatients}</h3>
                        <span>Total Patients</span>
                        <small>Till Today</small>
                    </div>
                    <div className="stat-icon-wrapper blue">
                        <UserGroupIcon />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.todayPatients}</h3>
                        <span>Today Patients</span>
                        <small>{new Date().toLocaleDateString()}</small>
                    </div>
                    <div className="stat-icon-wrapper indigo">
                        <UserGroupIcon />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>{stats.todayAppointments}</h3>
                        <span>Today Appointments</span>
                        <small>{new Date().toLocaleDateString()}</small>
                    </div>
                    <div className="stat-icon-wrapper orange">
                        <CalendarIcon />
                    </div>
                </div>
            </div>

            {/* Middle Grid Row */}
            <div className="dashboard-grid">
                {/* Pies Chart */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h4>Patients Summary</h4>
                    </div>
                    <div className="chart-container">
                        <div className="pie-chart" style={{
                            background: 'conic-gradient(#4299E1 0% 60%, #ED8936 60% 85%, #E2E8F0 85% 100%)',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            margin: '0 auto'
                        }}></div>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <div className="dot light"></div>
                            <span>New Patients</span>
                        </div>
                        <div className="legend-item">
                            <div className="dot orange"></div>
                            <span>Old Patients</span>
                        </div>
                        <div className="legend-item">
                            <div className="dot blue"></div>
                            <span>Total Patients</span>
                        </div>
                    </div>
                </div>

                {/* Today Appointment */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h4>Today Appointment</h4>
                        <a href="/doctor/appointments" style={{ fontSize: '12px', color: '#3182CE' }}>See All</a>
                    </div>
                    <div className="appointment-list">
                        {filteredAppointments.length === 0 ? (
                            <p style={{ color: '#718096', fontSize: '14px' }}>No appointments for today.</p>
                        ) : (
                            filteredAppointments.slice(0, 4).map((app) => (
                                <div className="appointment-item" key={app._id}>
                                    <div className="patient-info">
                                        <div className="patient-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBF8FF', color: '#3182CE', fontWeight: 'bold' }}>
                                            {app.patient?.name?.charAt(0) || 'P'}
                                        </div>
                                        <div className="patient-text">
                                            <h5>{app.patient?.name || 'Unknown Patient'}</h5>
                                            <p>{app.reason || 'General Checkup'}</p>
                                        </div>
                                    </div>
                                    <span className="time-badge">{app.appointmentTime}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Next Patient Details */}
                <div className="widget-card next-patient-card">
                    <div className="widget-header">
                        <h4>Next Patient Details</h4>
                    </div>
                    {stats.appointments && stats.appointments.length > 0 ? (
                        <>
                            <div className="patient-profile-lg" style={{ background: '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', width: '80px', height: '80px', borderRadius: '50%', fontSize: '32px', color: '#4A5568' }}>
                                {stats.appointments[0].patient?.name?.charAt(0)}
                            </div>
                            <h4 style={{ margin: '0' }}>{stats.appointments[0].patient?.name}</h4>
                            <span style={{ fontSize: '12px', color: '#718096' }}>{stats.appointments[0].reason}</span>

                            <div className="vital-grid">
                                <div className="vital-item">
                                    <span>Date</span>
                                    <strong>{new Date(stats.appointments[0].appointmentDate).toLocaleDateString()}</strong>
                                </div>
                                <div className="vital-item">
                                    <span>Time</span>
                                    <strong>{stats.appointments[0].appointmentTime}</strong>
                                </div>
                                <div className="vital-item">
                                    <span>Status</span>
                                    <strong>{stats.appointments[0].status}</strong>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn-icon-outline"><PhoneIcon /></button>
                                <button className="btn-icon-outline"><DocumentTextIcon /></button>
                                <button className="btn-icon-outline"><ChatIcon /></button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p style={{ color: '#718096' }}>No upcoming patient Scheduled.</p>
                        </div>
                    )}
                </div>

                {/* Patients Review */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h4>Patients Review</h4>
                    </div>
                    <div className="review-list">
                        <div className="review-item">
                            <div className="review-header">
                                <span>Excellent</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill fill-blue" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                        <div className="review-item">
                            <div className="review-header">
                                <span>Great</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill fill-green" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointment Request */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h4>Appointment Request</h4>
                        <a href="/doctor/appointments" style={{ fontSize: '12px', color: '#3182CE' }}>See All</a>
                    </div>
                    <div className="request-list">
                        {filteredRequests.length === 0 ? (
                            <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No pending requests.</p>
                        ) : (
                            filteredRequests.slice(0, 3).map((req) => (
                                <div className="request-item" key={req._id}>
                                    <div className="patient-info">
                                        <div className="patient-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7FAFC', color: '#4A5568' }}>
                                            {req.patient?.name?.charAt(0)}
                                        </div>
                                        <div className="patient-text">
                                            <h5>{req.patient?.name}</h5>
                                            <p>{req.reason || 'Checkup'} - <small>{new Date(req.appointmentDate).toLocaleDateString()}</small></p>
                                        </div>
                                    </div>
                                    <div className="request-actions">
                                        <button onClick={() => handleStatusUpdate(req._id, 'confirmed')} className="btn-action btn-accept" title="Accept"><CheckIcon /></button>
                                        <button onClick={() => handleStatusUpdate(req._id, 'cancelled')} className="btn-action btn-reject" title="Reject"><XIcon /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Calendar Functional View */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h4>Calendar</h4>
                        <span style={{ fontSize: '12px', color: '#3182CE' }}>{monthYear}</span>
                    </div>
                    <div className="custom-calendar-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        fontSize: '12px',
                        marginTop: '10px'
                    }}>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ fontWeight: '600', color: '#718096', textAlign: 'center' }}>{d}</div>
                        ))}
                        {days.map((day, idx) => (
                            <div key={idx} style={{
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                                background: day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? '#4299E1' : 'transparent',
                                color: day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'white' : '#4A5568',
                                fontWeight: day === new Date().getDate() ? 'bold' : 'normal',
                                cursor: day ? 'pointer' : 'default'
                            }}>
                                {day}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorHome;
