# 📋 Doctor-to-Patient Report System

## Overview
Doctors can now upload medical reports (lab results, X-rays, prescriptions, etc.) directly to patient accounts. Reports automatically appear in the patient's dashboard.

## 🔄 How It Works

### For Doctors:

1. **Access Report Manager**
   - Navigate to `/doctor/reports` or click "Patient Reports" in the sidebar

2. **Select Patient**
   - View list of all your patients (from appointments)
   - Click on a patient to manage their reports

3. **Upload Report**
   - Click "+ Upload Report"
   - Fill in:
     - **Report Title**: e.g., "Blood Test Results", "Chest X-Ray"
     - **File Upload**: PDF, JPG, or PNG (up to 10MB)
     - **Clinical Notes**: Optional findings/recommendations
   - Click "Upload Report to Patient"

4. **View Patient's Reports**
   - See all reports uploaded for the selected patient
   - Each report shows:
     - Title
     - Date uploaded
     - Status (Reviewed/Pending)
     - Clinical notes

### For Patients:

1. **View Reports**
   - Navigate to `/patient/reports`
   - All reports uploaded by doctors appear automatically
   - No manual upload needed

2. **Report Details**
   - See who uploaded the report (doctor's name & specialization)
   - View date and status
   - Read clinical notes
   - Click "View PDF" to open the file

## 🔧 API Endpoints

### 1. Doctor Creates Report for Patient
```http
POST /api/reports
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "patientId": "patient_mongodb_id",
  "title": "Blood Test Results",
  "fileUrl": "https://cloudinary.com/reports/file.pdf",
  "notes": "All levels normal. Continue current medication."
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "patient": {...},
    "doctor": {...},
    "title": "Blood Test Results",
    "status": "reviewed",
    "date": "2025-12-28",
    "notes": "All levels normal..."
  }
}
```

### 2. Patient Gets Their Reports
```http
GET /api/reports
Authorization: Bearer {patient_token}

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "title": "Blood Test Results",
      "doctor": {
        "_id": "...",
        "name": "Dr. Smith",
        "specialization": "Cardiology"
      },
      "date": "2025-12-28",
      "status": "reviewed",
      "notes": "All levels normal..."
    }
  ]
}
```

### 3. Doctor Views Patient's Reports
```http
GET /api/reports/patient/{patientId}
Authorization: Bearer {doctor_token}

Response:
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 4. Update Report Status
```http
PATCH /api/reports/{reportId}
Authorization: Bearer {doctor_token}

{
  "status": "updated",
  "notes": "New findings added"
}
```

## 📁 Report Model Schema

```javascript
{
  patient: ObjectId (ref: User) - Required,
  doctor: ObjectId (ref: User),
  title: String - Required,
  date: Date - Default: now,
  fileUrl: String,
  status: Enum['pending', 'reviewed', 'updated'] - Default: 'pending',
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Features

### Doctor Interface:
- **Patient List**: Sidebar with all patients from appointments
- **Upload Form**: Clean interface for report creation
- **File Upload**: Supports PDF, JPG, PNG
- **Report History**: View all reports uploaded for each patient
- **Status Badges**: Visual indicators for report status

### Patient Interface:
- **No Upload Needed**: Reports from doctors appear automatically
- **Doctor Attribution**: Shows which doctor uploaded the report
- **Status Indicators**:
  - 🟢 **Reviewed**: Doctor-verified reports
  - 🟡 **Pending**: Awaiting review
  - 🔵 **Updated**: Modified reports
- **Clinical Notes**: View doctor's recommendations
- **View PDF**: Open report files

## 🔐 Security & Permissions

### Access Control:
- ✅ Patients can only see **their own** reports
- ✅ Doctors can only upload reports for **their patients** (patients they have appointments with)
- ✅ All endpoints protected by JWT authentication
- ✅ Role validation (doctor vs patient)

### Data Validation:
- Patient ID verification before report creation
- File type and size validation (client-side)
- Required fields enforcement

## 📤 File Upload Integration

### Current Implementation:
- **Mock URL**: For demo purposes, generates a placeholder URL
- **File selected**: User sees the filename

### Production Setup (Required):

**Option A: Cloudinary**
```javascript
// Install: npm install cloudinary multer
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// In your upload endpoint:
router.post('/upload', upload.single('file'), async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'medical_reports',
    resource_type: 'auto'
  });
  res.json({ fileUrl: result.secure_url });
});
```

**Option B: AWS S3**
```javascript
// Install: npm install aws-sdk multer-s3
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'your-bucket-name',
    key: function (req, file, cb) {
      cb(null, `reports/${Date.now()}_${file.originalname}`);
    }
  })
});
```

**Environment Variables Needed:**
```env
# For Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OR for AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
```

## 🔄 Workflow Example

1. **Patient visits doctor** for consultation
2. **Doctor orders blood test** after examination
3. **Lab sends results** to doctor
4. **Doctor uploads report** via Report Manager:
   - Selects patient from list
   - Uploads PDF file "Blood_Test_Results.pdf"
   - Adds notes: "Hemoglobin slightly low. Recommend iron supplements."
   - Clicks "Upload"
5. **Report instantly appears** in patient's dashboard
6. **Patient receives notification** (if implemented)
7. **Patient views report** and doctor's recommendations
8. **Patient follows up** if needed

## 🎯 Status Meanings

| Status | Meaning | Used When |
|--------|---------|-----------|
| **pending** | Awaiting review | Patient uploads their own report |
| **reviewed** | Doctor-verified | Doctor uploads a report for patient |
| **updated** | Modified/Amended | Doctor updates an existing report |

## 🐛 Troubleshooting

**Issue: "Patient ID is required"**
- Solution: Ensure `patientId` is included when doctor creates report

**Issue: "Patient not found"**
- Solution: Verify patient exists in database and has role='patient'

**Issue: Reports not showing for patient**
- Solution: Check if `patient` field matches patient's MongoDB _id

**Issue: File upload fails**
- Solution: Implement actual cloud storage (Cloudinary/S3)

## 📱 Future Enhancements

1. **Real-time Notifications**
   - Email/SMS when new report uploaded
   - In-app notification badge

2. **Report Categories**
   - Lab Results
   - Imaging (X-Ray, MRI, CT)
   - Prescriptions
   - Discharge Summaries

3. **Version Control**
   - Track report revisions
   - Compare old vs new versions

4. **Patient Comments**
   - Allow patients to add questions
   - Doctor can respond

5. **Bulk Upload**
   - Upload multiple reports at once
   - Batch processing

6. **Report Templates**
   - Pre-filled forms for common reports
   - Lab result templates

---

**Status**: ✅ Fully Functional  
**Last Updated**: December 28, 2025  
**File Upload**: Requires cloud storage setup for production
