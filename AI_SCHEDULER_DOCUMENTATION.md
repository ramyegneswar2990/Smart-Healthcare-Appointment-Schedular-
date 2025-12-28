# 🤖 AI-Powered Smart Healthcare Appointment Scheduler

## Overview
An intelligent appointment scheduling system that uses AI to recommend optimal booking slots based on patient symptoms, doctor availability, and urgency levels.

## ✨ Key Features

### 1. **AI-Powered Recommendations**
- Analyzes patient symptoms and condition
- Matches patients with the most suitable specialists
- Scores doctors based on rating, experience, and specialization
- Suggests optimal time slots based on availability

### 2. **Intelligent Doctor Matching**
- Automatic specialization mapping from symptoms
- Example: "heart pain" → Cardiology, "fever" → General Physician
- Alternative doctor suggestions if primary choices are full
- Priority ranking based on AI scoring (max 100 points)

### 3. **Smart Slot Optimization**
- Identifies AI-recommended slots (marked with ⭐)
- Prioritizes morning (9-11 AM) and afternoon (2-4 PM) slots
- Favors earlier available dates
- Real-time conflict detection

### 4. **Calendar Synchronization**
- Doctor weekly schedule management
- Blocked dates for holidays/vacations
- Slot duration customization (default: 30 minutes)
- Multi-patient per slot support

## 🏗️ Architecture

### Backend Components

#### 1. **DoctorAvailability Model**
```javascript
{
  doctor: ObjectId (ref: User),
  weeklySchedule: [{
    dayOfWeek: Number (0-6), // Sunday-Saturday
    startTime: String, // "09:00"
    endTime: String, // "17:00"
    slotDuration: Number, // minutes
    maxPatientsPerSlot: Number
  }],
  blockedDates: [{
    date: Date,
    reason: String
  }]
}
```

#### 2. **SmartScheduler Service**
Located: `backend/services/smartScheduler.js`

**Main Methods:**
- `getRecommendations()` - Generates AI-powered doctor and slot recommendations
- `scoreDoctors()` - Ranks doctors using AI criteria
- `generateAvailableSlots()` - Creates time slots from doctor schedules
- `detectConflicts()` - Checks for appointment conflicts
- `mapConditionToSpecialization()` - Maps symptoms to medical specialties

**AI Scoring Algorithm:**
```
Total Score (100 points):
- Rating: 40% (doctor.rating / 5 * 40)
- Experience: 30% (min(years/20, 1) * 30)
- Specialization Match: 30%
- Urgency Bonus: +10 for high-priority cases
```

### Frontend Components

#### 1. **SmartBookingPage**
Location: `frontend/src/components/patient/SmartBookingPage.js`

**Features:**
- Step 1: Condition & symptom input
- Step 2: AI recommendations with slot selection
- Step 3: Booking confirmation
- Visual slot recommendations with star ratings
- Alternative doctor suggestions

## 📡 API Endpoints

### 1. Get AI Recommendations
```http
POST /api/scheduler/recommendations
Authorization: Bearer {token}

Body:
{
  "condition": "heart",
  "symptoms": "chest pain and shortness of breath",
  "preferredDate": "2025-12-30",
  "urgency": "high"
}

Response:
{
  "success": true,
  "data": {
    "primaryRecommendations": [{
      "doctor": {...},
      "aiScore": 95,
      "recommendedSlots": [...],
      "reasonForRecommendation": "Highly rated, Experienced specialist"
    }],
    "alternativeRecommendations": [...],
    "aiInsights": [
      "⚡ Urgent case detected",
      "🩺 Recommended specialty: Cardiology"
    ]
  }
}
```

### 2. Set Doctor Availability
```http
POST /api/scheduler/availability
Authorization: Bearer {doctor_token}

Body:
{
  "weeklySchedule": [
    {
      "dayOfWeek": 1, // Monday
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "maxPatientsPerSlot": 1
    }
  ],
  "blockedDates": [
    {
      "date": "2025-12-25",
      "reason": "Christmas Holiday"
    }
  ]
}
```

### 3. Check Appointment Conflicts
```http
POST /api/scheduler/check-conflict

Body:
{
  "doctorId": "...",
  "appointmentDate": "2025-12-30",
  "appointmentTime": "10:00"
}

Response:
{
  "success": true,
  "data": {
    "hasConflict": false,
    "conflicts": []
  }
}
```

## 🎯 Condition to Specialization Mapping

| Symptom/Condition | Recommended Specialty |
|-------------------|----------------------|
| Heart, chest pain | Cardiology |
| Diabetes, blood sugar | Endocrinology |
| Skin, rash | Dermatology |
| Bone, joint pain | Orthopedics |
| Mental health, anxiety | Psychiatry |
| Child, pediatric | Pediatrics |
| Pregnancy, gynecological | Gynecology |
| Eye, vision | Ophthalmology |
| Dental, tooth | Dentistry |
| Fever, cold, general | General Physician |

