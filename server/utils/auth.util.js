import crypto from 'crypto';
import db from './db.util.js';

const OTP_EXPIRY_MINUTES = 5;
const TOKEN_EXPIRY_DAYS = 30;

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function createOtp(email) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await db('otps').where({ email }).del();

    await db('otps').insert({
        email,
        otp,
        expires_at: expiresAt
    });

    return otp;
}

async function verifyOtp(email, otp) {
    const record = await db('otps')
        .where({ email, otp })
        .where('expires_at', '>', new Date())
        .first();

    if (record) {
        await db('otps').where({ email }).del();
        return true;
    }

    return false;
}

async function createAuthToken(userId) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db('auth_tokens').insert({
        user_id: userId,
        token,
        expires_at: expiresAt
    });

    return token;
}

async function verifyAuthToken(token) {
    const record = await db('auth_tokens')
        .where({ token })
        .where('expires_at', '>', new Date())
        .first();

    if (!record) {
        return null;
    }

    const user = await db('users')
        .where({ user_id: record.user_id })
        .first();

    return user;
}

async function invalidateAuthToken(token) {
    const deleted = await db('auth_tokens').where({ token }).del();
    return deleted > 0;
}

async function getOrCreateUser(email) {
    let user = await db('users').where({ email }).first();

    if (!user) {
        const [newUser] = await db('users')
            .insert({ email })
            .returning('*');
        user = newUser;
    }

    return user;
}

async function updateLastLogin(userId) {
    await db('users')
        .where({ user_id: userId })
        .update({ last_login: new Date() });
}

export {
    createOtp,
    verifyOtp,
    createAuthToken,
    verifyAuthToken,
    invalidateAuthToken,
    getOrCreateUser,
    updateLastLogin
};
