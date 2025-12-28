import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './PatientHome.css';

const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const BPIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const PatientHome = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        heartRate: '72 bpm',
        bloodPressure: '120 / 80',
        nextAppointment: 'Not scheduled',
        reportsCount: '0 Files',
        appointmentsCount: 0,
        prescriptionsCount: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [userRes, statsRes] = await Promise.all([
                    api.get('/api/auth/me'),
                    api.get('/api/appointments/patient-stats')
                ]);

                setUser(userRes.data.data);

                const s = statsRes.data.data;
                setStats({
                    ...stats,
                    nextAppointment: s.nextAppointment ?
                        `${new Date(s.nextAppointment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${s.nextAppointment.time}` :
                        'Not scheduled',
                    reportsCount: `${s.reportsCount} Files`,
                    appointmentsCount: s.appointmentsCount,
                    prescriptionsCount: s.prescriptionsCount,
                    recentActivity: s.recentActivity
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div style={{ padding: '30px', textAlign: 'center' }}>Loading your dashboard...</div>;

    return (
        <div className="patient-home">
            <div className="welcome-section">
                <h1>Welcome, {user?.name?.split(' ')[0] || 'Patient'} 👋</h1>
                <p>Here is your health overview</p>
            </div>

            {/* Metrics Row */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-bg" style={{ background: '#FFF5F5' }}>
                            <HeartIcon />
                        </div>
                        <span className="status-label" style={{ color: '#38A169' }}>Normal</span>
                    </div>
                    <div className="metric-info">
                        <span>Heart Rate</span>
                        <h2>{stats.heartRate}</h2>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-bg" style={{ background: '#EBF8FF' }}>
                            <BPIcon />
                        </div>
                        <span className="status-label" style={{ color: '#3182CE' }}>Stable</span>
                    </div>
                    <div className="metric-info">
                        <span>Blood Pressure</span>
                        <h2>{stats.bloodPressure}</h2>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-bg" style={{ background: '#FAF5FF' }}>
                            <span style={{ fontSize: '20px' }}>📅</span>
                        </div>
                        <span className="status-label" style={{ color: '#E53E3E' }}>Upcoming</span>
                    </div>
                    <div className="metric-info">
                        <span>Next Appointment</span>
                        <h2>{stats.nextAppointment}</h2>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="metric-icon-bg" style={{ background: '#F0FFF4' }}>
                            <span style={{ fontSize: '20px' }}>📄</span>
                        </div>
                        <span className="status-label" style={{ color: '#718096' }}>Updated</span>
                    </div>
                    <div className="metric-info">
                        <span>Medical Reports</span>
                        <h2>{stats.reportsCount}</h2>
                    </div>
                </div>
            </div>

            {/* Dashboard Row 2 */}
            <div className="dashboard-row">
                <div className="content-box">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {stats.recentActivity.length > 0 ? stats.recentActivity.map((act, i) => (
                            <div key={i} className="activity-item">
                                <span>{act.type === 'report' ? '🧪' : '📅'}</span> {act.text}
                            </div>
                        )) : (
                            <div className="activity-item" style={{ color: '#A0AEC0' }}>No recent activity</div>
                        )}
                    </div>
                </div>

                <div className="content-box">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                        <button className="action-btn primary" onClick={() => window.location.href = '/patient/appointments/book'}>Book Appointment</button>
                        <button className="action-btn" onClick={() => window.location.href = '/patient/reports'}>View Reports</button>
                        <button className="action-btn" onClick={() => window.location.href = '/patient/doctors'}>Contact Doctor</button>
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="bottom-grid">
                <div className="content-box">
                    <h3>Today's Medications</h3>
                    <div className="card-list">
                        <div className="card-item">
                            <span>💊</span> Paracetamol – Morning
                        </div>
                        <div className="card-item">
                            <span>💊</span> Vitamin D – Afternoon
                        </div>
                        <div className="card-item">
                            <span>💊</span> BP Tablet – Night
                        </div>
                    </div>
                </div>

                <div className="content-box">
                    <h3>Upcoming Tests</h3>
                    <div className="card-list">
                        <div className="card-item">
                            <span>🧪</span> Blood Sugar Test – 28 Jan
                        </div>
                        <div className="card-item">
                            <span>💓</span> ECG – 02 Feb
                        </div>
                    </div>
                </div>

                <div className="content-box">
                    <h3>Health Tips</h3>
                    <div className="health-tip">
                        <p>Drink at least 2–3 liters of water daily and walk 30 minutes to maintain healthy blood pressure.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientHome;
