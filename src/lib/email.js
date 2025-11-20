// src/lib/email.js
export const sendEmail = async (to, subject, html) => {
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Email failed');
  }

  return res.json();
};