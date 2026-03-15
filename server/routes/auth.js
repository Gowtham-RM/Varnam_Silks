import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();

const hasSmtpConfig = () => (
        Boolean(process.env.SMTP_HOST) &&
        Boolean(process.env.SMTP_PORT) &&
        Boolean(process.env.SMTP_USER) &&
        Boolean(process.env.SMTP_PASS)
);

const createTransporter = () => {
        if (!hasSmtpConfig()) return null;

        return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                },
        });
};

const sendResetEmail = async (toEmail, resetLink) => {
        const transporter = createTransporter();
        if (!transporter) return false;

        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        await transporter.sendMail({
                from: fromEmail,
                to: toEmail,
                subject: 'Reset your Varnam Silks password',
                text: `We received a request to reset your password. Use this link within 1 hour: ${resetLink}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
                        <h2>Reset your password</h2>
                        <p>We received a request to reset your Varnam Silks password.</p>
                        <p>
                            <a href="${resetLink}" style="display: inline-block; padding: 10px 14px; background: #e11d48; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a>
                        </p>
                        <p>If you did not request this, you can safely ignore this email.</p>
                        <p>This link expires in 1 hour.</p>
                    </div>
                `,
        });

        return true;
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // Create token
        const token = jwt.sign(
            { id: savedUser._id, role: savedUser.role },
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                isAdmin: savedUser.role === 'admin'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.role === 'admin'
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Forgot Password - Generate reset token
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please enter your email' });
        }

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists or not
            return res.json({ message: 'If an account exists with this email, a reset link has been sent' });
        }

        // Generate reset token (valid for 1 hour)
        const resetToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret_key_12345',
            { expiresIn: '1h' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        try {
            const emailSent = await sendResetEmail(email, resetLink);
            if (!emailSent) {
                console.warn('SMTP not configured. Password reset email was not sent.');
                console.log(`Password reset token for ${email}: ${resetToken}`);
                console.log(`Reset link: ${resetLink}`);
            }
        } catch (mailError) {
            console.error('Failed to send reset email:', mailError.message);
            console.log(`Password reset token for ${email}: ${resetToken}`);
            console.log(`Reset link: ${resetLink}`);
        }

        res.json({ message: 'If an account exists with this email, a reset link has been sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reset Password - Verify token and update password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Please provide token and new password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_12345');
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
