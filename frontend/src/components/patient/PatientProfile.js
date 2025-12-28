import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const PatientProfile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                location: user.location || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            const res = await api.put('/api/users/profile', formData);
            if (res.data.success) {
                // Update local auth context
                setUser(res.data.data);
                setMsg({ type: 'success', text: 'Profile updated successfully!' });
                setEditMode(false);
            }
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #EDF2F7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A365D', margin: 0 }}>My Profile</h2>
                        <p style={{ color: '#718096', margin: '4px 0 0 0' }}>Manage your personal information and health preferences</p>
                    </div>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            style={{ padding: '10px 24px', borderRadius: '12px', background: '#3182CE', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.2)' }}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {msg.text && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '600',
                        background: msg.type === 'success' ? '#F0FFF4' : '#FFF5F5',
                        color: msg.type === 'success' ? '#276749' : '#C53030',
                        border: `1px solid ${msg.type === 'success' ? '#C6F6D5' : '#FED7D7'}`
                    }}>
                        {msg.text}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '40px', alignItems: 'start' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
                            <img
                                src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=3182CE&color=fff&bold=true`}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', borderRadius: '24px', objectFit: 'cover', border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            {editMode && (
                                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#3182CE', color: 'white', padding: '8px', borderRadius: '12px', cursor: 'pointer', border: '3px solid white' }}>
                                    📷
                                </div>
                            )}
                        </div>
                        <h3 style={{ marginTop: '20px', color: '#2D3748', fontSize: '20px' }}>{user?.name}</h3>
                        <span style={{ fontSize: '13px', color: '#718096', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{user?.role}</span>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    readOnly={!editMode}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: editMode ? '#F8FAFC' : 'white', fontSize: '15px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: '#EDF2F7', color: '#718096', fontSize: '15px' }}
                                />
                                <small style={{ color: '#A0AEC0', fontSize: '11px' }}>Email cannot be changed</small>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    readOnly={!editMode}
                                    placeholder="+1 234 567 890"
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: editMode ? '#F8FAFC' : 'white', fontSize: '15px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    readOnly={!editMode}
                                    placeholder="City, Country"
                                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: editMode ? '#F8FAFC' : 'white', fontSize: '15px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#4A5568' }}>Medical Bio / Notes</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                readOnly={!editMode}
                                rows="4"
                                placeholder="Any chronic conditions or important health notes..."
                                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', background: editMode ? '#F8FAFC' : 'white', fontSize: '15px', resize: 'none' }}
                            />
                        </div>

                        {editMode && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#3182CE', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)' }}
                                >
                                    {loading ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'white', color: '#718096', border: '1px solid #E2E8F0', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
