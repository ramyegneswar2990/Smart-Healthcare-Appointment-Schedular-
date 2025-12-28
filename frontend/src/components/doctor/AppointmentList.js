import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AppointmentList = ({ searchTerm: globalSearch }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments');
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching:', error);
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
      alert('Update failed');
    }
  };

  const search = globalSearch || '';
  const filtered = appointments.filter(app =>
    app.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    app.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Pending Requests', status: ['booked', 'pending'], color: '#BEE3F8' },
    { title: 'Confirmed Schedule', status: ['confirmed'], color: '#C6F6D5' },
    { title: 'Completed / Others', status: ['completed', 'cancelled'], color: '#EDF2F7' }
  ];

  if (loading) return <div style={{ padding: '24px' }}>Loading board...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2D3748', marginBottom: '24px' }}>Appointment Workflow Board</h2>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {columns.map(col => (
          <div key={col.title} style={{ flex: '1', minWidth: '300px', background: '#F7FAFC', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4A5568', margin: 0 }}>{col.title}</h3>
              <span style={{ border: `1px solid ${col.color}`, background: col.color, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                {filtered.filter(a => col.status.includes(a.status)).length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.filter(a => col.status.includes(a.status)).map(app => (
                <div key={app._id} style={{ background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${col.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{app.patient?.name}</h4>
                    <span style={{ fontSize: '12px', color: '#718096' }}>{app.appointmentTime}</span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718096' }}>{app.reason || 'General Checkup'}</p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {(app.status === 'booked' || app.status === 'pending') && (
                      <button onClick={() => handleAction(app._id, 'confirmed')} style={{ border: 'none', background: '#C6F6D5', color: '#22543D', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Accept</button>
                    )}
                    {app.status === 'confirmed' && (
                      <button onClick={() => handleAction(app._id, 'completed')} style={{ border: 'none', background: '#BEE3F8', color: '#2A4365', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>Complete</button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button onClick={() => handleAction(app._id, 'cancelled')} style={{ border: 'none', background: 'none', color: '#E53E3E', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.filter(a => col.status.includes(a.status)).length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#A0AEC0', fontSize: '13px', border: '2px dashed #E2E8F0', borderRadius: '8px' }}>
                  No cards here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;
