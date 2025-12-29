import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import '../../App.css';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = React.useCallback(async () => {
    try {
      const response = await api.get('/api/appointments');
      setAppointments(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);


  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.patch(`/api/appointments/${id}/status`, { status: 'cancelled' });
        fetchAppointments();
      } catch (err) {
        alert('Failed to cancel appointment');
      }
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2D3748', margin: 0 }}>My Appointments</h2>
        <button
          onClick={() => window.location.href = '/patient/appointments/book'}
          style={{ padding: '10px 20px', background: '#3182CE', color: 'white', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
        >
          + Book New
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#F7FAFC' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#718096', fontWeight: '600' }}>Doctor</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#718096', fontWeight: '600' }}>Date & Time</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#718096', fontWeight: '600' }}>Reason</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#718096', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'right', color: '#718096', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>No appointments yet.</td></tr>
            ) : (
              appointments.map((app) => (
                <tr key={app._id} style={{ borderTop: '1px solid #EDF2F7' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={app.doctor?.profileImage || "https://ui-avatars.com/api/?name=Doctor&background=E2E8F0"} alt="Doctor" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <span style={{ fontWeight: '500' }}>Dr. {app.doctor?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#4A5568' }}>
                    {new Date(app.appointmentDate).toDateString()} <br />
                    <small style={{ color: '#718096' }}>{app.appointmentTime}</small>
                  </td>
                  <td style={{ padding: '16px', color: '#4A5568' }}>{app.reason || 'Checkup'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: app.status === 'confirmed' ? '#C6F6D5' : app.status === 'cancelled' ? '#FED7D7' : '#EBF8FF',
                      color: app.status === 'confirmed' ? '#22543D' : app.status === 'cancelled' ? '#822727' : '#2A4365'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {app.status === 'pending' || app.status === 'booked' ? (
                      <button onClick={() => handleCancel(app._id)} style={{ border: 'none', background: '#FFF5F5', color: '#E53E3E', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Cancel</button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default AppointmentList;

