import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const assignmentsFile = path.join(__dirname, '..', 'data', 'assignments.json');

function readAssignments() {
    return JSON.parse(fs.readFileSync(assignmentsFile, 'utf-8'));
}

function writeAssignments(data) {
    fs.writeFileSync(assignmentsFile, JSON.stringify(data, null, 2));
}

// POST /api/assignments — create assignment (Faculty)
router.post('/', authenticateToken, authorizeRoles('faculty'), (req, res) => {
    const { title, description, course, dueDate } = req.body;

    if (!title || !course || !dueDate) {
        return res.status(400).json({ message: 'Title, course, and due date are required' });
    }

    const assignments = readAssignments();
    const newAssignment = {
        id: `asgn-${Date.now()}`,
        title,
        description: description || '',
        course,
        dueDate,
        createdBy: req.user.id,
        createdByName: req.user.name,
        createdAt: new Date().toISOString(),
        submissions: []
    };

    assignments.push(newAssignment);
    writeAssignments(assignments);

    res.status(201).json({ message: 'Assignment created', assignment: newAssignment });
});

// GET /api/assignments — list assignments
router.get('/', authenticateToken, (req, res) => {
    const assignments = readAssignments();
    const { course } = req.query;
    let filtered = assignments;
    if (course) filtered = filtered.filter(a => a.course === course);

    // For students, hide other students' submissions
    if (req.user.role === 'student') {
        filtered = filtered.map(a => ({
            ...a,
            submissions: a.submissions.filter(s => s.studentId === req.user.id)
        }));
    }

    res.json(filtered);
});

// PUT /api/assignments/:id/submit — submit assignment (Student)
router.put('/:id/submit', authenticateToken, authorizeRoles('student'), (req, res) => {
    const { content } = req.body;
    const assignments = readAssignments();
    const assignment = assignments.find(a => a.id === req.params.id);

    if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existing = assignment.submissions.findIndex(s => s.studentId === req.user.id);
    const submission = {
        studentId: req.user.id,
        studentName: req.user.name,
        content: content || '',
        submittedAt: new Date().toISOString()
    };

    if (existing >= 0) {
        assignment.submissions[existing] = submission;
    } else {
        assignment.submissions.push(submission);
    }

    writeAssignments(assignments);
    res.json({ message: 'Assignment submitted successfully' });
});

export default router;
