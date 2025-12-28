# 🚀 AI Scheduler Setup Checklist

## ✅ Prerequisites (Already Complete)

- [x] Node.js installed
- [x] MongoDB running
- [x] Backend server running on port 5000
- [x] Frontend server running on port 3000
- [x] JWT authentication configured
- [x] User model with doctor profiles

## 📋 Setup Steps

### Step 1: Verify Backend is Running ✓

Your backend should already be running. Check by visiting:
```
http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

### Step 2: Test Scheduler Endpoint

Try the health endpoint for the scheduler:
```bash
# On Windows PowerShell:
curl http://localhost:5000/api/scheduler/availability/test

# Should return 404 (expected - no availability set yet)
```

### Step 3: Set Up Doctor Availability ⚠️ **REQUIRED**

**Option A: Using Postman/Thunder Client**

1. **Login as a doctor** and get the JWT token
2. Make this request:

```http
POST http://localhost:5000/api/scheduler/availability
Authorization: Bearer YOUR_DOCTOR_TOKEN
Content-Type: application/json

{
  "weeklySchedule": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "maxPatientsPerSlot": 1,
      "isActive": true
    },
    {
      "dayOfWeek": 3,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "maxPatientsPerSlot": 1,
      "isActive": true
    }
  ],
  "blockedDates": []
}
```

**Option B: Using the Setup Script**

1. Navigate to backend folder:
```bash
cd "C:\Users\RAM\Smart Healthcare\backend"
```

2. Edit `scripts/setup-doctor-availability.js`:
   - Replace `DOCTOR_TOKEN` with your actual token
   - Customize the schedule if needed

3. Run:
```bash
node scripts/setup-doctor-availability.js
```

### Step 4: Update Doctor Profiles

Ensure all doctors have these fields in the database:
- `specialization` (e.g., "Cardiology", "General Physician")
- `rating` (default: 4.5)
- `experienceYears` (default: 5)

**MongoDB Update Script:**
```javascript
// Run this in MongoDB Compass or mongosh
db.users.updateMany(
  { role: "doctor", specialization: { $exists: false } },
  { $set: { 
    specialization: "General Physician",
    rating: 4.5,
    experienceYears: 5
  }}
)
```

### Step 5: Test AI Recommendations

**Login as a patient** and try:

```http
POST http://localhost:5000/api/scheduler/recommendations
Authorization: Bearer YOUR_PATIENT_TOKEN
Content-Type: application/json

{
  "condition": "fever",
  "symptoms": "High temperature and body ache",
  "preferredDate": "2025-12-30",
  "urgency": "normal"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "primaryRecommendations": [...],
    "alternativeRecommendations": [...],
    "urgencyLevel": "normal",
    "aiInsights": [
      "🩺 Recommended specialty: General Physician",
      "✅ Multiple specialists available"
    ]
  }
}
```

### Step 6: Access Frontend

Navigate to:
```
http://localhost:3000/patient/appointments/smart-book
```

You should see the AI booking interface!

## 🔧 Optional Features

### Calendar Sync (Future Enhancement)
Not implemented yet, but would require:
- Google Calendar API key
- OAuth 2.0 setup
- `google-auth-library` npm package

### Email Reminders (Future Enhancement)
Would require:
- SendGrid API key OR
- Nodemailer with SMTP credentials
- Environment variables:
  ```
  SENDGRID_API_KEY=your_key
  EMAIL_FROM=noreply@yourdomain.com
  ```

### SMS Notifications (Future Enhancement)
Would require:
- Twilio API credentials
- Environment variables:
  ```
  TWILIO_ACCOUNT_SID=your_sid
  TWILIO_AUTH_TOKEN=your_token
  TWILIO_PHONE_NUMBER=your_number
  ```

## 🐛 Troubleshooting

### Issue: "No doctors found for this specialization"

**Solution:**
1. Check if doctors exist in database
2. Verify `specialization` field is set
3. Run the MongoDB update script above

### Issue: "No available slots"

**Solution:**
1. Ensure doctor has `weeklySchedule` set in DoctorAvailability
2. Check if `preferredDate` is not blocked
3. Verify `isActive: true` in schedule

### Issue: "Failed to get recommendations"

**Solution:**
1. Check backend console for errors
2. Verify JWT token is valid
3. Ensure MongoDB is running
4. Check if DoctorAvailability collection exists

### Issue: Frontend can't reach backend

**Solution:**
1. Verify backend is running on port 5000
2. Check CORS is enabled in server.js
3. Ensure axios api.js has correct baseURL

## 📊 Database Collections Status

After setup, you should have:

```
MongoDB Collections:
├── users (doctors & patients)
├── appointments (bookings)
├── doctoravailabilities (NEW - doctor schedules)
├── prescriptions (optional)
└── reports (optional)
```

## 🎯 Quick Test

**Minimum test to verify everything works:**

1. **Create a test doctor:**
   - Email: doctor@test.com
   - Password: Test123!
   - Role: doctor
   - Specialization: General Physician

2. **Set doctor availability** (using script or API)

3. **Create a test patient:**
   - Email: patient@test.com
   - Password: Test123!
   - Role: patient

4. **Login as patient** and navigate to Smart Booking

5. **Select condition "fever"** and get recommendations

6. **Should see the test doctor** with available slots

## 📞 Support Checklist

If something doesn't work:

- [ ] Backend server running? (check port 5000)
- [ ] Frontend server running? (check port 3000)
- [ ] MongoDB running? (check connection string)
- [ ] Doctor availability set? (check DoctorAvailability collection)
- [ ] Doctor has specialization? (check users collection)
- [ ] JWT token valid? (try re-logging in)
- [ ] Console errors? (check browser and backend logs)

## 🎉 Success Indicators

You'll know it's working when:

✅ Backend shows no errors on startup  
✅ `/api/health` returns OK  
✅ Doctor can set availability without errors  
✅ Patient can access Smart Booking page  
✅ AI recommendations show doctors with slots  
✅ Booking confirmation works  
✅ New appointments appear in database  

---

**Need Help?** Check the logs:
- Backend: Terminal running `npm start` in backend folder
- Frontend: Terminal running `npm start` in frontend folder
- MongoDB: MongoDB Compass or mongosh

**Status:** ✅ No external API keys required - System is self-contained!
