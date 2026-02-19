import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const attendanceFile = path.join(__dirname, '..', 'data', 'attendance.json');

function readAttendance() {
    return JSON.parse(fs.readFileSync(attendanceFile, 'utf-8'));
}

function writeAttendance(data) {
    fs.writeFileSync(attendanceFile, JSON.stringify(data, null, 2));
}

// POST /api/attendance — mark attendance (Faculty only)
router.post('/', authenticateToken, authorizeRoles('faculty'), (req, res) => {
    const { course, date, records } = req.body;
    // records: [{ studentId, studentName, status: 'present'|'absent' }]

    if (!course || !date || !records || !Array.isArray(records)) {
        return res.status(400).json({ message: 'Course, date, and records are required' });
    }

    const attendance = readAttendance();

    // Remove existing records for same course + date
    const filtered = attendance.filter(a => !(a.course === course && a.date === date));

    const newRecords = records.map(r => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        course,
        date,
        studentId: r.studentId,
        studentName: r.studentName,
        status: r.status,
        markedBy: req.user.id,
        markedAt: new Date().toISOString()
    }));

    filtered.push(...newRecords);
    writeAttendance(filtered);

    res.status(201).json({ message: 'Attendance marked successfully', count: newRecords.length });
});

// GET /api/attendance — get records (Faculty/Student)
router.get('/', authenticateToken, (req, res) => {
    const { course, date, studentId } = req.query;
    let attendance = readAttendance();

    if (req.user.role === 'student') {
        attendance = attendance.filter(a => a.studentId === req.user.id);
    }
    if (course) attendance = attendance.filter(a => a.course === course);
    if (date) attendance = attendance.filter(a => a.date === date);
    if (studentId) attendance = attendance.filter(a => a.studentId === studentId);

    res.json(attendance);
});

// GET /api/attendance/report — attendance report (Faculty)
router.get('/report', authenticateToken, authorizeRoles('faculty', 'admin'), (req, res) => {
    const { course, month } = req.query;
    let attendance = readAttendance();

    if (course) attendance = attendance.filter(a => a.course === course);
    if (month) attendance = attendance.filter(a => a.date && a.date.startsWith(month));

    // Group by student
    const studentMap = {};
    attendance.forEach(a => {
        if (!studentMap[a.studentId]) {
            studentMap[a.studentId] = { studentId: a.studentId, studentName: a.studentName, total: 0, present: 0 };
        }
        studentMap[a.studentId].total++;
        if (a.status === 'present') studentMap[a.studentId].present++;
    });

    const report = Object.values(studentMap).map(s => ({
        ...s,
        percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    res.json(report);
});

export default router;
