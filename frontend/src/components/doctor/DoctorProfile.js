import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DoctorProfile = () => {
    const { user: authUser, refreshUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [updating, setUpdating] = useState(false);

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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        const formData = new FormData(e.target);

        // Handle skills (comma separated string to array)
        const skillsArray = formData.get('skills')
            ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s)
            : [];

        // Handle awards (simplified for this UI - parsing specific format or just keeping existing if not editable in simple way)
        // For now, let's just update basic fields. If user wants to edit awards, we'd need a dynamic list in the form.

        const data = {
            name: formData.get('name'),
            specialization: formData.get('specialization'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            bio: formData.get('bio'),
            skills: skillsArray,
        };

        try {
            const response = await api.put('/api/users/profile', data);
            setUser(response.data.data);
            // In a real app, refreshUser might fetch full user object again
            if (refreshUser) await refreshUser();
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading profile...</div>;
    if (!user) return <div style={{ padding: '24px', textAlign: 'center' }}>User not found.</div>;

    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100%' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1A202C' }}>My Profile</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>
                {/* Profile Card */}
                <div style={{ backgroundColor: 'white', padding: '40px 32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 24px' }}>
                        <img
                            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3182CE&color=fff&bold=true`}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid #EDF2F7' }}
                        />
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '5px',
                                backgroundColor: '#4299E1',
                                border: 'none',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                fontSize: '16px'
                            }}>✎</button>
                    </div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#1A202C', fontWeight: '700' }}>Dr. {user.name}</h3>
                    <p style={{ margin: '0 0 24px 0', color: '#718096', fontSize: '15px', fontWeight: '500' }}>{user.specialization || 'General Physician'}</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
                        <button style={{ backgroundColor: '#F7FAFC', border: '1px solid #E2E8F0', padding: '10px 20px', borderRadius: '10px', color: '#4A5568', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Message</button>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ backgroundColor: '#3182CE', border: 'none', padding: '10px 20px', borderRadius: '10px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(66, 153, 225, 0.4)' }}
                        >Edit Profile</button>
                    </div>

                    <div style={{ borderTop: '1px solid #EDF2F7', paddingTop: '32px', textAlign: 'left' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: '#A0AEC0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Email Address</span>
                            <span style={{ color: '#2D3748', fontWeight: '600', fontSize: '15px' }}>{user.email}</span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: '#A0AEC0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Phone Number</span>
                            <span style={{ color: '#2D3748', fontWeight: '600', fontSize: '15px' }}>{user.phone || 'Not provided'}</span>
                        </div>
                        <div style={{ marginBottom: '0' }}>
                            <span style={{ display: 'block', fontSize: '12px', color: '#A0AEC0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Location</span>
                            <span style={{ color: '#2D3748', fontWeight: '600', fontSize: '15px' }}>{user.location || 'Not Specified'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* About Me */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1A202C', fontWeight: '700' }}>About Me</h3>
                        <p style={{ color: '#4A5568', lineHeight: '1.7', margin: 0, fontSize: '15px' }}>
                            {user.bio || 'No biography provided yet. Click "Edit Profile" to add information about your medical background, experience, and philosophy of care.'}
                        </p>
                    </div>

                    {/* Specialization & Skills */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1A202C', fontWeight: '700' }}>Specialization & Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {user.skills && user.skills.length > 0 ? (
                                user.skills.map(skill => (
                                    <span key={skill} style={{ backgroundColor: '#EBF8FF', color: '#2B6CB0', padding: '8px 16px', borderRadius: '30px', fontSize: '14px', fontWeight: '600' }}>{skill}</span>
                                ))
                            ) : (
                                <span style={{ color: '#718096', fontSize: '14px', fontStyle: 'italic' }}>No skills listed.</span>
                            )}
                        </div>
                    </div>

                    {/* Awards */}
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#1A202C', fontWeight: '700' }}>Awards</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {user.awards && user.awards.length > 0 ? (
                                user.awards.map((award, index) => (
                                    <div key={index} style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '15px', border: '1px solid #EDF2F7' }}>
                                        <h4 style={{ margin: '0 0 6px 0', color: '#2D3748', fontSize: '15px', fontWeight: '700' }}>{award.title}</h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#718096', fontWeight: '500' }}>{award.organization}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: '#718096', fontSize: '14px', margin: 0, fontStyle: 'italic' }}>No awards listed yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Sidebar/Modal */}
            {isEditing && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }} onClick={() => setIsEditing(false)}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '24px',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '85vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1A202C' }}>Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#718096' }}>×</button>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>Full Name</label>
                                    <input name="name" defaultValue={user.name} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>Specialization</label>
                                    <input name="specialization" defaultValue={user.specialization} placeholder="e.g. Cardiologist" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>Phone Number</label>
                                    <input name="phone" defaultValue={user.phone} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>Location</label>
                                    <input name="location" defaultValue={user.location} placeholder="City, Country" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>Skills (comma separated)</label>
                                <input name="skills" defaultValue={user.skills?.join(', ')} placeholder="e.g. Surgery, Patient Care, Diagnostics" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
                                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#718096' }}>Separate skills with commas.</p>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#4A5568' }}>About Me (Biography)</label>
                                <textarea name="bio" defaultValue={user.bio} rows="4" placeholder="Tell patients about your background and medical expertise..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.5' }}></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px' }}>
                                <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#4A5568', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={updating} style={{ backgroundColor: '#3182CE', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: 'white', cursor: 'pointer', transition: 'all 0.2s', opacity: updating ? 0.7 : 1 }}>
                                    {updating ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorProfile;

