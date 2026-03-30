import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const isPlaceholderValue = (value = '') => {
  const normalized = String(value).toLowerCase();
  return (
    normalized.includes('your_email') ||
    normalized.includes('your_app_password_here') ||
    normalized.includes('example.com')
  );
};

const hasSmtpConfig = () => (
  Boolean(process.env.SMTP_HOST) &&
  Boolean(process.env.SMTP_PORT) &&
  Boolean(process.env.SMTP_USER) &&
  Boolean(process.env.SMTP_PASS) &&
  !isPlaceholderValue(process.env.SMTP_USER) &&
  !isPlaceholderValue(process.env.SMTP_PASS)
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

const sanitize = (value = '') => String(value).trim();

router.post('/contact', async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const phone = sanitize(req.body.phone);
    const subject = sanitize(req.body.subject);
    const message = sanitize(req.body.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required.' });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({
        message: 'Email service is not configured. Please set valid SMTP_USER and SMTP_PASS in server environment.',
      });
    }

    const toEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });

    res.json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Contact form email failed:', error.message);
    res.status(500).json({ message: 'Unable to send message right now. Please try again later.' });
  }
});

router.post('/careers', async (req, res) => {
  try {
    const name = sanitize(req.body.name);
    const email = sanitize(req.body.email);
    const phone = sanitize(req.body.phone);
    const position = sanitize(req.body.position);
    const experience = sanitize(req.body.experience);
    const message = sanitize(req.body.message);
    const resumeLink = sanitize(req.body.resumeLink);

    if (!name || !email || !phone || !position || !experience) {
      return res.status(400).json({ message: 'Name, email, phone, position, and experience are required.' });
    }

    const transporter = createTransporter();
    if (!transporter) {
      return res.status(503).json({
        message: 'Email service is not configured. Please set valid SMTP_USER and SMTP_PASS in server environment.',
      });
    }

    const toEmail = process.env.CAREERS_RECEIVER_EMAIL || process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `[Career Application] ${position} - ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${position}\nExperience: ${experience}\nResume Link: ${resumeLink || 'Not provided'}\n\nCover Letter:\n${message || 'Not provided'}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New Career Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Position Applied:</strong> ${position}</p>
          <p><strong>Experience:</strong> ${experience}</p>
          <p><strong>Resume Link:</strong> ${resumeLink || 'Not provided'}</p>
          <hr />
          <p><strong>Cover Letter / Additional Information:</strong></p>
          <p>${(message || 'Not provided').replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });

    res.json({ message: 'Application sent successfully.' });
  } catch (error) {
    console.error('Career form email failed:', error.message);
    res.status(500).json({ message: 'Unable to submit application right now. Please try again later.' });
  }
});

export default router;