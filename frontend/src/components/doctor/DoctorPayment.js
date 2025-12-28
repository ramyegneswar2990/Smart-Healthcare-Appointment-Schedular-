import React from 'react';

const DoctorPayment = () => {
    return (
        <div style={{ padding: '24px', fontFamily: "'Outfit', sans-serif" }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#2D3748' }}>Payment History</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>Total Earnings</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#2D3748' }}>$12,450</div>
                    <div style={{ color: '#48BB78', fontSize: '12px', marginTop: '4px' }}>+12% from last month</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>Pending Payments</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#2D3748' }}>$1,200</div>
                    <div style={{ color: '#ECC94B', fontSize: '12px', marginTop: '4px' }}>5 invoices pending</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>This Month</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#2D3748' }}>$3,500</div>
                    <div style={{ color: '#48BB78', fontSize: '12px', marginTop: '4px' }}>+5% from last month</div>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#4A5568' }}>Recent Transactions</h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#F7FAFC' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Invoice ID</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Patient</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Amount</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#718096', fontWeight: '600', fontSize: '14px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((item) => (
                                <tr key={item} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '16px', color: '#2D3748', borderBottom: '1px solid #E2E8F0', fontFamily: 'monospace' }}>#INV-2021-00{item}</td>
                                    <td style={{ padding: '16px', color: '#4A5568', borderBottom: '1px solid #E2E8F0' }}>Patient Name {item}</td>
                                    <td style={{ padding: '16px', color: '#4A5568', borderBottom: '1px solid #E2E8F0' }}>Dec {20 + item}, 2021</td>
                                    <td style={{ padding: '16px', color: '#2D3748', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>${100 * item}.00</td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #E2E8F0' }}>
                                        <span style={{
                                            backgroundColor: item % 2 === 0 ? '#C6F6D5' : '#FEFCBF',
                                            color: item % 2 === 0 ? '#22543D' : '#744210',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>{item % 2 === 0 ? 'Paid' : 'Pending'}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorPayment;
