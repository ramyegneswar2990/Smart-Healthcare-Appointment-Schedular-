import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const StarIcon = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#FFB800" : "#E2E8F0"}>
        <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
    </svg>
);

const VerifiedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3182CE">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
);

const DoctorList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/api/users/doctors');
                setDoctors(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => setLoading(false), 800); // Smooth transition
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonCard = () => (
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px', display: 'flex', gap: '24px', marginBottom: '20px', border: '1px solid #EDF2F7' }}>
            <div style={{ width: '130px', height: '130px', borderRadius: '16px', background: '#F7FAFC', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ flex: 1 }}>
                <div style={{ height: '24px', width: '200px', background: '#F7FAFC', borderRadius: '4px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '16px', width: '150px', background: '#F7FAFC', borderRadius: '4px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '40px', width: '100%', background: '#F7FAFC', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
            </div>
        </div>
    );

    const DoctorCard = ({ doctor, isSponsored }) => (
        <div className="doctor-card-premium" style={{
            background: isSponsored ? 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)' : 'white',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            gap: '28px',
            marginBottom: '20px',
            boxShadow: isSponsored ? '0 10px 30px rgba(49, 130, 206, 0.1)' : '0 4px 20px rgba(0,0,0,0.03)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: isSponsored ? '1.5px solid #bee3f8' : '1px solid #edf2f7',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            alignItems: 'center'
        }}>
            {isSponsored && (
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '6px 16px', background: '#3182CE', color: 'white', fontSize: '10px', fontWeight: '800', borderBottomLeftRadius: '16px', letterSpacing: '1px' }}>
                    TOP RATED
                </div>
            )}

            <div style={{ position: 'relative' }}>
                <img
                    src={doctor.profileImage || `https://i.pravatar.cc/150?u=${doctor._id}`}
                    alt={doctor.name}
                    style={{ width: '140px', height: '140px', borderRadius: '18px', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}
                />
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'white', padding: '4px', borderRadius: '50%', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <VerifiedIcon />
                </div>
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '22px', color: '#1A365D', fontWeight: '800' }}>Dr. {doctor.name}</h3>
                </div>
                <p style={{ margin: '0 0 12px 0', color: '#4A5568', fontSize: '15px', fontWeight: '500' }}>{doctor.specialization || 'General Physician'}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} filled={s <= (doctor.rating || 4)} />)}
                    </div>
                    <span style={{ fontSize: '14px', color: '#718096', fontWeight: '600' }}>(48 Reviews)</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#EBF8FF', color: '#2C5282', fontSize: '12px', fontWeight: '700' }}>{doctor.experienceYears || '5'}+ Yrs Exp</span>
                    <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#F0FFF4', color: '#276749', fontSize: '12px', fontWeight: '700' }}>Available Today</span>
                    <span style={{ padding: '6px 12px', borderRadius: '10px', background: '#FFF5F5', color: '#9B2C2C', fontSize: '12px', fontWeight: '700' }}>Video Consult</span>
                </div>
            </div>

            <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', borderLeft: '1px dashed #E2E8F0', paddingLeft: '28px' }}>
                <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#718096', fontWeight: '600' }}>Next Available</p>
                    <p style={{ margin: 0, fontSize: '15px', color: '#2D3748', fontWeight: '700' }}>10:30 AM, Tomorrow</p>
                </div>
                <button
                    onClick={() => window.location.href = `/patient/appointments/book?doctorId=${doctor._id}`}
                    style={{
                        padding: '14px', borderRadius: '14px', background: '#3182CE', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)'
                    }}
                >
                    Book Appointment
                </button>
                <button
                    onClick={() => alert('Detailed profile view coming soon!')}
                    style={{
                        padding: '12px', borderRadius: '14px', background: 'white', color: '#718096', border: '1px solid #E2E8F0', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    View Profile
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
                .doctor-card-premium:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
            `}</style>

            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1A365D', margin: '0 0 8px 0' }}>Find Your Specialist</h1>
                    <p style={{ color: '#718096', margin: 0, fontSize: '16px' }}>Book appointments with the world's best doctors</p>
                </div>
                <div style={{ position: 'relative', width: '400px' }}>
                    <input
                        type="text"
                        placeholder="Search by name or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '16px 20px 16px 50px', borderRadius: '18px', border: '1px solid #E2E8F0', background: 'white', outline: 'none', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                    />
                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>
            </header>

            {loading ? (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : (
                <>
                    {filteredDoctors.length > 0 && (
                        <div style={{ marginBottom: '50px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <span style={{ height: '2px', flex: 1, background: '#E2E8F0' }}></span>
                                <span style={{ fontSize: '13px', color: '#A0AEC0', fontWeight: '800', letterSpacing: '2px' }}>RECOMMENDED DOCTORS</span>
                                <span style={{ height: '2px', flex: 1, background: '#E2E8F0' }}></span>
                            </div>
                            {filteredDoctors.slice(0, 2).map(doc => (
                                <DoctorCard key={doc._id} doctor={doc} isSponsored={true} />
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#2D3748', margin: 0 }}>All Results ({filteredDoctors.length})</h2>
                    </div>
                    {filteredDoctors.map(doc => (
                        <DoctorCard key={doc._id} doctor={doc} isSponsored={false} />
                    ))}

                    {filteredDoctors.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: '#A0AEC0' }}>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔍</div>
                            <h3>No doctors found matching "{searchTerm}"</h3>
                            <p>Try searching for a different name or specialty.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DoctorList;
