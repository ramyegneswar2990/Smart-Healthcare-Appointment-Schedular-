import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
    const { refreshUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/auth/me');
                setUser(response.data.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div style={{ padding: '24px' }}>Loading profile...</div>;
    if (!user) return <div style={{ padding: '24px' }}>User not found.</div>;

    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#2D3748' }}>My Profile</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
                {/* Profile Card */}
                <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px' }}>
                        <img
                            src={user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg"}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                backgroundColor: '#4299E1',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>✎</button>
                    </div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#2D3748' }}>{user.name}</h3>
                    <p style={{ margin: '0 0 16px 0', color: '#718096', fontSize: '14px' }}>{user.specialization || 'General Physician'}</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button style={{ backgroundColor: '#EDF2F7', border: 'none', padding: '8px 16px', borderRadius: '6px', color: '#4A5568', fontWeight: '500', cursor: 'pointer' }}>Message</button>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ backgroundColor: '#4299E1', border: 'none', padding: '8px 16px', borderRadius: '6px', color: 'white', fontWeight: '500', cursor: 'pointer' }}
                        >Edit Profile</button>
                    </div>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', textAlign: 'left' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Email Address</span>
                            <span style={{ color: '#2D3748', fontWeight: '500' }}>{user.email}</span>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Phone Number</span>
                            <span style={{ color: '#2D3748', fontWeight: '500' }}>{user.phone || '+1 (555) 000-0000'}</span>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Location</span>
                            <span style={{ color: '#2D3748', fontWeight: '500' }}>{user.location || 'Not Specified'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D3748' }}>About Me</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.6', margin: 0 }}>
                            {user.bio || 'No biography provided yet. Update your profile to add information about your experience and medical background.'}
                        </p>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D3748' }}>Specialization & Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {user.skills && user.skills.length > 0 ? (
                                user.skills.map(skill => (
                                    <span key={skill} style={{ backgroundColor: '#EBF8FF', color: '#3182CE', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>{skill}</span>
                                ))
                            ) : (
                                <span style={{ color: '#718096', fontSize: '14px' }}>No skills listed.</span>
                            )}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#2D3748' }}>Awards</h3>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {user.awards && user.awards.length > 0 ? (
                                user.awards.map((award, index) => (
                                    <div key={index} style={{ flex: 1, padding: '16px', backgroundColor: '#F7FAFC', borderRadius: '8px' }}>
                                        <h4 style={{ margin: '0 0 4px 0', color: '#2D3748' }}>{award.title}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>{award.organization}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>No awards listed.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal/Overlay */}
            {isEditing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '32px',
                        borderRadius: '12px',
                        width: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Edit Profile</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = {
                                name: formData.get('name'),
                                specialization: formData.get('specialization'),
                                phone: formData.get('phone'),
                                location: formData.get('location'),
                                bio: formData.get('bio'),
                                skills: formData.get('skills').split(',').map(s => s.trim()).filter(s => s),
                            };
                            try {
                                const response = await api.put('/api/users/profile', data);
                                setUser(response.data.data);
                                await refreshUser(); // Sync sidebar
                                setIsEditing(false);
                            } catch (error) {
                                console.error('Error updating profile:', error);
                                alert('Failed to update profile');
                            }
                        }}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Full Name</label>
                                <input name="name" defaultValue={user.name} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Specialization</label>
                                    <input name="specialization" defaultValue={user.specialization} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Location</label>
                                    <input name="location" defaultValue={user.location} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Phone</label>
                                <input name="phone" defaultValue={user.phone} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>Skills (comma separated)</label>
                                <input name="skills" defaultValue={user.skills?.join(', ')} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }} placeholder="e.g. Cardiology, Surgery" />
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '500' }}>About Me</label>
                                <textarea name="bio" defaultValue={user.bio} rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', resize: 'vertical' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: '#EDF2F7', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ backgroundColor: '#4299E1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorProfile;
