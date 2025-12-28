import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DoctorSettings = () => {
    const { refreshUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        news: true
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/auth/me');
                const userData = response.data.data;
                setUser(userData);
                if (userData.notificationPreferences) {
                    setNotifications(userData.notificationPreferences);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.target);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const data = {
            name: `${firstName} ${lastName}`.trim(),
            email: formData.get('email'),
            phone: formData.get('phone'),
            notificationPreferences: notifications
        };

        try {
            await api.put('/api/users/profile', data);
            await refreshUser();
            alert('Settings updated successfully!');
        } catch (error) {
            console.error('Error updating account:', error);
            alert(error.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        setSaving(true);
        try {
            await api.put('/api/auth/updatepassword', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert('Password updated successfully!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error updating password:', error);
            alert(error.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '24px' }}>Loading settings...</div>;

    const names = user?.name?.split(' ') || ['', ''];
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');

    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#2D3748' }}>Settings</h2>

            <div style={{ backgroundColor: 'white', maxWidth: '800px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                {/* Account Settings Section */}
                <form onSubmit={handleAccountSubmit}>
                    <div style={{ borderBottom: '1px solid #E2E8F0', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D3748' }}>Account Settings</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>First Name</label>
                                <input name="firstName" type="text" defaultValue={firstName} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>Last Name</label>
                                <input name="lastName" type="text" defaultValue={lastName} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>Email</label>
                                <input name="email" type="email" defaultValue={user?.email} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }} disabled />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>Phone</label>
                                <input name="phone" type="text" defaultValue={user?.phone || '+1 555 000 0000'} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }} />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                            <button type="submit" disabled={saving} style={{
                                backgroundColor: '#4299E1',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                color: 'white',
                                fontWeight: '500',
                                cursor: 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}>{saving ? 'Updating...' : 'Update Info'}</button>
                        </div>
                    </div>
                </form>

                {/* Security Section */}
                <form onSubmit={handleSecuritySubmit}>
                    <div style={{ borderBottom: '1px solid #E2E8F0', padding: '24px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D3748' }}>Security</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>Current Password</label>
                            <input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>New Password</label>
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#4A5568', fontWeight: '500' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '16px' }}>
                            <button type="submit" disabled={saving} style={{
                                backgroundColor: '#4299E1',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                color: 'white',
                                fontWeight: '500',
                                cursor: 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}>{saving ? 'Updating...' : 'Change Password'}</button>
                        </div>
                    </div>
                </form>

                <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D3748' }}>Notifications</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ color: '#4A5568' }}>Email Notifications</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={notifications.sms}
                                onChange={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ color: '#4A5568' }}>SMS Notifications</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={notifications.news}
                                onChange={() => setNotifications({ ...notifications, news: !notifications.news })}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ color: '#4A5568' }}>Subscribe to Newsletter</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorSettings;
