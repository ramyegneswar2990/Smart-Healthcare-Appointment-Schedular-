import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/api/reports');
                setReports(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return <div style={{ padding: '24px' }}>Loading reports...</div>;

    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#2D3748', margin: 0 }}>Medical Reports</h2>
                <button
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'application/pdf,image/*';
                        input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                alert(`Simulating upload of: ${file.name}\n\nIn the backend, this would use Multer/Cloudinary to store your file and link it to your profile.`);
                            }
                        };
                        input.click();
                    }}
                    style={{ padding: '10px 20px', background: '#3182CE', color: 'white', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 10px rgba(49, 130, 206, 0.2)' }}
                >
                    + Upload New
                </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {reports.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#718096' }}>
                        No medical reports found.
                    </div>
                ) : (
                    reports.map(report => (
                        <div key={report._id} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                <div style={{ background: '#E6FFFA', padding: '12px', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>📄</span>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px' }}>{report.title}</h3>
                                    <p style={{ margin: '4px 0', color: '#718096', fontSize: '13px' }}>{new Date(report.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: report.status === 'reviewed' ? '#C6F6D5' : '#FED7D7',
                                    color: report.status === 'reviewed' ? '#22543D' : '#822727'
                                }}>
                                    {report.status.toUpperCase()}
                                </span>
                                <button
                                    onClick={() => {
                                        alert(`Opening Medical Report: ${report.title}\nStatus: ${report.status.toUpperCase()}\n\nIn a real-world scenario, this would open your secure PDF or X-Ray file.`);
                                    }}
                                    style={{ border: 'none', background: 'transparent', color: '#3182CE', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    View PDF
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReportList;
