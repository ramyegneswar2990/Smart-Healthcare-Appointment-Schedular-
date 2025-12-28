const express = require('express');
const router = express.Router();
const { getReports, createReport, getPatientReports, updateReportStatus } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.route('/')
    .get(protect, getReports)
    .post(protect, createReport);

router.route('/patient/:patientId')
    .get(protect, getPatientReports);

router.route('/:id')
    .patch(protect, updateReportStatus);

module.exports = router;
