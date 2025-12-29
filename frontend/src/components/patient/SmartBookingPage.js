import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
const SmartBookingPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Condition, 2: AI Recommendations, 3: Confirm
    const [formData, setFormData] = useState({
        condition: '',
        symptoms: '',
        urgency: 'normal',
        preferredDate: new Date().toISOString().split('T')[0]
    });
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    const conditions = [
        { value: 'fever', label: '🤒 Fever/Cold', urgency: 'normal' },
        { value: 'heart', label: '❤️ Heart Issues', urgency: 'high' },
        { value: 'diabetes', label: '🩸 Diabetes', urgency: 'normal' },
        { value: 'skin', label: '🧴 Skin Problems', urgency: 'normal' },
        { value: 'bone', label: '🦴 Bone/Joint Pain', urgency: 'normal' },
        { value: 'mental', label: '🧠 Mental Health', urgency: 'normal' },
        { value: 'eye', label: '👁️ Eye Issues', urgency: 'normal' },
        { value: 'dental', label: '🦷 Dental', urgency: 'normal' },
        { value: 'checkup', label: '✅ General Checkup', urgency: 'normal' }
    ];

    const handleConditionSelect = (condition) => {
        const selected = conditions.find(c => c.value === condition);
        setFormData({
            ...formData,
            condition,
            urgency: selected?.urgency || 'normal'
        });
    };

    const getAiRecommendations = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/scheduler/recommendations', formData);
            if (res.data.success) {
                setAiRecommendations(res.data.data);
                setStep(2);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotSelect = (doctor, slot) => {
        setSelectedSlot({
            doctor,
            date: slot.date,
            time: slot.time,
            dayName: slot.dayName
        });
    };

    const confirmBooking = async () => {
        if (!selectedSlot) return;

        setBooking(true);
        try {
            await api.post('/api/appointments', {
                doctor: selectedSlot.doctor._id,
                appointmentDate: selectedSlot.date,
                appointmentTime: selectedSlot.time,
                reason: `${formData.condition} - ${formData.symptoms} `
            });

            alert('✅ Appointment booked successfully!');
            navigate('/patient/appointments');
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    // Step 1: Condition Selection
    if (step === 1) {
        return (
            <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #EDF2F7' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1A365D', margin: '0 0 8px 0' }}>🤖 AI-Powered Appointment Booking</h2>
                        <p style={{ color: '#718096', fontSize: '16px' }}>Tell us how you're feeling, and our AI will find the perfect specialist for you</p>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '15px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '16px' }}>What brings you here today?</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {conditions.map(cond => (
                                <button
                                    key={cond.value}
                                    onClick={() => handleConditionSelect(cond.value)}
                                    style={{
                                        padding: '16px 20px',
                                        borderRadius: '16px',
                                        border: formData.condition === cond.value ? '2px solid #3182CE' : '1px solid #E2E8F0',
                                        background: formData.condition === cond.value ? '#EBF8FF' : 'white',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    {cond.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ fontSize: '15px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '12px' }}>Describe your symptoms</label>
                        <textarea
                            value={formData.symptoms}
                            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                            placeholder="E.g., Persistent headache for 3 days, difficulty sleeping..."
                            rows="4"
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '8px' }}>Preferred Date</label>
                            <input
                                type="date"
                                value={formData.preferredDate}
                                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: '700', color: '#2D3748', display: 'block', marginBottom: '8px' }}>Urgency Level</label>
                            <select
                                value={formData.urgency}
                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '15px', background: 'white' }}
                            >
                                <option value="normal">🟢 Normal</option>
                                <option value="high">🔴 Urgent</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={getAiRecommendations}
                        disabled={!formData.condition || loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '14px',
                            background: formData.condition ? '#3182CE' : '#CBD5E0',
                            color: 'white',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: formData.condition ? 'pointer' : 'not-allowed',
                            boxShadow: formData.condition ? '0 4px 12px rgba(49, 130, 206, 0.3)' : 'none'
                        }}
                    >
                        {loading ? '🔍 Finding best doctors...' : '🤖 Get AI Recommendations'}
                    </button>
                </div>
            </div>
        );
    }

    // Step 2: AI Recommendations
    if (step === 2 && aiRecommendations) {
        return (
            <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #EDF2F7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1A365D', margin: '0 0 8px 0' }}>🎯 AI-Recommended Specialists</h2>
                            <p style={{ color: '#718096', margin: 0 }}>Based on your symptoms and preferences</p>
                        </div>
                        <button
                            onClick={() => setStep(1)}
                            style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#718096', fontWeight: '600', cursor: 'pointer' }}
                        >
                            ← Back
                        </button>
                    </div>

                    {/* AI Insights */}
                    {aiRecommendations.aiInsights && aiRecommendations.aiInsights.length > 0 && (
                        <div style={{ background: '#F7FAFC', borderRadius: '16px', padding: '20px', marginBottom: '32px', border: '1px solid #E2E8F0' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#2D3748' }}>💡 AI Insights</h4>
                            {aiRecommendations.aiInsights.map((insight, i) => (
                                <div key={i} style={{ padding: '8px 0', color: '#4A5568', fontSize: '14px' }}>{insight}</div>
                            ))}
                        </div>
                    )}

                    {/* Primary Recommendations */}
                    {aiRecommendations.primaryRecommendations && aiRecommendations.primaryRecommendations.length > 0 && (
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2D3748', marginBottom: '20px' }}>✨ Top Matches</h3>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {aiRecommendations.primaryRecommendations.map(rec => (
                                    <div key={rec.doctor._id} style={{ border: '2px solid #3182CE', borderRadius: '20px', padding: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)' }}>
                                        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                                            <img
                                                src={rec.doctor.profileImage || `https://i.pravatar.cc/150?u=${rec.doctor._id}`}
                                                alt={rec.doctor.name}
                                                style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover' }}
                                            />
                                            < div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                                    <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1A365D' }}>Dr. {rec.doctor.name}</h4>
                                                    <span style={{ padding: '4px 10px', background: '#3182CE', color: 'white', fontSize: '11px', fontWeight: '700', borderRadius: '6px' }}>AI Score: {rec.aiScore}</span>
                                                </div>
                                                <p style={{ margin: '0 0 8px 0', color: '#4A5568', fontSize: '15px', fontWeight: '600' }}>{rec.doctor.specialization}</p>
                                                <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>⭐ {rec.doctor.rating}/5 • {rec.doctor.experienceYears}+ years experience</p>
                                                <p style={{ margin: '8px 0 0 0', color: '#3182CE', fontSize: '13px', fontWeight: '600' }}>{rec.reasonForRecommendation}</p>
                                            </div >
                                        </div >

                                        <div>
                                            <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#2D3748' }}>🕒 Available Time Slots</h5>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {rec.recommendedSlots.slice(0, 6).map((slot, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSlotSelect(rec.doctor, slot)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            borderRadius: '12px',
                                                            border: selectedSlot?.time === slot.time && selectedSlot?.date === slot.date ? '2px solid #3182CE' : '1px solid #E2E8F0',
                                                            background: selectedSlot?.time === slot.time && selectedSlot?.date === slot.date ? '#3182CE' : slot.aiRecommended ? '#F0FFF4' : 'white',
                                                            color: selectedSlot?.time === slot.time && selectedSlot?.date === slot.date ? 'white' : '#2D3748',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        {slot.aiRecommended && <span style={{ position: 'absolute', top: '-8px', right: '-8px', fontSize: '16px' }}>⭐</span>}
                                                        <div>{slot.dayName}</div>
                                                        <div style={{ fontSize: '11px', opacity: 0.8 }}>{slot.time}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div >
                                ))}
                            </div >
                        </div >
                    )}

                    {/* Alternative Recommendations */}
                    {
                        aiRecommendations.alternativeRecommendations && aiRecommendations.alternativeRecommendations.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#718096', marginBottom: '16px' }}>🔄 Alternative Options</h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {aiRecommendations.alternativeRecommendations.map(alt => (
                                        <div key={alt.doctor._id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F7FAFC' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong>Dr. {alt.doctor.name}</strong> - {alt.doctor.specialization}
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#718096' }}>{alt.message}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {
                        selectedSlot && (
                            <div style={{ marginTop: '32px', padding: '20px', background: '#EBF8FF', borderRadius: '16px', border: '2px solid #3182CE' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1A365D' }}>✅ Selected Appointment</h4>
                                        <p style={{ margin: 0, fontSize: '15px', color: '#2D3748' }}>
                                            <strong>Dr. {selectedSlot.doctor.name}</strong> on <strong>{selectedSlot.dayName}, {selectedSlot.date}</strong> at <strong>{selectedSlot.time}</strong>
                                        </p>
                                    </div>
                                    <button
                                        onClick={confirmBooking}
                                        disabled={booking}
                                        style={{
                                            padding: '14px 32px',
                                            borderRadius: '12px',
                                            background: '#3182CE',
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '16px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)'
                                        }}
                                    >
                                        {booking ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >
        );
    }

    return null;
};

export default SmartBookingPage;
