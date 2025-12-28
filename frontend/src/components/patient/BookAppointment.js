import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a doctor was passed via state (from DoctorList)
  const initialDoctorId = new URLSearchParams(location.search).get('doctorId') || '';

  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctor: initialDoctorId,
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/api/users/doctors');
        setDoctors(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/appointments', formData);
      setSuccess(true);
      setTimeout(() => navigate('/patient/appointments'), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  if (success) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '28px', color: '#2D3748', marginBottom: '10px' }}>Appointment Confirmed!</h2>
        <p style={{ color: '#718096' }}>Redirecting you to your appointments list...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #EDF2F7' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A365D', marginBottom: '8px' }}>Book Appointment</h2>
        <p style={{ color: '#718096', marginBottom: '32px' }}>Fill in the details to schedule your visit</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#4A5568' }}>Select Doctor</label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              required
              disabled={fetchingDoctors}
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '15px' }}
            >
              <option value="">{fetchingDoctors ? 'Loading doctors...' : 'Choose a doctor'}</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#4A5568' }}>Appointment Date</label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#4A5568' }}>Prefered Time</label>
            <select
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              required
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '15px' }}
            >
              <option value="">Choose a time</option>
              {generateTimeSlots().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#4A5568' }}>Reason for Visit</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Regular checkup, headache, etc."
              rows="3"
              style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#F8FAFC', fontSize: '15px', resize: 'none' }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading || fetchingDoctors}
              style={{
                width: '100%', padding: '16px', borderRadius: '12px', background: '#3182CE', color: 'white', border: 'none', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)', transition: 'all 0.2s'
              }}
            >
              {loading ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
