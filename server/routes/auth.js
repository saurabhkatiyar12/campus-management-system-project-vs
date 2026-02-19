import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, authorizeRoles, JWT_SECRET } from '../middleware/auth.js';

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

const defaultUsers = [
    {
        id: 'admin-001',
        name: 'Admin',
        email: 'admin@campus.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Administration'
    },
    {
        id: 'faculty-001',
        name: 'Default Faculty',
        email: 'faculty@campus.edu',
        password: 'faculty123',
        role: 'faculty',
        department: 'Computer Science'
    },
    {
        id: 'student-001',
        name: 'Default Student',
        email: 'student@campus.edu',
        password: 'student123',
        role: 'student',
        department: 'Computer Science'
    }
];

// Seed default demo users and hash legacy/plaintext passwords.
(function seedDefaultUsers() {
    const users = readUsers();
    let changed = false;

    defaultUsers.forEach(def => {
        const existing = users.find(u => u.email === def.email);
        if (!existing) {
            users.push({
                id: def.id,
                name: def.name,
                email: def.email,
                password: bcrypt.hashSync(def.password, 10),
                role: def.role,
                department: def.department,
                createdAt: new Date().toISOString()
            });
            changed = true;
            return;
        }

        // Hash legacy/plaintext password once without overriding existing bcrypt hashes.
        if (typeof existing.password !== 'string' || !existing.password.startsWith('$2')) {
            existing.password = bcrypt.hashSync(existing.password || def.password, 10);
            changed = true;
            return;
        }

        // Keep demo credentials deterministic for default accounts.
        if (!bcrypt.compareSync(def.password, existing.password)) {
            existing.password = bcrypt.hashSync(def.password, 10);
            changed = true;
        }
    });

    if (changed) {
        writeUsers(users);
    }
})();

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const normalizedEmail = String(email || '').toLowerCase();
    const user = users.find(u => u.email === normalizedEmail);

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
});

// POST /api/auth/register (Admin only — validated in users route, but also here for convenience)
router.post('/register', authenticateToken, authorizeRoles('admin'), (req, res) => {
    const { name, email, password, role, department } = req.body;
    const allowedRoles = ['admin', 'faculty', 'student'];

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    const users = readUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
        return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const newUser = {
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: hashed,
        role,
        department: department || '',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, name, email: newUser.email, role, department: newUser.department } });
});

export default router;
