// Sample script to set up doctor availability
// Run this once per doctor to enable AI scheduling

const axios = require('axios');

// REPLACE THESE WITH ACTUAL VALUES
const BACKEND_URL = 'http://localhost:5000';
const DOCTOR_TOKEN = 'your_doctor_jwt_token_here';

const setupDoctorAvailability = async () => {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/scheduler/availability`,
            {
                weeklySchedule: [
                    // Monday
                    {
                        dayOfWeek: 1,
                        startTime: "09:00",
                        endTime: "12:00",
                        slotDuration: 30,
                        maxPatientsPerSlot: 1,
                        isActive: true
                    },
                    {
                        dayOfWeek: 1,
                        startTime: "14:00",
                        endTime: "17:00",
                        slotDuration: 30,
                        maxPatientsPerSlot: 1,
                        isActive: true
                    },
                    // Wednesday
                    {
                        dayOfWeek: 3,
                        startTime: "09:00",
                        endTime: "17:00",
                        slotDuration: 30,
                        maxPatientsPerSlot: 1,
                        isActive: true
                    },
                    // Friday
                    {
                        dayOfWeek: 5,
                        startTime: "09:00",
                        endTime: "13:00",
                        slotDuration: 30,
                        maxPatientsPerSlot: 1,
                        isActive: true
                    }
                ],
                blockedDates: [
                    {
                        date: "2025-12-25",
                        reason: "Christmas Holiday"
                    },
                    {
                        date: "2026-01-01",
                        reason: "New Year's Day"
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${DOCTOR_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Doctor availability set successfully!');
        console.log('Schedule:', response.data);
    } catch (error) {
        console.error('❌ Error setting availability:', error.response?.data || error.message);
    }
};

// Run the setup
setupDoctorAvailability();

/* 
HOW TO USE:
1. Login as a doctor and copy the JWT token from browser localStorage
2. Replace DOCTOR_TOKEN above with the actual token
3. Run: node setup-doctor-availability.js
4. Repeat for each doctor in your system
*/
