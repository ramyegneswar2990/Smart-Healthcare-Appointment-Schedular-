import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const DoctorReportManager = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientReports, setPatientReports] = useState([]);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        notes: '',
        fileUrl: ''
    });

    // Fetch all patients (from appointments)
    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/api/appointments');
            // Extract unique patients from appointments
            const uniquePatients = res.data.data.reduce((acc, appointment) => {
                if (appointment.patient && !acc.find(p => p._id === appointment.patient._id)) {
                    acc.push(appointment.patient);
                }
                return acc;
            }, []);
            setPatients(uniquePatients);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPatientReports = async (patientId) => {
        try {
            const res = await api.get(`/api/reports/patient/${patientId}`);
            setPatientReports(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        fetchPatientReports(patient._id);
        setShowUploadForm(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulate file upload - In production, upload to cloud storage (Cloudinary/AWS S3)
            const mockUrl = `https://example.com/reports/${Date.now()}_${file.name}`;
            setFormData({ ...formData, fileUrl: mockUrl });
            alert(`File "${file.name}" ready to upload.\nIn production, this would upload to cloud storage.`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log('Submitting report:', {
            ...formData,
            patientId: selectedPatient._id
        });

        try {
            const response = await api.post('/api/reports', {
                ...formData,
                patientId: selectedPatient._id
            });

            console.log('Report upload success:', response.data);
            alert('✅ Report uploaded successfully! Patient will see it in their dashboard.');
            setShowUploadForm(false);
            setFormData({ title: '', notes: '', fileUrl: '' });
            fetchPatientReports(selectedPatient._id);
        } catch (err) {
            console.error('Report upload error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to upload report';
            alert(`❌ Upload failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A365D', margin: '0 0 8px 0' }}>📋 Patient Report Manager</h2>
                <p style={{ color: '#718096', margin: 0 }}>Upload medical reports for your patients</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                {/* Patient List */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #EDF2F7', maxHeight: '600px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#2D3748', marginBottom: '20px' }}>Your Patients</h3>
                    {patients.length === 0 ? (
                        <p style={{ color: '#A0AEC0', textAlign: 'center', padding: '20px' }}>No patients found</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {patients.map(patient => (
                                <div
                                    key={patient._id}
                                    onClick={() => handlePatientSelect(patient)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: selectedPatient?._id === patient._id ? '#EBF8FF' : '#F7FAFC',
                                        border: selectedPatient?._id === patient._id ? '2px solid #3182CE' : '1px solid #E2E8F0',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3182CE', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                                            {patient.name?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2D3748' }}>{patient.name}</div>
                                            <div style={{ fontSize: '12px', color: '#718096' }}>{patient.email}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Report Section */}
                <div>
                    {!selectedPatient ? (
                        <div style={{ background: 'white', borderRadius: '20px', padding: '80px 40px', textAlign: 'center', border: '2px dashed #E2E8F0' }}>
                            <div style={{ fontSize: '60px', marginBottom: '16px', opacity: 0.3 }}>👈</div>
                            <h3 style={{ color: '#718096' }}>Select a patient to manage reports</h3>
                        </div>
                    ) : (
                        <div style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #EDF2F7' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2D3748', margin: '0 0 4px 0' }}>{selectedPatient.name}'s Reports</h3>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>{selectedPatient.email}</p>
                                </div>
                                <button
                                    onClick={() => setShowUploadForm(!showUploadForm)}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        background: showUploadForm ? '#E2E8F0' : '#3182CE',
                                        color: showUploadForm ? '#2D3748' : 'white',
                                        border: 'none',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        boxShadow: showUploadForm ? 'none' : '0 4px 12px rgba(49, 130, 206, 0.3)'
                                    }}
                                >
                                    {showUploadForm ? 'Cancel' : '+ Upload Report'}
                                </button>
                            </div>

                            {/* Upload Form */}
                            {showUploadForm && (
                                <form onSubmit={handleSubmit} style={{ background: '#F7FAFC', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '14px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '8px' }}>Report Title *</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g., Blood Test Results, X-Ray Chest"
                                                required
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '14px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '8px' }}>Upload File</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontSize: '14px' }}
                                            />
                                            <small style={{ color: '#718096', fontSize: '12px' }}>Supported: PDF, JPG, PNG (Max 10MB)</small>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '14px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '8px' }}>Clinical Notes</label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Add any important findings or recommendations..."
                                                rows="3"
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '14px', resize: 'none' }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !formData.title}
                                            style={{
                                                padding: '14px',
                                                borderRadius: '12px',
                                                background: formData.title ? '#38A169' : '#CBD5E0',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: '700',
                                                cursor: formData.title ? 'pointer' : 'not-allowed',
                                                fontSize: '15px'
                                            }}
                                        >
                                            {loading ? 'Uploading...' : '📤 Upload Report to Patient'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Existing Reports */}
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#2D3748', marginBottom: '16px' }}>Existing Reports ({patientReports.length})</h4>
                                {patientReports.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#A0AEC0' }}>
                                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                                        <p>No reports uploaded yet</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {patientReports.map(report => (
                                            <div key={report._id} style={{ padding: '16px', borderRadius: '12px', background: '#F7FAFC', border: '1px solid #E2E8F0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                    <div>
                                                        <h5 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#2D3748' }}>{report.title}</h5>
                                                        <p style={{ margin: 0, fontSize: '13px', color: '#718096' }}>
                                                            {new Date(report.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        background: report.status === 'reviewed' ? '#C6F6D5' : '#FED7D7',
                                                        color: report.status === 'reviewed' ? '#22543D' : '#822727'
                                                    }}>
                                                        {report.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                {report.notes && (
                                                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4A5568', fontStyle: 'italic' }}>
                                                        📝 {report.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorReportManager;
