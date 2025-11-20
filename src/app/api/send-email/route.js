// src/app/api/send-email/route.js
import { NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_ZQ4ahKwo_CntnGp4v1JwZHNQrj3RreJ4i';

export async function POST(request) {
  try {
    const { to, subject, html } = await request.json();

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
      return NextResponse.json(
        { error: err.message || 'Email failed' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}