const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

const DAILY_LIMIT_PER_RECIPIENT = 10;

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// Prevents Watchly being abused to spam any single recipient address
const canSendTo = async (email) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await EmailLog.countDocuments({ email, sentAt: { $gte: since } });
  return count < DAILY_LIMIT_PER_RECIPIENT;
};

const sendChangeAlert = async (email, url, checkedAt, snapshot = null) => {
  const allowed = await canSendTo(email);
  if (!allowed) {
    console.warn(`[Mail] Daily limit reached for ${email}, skipping send.`);
    return;
  }

  const transporter = createTransporter();
  const formattedTime = new Date(checkedAt).toLocaleString('en-US', {
    dateStyle: 'medium', timeStyle: 'short',
  });

  const hostname = (() => {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch { return url; }
  })();

  await transporter.sendMail({
    from: `"Watchly" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `⚡ Content changed: ${hostname}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F8F8F8;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #E5E5E5;overflow:hidden;">

          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid #F0F0F0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:15px;font-weight:600;color:#111111;letter-spacing:-0.3px;">● Watchly</td>
                  <td align="right">
                    <span style="background:#FFFBEB;border:1px solid #FDE68A;color:#B45309;font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;">Change detected</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 6px;font-size:20px;font-weight:600;color:#111111;letter-spacing:-0.3px;">Content change detected</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#737373;line-height:1.5;">A website you're monitoring has updated its content.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8F8;border:1px solid #E5E5E5;border-radius:10px;margin-bottom:20px;">
                <tr><td style="padding:14px 18px;">
                  <p style="margin:0 0 4px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#737373;font-weight:500;">Website</p>
                  <a href="${url}" style="font-size:14px;color:#111111;word-break:break-all;text-decoration:none;font-weight:500;">${url}</a>
                </td></tr>
              </table>

              ${snapshot ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border:1px solid #FDE68A;border-left:3px solid #F59E0B;border-radius:10px;margin-bottom:20px;">
                <tr><td style="padding:14px 18px;">
                  <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#737373;font-weight:500;">What we saw on the page</p>
                  <p style="margin:0;font-size:13px;color:#111111;line-height:1.6;">${snapshot.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 300)}...</p>
                </td></tr>
              </table>
              ` : ''}

              <p style="margin:0 0 24px;font-size:13px;color:#737373;">Detected at ${formattedTime}</p>
              <a href="${url}" style="display:inline-block;background:#111111;color:#ffffff;font-size:13px;font-weight:500;padding:10px 20px;border-radius:10px;text-decoration:none;">View website →</a>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 28px;border-top:1px solid #F0F0F0;background:#F8F8F8;">
              <p style="margin:0;font-size:12px;color:#737373;">You're receiving this because someone added this site to be monitored on Watchly, using this email address for alerts.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  // Log the send for rate limiting
  await EmailLog.create({ email });
};

module.exports = { sendChangeAlert };