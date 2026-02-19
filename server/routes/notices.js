import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const noticesFile = path.join(__dirname, '..', 'data', 'notices.json');

function readNotices() {
    return JSON.parse(fs.readFileSync(noticesFile, 'utf-8'));
}

function writeNotices(data) {
    fs.writeFileSync(noticesFile, JSON.stringify(data, null, 2));
}

// POST /api/notices — create notice (Admin/Faculty)
router.post('/', authenticateToken, authorizeRoles('admin', 'faculty'), (req, res) => {
    const { title, content, priority, targetAudience } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    const notices = readNotices();
    const newNotice = {
        id: `notice-${Date.now()}`,
        title,
        content,
        priority: priority || 'normal',
        targetAudience: targetAudience || 'all',
        postedBy: req.user.id,
        postedByName: req.user.name,
        postedByRole: req.user.role,
        createdAt: new Date().toISOString()
    };

    notices.unshift(newNotice);
    writeNotices(notices);

    res.status(201).json({ message: 'Notice posted', notice: newNotice });
});

// GET /api/notices — list notices
router.get('/', authenticateToken, (req, res) => {
    const notices = readNotices();

    if (req.user.role === 'admin') {
        return res.json(notices);
    }

    if (req.user.role === 'faculty') {
        return res.json(notices.filter(n => n.targetAudience === 'all' || n.targetAudience === 'faculty'));
    }

    if (req.user.role === 'student') {
        return res.json(notices.filter(n => n.targetAudience === 'all' || n.targetAudience === 'students'));
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
});

// DELETE /api/notices/:id — delete notice (Admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
    let notices = readNotices();
    const idx = notices.findIndex(n => n.id === req.params.id);
    if (idx === -1) {
        return res.status(404).json({ message: 'Notice not found' });
    }
    notices.splice(idx, 1);
    writeNotices(notices);
    res.json({ message: 'Notice deleted successfully' });
});

export default router;
