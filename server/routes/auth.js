import express from 'express';
import { sendOtp } from '../utils/email.util.js';
import {
    createOtp,
    verifyOtp,
    createAuthToken,
    verifyAuthToken,
    invalidateAuthToken,
    getOrCreateUser,
    updateLastLogin
} from '../utils/auth.util.js';
import db from '../utils/db.util.js';

const router = express.Router();

router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const otp = await createOtp(email);
        await sendOtp(email, otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const isValid = await verifyOtp(email, otp);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        const existingUser = await db('users').where({ email }).first();
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const user = await getOrCreateUser(email);
        await updateLastLogin(user.user_id);
        const token = await createAuthToken(user.user_id);

        res.json({ token, user_id: user.user_id });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const isValid = await verifyOtp(email, otp);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await updateLastLogin(user.user_id);
        const token = await createAuthToken(user.user_id);

        res.json({ token, user_id: user.user_id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({ error: 'Authorization token required' });
        }

        const invalidated = await invalidateAuthToken(token);
        if (!invalidated) {
            return res.status(404).json({ error: 'Token not found' });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