## 🚀 Usage Guide

### For Patients

1. **Navigate to AI Smart Booking**
   - Go to Patient Dashboard
   - Click "🤖 AI Smart Booking" (has NEW badge)

2. **Describe Your Condition**
   - Select from common conditions (Fever, Heart, Diabetes, etc.)
   - Describe symptoms in detail
   - Set preferred date and urgency level
   - Click "Get AI Recommendations"

3. **Review AI Recommendations**
   - View top-matched doctors with AI scores
   - Check "AI Insights" for personalized advice
   - Select from recommended time slots (⭐ = AI optimal)
   - Click on alternative doctors if needed

4. **Confirm Booking**
   - Review selected doctor, date, and time
   - Click "Confirm Booking"
   - Receive confirmation

### For Doctors

**Setting Up Availability:**

1. Use the API endpoint `/api/scheduler/availability`
2. Define weekly schedule with time blocks
3. Add blocked dates for vacations
4. System automatically generates booking slots

**Sample Doctor Schedule Setup:**
```javascript
{
  weeklySchedule: [
    { dayOfWeek: 1, startTime: "09:00", endTime: "12:00", slotDuration: 30 }, // Monday morning
    { dayOfWeek: 1, startTime: "14:00", endTime: "17:00", slotDuration: 30 }, // Monday afternoon
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDuration: 30 }, // Wednesday full day
    { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", slotDuration: 45 }  // Friday half-day (45min slots)
  ]
}
```

## 📊 AI Decision-Making Process

```
Patient submits: "Heart pain, shortness of breath, HIGH urgency"
        ↓
1. Condition Mapping: heart → Cardiology
        ↓
2. Find Cardiologists in database
        ↓
3. Score each doctor:
   - Dr. Smith: Rating 4.8 (38.4) + 15 yrs exp (22.5) + Cardiology (30) + Urgent bonus (10) = 100.9
   - Dr. Jones: Rating 4.2 (33.6) + 8 yrs exp (12) + Cardiology (30) = 75.6
        ↓
4. Get availability for top doctors
        ↓
5. Generate time slots, prioritize:
   - Sooner dates (within 3 days)
   - Optimal times (9-11 AM, 2-4 PM)
        ↓
6. Present recommendations:
   - Primary: Dr. Smith (Score: 101) with 5 recommended slots
   - Alternative: Dr. Jones (Score: 76) if slots full
```

## 🔧 Configuration

### Environment Variables
No additional environment variables needed. System uses existing MongoDB and JWT setup.

### Customization Options

**Modify AI Scoring Weights:**
Edit `backend/services/smartScheduler.js`:
```javascript
// Current weights
score += (doctor.rating / 5) * 40;  // Rating: 40%
score += expScore * 30;              // Experience: 30%
score += 30;                         // Specialization: 30%
```

**Adjust Optimal Time Slots:**
```javascript
const isOptimalTime = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);
```

**Change Days to Check:**
```javascript
const slots = await this.generateAvailableSlots(
    doctor._id,
    availability,
    preferredDate,
    7 // Change this number to check more/fewer days
);
```

## 🎨 UI Features

### Visual Elements
- **AI Score Badges**: Blue badges showing doctor recommendation score
- **Star Icons** (⭐): Mark AI-recommended optimal slots
- **Urgency Indicators**: Red/Green badges for urgency levels
- **Alternative Section**: Separate area for backup options
- **AI Insights Box**: Real-time personalized recommendations

### Color Coding
- **Primary Recommendations**: Blue gradient border (#3182CE)
- **AI Optimal Slots**: Green background (#F0FFF4)
- **Selected Slot**: Deep blue (#3182CE)
- **Urgent Cases**: Red indicators (#E53E3E)

## 📝 Future Enhancements

1. **Machine Learning Integration**
   - Use historical data to improve doctor matching
   - Predict best appointment times based on patient history
   - Learn from cancellation patterns

2. **Notification System**
   - Email/SMS reminders before appointments
   - Cancellation alerts
   - Availability updates

3. **Advanced Conflict Resolution**
   - Suggest nearby time slots if conflicts occur
   - Waitlist management
   - Automatic rescheduling suggestions

4. **Multi-language Support**
   - Translate condition descriptions
   - International specialization mapping

5. **Integration with External Calendars**
   - Google Calendar sync
   - iCal export
   - Outlook integration

## 🐛 Troubleshooting

**Issue: No recommendations returned**
- Check if doctors have availability set up
- Verify specialization field in doctor profiles
- Ensure preferred date is not in the past

**Issue: All slots showing as unavailable**
- Doctor may have blocked dates
- Check maxPatientsPerSlot setting
- Verify appointment status filters

**Issue: AI score seems incorrect**
- Review doctor profile data (rating, experience)
- Check specialization match
- Verify urgency level

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API responses for error messages
3. Check backend logs for SmartScheduler service errors
4. Verify database has DoctorAvailability records

---

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: ✅ Production Ready
