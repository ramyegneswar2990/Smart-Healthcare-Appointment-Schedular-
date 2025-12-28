import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const DoctorAppointmentPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAppointments = async () => {
        try {
            const response = await api.get('/api/appointments');
            setAppointments(response.data.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAction = async (id, status) => {
        try {
            await api.patch(`/api/appointments/${id}/status`, { status });
            fetchAppointments();
        } catch (error) {
            alert('Action failed');
        }
    };

    const filtered = appointments.filter(app =>
        app.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#2D3748', margin: 0 }}>Appointment Management</h2>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#4A5568' }}>Upcoming Schedule</h3>
                    <button
                        onClick={() => alert('New Appointment feature coming soon')}
                        style={{ backgroundColor: '#4299E1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                    >+ New Appointment</button>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#F7FAFC' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Patient Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Time</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Type</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No appointments found.</td></tr>
                            ) : (
                                filtered.map((app, index) => (
                                    <tr key={app._id} style={{ borderTop: '1px solid #EDF2F7' }}>
                                        <td style={{ padding: '16px', color: '#2D3748' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#EBF4FF',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#718096'
                                                }}>
                                                    P{index + 1}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{app.patient?.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#4A5568', fontSize: '14px' }}>
                                            {new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '16px', color: '#4A5568', fontSize: '14px' }}>{app.appointmentTime}</td>
                                        <td style={{ padding: '16px', color: '#4A5568', fontSize: '14px' }}>{app.reason || 'General Checkup'}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                backgroundColor: '#C6F6D5',
                                                color: '#22543D',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => alert(`Editing: ${app.patient?.name}`)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '16px', fontSize: '16px', color: '#ED8936' }}
                                            >✏️</button>
                                            <button
                                                onClick={() => handleAction(app._id, 'cancelled')}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#E53E3E' }}
                                            >❌</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorAppointmentPage;
