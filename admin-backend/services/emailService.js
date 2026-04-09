const nodemailer = require('nodemailer');
const { SmtpSettings, EmailLog } = require('../models');

class EmailService {
  static async sendEmail({ to, subject, html, text, senderInfo = {} }) {
    let emailLog = null;
    
    try {
      // Get active SMTP settings
      const smtpSettings = await SmtpSettings.findOne({ where: { isActive: true } });
      
      if (!smtpSettings) {
        throw new Error('No active SMTP configuration found');
      }

      // Route email based on source
      let recipientEmail = smtpSettings.toEmail || to;
      const source = senderInfo.source || '';
      if (source === 'placement-form' && smtpSettings.placementEmail) {
        recipientEmail = smtpSettings.placementEmail;
      } else if (source === 'alumni-form' && smtpSettings.alumniEmail) {
        recipientEmail = smtpSettings.alumniEmail;
      }

      // Create email log entry
      emailLog = await EmailLog.create({
        from: smtpSettings.fromEmail,
        to: recipientEmail,
        subject,
        body: html || text,
        status: 'pending',
        source: senderInfo.source || 'contact-form',
        senderName: senderInfo.name,
        senderEmail: senderInfo.email,
        senderPhone: senderInfo.phone
      });

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.secure,
        auth: {
          user: smtpSettings.username,
          pass: smtpSettings.password
        }
      });

      // Email options
      const mailOptions = {
        from: `${smtpSettings.fromName} <${smtpSettings.fromEmail}>`,
        to: recipientEmail,
        subject,
        text: text || '',
        html: html || text
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      // Update email log with success
      await emailLog.update({
        status: 'sent',
        sentAt: new Date()
      });

      return {
        success: true,
        messageId: info.messageId,
        emailLogId: emailLog.id
      };

    } catch (error) {
      console.error('Email sending error:', error);

      // Update email log with failure
      if (emailLog) {
        await emailLog.update({
          status: 'failed',
          errorMessage: error.message
        });
      }

      return {
        success: false,
        error: error.message,
        emailLogId: emailLog?.id
      };
    }
  }

  static async sendContactFormEmail({ name, email, phone, message }) {
    const subject = `New Contact Form Submission from ${name}`;
    
    const html = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>This email was sent from the contact form on your website.</small></p>
    `;

    return this.sendEmail({
      subject,
      html,
      senderInfo: {
        name,
        email,
        phone,
        source: 'contact-form'
      }
    });
  }
}

module.exports = EmailService;