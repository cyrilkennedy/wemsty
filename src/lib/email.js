// src/lib/email.js
const RESEND_API_KEY = 're_ZQ4ahKwo_CntnGp4v1JwZHNQrj3RreJ4i'; // REPLACE LATER

export const sendEmail = async (to, subject, html) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'WEMSTY <no-reply@wemsty.com>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Email failed');
  }
  return res.json();
};