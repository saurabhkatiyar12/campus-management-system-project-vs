import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const usersFile = path.join(__dirname, '..', 'data', 'users.json');

function readUsers() {
    return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

function writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// GET /api/users — list all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const users = readUsers().map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        createdAt: u.createdAt
    }));
    res.json(users);
});

// GET /api/users/students — list students (Faculty use)
router.get('/students', authenticateToken, authorizeRoles('admin', 'faculty'), (req, res) => {
    const students = readUsers()
        .filter(u => u.role === 'student')
        .map(u => ({ id: u.id, name: u.name, email: u.email, department: u.department }));
    res.json(students);
});

// DELETE /api/users/:id — remove user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
    let users = readUsers();
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (users[idx].role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete admin user' });
    }
    users.splice(idx, 1);
    writeUsers(users);
    res.json({ message: 'User deleted successfully' });
});

export default router;
