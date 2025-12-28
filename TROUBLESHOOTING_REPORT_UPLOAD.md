# 🐛 Report Upload - Troubleshooting Error 400

## Error Analysis

**Error**: `POST http://localhost:5000/api/reports 400 (Bad Request)`

This means the backend is rejecting the request due to validation failure.

## ✅ Debugging Steps

### Step 1: Check Browser Console

Open **Browser DevTools** (F12) → **Console** tab

You should now see detailed logs:
```
Submitting report: {
  title: "Blood Test Results",
  patientId: "6749abc123...",
  notes: "...",
  fileUrl: "..."
}
```

**Check for:**
- ❌ `title` is empty or undefined
- ❌ `patientId` is missing or null
- ❌ `selectedPatient` is null (user didn't select a patient)

### Step 2: Check Backend Terminal

In your **backend terminal**, you should see:
```
Create report request: {
  title: '...',
  patientId: '...',
  userRole: 'doctor',
  userId: '...'
}
```

**Common Issues:**

#### Issue 1: Title is Empty
```
Error: "Report title is required"
```
**Solution**: Ensure the title input field has a value before submitting.

#### Issue 2: Patient Not Selected
```
Error: "Patient ID is required when doctor creates a report"
```
**Solution**: Click on a patient from the left sidebar first.

#### Issue 3: Patient Not Found
```
Error: "Patient not found"
```
**Solution**: The patientId doesn't exist in the database or isn't a patient role.

#### Issue 4: Authentication Issue
```
Error: "Unauthorized" or token errors
```
**Solution**: Re-login as a doctor to refresh your JWT token.

### Step 3: Verify Prerequisites

**Before uploading a report, ensure:**

1. ✅ You're logged in as a **doctor** (not patient)
2. ✅ You have at least one **appointment** with a patient
3. ✅ The patient list shows patients (if empty, create an appointment first)
4. ✅ You **clicked on a patient** from the list (left sidebar should be highlighted)
5. ✅ You **filled in the Report Title** field
6. ✅ Your backend server is running

## 🔍 Manual Testing

### Test 1: Check if Patients Load

**Browser Console:**
```javascript
// In the Report Manager page, check:
console.log('Patients loaded?', patients.length);
```

If `0`, you need to create appointments first.

### Test 2: Test API Directly

**Using Thunder Client/Postman:**

```http
POST http://localhost:5000/api/reports
Authorization: Bearer YOUR_DOCTOR_TOKEN
Content-Type: application/json

{
  "title": "Test Report",
  "patientId": "ACTUAL_PATIENT_ID",
  "notes": "Test notes",
  "fileUrl": "https://example.com/test.pdf"
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Test Report",
    "patient": {...},
    "doctor": {...},
    "status": "reviewed",
    "date": "2025-12-28"
  }
}
```

## 🛠️ Quick Fixes

### Fix 1: Title Not Being Captured

Check if the input field is properly bound:
```javascript
// Should be in the form:
value={formData.title}
onChange={(e) => setFormData({ ...formData, title: e.target.value })}
```

### Fix 2: Patient ID Not Being Sent

Ensure `selectedPatient` is set:
```javascript
// Before submitting, log:
console.log('Selected patient:', selectedPatient);
// Should show: { _id: '...', name: '...', email: '...' }
```

### Fix 3: Form Submission Issues

Make sure the form has `onSubmit={handleSubmit}` and the button is `type="submit"`.

## 📋 Complete Workflow

**Correct order of operations:**

1. **Login** as doctor → Get JWT token
2. **Navigate** to `/doctor/reports`
3. **Patient list loads** (from your appointments)
4. **Click on a patient** → Patient card turns blue
5. **Click "+ Upload Report"** → Form appears
6. **Fill in title** (e.g., "Blood Test Results")
7. **(Optional) Upload file** → Mock URL generated
8. **(Optional) Add notes** → Clinical findings
9. **Click "Upload Report to Patient"**
10. **Success!** → Report appears in patient's dashboard

## 🔧 If Still Failing

### Get Exact Error Message

After the update, the error alert will show:
```
❌ Upload failed: [actual error message here]
```

**Common messages:**
- `"Report title is required"` → Fill the title field
- `"Patient ID is required"` → Select a patient first
- `"Patient not found"` → Invalid patient ID
- `"Unauthorized"` → Re-login as doctor

### Check Network Tab

Browser DevTools → **Network** tab → Click on the failed POST request

**Request Payload should look like:**
```json
{
  "title": "Blood Test Results",
  "patientId": "6749abc...",
  "notes": "Some notes",
  "fileUrl": "https://..."
}
```

**Response should show:**
```json
{
  "success": false,
  "message": "Specific error here"
}
```

## ✅ Success Indicators

You'll know it's working when:

1. **Browser console** shows: `Report upload success: {...}`
2. **Backend terminal** shows: `Report created successfully: {...}`
3. **Alert** shows: `✅ Report uploaded successfully!`
4. **Report appears** in the list below
5. **Patient can see** the report in their dashboard at `/patient/reports`

## 🆘 Last Resort

If nothing works:

1. **Restart backend**: `Ctrl+C` then `npm start`
2. **Clear browser cache**: Ctrl+Shift+Delete
3. **Re-login** as doctor
4. **Check MongoDB** is running
5. **Verify** you have at least one patient with appointments

---

**Note**: The enhanced logging is now permanent. Check both console and terminal for detailed error information!
