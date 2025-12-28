import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const res = await api.get('/api/prescriptions');
                setPrescriptions(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Fetching your medical record...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1A365D', margin: '0 0 8px 0' }}>Digital Prescriptions</h2>
                <p style={{ color: '#718096', margin: 0 }}>View and manage your recent medications and doctor advice</p>
            </div>

            <div style={{ display: 'grid', gap: '30px' }}>
                {prescriptions.length === 0 ? (
                    <div style={{ background: 'white', padding: '100px 40px', borderRadius: '24px', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
                        <div style={{ fontSize: '50px', marginBottom: '16px', opacity: 0.5 }}>💊</div>
                        <h3 style={{ color: '#718096', margin: 0 }}>No prescriptions found in your history</h3>
                    </div>
                ) : (
                    prescriptions.map(pres => (
                        <div key={pres._id} style={{
                            background: 'white',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                            border: '1px solid #EDF2F7',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                right: '30px',
                                top: '30px',
                                fontSize: '80px',
                                fontWeight: '900',
                                color: '#F7FAFC',
                                zIndex: 0,
                                transform: 'rotate(-10deg)',
                                pointerEvents: 'none'
                            }}>Rx</div>

                            <div style={{ padding: '30px', borderBottom: '1px solid #F7FAFC', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: '#3182CE', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                                        {pres.doctor?.name?.[0] || 'D'}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', color: '#2D3748' }}>Dr. {pres.doctor?.name}</h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#718096', fontWeight: '500' }}>{pres.doctor?.specialization}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '13px', color: '#718096', fontWeight: '600', marginBottom: '4px' }}>Date Issued</span>
                                    <span style={{ fontSize: '15px', color: '#2D3748', fontWeight: '700' }}>{new Date(pres.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>

                            <div style={{ padding: '30px', zIndex: 1, position: 'relative' }}>
                                <h4 style={{ fontSize: '14px', color: '#3182CE', fontWeight: '800', letterSpacing: '1px', marginBottom: '20px', textTransform: 'uppercase' }}>Medicines & Dosage</h4>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {pres.medicines.map((med, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: '#F8FAFC',
                                            border: '1px solid #EDF2F7'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2D3748', marginBottom: '4px' }}>{med.name}</div>
                                                <div style={{ fontSize: '13px', color: '#718096' }}>{med.dosage} • {med.duration}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#38A169' }}>{med.frequency}</div>
                                                <div style={{ fontSize: '12px', color: '#A0AEC0' }}>{med.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {pres.instructions && (
                                    <div style={{ marginTop: '24px', padding: '16px', borderRadius: '16px', background: '#FFFBF0', border: '1px solid #FEEBC8' }}>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#744210', fontWeight: '500' }}>
                                            <span style={{ fontWeight: '800' }}>Doctor's Advice:</span> {pres.instructions}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '20px 30px', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    onClick={() => alert('Feature coming soon!')}
                                    style={{ padding: '10px 20px', borderRadius: '10px', background: 'white', border: '1px solid #E2E8F0', color: '#718096', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Share
                                </button>
                                <button
                                    onClick={() => {
                                        const btn = document.activeElement;
                                        btn.innerText = 'Downloading...';
                                        setTimeout(() => {
                                            btn.innerText = 'Download PDF';
                                            alert('Digital Prescription Slip Downloaded Successfully!');
                                        }, 1500);
                                    }}
                                    style={{ padding: '10px 20px', borderRadius: '10px', background: '#3182CE', border: 'none', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(49, 130, 206, 0.2)' }}
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export default PrescriptionList;
